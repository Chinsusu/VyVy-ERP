-- Add procurement_status to production_plans to track the full procurement lifecycle
-- Statuses: draft -> ordering -> receiving -> received -> in_production -> completed | cancelled
ALTER TABLE production_plans
    ADD COLUMN IF NOT EXISTS procurement_status VARCHAR(50) NOT NULL DEFAULT 'draft';

-- Sync existing approved plans to 'ordering' if they have related POs
-- (initial migration only, no automated sync needed - new records start at draft)

CREATE INDEX IF NOT EXISTS idx_production_plans_procurement_status ON production_plans(procurement_status);
