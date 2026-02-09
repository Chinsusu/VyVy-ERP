-- Create stock_transfers table
CREATE TABLE IF NOT EXISTS stock_transfers (
    id BIGSERIAL PRIMARY KEY,
    transfer_number VARCHAR(50) UNIQUE NOT NULL,
    from_warehouse_id BIGINT NOT NULL,
    to_warehouse_id BIGINT NOT NULL,
    transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    
    -- Approval
    approved_by BIGINT,
    approved_at TIMESTAMP,
    
    -- Shipping
    shipped_by BIGINT,
    shipped_at TIMESTAMP,
    
    -- Receipt
    received_by BIGINT,
    received_at TIMESTAMP,
    
    -- Posting
    posted BOOLEAN DEFAULT FALSE,
    posted_by BIGINT,
    posted_at TIMESTAMP,
    
    -- Additional info
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    
    FOREIGN KEY (from_warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (to_warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (shipped_by) REFERENCES users(id),
    FOREIGN KEY (received_by) REFERENCES users(id),
    FOREIGN KEY (posted_by) REFERENCES users(id)
);

CREATE INDEX idx_stock_transfers_number ON stock_transfers(transfer_number);
CREATE INDEX idx_stock_transfers_from_warehouse ON stock_transfers(from_warehouse_id);
CREATE INDEX idx_stock_transfers_to_warehouse ON stock_transfers(to_warehouse_id);
CREATE INDEX idx_stock_transfers_status ON stock_transfers(status);
CREATE INDEX idx_stock_transfers_date ON stock_transfers(transfer_date);

CREATE TRIGGER update_stock_transfers_updated_at BEFORE UPDATE ON stock_transfers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
