-- Create material_requests table
CREATE TABLE IF NOT EXISTS material_requests (
    id BIGSERIAL PRIMARY KEY,
    mr_number VARCHAR(50) UNIQUE NOT NULL,
    warehouse_id BIGINT NOT NULL,
    department VARCHAR(100),
    
    -- Dates
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    required_date DATE,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    
    -- Approval
    approved_by BIGINT,
    approved_at TIMESTAMP,
    
    -- Purpose
    purpose TEXT,
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE INDEX idx_material_requests_number ON material_requests(mr_number);
CREATE INDEX idx_material_requests_warehouse ON material_requests(warehouse_id);
CREATE INDEX idx_material_requests_status ON material_requests(status);
CREATE INDEX idx_material_requests_request_date ON material_requests(request_date);

CREATE TRIGGER update_material_requests_updated_at BEFORE UPDATE ON material_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
