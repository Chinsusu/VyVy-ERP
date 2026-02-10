-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    trading_name VARCHAR(255) NOT NULL,
    inci_name VARCHAR(255),
    material_type VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    sub_category VARCHAR(100),
    unit VARCHAR(20) NOT NULL DEFAULT 'KG',
    supplier_id BIGINT,
    
    -- Pricing
    standard_cost DECIMAL(15,2),
    last_purchase_price DECIMAL(15,2),
    
    -- Stock control
    min_stock_level DECIMAL(15,3) DEFAULT 0,
    max_stock_level DECIMAL(15,3),
    reorder_point DECIMAL(15,3),
    reorder_quantity DECIMAL(15,3),
    
    -- Quality & Safety
    requires_qc BOOLEAN DEFAULT FALSE,
    shelf_life_days INT,
    storage_conditions TEXT,
    hazardous BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    deleted_at TIMESTAMP,
    
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- Create indexes
CREATE INDEX idx_materials_code ON materials(code);
CREATE INDEX idx_materials_name ON materials(trading_name);
CREATE INDEX idx_materials_type ON materials(material_type);
CREATE INDEX idx_materials_category ON materials(category);
CREATE INDEX idx_materials_supplier ON materials(supplier_id);
CREATE INDEX idx_materials_active ON materials(is_active);

-- Create trigger
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
