-- Migration 000028: Add sales channels + link to delivery orders
-- Source: File 4 THIẾT LẬP > Kênh bán: Shopee, Tiktok, Facebook, Lazada, Chi nhánh

-- 1. Create sales_channels table
CREATE TABLE IF NOT EXISTS sales_channels (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    platform_type VARCHAR(50) NOT NULL DEFAULT 'other',  -- marketplace, social, branch, other
    is_active BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by BIGINT REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by BIGINT REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_sales_channels_code ON sales_channels(code);
CREATE INDEX IF NOT EXISTS idx_sales_channels_platform_type ON sales_channels(platform_type);
CREATE INDEX IF NOT EXISTS idx_sales_channels_is_active ON sales_channels(is_active);

-- 2. Add sales_channel_id to delivery_orders
ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS sales_channel_id BIGINT REFERENCES sales_channels(id);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_sales_channel_id ON delivery_orders(sales_channel_id);
