-- Create delivery_orders table
CREATE TABLE IF NOT EXISTS delivery_orders (
    id BIGSERIAL PRIMARY KEY,
    do_number VARCHAR(50) UNIQUE NOT NULL,
    warehouse_id BIGINT NOT  NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_address TEXT,
    
    -- Dates
    delivery_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    
    -- Posting
    posted BOOLEAN DEFAULT FALSE,
    posted_by BIGINT,
    posted_at TIMESTAMP,
    
    -- Shipping
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(100),
    
    -- Additional info
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (posted_by) REFERENCES users(id)
);

CREATE INDEX idx_delivery_orders_number ON delivery_orders(do_number);
CREATE INDEX idx_delivery_orders_warehouse ON delivery_orders(warehouse_id);
CREATE INDEX idx_delivery_orders_status ON delivery_orders(status);
CREATE INDEX idx_delivery_orders_delivery_date ON delivery_orders(delivery_date);
CREATE INDEX idx_delivery_orders_customer ON delivery_orders(customer_name);

CREATE TRIGGER update_delivery_orders_updated_at BEFORE UPDATE ON delivery_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
