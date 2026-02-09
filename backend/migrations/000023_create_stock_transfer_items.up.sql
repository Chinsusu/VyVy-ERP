-- Create stock_transfer_items table
CREATE TABLE IF NOT EXISTS stock_transfer_items (
    id BIGSERIAL PRIMARY KEY,
    stock_transfer_id BIGINT NOT NULL,
    item_type VARCHAR(20) NOT NULL,
    item_id BIGINT NOT NULL,
    
    -- From location
    from_location_id BIGINT,
    -- To location  
    to_location_id BIGINT,
    
    -- Batch/Lot
    batch_number VARCHAR(100),
    lot_number VARCHAR(100),
    expiry_date DATE,
    
    -- Quantity
    quantity DECIMAL(15,3) NOT NULL,
    received_quantity DECIMAL(15,3) DEFAULT 0,
    
    -- Costing
    unit_cost DECIMAL(15,2),
    
    -- Additional info
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    
    FOREIGN KEY (stock_transfer_id) REFERENCES stock_transfers(id) ON DELETE CASCADE,
    FOREIGN KEY (from_location_id) REFERENCES warehouse_locations(id),
    FOREIGN KEY (to_location_id) REFERENCES warehouse_locations(id)
);

CREATE INDEX idx_stock_transfer_items_transfer ON stock_transfer_items(stock_transfer_id);
CREATE INDEX idx_stock_transfer_items_item ON stock_transfer_items(item_type, item_id);
CREATE INDEX idx_stock_transfer_items_batch ON stock_transfer_items(batch_number);

CREATE TRIGGER update_stock_transfer_items_updated_at BEFORE UPDATE ON stock_transfer_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
