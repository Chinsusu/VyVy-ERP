-- Create stock_adjustment_items table
CREATE TABLE IF NOT EXISTS stock_adjustment_items (
    id BIGSERIAL PRIMARY KEY,
    stock_adjustment_id BIGINT NOT NULL,
    item_type VARCHAR(20) NOT NULL,
    item_id BIGINT NOT NULL,
    warehouse_location_id BIGINT,
    
    -- Batch/Lot
    batch_number VARCHAR(100),
    lot_number VARCHAR(100),
    expiry_date DATE,
    
    -- Adjustment quantity (positive = add, negative = remove)
    adjustment_quantity DECIMAL(15,3) NOT NULL,
    
    -- Stock levels
    previous_quantity DECIMAL(15,3),
    new_quantity DECIMAL(15,3),
    
    -- Costing
    unit_cost DECIMAL(15,2),
    
    -- Additional info
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    
    FOREIGN KEY (stock_adjustment_id) REFERENCES stock_adjustments(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_location_id) REFERENCES warehouse_locations(id)
);

CREATE INDEX idx_stock_adjustment_items_adjustment ON stock_adjustment_items(stock_adjustment_id);
CREATE INDEX idx_stock_adjustment_items_item ON stock_adjustment_items(item_type, item_id);
CREATE INDEX idx_stock_adjustment_items_batch ON stock_adjustment_items(batch_number);

CREATE TRIGGER update_stock_adjustment_items_updated_at BEFORE UPDATE ON stock_adjustment_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
