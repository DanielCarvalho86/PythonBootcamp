"""Cria/atualiza o banco SQLite a partir de schema.sql e popula as
tabelas `products` e `stores` a partir dos catálogos YAML.

Idempotente: pode rodar quantas vezes quiser, não duplica nem apaga
histórico já coletado.
"""
import sqlite3
from pathlib import Path

import yaml

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "data" / "monitor.db"
SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"
PRODUCTS_YAML = BASE_DIR / "catalog" / "products.yaml"
STORES_YAML = BASE_DIR / "catalog" / "stores.yaml"


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    try:
        conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))

        products = yaml.safe_load(PRODUCTS_YAML.read_text(encoding="utf-8"))["products"]
        for product in products:
            conn.execute(
                "INSERT INTO products (id, canonical_name) VALUES (?, ?) "
                "ON CONFLICT(id) DO UPDATE SET canonical_name = excluded.canonical_name",
                (product["id"], product["canonical_name"]),
            )

        stores = yaml.safe_load(STORES_YAML.read_text(encoding="utf-8"))["stores"]
        for store in stores:
            conn.execute(
                "INSERT INTO stores (id, name) VALUES (?, ?) "
                "ON CONFLICT(id) DO UPDATE SET name = excluded.name",
                (store["id"], store["name"]),
            )

        conn.commit()
        print(f"Banco inicializado em {DB_PATH}: {len(products)} produtos, {len(stores)} lojas.")
    finally:
        conn.close()


if __name__ == "__main__":
    init_db()
