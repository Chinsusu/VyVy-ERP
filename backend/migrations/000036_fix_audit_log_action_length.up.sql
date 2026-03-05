-- Fix audit_logs action column: increase length from varchar(20) to varchar(50)
-- to support longer action names like UPDATE_PAYMENT_STATUS, UPDATE_INVOICE_STATUS
ALTER TABLE audit_logs ALTER COLUMN action TYPE varchar(50);
