"""Diagnóstico único: para cada URL de amostra, verifica se existe dado
estruturado JSON-LD (schema.org Product/Offer) e, se não houver, procura
trechos de HTML com padrão de preço em R$ para orientar a escrita dos
parsers específicos por loja.
"""
import json
import re

import requests

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "pt-BR,pt;q=0.9",
}

SAMPLE_URLS = {
    "amazon_br": "https://www.amazon.com.br/Geladeira-French-Tecnologia-Premium-Brastemp/dp/B0G66Z7P9R",
    "kabum": "https://www.kabum.com.br/",  # sem URL de produto real ainda, só a home
    "fast_shop": "https://site.fastshop.com.br/forno-eletrico-electrolux-80-litros-oe8el-220v-155810/p",
    "electrolux_oficial": "https://loja.electrolux.com.br/forno-de-embutir-eletrico-electrolux-80l-efficient-com-perfectcook--oe8el-/p",
    "midea_oficial": "https://www.midea.com.br/lava-e-seca-11kg-titanium-slim-healthguard-conectada-midea/p",
    "brastemp_oficial": "https://www.brastemp.com.br/geladeira-french-door-3-portas-inox-design-e-tecnologia-premium-bro85mk-1/p",
}

JSONLD_RE = re.compile(
    r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
    re.DOTALL | re.IGNORECASE,
)
PRICE_RE = re.compile(r'R\$\s?[\d.,]+')


def find_offer(node):
    """Procura recursivamente um objeto com @type Product ou 'offers'."""
    if isinstance(node, dict):
        if node.get("@type") in ("Product",) or "offers" in node:
            return node
        for v in node.values():
            found = find_offer(v)
            if found:
                return found
    elif isinstance(node, list):
        for item in node:
            found = find_offer(item)
            if found:
                return found
    return None


def inspect(store_id: str, url: str) -> None:
    print(f"\n{'=' * 70}\n{store_id} | {url}\n{'=' * 70}")
    try:
        resp = requests.get(url, headers=HEADERS, timeout=25)
    except requests.RequestException as exc:
        print(f"ERRO ao buscar: {exc}")
        return

    print(f"status: {resp.status_code} | tamanho: {len(resp.content)} bytes")
    if resp.status_code != 200:
        print("Não vou analisar mais - status diferente de 200.")
        return

    html = resp.text
    blocks = JSONLD_RE.findall(html)
    print(f"blocos JSON-LD encontrados: {len(blocks)}")

    product_found = False
    for block in blocks:
        try:
            data = json.loads(block)
        except json.JSONDecodeError:
            continue
        offer = find_offer(data)
        if offer:
            product_found = True
            print("--- JSON-LD com Product/offers encontrado ---")
            print(json.dumps(offer, ensure_ascii=False, indent=2)[:2000])
            break

    if not product_found:
        print("Nenhum JSON-LD de produto claro encontrado. Amostra de trechos com 'R$':")
        matches = PRICE_RE.findall(html)
        print(f"ocorrências de padrão R$: {len(matches)}")
        print(f"primeiras 15: {matches[:15]}")


def main() -> None:
    for store_id, url in SAMPLE_URLS.items():
        inspect(store_id, url)


if __name__ == "__main__":
    main()
