-- Migration 000027: Upgrade PO tracking + allow NULL FKs for historical imports
-- 
-- PO: Add multi-step tracking (matching spreadsheet workflow: DUYỆT CHI → ĐẶT HÀNG → NHẬN HÀNG → THANH TOÁN → HÓA ĐƠN)
-- GRN: Allow NULL purchase_order_id for opening balance / direct receipts
-- MIN: Allow NULL material_request_id for direct production issues

-- 1. PO tracking fields
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS po_type VARCHAR(50) DEFAULT 'material';
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS order_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS receipt_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS invoice_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(100);
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS invoice_date DATE;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS description TEXT;

CREATE INDEX IF NOT EXISTS idx_purchase_orders_po_type ON purchase_orders(po_type);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_approval_status ON purchase_orders(approval_status);

-- 2. GRN: Make purchase_order_id nullable for opening balances
ALTER TABLE goods_receipt_notes ALTER COLUMN purchase_order_id DROP NOT NULL;

-- 3. MIN: Make material_request_id nullable for direct issues
ALTER TABLE material_issue_notes ALTER COLUMN material_request_id DROP NOT NULL;

-- 4. MIN Items: Make mr_item_id nullable for direct issues
ALTER TABLE material_issue_note_items ALTER COLUMN mr_item_id DROP NOT NULL;
