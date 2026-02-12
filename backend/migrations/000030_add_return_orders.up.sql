-- Return Orders
CREATE TABLE IF NOT EXISTS return_orders (
    id SERIAL PRIMARY KEY,
    return_number VARCHAR(50) NOT NULL UNIQUE,
    delivery_order_id BIGINT NOT NULL REFERENCES delivery_orders(id),
    carrier_id BIGINT REFERENCES carriers(id),
    return_type VARCHAR(50) DEFAULT 'customer_return',
    status VARCHAR(50) DEFAULT 'pending',
    return_date DATE DEFAULT CURRENT_DATE,
    tracking_number VARCHAR(100),
    reason TEXT,
    resolution VARCHAR(50),
    total_items INT DEFAULT 0,
    total_restocked INT DEFAULT 0,
    total_scrapped INT DEFAULT 0,
    refund_amount DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by BIGINT,
    deleted_at TIMESTAMP
);

-- Return Order Items
CREATE TABLE IF NOT EXISTS return_order_items (
    id SERIAL PRIMARY KEY,
    return_order_id BIGINT NOT NULL REFERENCES return_orders(id) ON DELETE CASCADE,
    delivery_order_item_id BIGINT REFERENCES delivery_order_items(id),
    finished_product_id BIGINT NOT NULL REFERENCES finished_products(id),
    quantity_returned INT NOT NULL DEFAULT 1,
    quantity_restocked INT DEFAULT 0,
    quantity_scrapped INT DEFAULT 0,
    condition VARCHAR(50) DEFAULT 'pending_inspection',
    warehouse_id BIGINT REFERENCES warehouses(id),
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_return_orders_do_id ON return_orders(delivery_order_id);
CREATE INDEX idx_return_orders_status ON return_orders(status);
CREATE INDEX idx_return_orders_return_date ON return_orders(return_date);
CREATE INDEX idx_return_orders_deleted_at ON return_orders(deleted_at);
CREATE INDEX idx_return_order_items_ro_id ON return_order_items(return_order_id);
CREATE INDEX idx_return_order_items_product ON return_order_items(finished_product_id);
