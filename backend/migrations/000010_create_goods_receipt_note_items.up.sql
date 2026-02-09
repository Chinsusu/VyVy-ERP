-- Create goods_receipt_note_items table
CREATE TABLE IF NOT EXISTS goods_receipt_note_items (
    id BIGSERIAL PRIMARY KEY,
    grn_id BIGINT NOT NULL,
    po_item_id BIGINT NOT NULL,
    material_id BIGINT NOT NULL,
    warehouse_location_id BIGINT,
    
    -- Quantity
    quantity DECIMAL(15,3) NOT NULL,
    accepted_quantity DECIMAL(15,3) DEFAULT 0,
    rejected_quantity DECIMAL(15,3) DEFAULT 0,
    
    -- Batch/Lot tracking
    batch_number VARCHAR(100),
    lot_number VARCHAR(100),
    manufacture_date DATE,
    expiry_date DATE,
    
    -- Pricing
    unit_cost DECIMAL(15,2) NOT NULL,
    
    -- QC
    qc_status VARCHAR(50),
    qc_notes TEXT,
    
    -- Additional info
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    
    FOREIGN KEY (grn_id) REFERENCES goods_receipt_notes(id) ON DELETE CASCADE,
    FOREIGN KEY (po_item_id) REFERENCES purchase_order_items(id),
    FOREIGN KEY (material_id) REFERENCES materials(id),
    FOREIGN KEY (warehouse_location_id) REFERENCES warehouse_locations(id)
);

CREATE INDEX idx_goods_receipt_note_items_grn ON goods_receipt_note_items(grn_id);
CREATE INDEX idx_goods_receipt_note_items_po_item ON goods_receipt_note_items(po_item_id);
CREATE INDEX idx_goods_receipt_note_items_material ON goods_receipt_note_items(material_id);
CREATE INDEX idx_goods_receipt_note_items_batch ON goods_receipt_note_items(batch_number);
CREATE INDEX idx_goods_receipt_note_items_lot ON goods_receipt_note_items(lot_number);
CREATE INDEX idx_goods_receipt_note_items_expiry ON goods_receipt_note_items(expiry_date);

CREATE TRIGGER update_goods_receipt_note_items_updated_at BEFORE UPDATE ON goods_receipt_note_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
