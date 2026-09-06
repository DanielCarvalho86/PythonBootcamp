"""Extratores de preço por loja.

Cada extrator recebe o HTML da página de produto e devolve um dict com
os campos que conseguiu confirmar, ou None se não conseguiu extrair
nada com segurança (nunca inventamos preço).

Campos possíveis no retorno:
    name, sku, gtin, price (à vista/atual), list_price (preço "de"),
    availability ("disponivel"/"indisponivel"/"desconhecido"), currency
"""
import json
import re

JSONLD_RE = re.compile(
    r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
    re.DOTALL | re.IGNORECASE,
)

AMAZON_PRICE_RE = re.compile(
    r'<span class="a-price"[^>]*>\s*<span class="a-offscreen">R\$\s?([\d.,]+)</span>'
)
AMAZON_AVAILABILITY_UNAVAILABLE_MARKERS = (
    "no momento, este item não está disponível",
    "atualmente indisponível",
)


def _parse_brl(value: str) -> float | None:
    """Converte '1.234,56' -> 1234.56. Retorna None se não der pra converter."""
    if value is None:
        return None
    cleaned = value.replace(".", "").replace(",", ".")
    try:
        return float(cleaned)
    except ValueError:
        return None


def _find_offer_node(node):
    if isinstance(node, dict):
        if node.get("@type") == "Product" or "offers" in node:
            return node
        for v in node.values():
            found = _find_offer_node(v)
            if found:
                return found
    elif isinstance(node, list):
        for item in node:
            found = _find_offer_node(item)
            if found:
                return found
    return None


def extract_vtex_jsonld(html: str) -> dict | None:
    """Funciona para lojas VTEX com JSON-LD Product/Offer padrão:
    Electrolux oficial, Midea oficial, Brastemp oficial, Fast Shop.
    """
    for block in JSONLD_RE.findall(html):
        try:
            data = json.loads(block)
        except json.JSONDecodeError:
            continue
        product = _find_offer_node(data)
        if not product:
            continue

        offers = product.get("offers")
        if isinstance(offers, dict) and "offers" in offers:
            # AggregateOffer (ex: Electrolux oficial) - pega a primeira offer concreta
            inner = offers.get("offers") or []
            offer = inner[0] if inner else offers
        else:
            offer = offers

        if not isinstance(offer, dict):
            continue

        price = offer.get("price")
        if price is None:
            price = offers.get("lowPrice") if isinstance(offers, dict) else None
        if price is None:
            continue  # sem preço confirmado, não inventa

        list_price = offer.get("listPriceWithTaxes")
        availability_raw = (offer.get("availability") or "").lower()
        if "instock" in availability_raw:
            availability = "disponivel"
        elif "outofstock" in availability_raw or "soldout" in availability_raw:
            availability = "indisponivel"
        else:
            availability = "desconhecido"

        return {
            "name": product.get("name"),
            "sku": product.get("sku"),
            "gtin": product.get("gtin"),
            "price": float(price),
            "list_price": float(list_price) if list_price else None,
            "availability": availability,
            "currency": offer.get("priceCurrency", "BRL"),
        }
    return None


def extract_amazon(html: str) -> dict | None:
    match = AMAZON_PRICE_RE.search(html)
    if not match:
        return None

    price = _parse_brl(match.group(1))
    if price is None:
        return None

    html_lower = html.lower()
    if any(marker in html_lower for marker in AMAZON_AVAILABILITY_UNAVAILABLE_MARKERS):
        availability = "indisponivel"
    else:
        availability = "disponivel"

    return {
        "name": None,  # Amazon não tem JSON-LD nesta página; nome vem do catálogo/URL
        "sku": None,
        "gtin": None,
        "price": price,
        "list_price": None,
        "availability": availability,
        "currency": "BRL",
    }


EXTRACTORS = {
    "electrolux_oficial": extract_vtex_jsonld,
    "midea_oficial": extract_vtex_jsonld,
    "brastemp_oficial": extract_vtex_jsonld,
    "fast_shop": extract_vtex_jsonld,
    "amazon_br": extract_amazon,
}
