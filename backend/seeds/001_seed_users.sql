-- Clear existing test users and insert with properly hashed passwords
DELETE FROM users WHERE email IN ('admin@vyvy.com', 'manager@vyvy.com', 'staff@vyvy.com', 'qc@vyvy.com', 'procurement@vyvy.com');

-- The hash below is for password: password123
-- Generated using bcrypt with cost 10
INSERT INTO users (username, email, password_hash, full_name, role, is_active, created_at)
VALUES 
  ('admin', 'admin@vyvy.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Administrator', 'admin', TRUE, NOW()),
  ('manager', 'manager@vyvy.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Warehouse Manager', 'warehouse_manager', TRUE, NOW()),
  ('staff', 'staff@vyvy.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Warehouse Staff', 'warehouse_staff', TRUE, NOW()),
  ('qc', 'qc@vyvy.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'QC Staff', 'qc_staff', TRUE, NOW()),
  ('procurement', 'procurement@vyvy.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Procurement Staff', 'procurement_staff', TRUE, NOW());
