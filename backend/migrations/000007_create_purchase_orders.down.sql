-- Drop purchase_orders table
DROP TRIGGER IF EXISTS update_purchase_orders_updated_at ON purchase_orders;
DROP TABLE IF EXISTS purchase_orders CASCADE;
