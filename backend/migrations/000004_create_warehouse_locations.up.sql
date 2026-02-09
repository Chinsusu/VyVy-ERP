-- Create warehouse_locations table
CREATE TABLE IF NOT EXISTS warehouse_locations (
    id BIGSERIAL PRIMARY KEY,
    warehouse_id BIGINT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    aisle VARCHAR(10),
    rack VARCHAR(10),
    shelf VARCHAR(10),
    bin VARCHAR(10),
    location_type VARCHAR(50) DEFAULT 'storage',
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

-- Create indexes
CREATE INDEX idx_warehouse_locations_code ON warehouse_locations(code);
CREATE INDEX idx_warehouse_locations_warehouse ON warehouse_locations(warehouse_id);
CREATE INDEX idx_warehouse_locations_type ON warehouse_locations(location_type);

-- Create trigger
CREATE TRIGGER update_warehouse_locations_updated_at BEFORE UPDATE ON warehouse_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
