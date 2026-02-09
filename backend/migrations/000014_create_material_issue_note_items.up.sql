-- Create material_issue_note_items table
CREATE TABLE IF NOT EXISTS material_issue_note_items (
    id BIGSERIAL PRIMARY KEY,
    min_id BIGINT NOT NULL,
    mr_item_id BIGINT NOT NULL,
    material_id BIGINT NOT NULL,
    warehouse_location_id BIGINT,
    
    -- Batch/Lot tracking (FIFO/FEFO)
    batch_number VARCHAR(100),
    lot_number VARCHAR(100),
    expiry_date DATE,
    
    -- Quantity
    quantity DECIMAL(15,3) NOT NULL,
    
    -- Costing
    unit_cost DECIMAL(15,2),
    
    -- Additional info
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    
    FOREIGN KEY (min_id) REFERENCES material_issue_notes(id) ON DELETE CASCADE,
    FOREIGN KEY (mr_item_id) REFERENCES material_request_items(id),
    FOREIGN KEY (material_id) REFERENCES materials(id),
    FOREIGN KEY (warehouse_location_id) REFERENCES warehouse_locations(id)
);

CREATE INDEX idx_material_issue_note_items_min ON material_issue_note_items(min_id);
CREATE INDEX idx_material_issue_note_items_mr_item ON material_issue_note_items(mr_item_id);
CREATE INDEX idx_material_issue_note_items_material ON material_issue_note_items(material_id);
CREATE INDEX idx_material_issue_note_items_batch ON material_issue_note_items(batch_number);
CREATE INDEX idx_material_issue_note_items_lot ON material_issue_note_items(lot_number);

CREATE TRIGGER update_material_issue_note_items_updated_at BEFORE UPDATE ON material_issue_note_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
