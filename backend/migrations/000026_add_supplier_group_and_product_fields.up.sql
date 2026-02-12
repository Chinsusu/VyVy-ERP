-- Add supplier_group to suppliers
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS supplier_group VARCHAR(50);
CREATE INDEX IF NOT EXISTS idx_suppliers_supplier_group ON suppliers(supplier_group);

-- Add product_type and sales_status to finished_products
ALTER TABLE finished_products ADD COLUMN IF NOT EXISTS product_type VARCHAR(50);
ALTER TABLE finished_products ADD COLUMN IF NOT EXISTS sales_status VARCHAR(50) DEFAULT 'ĐANG_BÁN';
CREATE INDEX IF NOT EXISTS idx_finished_products_product_type ON finished_products(product_type);
