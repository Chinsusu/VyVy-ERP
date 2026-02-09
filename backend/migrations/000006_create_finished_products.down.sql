-- Drop finished_products table
DROP TRIGGER IF EXISTS update_finished_products_updated_at ON finished_products;
DROP TABLE IF EXISTS finished_products CASCADE;
