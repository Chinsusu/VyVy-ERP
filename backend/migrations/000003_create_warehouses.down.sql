-- Drop warehouses table
DROP TRIGGER IF EXISTS update_warehouses_updated_at ON warehouses;
DROP TABLE IF EXISTS warehouses CASCADE;
