"""Orquestrador principal: para cada listing em catalog/listings.yaml,
busca a página, extrai preço/disponibilidade, valida a identidade do
produto contra catalog/products.yaml e grava no banco (price_history).

Regras de segurança:
- Nunca inventa preço: se o extrator não confirma um valor, nada é
  gravado para aquele listing nesta execução.
- Nunca sobe a confiança de identidade além do que o catálogo já
  declarou; só pode REBAIXAR se achar sinal de modelo excluído no
  título retornado pela própria loja.
"""
import re
import sqlite3
import time
from pathlib import Path

import requests
import yaml

from price_monitor.collectors.extractors import EXTRACTORS
from price_monitor.db.init_db import init_db, DB_PATH

BASE_DIR = Path(__file__).resolve().parent.parent
PRODUCTS_YAML = BASE_DIR / "catalog" / "products.yaml"
LISTINGS_YAML = BASE_DIR / "catalog" / "listings.yaml"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "pt-BR,pt;q=0.9",
}

CONFIDENCE_RANK = {"alta": 3, "media": 2, "baixa": 1}


def normalize_code(text: str) -> str:
    return re.sub(r"[^A-Z0-9]", "", (text or "").upper())


def load_products() -> dict:
    data = yaml.safe_load(PRODUCTS_YAML.read_text(encoding="utf-8"))
    return {p["id"]: p for p in data["products"]}


def load_listings() -> list:
    data = yaml.safe_load(LISTINGS_YAML.read_text(encoding="utf-8"))
    return data["listings"]


def check_identity(product: dict, extracted: dict) -> tuple[str, str]:
    """Retorna (confidence, motivo). Nunca sobe a confiança declarada no
    catálogo, só pode rebaixar."""
    base_confidence = product.get("identity_confidence", "media")
    name = (extracted.get("name") or "").upper()

    for excluded in product.get("excluded_models", []):
        code = normalize_code(str(excluded.get("code", "")))
        if code and code in normalize_code(name):
            return "baixa", f"nome retornado contém código excluído '{excluded['code']}' ({excluded['reason']})"

    expected_sku = product.get("sku")
    found_sku = extracted.get("sku")
    if expected_sku and found_sku and normalize_code(expected_sku) != normalize_code(found_sku):
        return "baixa", f"SKU esperado '{expected_sku}' não bate com SKU retornado '{found_sku}'"

    return base_confidence, "sem sinais de divergência encontrados"


def fetch_and_extract(store_id: str, url: str) -> dict | None:
    extractor = EXTRACTORS.get(store_id)
    if extractor is None:
        print(f"    (sem extrator implementado para '{store_id}')")
        return None

    try:
        resp = requests.get(url, headers=HEADERS, timeout=25)
    except requests.RequestException as exc:
        print(f"    erro de rede: {exc}")
        return None

    if resp.status_code != 200:
        print(f"    status HTTP {resp.status_code} - não coletado")
        return None

    result = extractor(resp.text)
    if result is None:
        print("    extrator não confirmou preço - nada gravado")
    return result


def get_or_create_listing(conn: sqlite3.Connection, product_id: str, store_id: str, url: str,
                           identity_confidence: str) -> int:
    row = conn.execute(
        "SELECT id FROM listings WHERE store_id = ? AND url = ?", (store_id, url)
    ).fetchone()
    if row:
        return row[0]
    cur = conn.execute(
        "INSERT INTO listings (product_id, store_id, url, identity_confidence) VALUES (?, ?, ?, ?)",
        (product_id, store_id, url, identity_confidence),
    )
    return cur.lastrowid


def main() -> None:
    init_db()
    products = load_products()
    listings = load_listings()

    conn = sqlite3.connect(DB_PATH)
    collected, skipped = 0, 0

    for entry in listings:
        product_id = entry["product_id"]
        store_id = entry["store_id"]
        url = entry["url"]
        product = products[product_id]

        print(f"\n{product['canonical_name']} @ {store_id}")
        print(f"  {url}")

        extracted = fetch_and_extract(store_id, url)

        if extracted is None:
            skipped += 1
            get_or_create_listing(
                conn, product_id, store_id, url, product.get("identity_confidence", "media")
            )
            continue

        confidence, reason = check_identity(product, extracted)
        listing_id = get_or_create_listing(conn, product_id, store_id, url, confidence)
        conn.execute("UPDATE listings SET identity_confidence = ? WHERE id = ?", (confidence, listing_id))

        conn.execute(
            """INSERT INTO price_history
               (listing_id, price_pix, price_card, availability, notes)
               VALUES (?, ?, ?, ?, ?)""",
            (
                listing_id,
                extracted["price"],
                extracted["price"],  # sem distinção pix/cartão nas lojas VTEX/Amazon lidas via JSON-LD
                extracted["availability"],
                f"confiança={confidence}; {reason}",
            ),
        )
        conn.execute(
            "INSERT INTO monitoring_status (listing_id, last_checked_at) VALUES (?, datetime('now')) "
            "ON CONFLICT(listing_id) DO UPDATE SET last_checked_at = datetime('now'), last_error = NULL",
            (listing_id,),
        )
        collected += 1
        print(f"    preço: R$ {extracted['price']:.2f} | disponibilidade: {extracted['availability']} "
              f"| confiança identidade: {confidence} ({reason})")

        time.sleep(1)  # educado com os servidores das lojas

    conn.commit()
    conn.close()
    print(f"\nResumo: {collected} preços coletados, {skipped} listings sem preço confirmado.")


if __name__ == "__main__":
    main()
