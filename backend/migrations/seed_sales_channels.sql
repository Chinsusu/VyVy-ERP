-- Seed data: Sales Channels
-- Source: File 4 THIẾT LẬP > Kênh bán: Shopee, Tiktok, Facebook, Lazada, Chi nhánh

INSERT INTO sales_channels (code, name, platform_type, is_active, description, created_at, updated_at)
VALUES
    ('SHOPEE', 'Shopee', 'marketplace', true, 'Sàn thương mại điện tử Shopee', NOW(), NOW()),
    ('TIKTOK', 'Tiktok Shop', 'social', true, 'Kênh bán trên Tiktok Shop', NOW(), NOW()),
    ('FACEBOOK', 'Facebook', 'social', true, 'Kênh bán trên Facebook / Fanpage', NOW(), NOW()),
    ('LAZADA', 'Lazada', 'marketplace', true, 'Sàn thương mại điện tử Lazada', NOW(), NOW()),
    ('BRANCH', 'Chi nhánh', 'branch', true, 'Bán trực tiếp tại chi nhánh / cửa hàng', NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    platform_type = EXCLUDED.platform_type;

-- Reset sequence
SELECT setval('sales_channels_id_seq', COALESCE((SELECT MAX(id) FROM sales_channels), 0) + 1, false);
