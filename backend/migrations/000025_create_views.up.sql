-- Create useful views for reporting and queries

-- View 1: Material stock summary with batch details
CREATE OR REPLACE VIEW v_material_stock_summary AS
SELECT 
    m.id AS material_id,
    m.code AS material_code,
    m.trading_name AS material_name,
    m.category,
    m.unit,
    w.id AS warehouse_id,
    w.name AS warehouse_name,
    sb.batch_number,
    sb.lot_number,
    sb.expiry_date,
    sb.quantity,
    sb.reserved_quantity,
    sb.available_quantity,
    sb.unit_cost,
    sb.total_cost,
    CASE 
        WHEN sb.expiry_date IS NOT NULL AND sb.expiry_date <= CURRENT_DATE THEN 'expired'
        WHEN sb.expiry_date IS NOT NULL AND sb.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'exp iring_soon'
        ELSE 'normal'
    END AS expiry_status
FROM stock_balance sb
JOIN materials m ON sb.item_id = m.id AND sb.item_type = 'material'
JOIN warehouses w ON sb.warehouse_id = w.id
WHERE sb.quantity > 0;

-- View 2: Expiring items alert
CREATE OR REPLACE VIEW v_expiring_items AS
SELECT 
    sb.item_type,
    sb.item_id,
    CASE 
        WHEN sb.item_type = 'material' THEN m.code
        WHEN sb.item_type = 'finished_product' THEN fp.code
    END AS item_code,
    CASE 
        WHEN sb.item_type = 'material' THEN m.trading_name
        WHEN sb.item_type = 'finished_product' THEN fp.name
    END AS item_name,
    w.name AS warehouse_name,
    sb.batch_number,
    sb.lot_number,
    sb.expiry_date,
    sb.quantity,
    sb.available_quantity,
    CURRENT_DATE - sb.expiry_date AS days_past_expiry,
    sb.expiry_date - CURRENT_DATE AS days_until_expiry,
    CASE 
        WHEN sb.expiry_date < CURRENT_DATE THEN 'expired'
        WHEN sb.expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'critical'
        WHEN sb.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'warning'
        ELSE 'normal'
    END AS alert_level
FROM stock_balance sb
JOIN warehouses w ON sb.warehouse_id = w.id
LEFT JOIN materials m ON sb.item_id = m.id AND sb.item_type = 'material'
LEFT JOIN finished_products fp ON sb.item_id = fp.id AND sb.item_type = 'finished_product'
WHERE sb.expiry_date IS NOT NULL 
  AND sb.expiry_date <= CURRENT_DATE + INTERVAL '60 days'
  AND sb.quantity > 0
ORDER BY sb.expiry_date ASC;

-- View 3: Stock movement summary by date range
CREATE OR REPLACE VIEW v_stock_movement_summary AS
SELECT 
    sl.transaction_date::DATE AS movement_date,
    sl.item_type,
    sl.item_id,
    CASE 
        WHEN sl.item_type = 'material' THEN m.code
        WHEN sl.item_type = 'finished_product' THEN fp.code
    END AS item_code,
    CASE 
        WHEN sl.item_type = 'material' THEN m.trading_name
        WHEN sl.item_type = 'finished_product' THEN fp.name
    END AS item_name,
    w.name AS warehouse_name,
    sl.transaction_type,
    COUNT(*) AS transaction_count,
    SUM(CASE WHEN sl.quantity > 0 THEN sl.quantity ELSE 0 END) AS total_in,
    ABS(SUM(CASE WHEN sl.quantity < 0 THEN sl.quantity ELSE 0 END)) AS total_out,
    SUM(sl.quantity) AS net_movement
FROM stock_ledger sl
JOIN warehouses w ON sl.warehouse_id = w.id
LEFT JOIN materials m ON sl.item_id = m.id AND sl.item_type = 'material'
LEFT JOIN finished_products fp ON sl.item_id = fp.id AND sl.item_type = 'finished_product'
GROUP BY 
    sl.transaction_date::DATE,
    sl.item_type,
    sl.item_id,
    item_code,
    item_name,
    w.name,
    sl.transaction_type;
