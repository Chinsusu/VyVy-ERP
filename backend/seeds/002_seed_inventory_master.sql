-- Seed Warehouses
INSERT INTO warehouses (id, code, name, address, is_active) 
VALUES (1, 'WH-MAIN', 'Main Warehouse', 'Factory Building A', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO warehouses (id, code, name, address, is_active) 
VALUES (2, 'WH-SUB', 'Sub Warehouse', 'Factory Building B', true)
ON CONFLICT (code) DO NOTHING;

-- Seed Warehouse Locations
INSERT INTO warehouse_locations (id, warehouse_id, code, name, is_active) 
VALUES (1, 1, 'LOC-01', 'Storage Shelf 01', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO warehouse_locations (id, warehouse_id, code, name, is_active) 
VALUES (2, 2, 'LOC-02', 'Storage Shelf 02', true)
ON CONFLICT (code) DO NOTHING;

-- Seed Suppliers
INSERT INTO suppliers (id, code, name, contact_person, email, is_active) 
VALUES (1, 'SUP-001', 'Test Supplier', 'Mr. Test', 'test@supplier.com', true)
ON CONFLICT (code) DO NOTHING;

-- Seed Materials
INSERT INTO materials (id, code, trading_name, material_type, category, unit, supplier_id, standard_cost, is_active) 
VALUES (1, 'MAT-001', 'Test Material 01', 'Raw Material', 'Chemicals', 'KG', 1, 100.00, true)
ON CONFLICT (code) DO NOTHING;

-- Seed Finished Products
INSERT INTO finished_products (id, code, name, category, unit, standard_cost, is_active) 
VALUES (1, 'FP-001', 'Test Product 01', 'Cosmetics', 'PCS', 500.00, true)
ON CONFLICT (code) DO NOTHING;
