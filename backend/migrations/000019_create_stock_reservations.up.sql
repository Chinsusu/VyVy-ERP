-- Create stock_reservations table
CREATE TABLE IF NOT EXISTS stock_reservations (
    id BIGSERIAL PRIMARY KEY,
    item_type VARCHAR(20) NOT NULL,
    item_id BIGINT NOT NULL,
    warehouse_id BIGINT NOT NULL,
    warehouse_location_id BIGINT,
    
    -- Batch/Lot
    batch_number VARCHAR(100),
    lot_number VARCHAR(100),
    
    -- Reservation details
    reserved_quantity DECIMAL(15,3) NOT NULL,
    fulfilled_quantity DECIMAL(15,3) DEFAULT 0,
    
    -- Reference (what is reserving this stock)
    reference_type VARCHAR(50) NOT NULL,
    reference_id BIGINT NOT NULL,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    expires_at TIMESTAMP,
    
    -- Additional info
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (warehouse_location_id) REFERENCES warehouse_locations(id)
);

CREATE INDEX idx_stock_reservations_item ON stock_reservations(item_type, item_id);
CREATE INDEX idx_stock_reservations_warehouse ON stock_reservations(warehouse_id);
CREATE INDEX idx_stock_reservations_reference ON stock_reservations(reference_type, reference_id);
CREATE INDEX idx_stock_reservations_status ON stock_reservations(status);
CREATE INDEX idx_stock_reservations_expires_at ON stock_reservations(expires_at);

CREATE TRIGGER update_stock_reservations_updated_at BEFORE UPDATE ON stock_reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
