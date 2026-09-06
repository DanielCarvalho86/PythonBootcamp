"""Regras de decisão de alerta e deduplicação.

Regra de deduplicação: só gera um novo alerta para o mesmo listing se
o preço atual for MENOR que o preço do último alerta já enviado para
ele (ou se não houver alerta anterior). Preço igual ou maior que o
último alerta não gera repetição - evita spam quando o preço fica
parado num patamar.
"""
import sqlite3

ALERT_SCORE_THRESHOLD = 75

# Período mínimo de observação antes de confiar em "novo mínimo histórico"
# ou no Offer Score: com poucos pontos de dado, qualquer preço parece um
# recorde. Preço-alvo explícito do usuário ignora esse período (é uma
# regra dele, não depende do nosso histórico).
MIN_OBSERVATIONS_FOR_ALERT = 3
MIN_HISTORY_HOURS_FOR_ALERT = 48


def should_alert(
    conn: sqlite3.Connection,
    listing_id: int,
    current_price: float,
    score: int,
    identity_confidence: str,
    availability: str,
    target_price: float | None,
    observation_count: int,
    history_span_hours: float,
) -> tuple[bool, str]:
    if availability != "disponivel":
        return False, "produto indisponível"

    if identity_confidence == "baixa":
        return False, "identidade do produto não confirmada com segurança"

    target_hit = target_price is not None and current_price <= target_price

    if not target_hit:
        if observation_count < MIN_OBSERVATIONS_FOR_ALERT or history_span_hours < MIN_HISTORY_HOURS_FOR_ALERT:
            return False, (
                f"em período de observação inicial ({observation_count} coleta(s) em "
                f"{history_span_hours:.1f}h - precisa de pelo menos {MIN_OBSERVATIONS_FOR_ALERT} "
                f"coletas em {MIN_HISTORY_HOURS_FOR_ALERT}h de histórico antes de confiar no score)"
            )
        if score < ALERT_SCORE_THRESHOLD:
            return False, f"score {score} abaixo do limiar de alerta ({ALERT_SCORE_THRESHOLD})"

    last_alert = conn.execute(
        "SELECT price_at_alert FROM alerts_sent WHERE listing_id = ? "
        "ORDER BY sent_at DESC LIMIT 1",
        (listing_id,),
    ).fetchone()

    if last_alert is None:
        return True, "primeira oferta qualificada para este listing"

    last_price = last_alert[0]
    if current_price < last_price:
        return True, f"preço caiu ainda mais desde o último alerta (R$ {last_price:.2f} -> R$ {current_price:.2f})"

    return False, f"já houve alerta neste preço ou menor (R$ {last_price:.2f}) - evitando repetição"


def record_alert(conn: sqlite3.Connection, listing_id: int, price: float, score: int, reason: str) -> None:
    conn.execute(
        "INSERT INTO alerts_sent (listing_id, price_at_alert, offer_score, reason) VALUES (?, ?, ?, ?)",
        (listing_id, price, score, reason),
    )
