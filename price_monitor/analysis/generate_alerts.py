"""Analisa todos os listings ativos: calcula histórico, Offer Score, e
decide se algum merece alerta. Registra os alertas gerados em
alerts_sent (para deduplicação futura) e imprime a mensagem formatada.

Neste momento NÃO envia WhatsApp de verdade - isso é responsabilidade
do módulo de notificações (ainda pendente de credencial funcionando).
Este script é o "cérebro" que decide O QUE alertar; o envio é uma
etapa separada e deliberadamente desacoplada.
"""
import sqlite3
from pathlib import Path

import yaml

from price_monitor.analysis.alert_rules import should_alert, record_alert
from price_monitor.analysis.offer_score import compute_offer_score, classify
from price_monitor.analysis.stats import get_price_stats
from price_monitor.db.init_db import DB_PATH
from price_monitor.notifications.format_alert import format_alert_message

BASE_DIR = Path(__file__).resolve().parent.parent
PRODUCTS_YAML = BASE_DIR / "catalog" / "products.yaml"
STORES_YAML = BASE_DIR / "catalog" / "stores.yaml"


def load_yaml_by_id(path: Path, key: str) -> dict:
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    return {item["id"]: item for item in data[key]}


def get_cross_store_prices(conn: sqlite3.Connection, product_id: str, exclude_listing_id: int) -> list[float]:
    rows = conn.execute(
        """SELECT ph.price_pix
           FROM listings l
           JOIN price_history ph ON ph.listing_id = l.id
           WHERE l.product_id = ? AND l.id != ? AND l.active = 1
           AND ph.collected_at = (
               SELECT MAX(collected_at) FROM price_history WHERE listing_id = l.id
           )""",
        (product_id, exclude_listing_id),
    ).fetchall()
    return [r[0] for r in rows if r[0] is not None]


def main() -> None:
    products = load_yaml_by_id(PRODUCTS_YAML, "products")
    stores = load_yaml_by_id(STORES_YAML, "stores")

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    listings = conn.execute("SELECT * FROM listings WHERE active = 1").fetchall()

    alerts_generated = 0
    for listing in listings:
        product = products.get(listing["product_id"])
        store = stores.get(listing["store_id"])
        if not product or not store:
            continue

        stats = get_price_stats(conn, listing["id"])
        if stats is None:
            continue

        last_row = conn.execute(
            "SELECT availability FROM price_history WHERE listing_id = ? "
            "ORDER BY collected_at DESC LIMIT 1",
            (listing["id"],),
        ).fetchone()
        availability = last_row["availability"] if last_row else "desconhecido"

        cross_prices = get_cross_store_prices(conn, listing["product_id"], listing["id"])

        score, reasons = compute_offer_score(
            stats=stats,
            availability=availability,
            identity_confidence=listing["identity_confidence"],
            store_reliability=store.get("reliability_score", 70),
            cross_store_prices=cross_prices,
        )
        tier_label = classify(score)

        target_row = conn.execute(
            "SELECT target_price FROM target_prices WHERE product_id = ?", (listing["product_id"],)
        ).fetchone()
        target_price = target_row["target_price"] if target_row else None

        print(f"\n{product['canonical_name']} @ {store['name']}")
        print(f"  preço atual: R$ {stats['current']:.2f} | score: {score}/100 ({tier_label})")
        print(f"  motivos: {'; '.join(reasons) if reasons else 'nenhum fator relevante'}")

        allow, reason = should_alert(
            conn=conn,
            listing_id=listing["id"],
            current_price=stats["current"],
            score=score,
            identity_confidence=listing["identity_confidence"],
            availability=availability,
            target_price=target_price,
            observation_count=stats["observation_count"],
            history_span_hours=stats["history_span_hours"],
        )
        print(f"  decisão de alerta: {'SIM' if allow else 'não'} ({reason})")

        if allow:
            record_alert(conn, listing["id"], stats["current"], score, reason)
            message = format_alert_message(
                product_name=product["canonical_name"],
                voltage=product.get("voltage"),
                current_price=stats["current"],
                mean_recent=stats["window_30d"]["mean"],
                min_hist=stats["all_time_min"],
                store_name=store["name"],
                score=score,
                tier_label=tier_label,
                url=listing["url"],
                main_reason=reasons[0] if reasons else reason,
            )
            print("  --- mensagem que seria enviada ---")
            print(message)
            alerts_generated += 1

    conn.commit()
    conn.close()
    print(f"\nResumo: {alerts_generated} alerta(s) gerado(s) de {len(listings)} listing(s) analisados.")


if __name__ == "__main__":
    main()
