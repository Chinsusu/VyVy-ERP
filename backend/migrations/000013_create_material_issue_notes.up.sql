-- Create material_issue_notes table
CREATE TABLE IF NOT EXISTS material_issue_notes (
    id BIGSERIAL PRIMARY KEY,
    min_number VARCHAR(50) UNIQUE NOT NULL,
    material_request_id BIGINT NOT NULL,
    warehouse_id BIGINT NOT NULL,
    
    -- Dates
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    
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
    
    FOREIGN KEY (material_request_id) REFERENCES material_requests(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (posted_by) REFERENCES users(id)
);

CREATE INDEX idx_material_issue_notes_number ON material_issue_notes(min_number);
CREATE INDEX idx_material_issue_notes_mr ON material_issue_notes(material_request_id);
CREATE INDEX idx_material_issue_notes_warehouse ON material_issue_notes(warehouse_id);
CREATE INDEX idx_material_issue_notes_status ON material_issue_notes(status);
CREATE INDEX idx_material_issue_notes_issue_date ON material_issue_notes(issue_date);

CREATE TRIGGER update_material_issue_notes_updated_at BEFORE UPDATE ON material_issue_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
