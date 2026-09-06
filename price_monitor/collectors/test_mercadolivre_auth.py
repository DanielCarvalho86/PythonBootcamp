"""Diagnóstico único: tenta autenticar na API do Mercado Livre e refazer
a busca que retornou 403 na auditoria inicial, para descobrir se o
bloqueio era falta de autenticação ou bloqueio por IP/reputação.
"""
import os

import requests

TOKEN_URL = "https://api.mercadolibre.com/oauth/token"
SEARCH_URL = "https://api.mercadolibre.com/sites/MLB/search"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    )
}


def get_token() -> str | None:
    client_id = os.environ["ML_CLIENT_ID"]
    client_secret = os.environ["ML_CLIENT_SECRET"]

    resp = requests.post(
        TOKEN_URL,
        data={
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret,
        },
        headers=HEADERS,
        timeout=20,
    )
    print(f"POST /oauth/token -> {resp.status_code}: {resp.text[:500]}")
    if resp.ok:
        return resp.json().get("access_token")
    return None


def try_search(token: str | None) -> None:
    headers = dict(HEADERS)
    if token:
        headers["Authorization"] = f"Bearer {token}"

    resp = requests.get(
        SEARCH_URL,
        params={"q": "Forno Electrolux OE8EL"},
        headers=headers,
        timeout=20,
    )
    print(f"GET /sites/MLB/search (com token={'sim' if token else 'nao'}) -> {resp.status_code}")
    print(resp.text[:800])


def main() -> None:
    token = get_token()
    try_search(token)
    if token is None:
        print("\nNão foi possível obter token via client_credentials. "
              "Refazendo busca sem token para registrar o comportamento atual.")


if __name__ == "__main__":
    main()
