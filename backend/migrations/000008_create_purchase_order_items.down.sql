-- Drop purchase_order_items table
DROP TRIGGER IF EXISTS update_purchase_order_items_updated_at ON purchase_order_items;
DROP TABLE IF EXISTS purchase_order_items CASCADE;
