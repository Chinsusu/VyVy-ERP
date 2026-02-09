-- Create stock_balance table (current stock levels)
CREATE TABLE IF NOT EXISTS stock_balance (
    id BIGSERIAL PRIMARY KEY,
    item_type VARCHAR(20) NOT NULL,
    item_id BIGINT NOT NULL,
    warehouse_id BIGINT NOT NULL,
    warehouse_location_id BIGINT,
    
    -- Batch/Lot tracking
    batch_number VARCHAR(100),
    lot_number VARCHAR(100),
    manufacture_date DATE,
    expiry_date DATE,
    
    -- Quantity
    quantity DECIMAL(15,3) NOT NULL DEFAULT 0,
    reserved_quantity DECIMAL(15,3) DEFAULT 0,
    available_quantity DECIMAL(15,3) GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    
    -- Costing (weighted average)
    unit_cost DECIMAL(15,2),
    total_cost DECIMAL(15,2),
    
    -- Timestamps
    last_transaction_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (warehouse_location_id) REFERENCES warehouse_locations(id),
    
    -- Unique constraint: one record per item/warehouse/location/batch combination
    UNIQUE(item_type, item_id, warehouse_id, warehouse_location_id, batch_number, lot_number)
);

CREATE INDEX idx_stock_balance_item ON stock_balance(item_type, item_id);
CREATE INDEX idx_stock_balance_warehouse ON stock_balance(warehouse_id);
CREATE INDEX idx_stock_balance_location ON stock_balance(warehouse_location_id);
CREATE INDEX idx_stock_balance_batch ON stock_balance(batch_number);
CREATE INDEX idx_stock_balance_lot ON stock_balance(lot_number);
CREATE INDEX idx_stock_balance_expiry ON stock_balance(expiry_date);
CREATE INDEX idx_stock_balance_available_qty ON stock_balance(available_quantity);

CREATE TRIGGER update_stock_balance_updated_at BEFORE UPDATE ON stock_balance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
