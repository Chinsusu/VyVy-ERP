-- Create stock_adjustments table
CREATE TABLE IF NOT EXISTS stock_adjustments (
    id BIGSERIAL PRIMARY KEY,
    adjustment_number VARCHAR(50) UNIQUE NOT NULL,
    warehouse_id BIGINT NOT NULL,
    adjustment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Reason
    adjustment_type VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    
    -- Approval
    approved_by BIGINT,
    approved_at TIMESTAMP,
    
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
    
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (posted_by) REFERENCES users(id)
);

CREATE INDEX idx_stock_adjustments_number ON stock_adjustments(adjustment_number);
CREATE INDEX idx_stock_adjustments_warehouse ON stock_adjustments(warehouse_id);
CREATE INDEX idx_stock_adjustments_status ON stock_adjustments(status);
CREATE INDEX idx_stock_adjustments_date ON stock_adjustments(adjustment_date);
CREATE INDEX idx_stock_adjustments_type ON stock_adjustments(adjustment_type);

CREATE TRIGGER update_stock_adjustments_updated_at BEFORE UPDATE ON stock_adjustments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
