-- Revert migration 000028
DROP INDEX IF EXISTS idx_delivery_orders_sales_channel_id;
ALTER TABLE delivery_orders DROP COLUMN IF EXISTS sales_channel_id;
DROP TABLE IF EXISTS sales_channels;
