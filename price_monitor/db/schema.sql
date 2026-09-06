-- Schema do banco de monitoramento de preços (SQLite).
-- Catálogo de produtos/lojas vem dos YAMLs em price_monitor/catalog/;
-- este banco guarda apenas dados de runtime (anúncios encontrados,
-- histórico de preços, alertas enviados e configuração de preço-alvo).

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,              -- mesmo id usado em catalog/products.yaml
    canonical_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stores (
    id TEXT PRIMARY KEY,              -- mesmo id usado em catalog/stores.yaml
    name TEXT NOT NULL
);

-- Um "listing" é um anúncio específico de um produto numa loja (uma URL).
-- Um mesmo produto pode ter vários listings na mesma loja (cores/variantes).
CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL REFERENCES products(id),
    store_id TEXT NOT NULL REFERENCES stores(id),
    url TEXT NOT NULL,
    sku_found TEXT,
    ean_found TEXT,
    identity_confidence TEXT NOT NULL DEFAULT 'media' CHECK (identity_confidence IN ('alta', 'media', 'baixa')),
    active INTEGER NOT NULL DEFAULT 1,  -- 0 = pausado/descontinuado
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (store_id, url)
);

CREATE INDEX IF NOT EXISTS idx_listings_product ON listings(product_id);

-- Cada verificação periódica grava uma linha aqui (ou nenhuma, se não
-- conseguir confirmar o preço com segurança - nunca inventar preço).
CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER NOT NULL REFERENCES listings(id),
    collected_at TEXT NOT NULL DEFAULT (datetime('now')),
    price_pix REAL,
    price_card REAL,
    installments INTEGER,
    shipping_cost REAL,               -- NULL = não informado; 0 = frete grátis
    coupon_code TEXT,
    coupon_discount REAL,
    cashback_pct REAL,
    availability TEXT NOT NULL CHECK (availability IN ('disponivel', 'indisponivel', 'desconhecido')),
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_price_history_listing_time ON price_history(listing_id, collected_at);

-- Preço-alvo por produto (opcional, definido pelo usuário depois).
CREATE TABLE IF NOT EXISTS target_prices (
    product_id TEXT PRIMARY KEY REFERENCES products(id),
    target_price REAL NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Registro de alertas já enviados, para deduplicação (não repetir o
-- mesmo preço/oferta a cada verificação).
CREATE TABLE IF NOT EXISTS alerts_sent (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER NOT NULL REFERENCES listings(id),
    price_at_alert REAL NOT NULL,
    offer_score INTEGER NOT NULL,
    reason TEXT,
    sent_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_alerts_listing_time ON alerts_sent(listing_id, sent_at);

-- Estado de monitoramento por listing (permite pausar uma loja/produto
-- específico sem apagar o histórico já coletado).
CREATE TABLE IF NOT EXISTS monitoring_status (
    listing_id INTEGER PRIMARY KEY REFERENCES listings(id),
    enabled INTEGER NOT NULL DEFAULT 1,
    last_checked_at TEXT,
    last_error TEXT
);
