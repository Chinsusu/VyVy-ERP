-- Reverse: production_plans -> material_requests
ALTER TABLE production_plans RENAME COLUMN plan_number TO mr_number;
ALTER TABLE production_plan_items RENAME COLUMN production_plan_id TO material_request_id;
ALTER TABLE production_plan_items RENAME TO material_request_items;
ALTER TABLE production_plans RENAME TO material_requests;
UPDATE audit_logs SET table_name = 'material_requests' WHERE table_name = 'production_plans';
