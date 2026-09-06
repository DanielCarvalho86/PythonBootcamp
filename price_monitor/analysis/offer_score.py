"""Offer Score (0-100): quão boa é uma oferta, considerando histórico
próprio do listing, comparação entre lojas e confiabilidade dos dados.

Limitação atual conhecida: ainda não coletamos frete/cupom/cashback
separadamente (as lojas VTEX não expõem isso no JSON-LD que lemos),
então esses fatores não entram no cálculo por enquanto - o score reflete
só preço, histórico, comparação entre lojas, confiabilidade da loja e
confiança de identidade do produto.
"""

TIERS = (
    (90, "🔥 OFERTA EXCEPCIONAL"),
    (75, "🟢 BOA OFERTA"),
    (60, "🟡 PREÇO INTERESSANTE"),
    (40, "⚪ PREÇO NORMAL"),
    (0, "🔴 PREÇO RUIM"),
)


def classify(score: int) -> str:
    for threshold, label in TIERS:
        if score >= threshold:
            return label
    return TIERS[-1][1]


def compute_offer_score(
    stats: dict,
    availability: str,
    identity_confidence: str,
    store_reliability: int,
    cross_store_prices: list[float],
) -> tuple[int, list[str]]:
    """Retorna (score 0-100, lista de motivos legíveis)."""
    if availability != "disponivel":
        return 0, ["produto indisponível - não é oportunidade de compra"]

    score = 50.0
    reasons: list[str] = []
    current = stats["current"]
    min_hist = stats["all_time_min"]
    mean_recent = stats["window_30d"]["mean"] or stats["all_time_mean"]

    if stats["observation_count"] < 2:
        reasons.append(
            f"apenas {stats['observation_count']} observação(ões) até agora - "
            "histórico ainda insuficiente para comparação robusta"
        )

    if min_hist and min_hist > 0:
        diff_min_pct = (current - min_hist) / min_hist * 100
        if diff_min_pct <= 0:
            score += 25
            reasons.append("preço é o novo mínimo histórico")
        elif diff_min_pct <= 3:
            score += 20
            reasons.append(f"muito próximo do menor histórico (+{diff_min_pct:.1f}%)")
        elif diff_min_pct <= 10:
            score += 10
            reasons.append(f"razoavelmente próximo do menor histórico (+{diff_min_pct:.1f}%)")

    if mean_recent and mean_recent > 0:
        diff_mean_pct = (current - mean_recent) / mean_recent * 100
        if diff_mean_pct <= -15:
            score += 20
            reasons.append(f"{abs(diff_mean_pct):.1f}% abaixo da média recente (30 dias)")
        elif diff_mean_pct <= -5:
            score += 10
            reasons.append(f"{abs(diff_mean_pct):.1f}% abaixo da média recente (30 dias)")
        elif diff_mean_pct > 5:
            score -= 10
            reasons.append(f"{diff_mean_pct:.1f}% acima da média recente (30 dias)")

    if cross_store_prices:
        cheapest_elsewhere = min(cross_store_prices)
        if current <= cheapest_elsewhere:
            score += 10
            reasons.append("menor preço entre as lojas monitoradas para este produto")
        else:
            diff_pct = (current - cheapest_elsewhere) / cheapest_elsewhere * 100
            score -= min(15, diff_pct)
            reasons.append(f"{diff_pct:.1f}% mais caro que em outra loja monitorada")

    score += (store_reliability - 80) / 4

    if identity_confidence == "baixa":
        score = min(score, 30)
        reasons.append("confiança de identidade do produto BAIXA - score limitado por segurança")
    elif identity_confidence == "media":
        score = min(score, 75)

    return max(0, min(100, round(score))), reasons
