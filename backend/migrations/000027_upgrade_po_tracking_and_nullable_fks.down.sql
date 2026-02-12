-- Reverse migration 000027

ALTER TABLE purchase_orders DROP COLUMN IF EXISTS po_type;
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS approval_status;
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS order_status;
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS receipt_status;
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS payment_status;
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS invoice_status;
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS vat_rate;
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS invoice_number;
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS invoice_date;
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS description;

ALTER TABLE goods_receipt_notes ALTER COLUMN purchase_order_id SET NOT NULL;
ALTER TABLE material_issue_notes ALTER COLUMN material_request_id SET NOT NULL;
