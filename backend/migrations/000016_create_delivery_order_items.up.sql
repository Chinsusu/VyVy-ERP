-- Create delivery_order_items table
CREATE TABLE IF NOT EXISTS delivery_order_items (
    id BIGSERIAL PRIMARY KEY,
    delivery_order_id BIGINT NOT NULL,
    finished_product_id BIGINT NOT NULL,
    warehouse_location_id BIGINT,
    
    -- Batch/Lot tracking
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
    
    FOREIGN KEY (delivery_order_id) REFERENCES delivery_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (finished_product_id) REFERENCES finished_products(id),
    FOREIGN KEY (warehouse_location_id) REFERENCES warehouse_locations(id)
);

CREATE INDEX idx_delivery_order_items_do ON delivery_order_items(delivery_order_id);
CREATE INDEX idx_delivery_order_items_product ON delivery_order_items(finished_product_id);
CREATE INDEX idx_delivery_order_items_batch ON delivery_order_items(batch_number);
CREATE INDEX idx_delivery_order_items_lot ON delivery_order_items(lot_number);

CREATE TRIGGER update_delivery_order_items_updated_at BEFORE UPDATE ON delivery_order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
