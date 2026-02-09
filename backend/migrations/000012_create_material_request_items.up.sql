-- Create material_request_items table
CREATE TABLE IF NOT EXISTS material_request_items (
    id BIGSERIAL PRIMARY KEY,
    material_request_id BIGINT NOT NULL,
    material_id BIGINT NOT NULL,
    
    -- Quantity
    requested_quantity DECIMAL(15,3) NOT NULL,
    issued_quantity DECIMAL(15,3) DEFAULT 0,
    
    -- Additional info
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    
    FOREIGN KEY (material_request_id) REFERENCES material_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id)
);

CREATE INDEX idx_material_request_items_mr ON material_request_items(material_request_id);
CREATE INDEX idx_material_request_items_material ON material_request_items(material_id);

CREATE TRIGGER update_material_request_items_updated_at BEFORE UPDATE ON material_request_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
