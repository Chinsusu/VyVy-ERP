-- Migration 000039: Create Finished Product Receipt Notes (FPRN)
-- Phase D: GRN Thành Phẩm — nhập kho thành phẩm từ Kho Nhà Máy → Kho Bán Hàng

CREATE TABLE IF NOT EXISTS finished_product_receipts (
    id                 BIGSERIAL PRIMARY KEY,
    fprn_number        VARCHAR(50)  UNIQUE NOT NULL,
    production_plan_id BIGINT       REFERENCES production_plans(id),
    warehouse_id       BIGINT       NOT NULL REFERENCES warehouses(id),
    receipt_date       DATE         NOT NULL DEFAULT CURRENT_DATE,
    status             VARCHAR(50)  NOT NULL DEFAULT 'draft',
    posted             BOOLEAN      DEFAULT false,
    posted_by          BIGINT       REFERENCES users(id),
    posted_at          TIMESTAMP,
    notes              TEXT,
    created_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    created_by         BIGINT,
    updated_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_by         BIGINT
);

CREATE TABLE IF NOT EXISTS finished_product_receipt_items (
    id                    BIGSERIAL PRIMARY KEY,
    fprn_id               BIGINT         NOT NULL REFERENCES finished_product_receipts(id) ON DELETE CASCADE,
    finished_product_id   BIGINT         NOT NULL REFERENCES finished_products(id),
    warehouse_location_id BIGINT         REFERENCES warehouse_locations(id),
    quantity              NUMERIC(15,3)  NOT NULL,
    batch_number          VARCHAR(100),
    manufacture_date      DATE,
    expiry_date           DATE,
    unit_cost             NUMERIC(15,2)  DEFAULT 0,
    notes                 TEXT,
    created_at            TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    created_by            BIGINT,
    updated_at            TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_by            BIGINT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fpr_number       ON finished_product_receipts(fprn_number);
CREATE INDEX IF NOT EXISTS idx_fpr_warehouse     ON finished_product_receipts(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_fpr_plan          ON finished_product_receipts(production_plan_id);
CREATE INDEX IF NOT EXISTS idx_fpr_status        ON finished_product_receipts(status);
CREATE INDEX IF NOT EXISTS idx_fpr_receipt_date  ON finished_product_receipts(receipt_date);

CREATE INDEX IF NOT EXISTS idx_fpri_fprn         ON finished_product_receipt_items(fprn_id);
CREATE INDEX IF NOT EXISTS idx_fpri_product      ON finished_product_receipt_items(finished_product_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_finished_product_receipts_updated_at
    BEFORE UPDATE ON finished_product_receipts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_finished_product_receipt_items_updated_at
    BEFORE UPDATE ON finished_product_receipt_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
