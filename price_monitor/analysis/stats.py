"""Cálculo de estatísticas de histórico de preço por listing."""
import sqlite3
import statistics
from datetime import datetime, timedelta, timezone


def _parse(ts: str) -> datetime:
    return datetime.strptime(ts, "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)


def get_price_stats(conn: sqlite3.Connection, listing_id: int) -> dict | None:
    rows = conn.execute(
        "SELECT price_pix, collected_at FROM price_history "
        "WHERE listing_id = ? AND price_pix IS NOT NULL ORDER BY collected_at",
        (listing_id,),
    ).fetchall()
    if not rows:
        return None

    prices = [r[0] for r in rows]
    timestamps = [_parse(r[1]) for r in rows]
    now = datetime.now(timezone.utc)

    windows = {}
    for days in (7, 30, 90):
        cutoff = now - timedelta(days=days)
        windowed = [p for p, t in zip(prices, timestamps) if t >= cutoff]
        windows[days] = {
            "min": min(windowed) if windowed else None,
            "max": max(windowed) if windowed else None,
            "mean": statistics.mean(windowed) if windowed else None,
            "count": len(windowed),
        }

    current = prices[-1]
    previous = prices[-2] if len(prices) >= 2 else None
    if previous is None:
        trend = "dados insuficientes"
    elif current < previous:
        trend = "queda"
    elif current > previous:
        trend = "alta"
    else:
        trend = "estavel"

    all_time_min = min(prices)
    promo_hits = sum(1 for p in prices if p <= all_time_min * 1.02)
    history_span_hours = (timestamps[-1] - timestamps[0]).total_seconds() / 3600

    return {
        "current": current,
        "all_time_min": all_time_min,
        "all_time_max": max(prices),
        "all_time_mean": statistics.mean(prices),
        "all_time_median": statistics.median(prices),
        "observation_count": len(prices),
        "history_span_hours": history_span_hours,
        "trend": trend,
        "promo_frequency_pct": (promo_hits / len(prices)) * 100,
        "window_7d": windows[7],
        "window_30d": windows[30],
        "window_90d": windows[90],
    }
