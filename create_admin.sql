INSERT INTO users (username, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES ('admin', 'admin@vyvy.com', '$2b$10$HQs0i3t.Kma4BkUfWiXfU.tAxyjR8ifIPtkMwObHA7mVW0.MwtDdC', 'Administrator', 'admin', true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin', is_active = true;
SELECT id, username, email, role, is_active FROM users WHERE email = 'admin@vyvy.com';
