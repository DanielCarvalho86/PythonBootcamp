"""Auditoria de viabilidade de coleta por loja.

Roda fora do ambiente de chat (que tem firewall de saída restrito) via
GitHub Actions, que tem acesso normal à internet. Para cada loja, tenta:
  1. Ler o robots.txt e reportar regras relevantes.
  2. Buscar uma página real (produto conhecido, quando disponível, ou a
     home) e reportar status HTTP, tamanho da resposta e sinais comuns de
     proteção anti-bot (Cloudflare, Akamai, captcha, etc).

Isso não extrai preço nenhum ainda — é só um diagnóstico de acessibilidade
para decidir, por loja, se dá para coletar via requisição simples, se
precisa de outra abordagem, ou se não é viável.
"""
import time
from dataclasses import dataclass, field
from urllib.parse import urlparse

import requests

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "pt-BR,pt;q=0.9",
}

ANTI_BOT_MARKERS = [
    "cloudflare",
    "akamai",
    "captcha",
    "access denied",
    "px-captcha",
    "distil",
    "unusual traffic",
    "verifique que você é humano",
    "atenção requerida",
]


@dataclass
class StoreCheck:
    name: str
    sample_url: str
    is_official_api: bool = False
    notes: str = ""


STORES = [
    StoreCheck(
        "Mercado Livre (API oficial)",
        "https://api.mercadolibre.com/sites/MLB/search?q=Forno+Electrolux+OE8EL",
        is_official_api=True,
    ),
    StoreCheck(
        "Amazon Brasil",
        "https://www.amazon.com.br/Geladeira-French-Tecnologia-Premium-Brastemp/dp/B0G66Z7P9R",
    ),
    StoreCheck("Magazine Luiza", "https://www.magazineluiza.com.br/"),
    StoreCheck("KaBuM!", "https://www.kabum.com.br/"),
    StoreCheck(
        "Casas Bahia",
        "https://www.casasbahia.com.br/geladeira-brastemp-bro85mk-559l-frost-free-french-door-portas-inox/p/55071719",
    ),
    StoreCheck("Ponto", "https://www.ponto.com.br/"),
    StoreCheck(
        "Fast Shop",
        "https://site.fastshop.com.br/forno-eletrico-electrolux-80-litros-oe8el-220v-155810/p",
    ),
    StoreCheck("Carrefour", "https://www.carrefour.com.br/"),
    StoreCheck(
        "Leroy Merlin",
        "https://www.leroymerlin.com.br/lava-e-seca-13kg-titanium-midea-healthguard-conectada-mf200d130wb-gk-01-127v_1571729426",
    ),
    StoreCheck(
        "Electrolux (loja oficial)",
        "https://loja.electrolux.com.br/forno-de-embutir-eletrico-electrolux-80l-efficient-com-perfectcook--oe8el-/p",
    ),
    StoreCheck(
        "Midea (loja oficial)",
        "https://www.midea.com.br/lava-e-seca-11kg-titanium-slim-healthguard-conectada-midea/p",
    ),
    StoreCheck(
        "Brastemp (loja oficial)",
        "https://www.brastemp.com.br/geladeira-french-door-3-portas-inox-design-e-tecnologia-premium-bro85mk-1/p",
    ),
]


def check_robots(base_url: str) -> str:
    parsed = urlparse(base_url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    try:
        resp = requests.get(robots_url, headers=HEADERS, timeout=15)
        if resp.status_code != 200:
            return f"robots.txt: HTTP {resp.status_code}"
        disallow_lines = [
            line.strip()
            for line in resp.text.splitlines()
            if line.strip().lower().startswith("disallow")
        ]
        return f"robots.txt OK, {len(disallow_lines)} regras Disallow"
    except requests.RequestException as exc:
        return f"robots.txt: erro ({exc.__class__.__name__})"


def check_page(store: StoreCheck) -> dict:
    result = {"loja": store.name, "url": store.sample_url}
    result["robots"] = check_robots(store.sample_url)

    try:
        start = time.monotonic()
        resp = requests.get(store.sample_url, headers=HEADERS, timeout=20, allow_redirects=True)
        elapsed = time.monotonic() - start
        body_lower = resp.text.lower()
        markers_found = [m for m in ANTI_BOT_MARKERS if m in body_lower]

        result.update(
            {
                "status_code": resp.status_code,
                "final_url": resp.url,
                "tamanho_bytes": len(resp.content),
                "tempo_s": round(elapsed, 2),
                "sinais_anti_bot": markers_found or "nenhum sinal óbvio",
            }
        )
    except requests.RequestException as exc:
        result["erro"] = f"{exc.__class__.__name__}: {exc}"

    return result


def main() -> None:
    print(f"Auditando {len(STORES)} lojas...\n")
    for store in STORES:
        r = check_page(store)
        print(f"=== {r['loja']} ===")
        print(f"URL testada: {r['url']}")
        print(f"robots: {r.get('robots')}")
        if "erro" in r:
            print(f"ERRO: {r['erro']}")
        else:
            print(f"status: {r['status_code']} | tamanho: {r['tamanho_bytes']} bytes | tempo: {r['tempo_s']}s")
            print(f"sinais anti-bot: {r['sinais_anti_bot']}")
        print()


if __name__ == "__main__":
    main()
