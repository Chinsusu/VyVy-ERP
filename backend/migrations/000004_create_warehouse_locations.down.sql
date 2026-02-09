-- Drop warehouse_locations table
DROP TRIGGER IF EXISTS update_warehouse_locations_updated_at ON warehouse_locations;
DROP TABLE IF EXISTS warehouse_locations CASCADE;
