-- Rollback Migration 000029
ALTER TABLE delivery_orders DROP COLUMN IF EXISTS carrier_id;
DROP TABLE IF EXISTS shipping_reconciliation_items;
DROP TABLE IF EXISTS shipping_reconciliations;
DROP TABLE IF EXISTS carriers;
