"""Diagnóstico único: para cada URL de amostra, verifica se existe dado
estruturado JSON-LD (schema.org Product/Offer) e imprime só os campos
relevantes (nome, sku, gtin, offers) para não estourar o log com a
descrição. Para lojas sem JSON-LD, mostra o contexto de HTML ao redor
de cada ocorrência de preço em R$, para localizar o seletor certo.
Também tenta localizar um produto real na busca da KaBuM!.
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

RELEVANT_KEYS = ("name", "sku", "gtin", "mpn", "brand", "offers")


def find_offer(node):
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


def inspect_jsonld(store_id: str, url: str) -> None:
    print(f"\n{'=' * 70}\n{store_id} | {url}\n{'=' * 70}")
    try:
        resp = requests.get(url, headers=HEADERS, timeout=25)
    except requests.RequestException as exc:
        print(f"ERRO ao buscar: {exc}")
        return

    print(f"status: {resp.status_code} | tamanho: {len(resp.content)} bytes")
    if resp.status_code != 200:
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
            trimmed = {k: offer[k] for k in RELEVANT_KEYS if k in offer}
            print("--- campos relevantes do JSON-LD ---")
            print(json.dumps(trimmed, ensure_ascii=False, indent=2))
            break

    if not product_found:
        print("Nenhum JSON-LD de produto claro. Contexto ao redor de cada 'R$':")
        for m in PRICE_RE.finditer(html):
            start = max(0, m.start() - 120)
            end = min(len(html), m.end() + 40)
            snippet = html[start:end].replace("\n", " ")
            print(f"  ...{snippet}...")


def inspect_kabum_search() -> None:
    print(f"\n{'=' * 70}\nkabum | busca por produtos-alvo\n{'=' * 70}")
    queries = ["forno eletrolux oe8el", "geladeira brastemp bro85mk", "lava e seca midea 11kg"]
    for q in queries:
        url = f"https://www.kabum.com.br/busca/{q.replace(' ', '-')}"
        try:
            resp = requests.get(url, headers=HEADERS, timeout=25)
            has_product_words = "produto" in resp.text.lower() or "resultado" in resp.text.lower()
            print(f"'{q}' -> {url} -> status {resp.status_code}, tamanho {len(resp.content)} bytes, "
                  f"menção a produto/resultado: {has_product_words}")
        except requests.RequestException as exc:
            print(f"'{q}' -> ERRO: {exc}")


def main() -> None:
    for store_id, url in SAMPLE_URLS.items():
        inspect_jsonld(store_id, url)
    inspect_kabum_search()


if __name__ == "__main__":
    main()
