ALTER TABLE production_plans DROP COLUMN IF EXISTS procurement_status;
DROP INDEX IF EXISTS idx_production_plans_procurement_status;
