-- Create stock_ledger table (transaction history)
CREATE TABLE IF NOT EXISTS stock_ledger (
    id BIGSERIAL PRIMARY KEY,
    transaction_type VARCHAR(50) NOT NULL,
    transaction_number VARCHAR(50) NOT NULL,
    transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Item details
    item_type VARCHAR(20) NOT NULL,
    item_id BIGINT NOT NULL,
    warehouse_id BIGINT NOT NULL,
    warehouse_location_id BIGINT,
    
    -- Batch/Lot tracking
    batch_number VARCHAR(100),
    lot_number VARCHAR(100),
    expiry_date DATE,
    
    -- Quantity (positive = in, negative = out)
    quantity DECIMAL(15,3) NOT NULL,
    
    -- Costing
    unit_cost DECIMAL(15,2),
    total_cost DECIMAL(15,2),
    
    -- Balance after transaction
    balance_quantity DECIMAL(15,3),
    
    -- Reference
    reference_type VARCHAR(50),
    reference_id BIGINT,
    
    -- Additional info
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (warehouse_location_id) REFERENCES warehouse_locations(id)
);

CREATE INDEX idx_stock_ledger_item ON stock_ledger(item_type, item_id);
CREATE INDEX idx_stock_ledger_warehouse ON stock_ledger(warehouse_id);
CREATE INDEX idx_stock_ledger_location ON stock_ledger(warehouse_location_id);
CREATE INDEX idx_stock_ledger_batch ON stock_ledger(batch_number);
CREATE INDEX idx_stock_ledger_lot ON stock_ledger(lot_number);
CREATE INDEX idx_stock_ledger_transaction_date ON stock_ledger(transaction_date);
CREATE INDEX idx_stock_ledger_transaction_type ON stock_ledger(transaction_type);
