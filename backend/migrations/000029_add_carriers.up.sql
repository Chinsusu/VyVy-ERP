-- Migration 000029: Add carriers, shipping reconciliation, and carrier_id to delivery_orders
-- Phase 4: Carrier Management + Shipping Reconciliation

-- 1. Create carriers table
CREATE TABLE IF NOT EXISTS carriers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    carrier_type VARCHAR(50) NOT NULL DEFAULT 'express',  -- express, freight, internal
    contact_phone VARCHAR(50),
    contact_email VARCHAR(100),
    website VARCHAR(255),
    tracking_url_template VARCHAR(500),  -- e.g. https://jtexpress.vn/tracking?bill={tracking}
    shipping_fee_config JSONB DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by BIGINT REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by BIGINT REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_carriers_code ON carriers(code);
CREATE INDEX IF NOT EXISTS idx_carriers_carrier_type ON carriers(carrier_type);
CREATE INDEX IF NOT EXISTS idx_carriers_is_active ON carriers(is_active);

-- 2. Create shipping_reconciliations table
CREATE TABLE IF NOT EXISTS shipping_reconciliations (
    id SERIAL PRIMARY KEY,
    reconciliation_number VARCHAR(50) NOT NULL UNIQUE,
    carrier_id BIGINT NOT NULL REFERENCES carriers(id),
    period_start DATE,
    period_end DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',  -- draft, processing, completed, confirmed
    total_orders INT DEFAULT 0,
    total_matched INT DEFAULT 0,
    total_discrepancy INT DEFAULT 0,
    total_cod_expected DECIMAL(15,2) DEFAULT 0,
    total_cod_actual DECIMAL(15,2) DEFAULT 0,
    total_shipping_fee DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by BIGINT REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by BIGINT REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_shipping_reconciliations_carrier ON shipping_reconciliations(carrier_id);
CREATE INDEX IF NOT EXISTS idx_shipping_reconciliations_status ON shipping_reconciliations(status);
CREATE INDEX IF NOT EXISTS idx_shipping_reconciliations_number ON shipping_reconciliations(reconciliation_number);

-- 3. Create shipping_reconciliation_items table
CREATE TABLE IF NOT EXISTS shipping_reconciliation_items (
    id SERIAL PRIMARY KEY,
    reconciliation_id BIGINT NOT NULL REFERENCES shipping_reconciliations(id) ON DELETE CASCADE,
    delivery_order_id BIGINT REFERENCES delivery_orders(id),
    tracking_number VARCHAR(100),
    carrier_status VARCHAR(100),                -- delivered, returned, lost, in_transit
    cod_amount DECIMAL(15,2) DEFAULT 0,         -- COD carrier thu hộ
    shipping_fee DECIMAL(15,2) DEFAULT 0,       -- Phí ship thực tế
    actual_received DECIMAL(15,2) DEFAULT 0,    -- Thực nhận (COD - phí ship)
    match_status VARCHAR(50) NOT NULL DEFAULT 'pending',  -- pending, matched, discrepancy, unmatched
    discrepancy_amount DECIMAL(15,2) DEFAULT 0,
    discrepancy_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_items_recon ON shipping_reconciliation_items(reconciliation_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_items_do ON shipping_reconciliation_items(delivery_order_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_items_tracking ON shipping_reconciliation_items(tracking_number);
CREATE INDEX IF NOT EXISTS idx_reconciliation_items_status ON shipping_reconciliation_items(match_status);

-- 4. Add carrier_id FK to delivery_orders
ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS carrier_id BIGINT REFERENCES carriers(id);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_carrier_id ON delivery_orders(carrier_id);
