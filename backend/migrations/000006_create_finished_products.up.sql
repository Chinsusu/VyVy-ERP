-- Create finished_products table
CREATE TABLE IF NOT EXISTS finished_products (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    category VARCHAR(100),
    sub_category VARCHAR(100),
    unit VARCHAR(20) NOT NULL DEFAULT 'PCS',
    
    -- Pricing
    standard_cost DECIMAL(15,2),
    selling_price DECIMAL(15,2),
    
    -- Specifications
    net_weight DECIMAL(10,3),
    gross_weight DECIMAL(10,3),
    volume DECIMAL(10,3),
    
    -- Stock control
    min_stock_level DECIMAL(15,3) DEFAULT 0,
    max_stock_level DECIMAL(15,3),
    reorder_point DECIMAL(15,3),
    
    -- Product info
    shelf_life_days INT,
    storage_conditions TEXT,
    barcode VARCHAR(100),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT
);

-- Create indexes
CREATE INDEX idx_finished_products_code ON finished_products(code);
CREATE INDEX idx_finished_products_name ON finished_products(name);
CREATE INDEX idx_finished_products_category ON finished_products(category);
CREATE INDEX idx_finished_products_barcode ON finished_products(barcode);
CREATE INDEX idx_finished_products_active ON finished_products(is_active);

-- Create trigger
CREATE TRIGGER update_finished_products_updated_at BEFORE UPDATE ON finished_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
