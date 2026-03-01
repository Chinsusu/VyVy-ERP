-- Create product_formulas table (BOM header)
CREATE TABLE IF NOT EXISTS product_formulas (
    id                  BIGSERIAL PRIMARY KEY,
    finished_product_id BIGINT NOT NULL REFERENCES finished_products(id) ON DELETE CASCADE,
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    batch_size          DECIMAL(15,3) NOT NULL DEFAULT 1,
    batch_unit          VARCHAR(20) NOT NULL DEFAULT 'PCS',
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    notes               TEXT,
    created_by          BIGINT REFERENCES users(id),
    updated_by          BIGINT REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create product_formula_items table (BOM lines)
CREATE TABLE IF NOT EXISTS product_formula_items (
    id          BIGSERIAL PRIMARY KEY,
    formula_id  BIGINT NOT NULL REFERENCES product_formulas(id) ON DELETE CASCADE,
    material_id BIGINT NOT NULL REFERENCES materials(id),
    quantity    DECIMAL(15,3) NOT NULL DEFAULT 0,
    unit        VARCHAR(20) NOT NULL,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_product_formulas_finished_product_id ON product_formulas(finished_product_id);
CREATE INDEX idx_product_formula_items_formula_id ON product_formula_items(formula_id);
CREATE INDEX idx_product_formula_items_material_id ON product_formula_items(material_id);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_product_formulas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_product_formulas_updated_at
    BEFORE UPDATE ON product_formulas
    FOR EACH ROW EXECUTE FUNCTION update_product_formulas_updated_at();

CREATE TRIGGER trg_product_formula_items_updated_at
    BEFORE UPDATE ON product_formula_items
    FOR EACH ROW EXECUTE FUNCTION update_product_formulas_updated_at();
