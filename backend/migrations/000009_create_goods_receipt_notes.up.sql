-- Create goods_receipt_notes table
CREATE TABLE IF NOT EXISTS goods_receipt_notes (
    id BIGSERIAL PRIMARY KEY,
    grn_number VARCHAR(50) UNIQUE NOT NULL,
    purchase_order_id BIGINT NOT NULL,
    warehouse_id BIGINT NOT NULL,
    
    -- Dates
    receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending_qc',
    
    -- QC
    qc_status VARCHAR(50),
    qc_approved_by BIGINT,
    qc_approved_at TIMESTAMP,
    qc_notes TEXT,
    
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
    
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (qc_approved_by) REFERENCES users(id),
    FOREIGN KEY (posted_by) REFERENCES users(id)
);

CREATE INDEX idx_goods_receipt_notes_number ON goods_receipt_notes(grn_number);
CREATE INDEX idx_goods_receipt_notes_po ON goods_receipt_notes(purchase_order_id);
CREATE INDEX idx_goods_receipt_notes_warehouse ON goods_receipt_notes(warehouse_id);
CREATE INDEX idx_goods_receipt_notes_status ON goods_receipt_notes(status);
CREATE INDEX idx_goods_receipt_notes_receipt_date ON goods_receipt_notes(receipt_date);

CREATE TRIGGER update_goods_receipt_notes_updated_at BEFORE UPDATE ON goods_receipt_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
