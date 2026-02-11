-- Drop composite indexes added for performance optimization

DROP INDEX IF EXISTS idx_stock_ledger_query;
DROP INDEX IF EXISTS idx_stock_ledger_reference_lookup;
DROP INDEX IF EXISTS idx_stock_reservations_lookup;
DROP INDEX IF EXISTS idx_stock_reservations_item_status;
DROP INDEX IF EXISTS idx_purchase_orders_supplier_status;
DROP INDEX IF EXISTS idx_purchase_orders_warehouse_status;
DROP INDEX IF EXISTS idx_material_requests_status_date;
