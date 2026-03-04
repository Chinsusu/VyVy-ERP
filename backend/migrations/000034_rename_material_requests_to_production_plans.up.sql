-- Rename material_requests -> production_plans
ALTER TABLE material_requests RENAME TO production_plans;

-- Rename serial sequence if exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'material_requests_id_seq') THEN
        ALTER SEQUENCE material_requests_id_seq RENAME TO production_plans_id_seq;
    END IF;
END $$;

-- Rename material_request_items -> production_plan_items
ALTER TABLE material_request_items RENAME TO production_plan_items;

-- Rename column material_request_id -> production_plan_id in production_plan_items
ALTER TABLE production_plan_items RENAME COLUMN material_request_id TO production_plan_id;

-- Rename item sequence if exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'material_request_items_id_seq') THEN
        ALTER SEQUENCE material_request_items_id_seq RENAME TO production_plan_items_id_seq;
    END IF;
END $$;

-- Rename mr_number column to plan_number
ALTER TABLE production_plans RENAME COLUMN mr_number TO plan_number;

-- Update audit_logs table_name references (optional - keeps old history)
UPDATE audit_logs SET table_name = 'production_plans' WHERE table_name = 'material_requests';
