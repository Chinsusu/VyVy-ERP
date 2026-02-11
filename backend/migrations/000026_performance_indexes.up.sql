-- Add composite indexes for performance optimization

-- 1. Stock Ledger: Optimize history lookups and balance reconciliation
CREATE INDEX IF NOT EXISTS idx_stock_ledger_query 
    ON stock_ledger(item_type, item_id, warehouse_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_reference_lookup 
    ON stock_ledger(reference_type, reference_id);

-- 2. Stock Reservations: Optimize reservation fulfillment during MIN posting
CREATE INDEX IF NOT EXISTS idx_stock_reservations_lookup 
    ON stock_reservations(reference_type, reference_id, status);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_item_status 
    ON stock_reservations(item_type, item_id, status);

-- 3. Purchase Orders: Optimize filtering in list views
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_status 
    ON purchase_orders(supplier_id, status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_warehouse_status 
    ON purchase_orders(warehouse_id, status);

-- 4. Material Requests: Optimize status-based sorting/filtering
CREATE INDEX IF NOT EXISTS idx_material_requests_status_date 
    ON material_requests(status, created_at DESC);
