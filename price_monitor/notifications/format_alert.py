"""Formata o texto do alerta de oferta pro WhatsApp, no formato curto
combinado com o usuário."""


def _fmt_brl(value: float) -> str:
    return f"{value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def format_alert_message(
    product_name: str,
    voltage: str | None,
    current_price: float,
    mean_recent: float | None,
    min_hist: float,
    store_name: str,
    score: int,
    tier_label: str,
    url: str,
    main_reason: str,
) -> str:
    lines = [tier_label, ""]
    lines.append(f"📦 {product_name}")
    if voltage:
        lines.append(f"⚡ {voltage}")
    lines.append("")
    lines.append(f"💰 Agora: R$ {_fmt_brl(current_price)}")
    if mean_recent:
        lines.append(f"📊 Média recente: R$ {_fmt_brl(mean_recent)}")
    lines.append(f"🏆 Menor histórico: R$ {_fmt_brl(min_hist)}")
    lines.append("")
    lines.append(f"🏪 Loja: {store_name}")
    lines.append("")
    lines.append(f"⭐ Offer Score: {score}/100")
    lines.append("")
    lines.append("🔗 Link para comprar:")
    lines.append(url)
    lines.append("")
    lines.append(f"Motivo: {main_reason}")
    return "\n".join(lines)
