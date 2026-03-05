-- Revert: shrink action column back (may fail if existing data is too long)
ALTER TABLE audit_logs ALTER COLUMN action TYPE varchar(20);
