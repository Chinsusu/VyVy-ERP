-- Drop materials table
DROP TRIGGER IF EXISTS update_materials_updated_at ON materials;
DROP TABLE IF EXISTS materials CASCADE;
