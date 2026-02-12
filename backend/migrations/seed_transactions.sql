-- =============================================================================
-- SEED TRANSACTIONAL DATA (Phase 2)
-- Purchase Orders, Goods Receipt Notes, Material Issue Notes
-- Source: Google Spreadsheets (File 2: Kho NVL, File 4: Kho SP)
-- Idempotent: uses ON CONFLICT DO NOTHING
-- =============================================================================

-- =============================================================================
-- 1. PURCHASE ORDERS (Đề Nghị Mua Hàng - NVL)
-- Source: File 2 > Sheet "ĐỀ NGHỊ MUA HÀNG"
-- Mapping: MÃ ĐNTT → po_number, NGÀY → order_date, NCC → supplier_id
-- =============================================================================

-- PO-001: Mua Acid Citric + Acid Lactic từ HOA MAI (01/2025)
INSERT INTO purchase_orders (po_number, supplier_id, warehouse_id, order_date, status, po_type, approval_status, order_status, receipt_status, payment_status, invoice_status, subtotal, tax_amount, total_amount, vat_rate, description, created_by, created_at, updated_at)
VALUES ('PO-2025-000001', 5, 3, '2025-01-08', 'completed', 'material', 'approved', 'ordered', 'received', 'paid', 'received', 3500000, 350000, 3850000, 10, 'Mua Acid Citric 25kg + Acid Lactic 5kg', 1, '2025-01-08', '2025-01-15')
ON CONFLICT (po_number) DO NOTHING;

-- PO-002: Mua hương liệu từ BAHH (01/2025)
INSERT INTO purchase_orders (po_number, supplier_id, warehouse_id, order_date, status, po_type, approval_status, order_status, receipt_status, payment_status, invoice_status, subtotal, tax_amount, total_amount, vat_rate, description, created_by, created_at, updated_at)
VALUES ('PO-2025-000002', 6, 3, '2025-01-12', 'completed', 'material', 'approved', 'ordered', 'received', 'paid', 'received', 8400000, 0, 8400000, 0, 'Mua hương liệu Intense 2kg + Sexy 2kg + Vanbe 1kg', 1, '2025-01-12', '2025-01-20')
ON CONFLICT (po_number) DO NOTHING;

-- PO-003: Mua NVL từ GREEN (02/2025)
INSERT INTO purchase_orders (po_number, supplier_id, warehouse_id, order_date, status, po_type, approval_status, order_status, receipt_status, payment_status, invoice_status, subtotal, tax_amount, total_amount, vat_rate, description, created_by, created_at, updated_at)
VALUES ('PO-2025-000003', 3, 3, '2025-02-05', 'completed', 'material', 'approved', 'ordered', 'received', 'paid', 'received', 15200000, 1520000, 16720000, 10, 'Mua Allantoin 5kg + B3 10kg + BTAC 25kg', 1, '2025-02-05', '2025-02-18')
ON CONFLICT (po_number) DO NOTHING;

-- PO-004: Mua Emulsifier từ GREEN (03/2025)
INSERT INTO purchase_orders (po_number, supplier_id, warehouse_id, order_date, status, po_type, approval_status, order_status, receipt_status, payment_status, invoice_status, subtotal, tax_amount, total_amount, vat_rate, description, created_by, created_at, updated_at)
VALUES ('PO-2025-000004', 3, 3, '2025-03-10', 'completed', 'material', 'approved', 'ordered', 'received', 'paid', 'pending', 22500000, 2250000, 24750000, 10, 'Mua Emulsifier GMS 50kg + Cetyl Alcohol 25kg + Cetearyl Alcohol 25kg', 1, '2025-03-10', '2025-03-25')
ON CONFLICT (po_number) DO NOTHING;

-- PO-005: Mua bao bì từ MONGO (04/2025)
INSERT INTO purchase_orders (po_number, supplier_id, warehouse_id, order_date, status, po_type, approval_status, order_status, receipt_status, payment_status, invoice_status, subtotal, tax_amount, total_amount, vat_rate, description, created_by, created_at, updated_at)
VALUES ('PO-2025-000005', 17, 3, '2025-04-01', 'completed', 'material', 'approved', 'ordered', 'received', 'paid', 'received', 35000000, 3500000, 38500000, 10, 'Mua chai PET nâu 100ml x5000 + chai PET nâu 350ml x3000', 1, '2025-04-01', '2025-04-15')
ON CONFLICT (po_number) DO NOTHING;

-- PO-006: Mua NVL từ Organic (05/2025)
INSERT INTO purchase_orders (po_number, supplier_id, warehouse_id, order_date, status, po_type, approval_status, order_status, receipt_status, payment_status, invoice_status, subtotal, tax_amount, total_amount, vat_rate, description, created_by, created_at, updated_at)
VALUES ('PO-2025-000006', 4, 3, '2025-05-15', 'completed', 'material', 'approved', 'ordered', 'received', 'paid', 'received', 12800000, 0, 12800000, 0, 'Mua dầu Argan 5kg + Coconut Oil 10kg + Shea Butter 5kg', 1, '2025-05-15', '2025-05-28')
ON CONFLICT (po_number) DO NOTHING;

-- PO-007: Mua gia công từ TAMI (06/2025)
INSERT INTO purchase_orders (po_number, supplier_id, warehouse_id, order_date, status, po_type, approval_status, order_status, receipt_status, payment_status, invoice_status, subtotal, tax_amount, total_amount, vat_rate, description, created_by, created_at, updated_at)
VALUES ('PO-2025-000007', 34, 6, '2025-06-01', 'completed', 'outsource', 'approved', 'ordered', 'received', 'paid', 'received', 45000000, 4500000, 49500000, 10, 'Gia công Dầu gội Retro Nano 350ml x1500 chai', 1, '2025-06-01', '2025-06-20')
ON CONFLICT (po_number) DO NOTHING;

-- PO-008: Mua gia công từ M_HOA (07/2025)
INSERT INTO purchase_orders (po_number, supplier_id, warehouse_id, order_date, status, po_type, approval_status, order_status, receipt_status, payment_status, invoice_status, subtotal, tax_amount, total_amount, vat_rate, description, created_by, created_at, updated_at)
VALUES ('PO-2025-000008', 36, 8, '2025-07-10', 'completed', 'outsource', 'approved', 'ordered', 'received', 'paid', 'received', 32000000, 3200000, 35200000, 10, 'Gia công Kem body cream PMG 350g x1000 hủ', 1, '2025-07-10', '2025-07-28')
ON CONFLICT (po_number) DO NOTHING;

-- PO-009: Mua hương liệu đợt 2 từ BAHH (08/2025)
INSERT INTO purchase_orders (po_number, supplier_id, warehouse_id, order_date, status, po_type, approval_status, order_status, receipt_status, payment_status, invoice_status, subtotal, tax_amount, total_amount, vat_rate, description, created_by, created_at, updated_at)
VALUES ('PO-2025-000009', 6, 3, '2025-08-05', 'completed', 'material', 'approved', 'ordered', 'received', 'paid', 'received', 6300000, 0, 6300000, 0, 'Mua hương Cafe 1kg + Green Tea 1kg + Pink Grape 2kg', 1, '2025-08-05', '2025-08-15')
ON CONFLICT (po_number) DO NOTHING;

-- PO-010: Mua bao bì tem nhãn từ INNN (09/2025)
INSERT INTO purchase_orders (po_number, supplier_id, warehouse_id, order_date, status, po_type, approval_status, order_status, receipt_status, payment_status, invoice_status, subtotal, tax_amount, total_amount, vat_rate, description, created_by, created_at, updated_at)
VALUES ('PO-2025-000010', 19, 3, '2025-09-01', 'completed', 'material', 'approved', 'ordered', 'received', 'paid', 'received', 8500000, 850000, 9350000, 10, 'In tem nhãn các loại x10000 tờ', 1, '2025-09-01', '2025-09-12')
ON CONFLICT (po_number) DO NOTHING;

-- PO-011: Mua NVL đợt lớn từ GREEN (10/2025)
INSERT INTO purchase_orders (po_number, supplier_id, warehouse_id, order_date, status, po_type, approval_status, order_status, receipt_status, payment_status, invoice_status, subtotal, tax_amount, total_amount, vat_rate, description, created_by, created_at, updated_at)
VALUES ('PO-2025-000011', 3, 3, '2025-10-01', 'completed', 'material', 'approved', 'ordered', 'received', 'paid', 'received', 28600000, 2860000, 31460000, 10, 'Mua CTAC 25kg + CX TX 10kg + B5 5kg + Keratin 2kg', 1, '2025-10-01', '2025-10-18')
ON CONFLICT (po_number) DO NOTHING;

-- PO-012: Mua gia công từ LYONA (11/2025)
INSERT INTO purchase_orders (po_number, supplier_id, warehouse_id, order_date, status, po_type, approval_status, order_status, receipt_status, payment_status, invoice_status, subtotal, tax_amount, total_amount, vat_rate, description, created_by, created_at, updated_at)
VALUES ('PO-2025-000012', 37, 9, '2025-11-01', 'completed', 'outsource', 'approved', 'ordered', 'received', 'paid', 'received', 38000000, 3800000, 41800000, 10, 'Gia công Sữa tắm Pure Body 500ml x1200 chai', 1, '2025-11-01', '2025-11-22')
ON CONFLICT (po_number) DO NOTHING;

-- PO-013: Mua NVL cuối năm từ HOA MAI (12/2025) - đang xử lý
INSERT INTO purchase_orders (po_number, supplier_id, warehouse_id, order_date, status, po_type, approval_status, order_status, receipt_status, payment_status, invoice_status, subtotal, tax_amount, total_amount, vat_rate, description, created_by, created_at, updated_at)
VALUES ('PO-2025-000013', 5, 3, '2025-12-01', 'approved', 'material', 'approved', 'ordered', 'partial', 'pending', 'pending', 5200000, 520000, 5720000, 10, 'Mua Acid Citric 25kg + Tranexamic Acid 1kg', 1, '2025-12-01', '2025-12-10')
ON CONFLICT (po_number) DO NOTHING;

-- PO-014: Mua bao bì từ WONDERLAND (12/2025) - đang xử lý
INSERT INTO purchase_orders (po_number, supplier_id, warehouse_id, order_date, status, po_type, approval_status, order_status, receipt_status, payment_status, invoice_status, subtotal, tax_amount, total_amount, vat_rate, description, created_by, created_at, updated_at)
VALUES ('PO-2025-000014', 18, 3, '2025-12-05', 'approved', 'material', 'approved', 'ordered', 'pending', 'pending', 'pending', 18000000, 1800000, 19800000, 10, 'Mua hộp giấy các loại x5000', 1, '2025-12-05', '2025-12-05')
ON CONFLICT (po_number) DO NOTHING;

-- PO-015: Mua gia công từ N_TRAC (12/2025) - chờ duyệt
INSERT INTO purchase_orders (po_number, supplier_id, warehouse_id, order_date, status, po_type, approval_status, order_status, receipt_status, payment_status, invoice_status, subtotal, tax_amount, total_amount, vat_rate, description, created_by, created_at, updated_at)
VALUES ('PO-2025-000015', 38, 10, '2025-12-10', 'draft', 'outsource', 'pending', 'pending', 'pending', 'pending', 'pending', 25000000, 2500000, 27500000, 10, 'Gia công Kem ủ tóc Recovery Mask 350g x800', 1, '2025-12-10', '2025-12-10')
ON CONFLICT (po_number) DO NOTHING;


-- =============================================================================
-- 2. PURCHASE ORDER ITEMS
-- =============================================================================

-- PO-001 Items: Acid Citric + Acid Lactic
INSERT INTO purchase_order_items (purchase_order_id, material_id, quantity, unit_price, tax_rate, line_total, created_at, updated_at)
SELECT po.id, m.id, 25, 100000, 10, 2750000, '2025-01-08', '2025-01-08'
FROM purchase_orders po, materials m WHERE po.po_number = 'PO-2025-000001' AND m.code = 'ACI_Citric'
ON CONFLICT DO NOTHING;

INSERT INTO purchase_order_items (purchase_order_id, material_id, quantity, unit_price, tax_rate, line_total, created_at, updated_at)
SELECT po.id, m.id, 5, 200000, 10, 1100000, '2025-01-08', '2025-01-08'
FROM purchase_orders po, materials m WHERE po.po_number = 'PO-2025-000001' AND m.code = 'ACI_LA'
ON CONFLICT DO NOTHING;

-- PO-002 Items: Hương liệu
INSERT INTO purchase_order_items (purchase_order_id, material_id, quantity, unit_price, tax_rate, line_total, created_at, updated_at)
SELECT po.id, m.id, 2, 2100000, 0, 4200000, '2025-01-12', '2025-01-12'
FROM purchase_orders po, materials m WHERE po.po_number = 'PO-2025-000002' AND m.code = 'FRA_NTG'
ON CONFLICT DO NOTHING;

INSERT INTO purchase_order_items (purchase_order_id, material_id, quantity, unit_price, tax_rate, line_total, created_at, updated_at)
SELECT po.id, m.id, 2, 1500000, 0, 3000000, '2025-01-12', '2025-01-12'
FROM purchase_orders po, materials m WHERE po.po_number = 'PO-2025-000002' AND m.code = 'FRA_Sexy'
ON CONFLICT DO NOTHING;

INSERT INTO purchase_order_items (purchase_order_id, material_id, quantity, unit_price, tax_rate, line_total, created_at, updated_at)
SELECT po.id, m.id, 1, 1200000, 0, 1200000, '2025-01-12', '2025-01-12'
FROM purchase_orders po, materials m WHERE po.po_number = 'PO-2025-000002' AND m.code = 'FRA_VANBE'
ON CONFLICT DO NOTHING;

-- PO-003 Items: Active ingredients
INSERT INTO purchase_order_items (purchase_order_id, material_id, quantity, unit_price, tax_rate, line_total, created_at, updated_at)
SELECT po.id, m.id, 5, 350000, 10, 1925000, '2025-02-05', '2025-02-05'
FROM purchase_orders po, materials m WHERE po.po_number = 'PO-2025-000003' AND m.code = 'ACT_Allantoin Usp'
ON CONFLICT DO NOTHING;

INSERT INTO purchase_order_items (purchase_order_id, material_id, quantity, unit_price, tax_rate, line_total, created_at, updated_at)
SELECT po.id, m.id, 10, 280000, 10, 3080000, '2025-02-05', '2025-02-05'
FROM purchase_orders po, materials m WHERE po.po_number = 'PO-2025-000003' AND m.code = 'ACT_B3'
ON CONFLICT DO NOTHING;

INSERT INTO purchase_order_items (purchase_order_id, material_id, quantity, unit_price, tax_rate, line_total, created_at, updated_at)
SELECT po.id, m.id, 25, 420000, 10, 11550000, '2025-02-05', '2025-02-05'
FROM purchase_orders po, materials m WHERE po.po_number = 'PO-2025-000003' AND m.code = 'ACT_BTAC'
ON CONFLICT DO NOTHING;

-- PO-009 Items: Hương liệu đợt 2
INSERT INTO purchase_order_items (purchase_order_id, material_id, quantity, unit_price, tax_rate, line_total, created_at, updated_at)
SELECT po.id, m.id, 1, 1800000, 0, 1800000, '2025-08-05', '2025-08-05'
FROM purchase_orders po, materials m WHERE po.po_number = 'PO-2025-000009' AND m.code = 'FRA_CAFE'
ON CONFLICT DO NOTHING;

INSERT INTO purchase_order_items (purchase_order_id, material_id, quantity, unit_price, tax_rate, line_total, created_at, updated_at)
SELECT po.id, m.id, 1, 1500000, 0, 1500000, '2025-08-05', '2025-08-05'
FROM purchase_orders po, materials m WHERE po.po_number = 'PO-2025-000009' AND m.code = 'FRA_GREENTEA'
ON CONFLICT DO NOTHING;

INSERT INTO purchase_order_items (purchase_order_id, material_id, quantity, unit_price, tax_rate, line_total, created_at, updated_at)
SELECT po.id, m.id, 2, 1500000, 0, 3000000, '2025-08-05', '2025-08-05'
FROM purchase_orders po, materials m WHERE po.po_number = 'PO-2025-000009' AND m.code = 'FRA_PINKGRAPE'
ON CONFLICT DO NOTHING;

-- PO-011 Items: CTAC, CX TX, B5, Keratin
INSERT INTO purchase_order_items (purchase_order_id, material_id, quantity, unit_price, tax_rate, line_total, created_at, updated_at)
SELECT po.id, m.id, 25, 480000, 10, 13200000, '2025-10-01', '2025-10-01'
FROM purchase_orders po, materials m WHERE po.po_number = 'PO-2025-000011' AND m.code = 'ACT_CTAC'
ON CONFLICT DO NOTHING;

INSERT INTO purchase_order_items (purchase_order_id, material_id, quantity, unit_price, tax_rate, line_total, created_at, updated_at)
SELECT po.id, m.id, 10, 650000, 10, 7150000, '2025-10-01', '2025-10-01'
FROM purchase_orders po, materials m WHERE po.po_number = 'PO-2025-000011' AND m.code = 'ACT_CX TX'
ON CONFLICT DO NOTHING;


-- =============================================================================
-- 3. GOODS RECEIPT NOTES (Nhập Hàng)
-- Source: File 2 > Sheet "NHẬP HÀNG"
-- Mapping: Ngày → receipt_date, MĐN → grn_number, NCC+Kho → supplier_id + warehouse_id
-- =============================================================================

-- GRN-001: Nhập kho đầu kỳ (Opening Balance 01/2025)
INSERT INTO goods_receipt_notes (grn_number, purchase_order_id, warehouse_id, receipt_date, status, qc_status, posted, notes, created_by, created_at, updated_at)
VALUES ('GRN-2025-000001', NULL, 3, '2025-01-01', 'posted', 'pass', true, 'Nhập kho đầu kỳ 2025 - Nguyên liệu tồn từ 2024', 1, '2025-01-01', '2025-01-01')
ON CONFLICT (grn_number) DO NOTHING;

-- GRN-002: Nhập NVL từ HOA MAI (PO-001)
INSERT INTO goods_receipt_notes (grn_number, purchase_order_id, warehouse_id, receipt_date, status, qc_status, posted, notes, created_by, created_at, updated_at)
SELECT 'GRN-2025-000002', po.id, 3, '2025-01-15', 'posted', 'pass', true, 'Nhập Acid Citric + Acid Lactic từ HOA MAI', 1, '2025-01-15', '2025-01-15'
FROM purchase_orders po WHERE po.po_number = 'PO-2025-000001'
ON CONFLICT (grn_number) DO NOTHING;

-- GRN-003: Nhập hương liệu từ BAHH (PO-002)
INSERT INTO goods_receipt_notes (grn_number, purchase_order_id, warehouse_id, receipt_date, status, qc_status, posted, notes, created_by, created_at, updated_at)
SELECT 'GRN-2025-000003', po.id, 3, '2025-01-20', 'posted', 'pass', true, 'Nhập hương liệu Intense + Sexy + Vanbe từ BAHH', 1, '2025-01-20', '2025-01-20'
FROM purchase_orders po WHERE po.po_number = 'PO-2025-000002'
ON CONFLICT (grn_number) DO NOTHING;

-- GRN-004: Nhập NVL từ GREEN (PO-003)
INSERT INTO goods_receipt_notes (grn_number, purchase_order_id, warehouse_id, receipt_date, status, qc_status, posted, notes, created_by, created_at, updated_at)
SELECT 'GRN-2025-000004', po.id, 3, '2025-02-18', 'posted', 'pass', true, 'Nhập Allantoin + B3 + BTAC từ GREEN', 1, '2025-02-18', '2025-02-18'
FROM purchase_orders po WHERE po.po_number = 'PO-2025-000003'
ON CONFLICT (grn_number) DO NOTHING;

-- GRN-005: Nhập Emulsifier từ GREEN (PO-004)
INSERT INTO goods_receipt_notes (grn_number, purchase_order_id, warehouse_id, receipt_date, status, qc_status, posted, notes, created_by, created_at, updated_at)
SELECT 'GRN-2025-000005', po.id, 3, '2025-03-25', 'posted', 'pass', true, 'Nhập Emulsifier GMS + Cetyl + Cetearyl Alcohol từ GREEN', 1, '2025-03-25', '2025-03-25'
FROM purchase_orders po WHERE po.po_number = 'PO-2025-000004'
ON CONFLICT (grn_number) DO NOTHING;

-- GRN-006: Nhập bao bì từ MONGO (PO-005)
INSERT INTO goods_receipt_notes (grn_number, purchase_order_id, warehouse_id, receipt_date, status, qc_status, posted, notes, created_by, created_at, updated_at)
SELECT 'GRN-2025-000006', po.id, 3, '2025-04-15', 'posted', 'pass', true, 'Nhập chai PET nâu 100ml + 350ml từ MONGO', 1, '2025-04-15', '2025-04-15'
FROM purchase_orders po WHERE po.po_number = 'PO-2025-000005'
ON CONFLICT (grn_number) DO NOTHING;

-- GRN-007: Nhập NVL từ Organic (PO-006)
INSERT INTO goods_receipt_notes (grn_number, purchase_order_id, warehouse_id, receipt_date, status, qc_status, posted, notes, created_by, created_at, updated_at)
SELECT 'GRN-2025-000007', po.id, 3, '2025-05-28', 'posted', 'pass', true, 'Nhập dầu Argan + Coconut Oil + Shea Butter từ Organic', 1, '2025-05-28', '2025-05-28'
FROM purchase_orders po WHERE po.po_number = 'PO-2025-000006'
ON CONFLICT (grn_number) DO NOTHING;

-- GRN-008: Nhập thành phẩm gia công từ TAMI (PO-007)
INSERT INTO goods_receipt_notes (grn_number, purchase_order_id, warehouse_id, receipt_date, status, qc_status, posted, notes, created_by, created_at, updated_at)
SELECT 'GRN-2025-000008', po.id, 3, '2025-06-20', 'posted', 'pass', true, 'Nhập Dầu gội Retro Nano 350ml x1500 chai từ TAMI', 1, '2025-06-20', '2025-06-20'
FROM purchase_orders po WHERE po.po_number = 'PO-2025-000007'
ON CONFLICT (grn_number) DO NOTHING;

-- GRN-009: Nhập hương liệu đợt 2 từ BAHH (PO-009)
INSERT INTO goods_receipt_notes (grn_number, purchase_order_id, warehouse_id, receipt_date, status, qc_status, posted, notes, created_by, created_at, updated_at)
SELECT 'GRN-2025-000009', po.id, 3, '2025-08-15', 'posted', 'pass', true, 'Nhập hương Cafe + Green Tea + Pink Grape từ BAHH', 1, '2025-08-15', '2025-08-15'
FROM purchase_orders po WHERE po.po_number = 'PO-2025-000009'
ON CONFLICT (grn_number) DO NOTHING;

-- GRN-010: Nhập tem nhãn từ INNN (PO-010)
INSERT INTO goods_receipt_notes (grn_number, purchase_order_id, warehouse_id, receipt_date, status, qc_status, posted, notes, created_by, created_at, updated_at)
SELECT 'GRN-2025-000010', po.id, 3, '2025-09-12', 'posted', 'pass', true, 'Nhập tem nhãn các loại từ IN NHANH NHANH', 1, '2025-09-12', '2025-09-12'
FROM purchase_orders po WHERE po.po_number = 'PO-2025-000010'
ON CONFLICT (grn_number) DO NOTHING;

-- GRN-011: Nhập NVL đợt lớn từ GREEN (PO-011)
INSERT INTO goods_receipt_notes (grn_number, purchase_order_id, warehouse_id, receipt_date, status, qc_status, posted, notes, created_by, created_at, updated_at)
SELECT 'GRN-2025-000011', po.id, 3, '2025-10-18', 'posted', 'pass', true, 'Nhập CTAC + CX TX + B5 + Keratin từ GREEN', 1, '2025-10-18', '2025-10-18'
FROM purchase_orders po WHERE po.po_number = 'PO-2025-000011'
ON CONFLICT (grn_number) DO NOTHING;

-- GRN-012: Nhập thành phẩm gia công từ LYONA (PO-012)
INSERT INTO goods_receipt_notes (grn_number, purchase_order_id, warehouse_id, receipt_date, status, qc_status, posted, notes, created_by, created_at, updated_at)
SELECT 'GRN-2025-000012', po.id, 3, '2025-11-22', 'posted', 'pass', true, 'Nhập Sữa tắm Pure Body 500ml x1200 chai từ LYONA', 1, '2025-11-22', '2025-11-22'
FROM purchase_orders po WHERE po.po_number = 'PO-2025-000012'
ON CONFLICT (grn_number) DO NOTHING;

-- GRN-013: Nhập hàng từ HOA MAI (PO-013) - partial
INSERT INTO goods_receipt_notes (grn_number, purchase_order_id, warehouse_id, receipt_date, status, qc_status, posted, notes, created_by, created_at, updated_at)
SELECT 'GRN-2025-000013', po.id, 3, '2025-12-10', 'posted', 'pass', true, 'Nhập 1 phần (chỉ Acid Citric, chờ Tranexamic Acid)', 1, '2025-12-10', '2025-12-10'
FROM purchase_orders po WHERE po.po_number = 'PO-2025-000013'
ON CONFLICT (grn_number) DO NOTHING;


-- =============================================================================
-- 4. MATERIAL ISSUE NOTES (Xuất Sản Xuất)
-- Source: File 2 > Sheet "XUẤT SẢN XUẤT"
-- Mapping: Ngày → issue_date, Kho SX → warehouse_id  
-- Note: material_request_id = NULL (direct issues from spreadsheet)
-- =============================================================================

-- MIN-001: Xuất SX Dầu gội Retro Nano T01/2025
INSERT INTO material_issue_notes (min_number, material_request_id, warehouse_id, issue_date, status, posted, notes, created_by, created_at, updated_at)
VALUES ('MIN-2025-000001', NULL, 3, '2025-01-20', 'posted', true, 'SX 50kg Dầu gội Retro Nano T01/2025', 1, '2025-01-20', '2025-01-20')
ON CONFLICT (min_number) DO NOTHING;

-- MIN-002: Xuất SX Kem body cream PMG T02/2025
INSERT INTO material_issue_notes (min_number, material_request_id, warehouse_id, issue_date, status, posted, notes, created_by, created_at, updated_at)
VALUES ('MIN-2025-000002', NULL, 3, '2025-02-15', 'posted', true, 'SX 35kg Kem body cream Pick Me Girl T02/2025', 1, '2025-02-15', '2025-02-15')
ON CONFLICT (min_number) DO NOTHING;

-- MIN-003: Xuất SX Sữa tắm Pure Body T03/2025
INSERT INTO material_issue_notes (min_number, material_request_id, warehouse_id, issue_date, status, posted, notes, created_by, created_at, updated_at)
VALUES ('MIN-2025-000003', NULL, 3, '2025-03-10', 'posted', true, 'SX 60kg Sữa tắm Pure Body T03/2025', 1, '2025-03-10', '2025-03-10')
ON CONFLICT (min_number) DO NOTHING;

-- MIN-004: Xuất SX Kem ủ tóc Recovery Mask T04/2025
INSERT INTO material_issue_notes (min_number, material_request_id, warehouse_id, issue_date, status, posted, notes, created_by, created_at, updated_at)
VALUES ('MIN-2025-000004', NULL, 3, '2025-04-05', 'posted', true, 'SX 30kg Kem ủ tóc Recovery Mask T04/2025', 1, '2025-04-05', '2025-04-05')
ON CONFLICT (min_number) DO NOTHING;

-- MIN-005: Xuất SX Dầu gội Retro Nano T05/2025
INSERT INTO material_issue_notes (min_number, material_request_id, warehouse_id, issue_date, status, posted, notes, created_by, created_at, updated_at)
VALUES ('MIN-2025-000005', NULL, 3, '2025-05-12', 'posted', true, 'SX 45kg Dầu gội Retro Nano T05/2025', 1, '2025-05-12', '2025-05-12')
ON CONFLICT (min_number) DO NOTHING;

-- MIN-006: Xuất SX Kem body cream PMG T06/2025
INSERT INTO material_issue_notes (min_number, material_request_id, warehouse_id, issue_date, status, posted, notes, created_by, created_at, updated_at)
VALUES ('MIN-2025-000006', NULL, 3, '2025-06-08', 'posted', true, 'SX 40kg Kem body cream PMG T06/2025', 1, '2025-06-08', '2025-06-08')
ON CONFLICT (min_number) DO NOTHING;

-- MIN-007: Xuất SX Dầu gội + Sữa tắm T07/2025 (đợt lớn)
INSERT INTO material_issue_notes (min_number, material_request_id, warehouse_id, issue_date, status, posted, notes, created_by, created_at, updated_at)
VALUES ('MIN-2025-000007', NULL, 3, '2025-07-15', 'posted', true, 'SX 35kg Kem ủ tóc + 50kg Dầu gội Retro T07/2025', 1, '2025-07-15', '2025-07-15')
ON CONFLICT (min_number) DO NOTHING;

-- MIN-008: Xuất SX Serum T08/2025
INSERT INTO material_issue_notes (min_number, material_request_id, warehouse_id, issue_date, status, posted, notes, created_by, created_at, updated_at)
VALUES ('MIN-2025-000008', NULL, 3, '2025-08-20', 'posted', true, 'SX 15kg Serum Retro Nano T08/2025', 1, '2025-08-20', '2025-08-20')
ON CONFLICT (min_number) DO NOTHING;

-- MIN-009: Xuất NVL cho gia công TAMI T09/2025
INSERT INTO material_issue_notes (min_number, material_request_id, warehouse_id, issue_date, status, posted, notes, created_by, created_at, updated_at)
VALUES ('MIN-2025-000009', NULL, 3, '2025-09-05', 'posted', true, 'Xuất NVL cho gia công TAMI - Dầu gội 80kg T09/2025', 1, '2025-09-05', '2025-09-05')
ON CONFLICT (min_number) DO NOTHING;

-- MIN-010: Xuất SX Kem body PMG T10/2025
INSERT INTO material_issue_notes (min_number, material_request_id, warehouse_id, issue_date, status, posted, notes, created_by, created_at, updated_at)
VALUES ('MIN-2025-000010', NULL, 3, '2025-10-10', 'posted', true, 'SX 45kg Kem body PMG T10/2025', 1, '2025-10-10', '2025-10-10')
ON CONFLICT (min_number) DO NOTHING;

-- MIN-011: Xuất SX đợt cuối năm T11/2025
INSERT INTO material_issue_notes (min_number, material_request_id, warehouse_id, issue_date, status, posted, notes, created_by, created_at, updated_at)
VALUES ('MIN-2025-000011', NULL, 3, '2025-11-15', 'posted', true, 'SX tổng hợp cuối năm: Dầu gội 60kg + Sữa tắm 40kg T11/2025', 1, '2025-11-15', '2025-11-15')
ON CONFLICT (min_number) DO NOTHING;

-- MIN-012: Xuất SX Serum + Kem ủ T12/2025 (đang xử lý)
INSERT INTO material_issue_notes (min_number, material_request_id, warehouse_id, issue_date, status, posted, notes, created_by, created_at, updated_at)
VALUES ('MIN-2025-000012', NULL, 3, '2025-12-05', 'draft', false, 'SX 20kg Serum + 25kg Kem ủ tóc T12/2025 - chờ duyệt', 1, '2025-12-05', '2025-12-05')
ON CONFLICT (min_number) DO NOTHING;


-- =============================================================================
-- 5. MATERIAL ISSUE NOTE ITEMS (Chi tiết xuất NVL)
-- Sample items for key production batches
-- =============================================================================

-- MIN-001 Items: SX Dầu gội Retro Nano (50kg batch)
INSERT INTO material_issue_note_items (min_id, mr_item_id, material_id, quantity, unit_cost, notes, created_at, updated_at)
SELECT m_note.id, NULL, m.id, 5.0, 280000, 'Niacinamide cho dầu gội', '2025-01-20', '2025-01-20'
FROM material_issue_notes m_note, materials m WHERE m_note.min_number = 'MIN-2025-000001' AND m.code = 'ACT_B3'
ON CONFLICT DO NOTHING;

INSERT INTO material_issue_note_items (min_id, mr_item_id, material_id, quantity, unit_cost, notes, created_at, updated_at)
SELECT m_note.id, NULL, m.id, 2.5, 100000, 'Acid Citric điều chỉnh pH', '2025-01-20', '2025-01-20'
FROM material_issue_notes m_note, materials m WHERE m_note.min_number = 'MIN-2025-000001' AND m.code = 'ACI_Citric'
ON CONFLICT DO NOTHING;

INSERT INTO material_issue_note_items (min_id, mr_item_id, material_id, quantity, unit_cost, notes, created_at, updated_at)
SELECT m_note.id, NULL, m.id, 0.5, 2100000, 'Hương Intense cho dầu gội', '2025-01-20', '2025-01-20'
FROM material_issue_notes m_note, materials m WHERE m_note.min_number = 'MIN-2025-000001' AND m.code = 'FRA_NTG'
ON CONFLICT DO NOTHING;

-- MIN-002 Items: SX Kem body cream PMG (35kg batch)
INSERT INTO material_issue_note_items (min_id, mr_item_id, material_id, quantity, unit_cost, notes, created_at, updated_at)
SELECT m_note.id, NULL, m.id, 3.5, 280000, 'Niacinamide cho kem body', '2025-02-15', '2025-02-15'
FROM material_issue_notes m_note, materials m WHERE m_note.min_number = 'MIN-2025-000002' AND m.code = 'ACT_B3'
ON CONFLICT DO NOTHING;

INSERT INTO material_issue_note_items (min_id, mr_item_id, material_id, quantity, unit_cost, notes, created_at, updated_at)
SELECT m_note.id, NULL, m.id, 7.0, 420000, 'BTAC cho kem body', '2025-02-15', '2025-02-15'
FROM material_issue_notes m_note, materials m WHERE m_note.min_number = 'MIN-2025-000002' AND m.code = 'ACT_BTAC'
ON CONFLICT DO NOTHING;

INSERT INTO material_issue_note_items (min_id, mr_item_id, material_id, quantity, unit_cost, notes, created_at, updated_at)
SELECT m_note.id, NULL, m.id, 0.35, 1500000, 'Hương Sexy cho kem body', '2025-02-15', '2025-02-15'
FROM material_issue_notes m_note, materials m WHERE m_note.min_number = 'MIN-2025-000002' AND m.code = 'FRA_Sexy'
ON CONFLICT DO NOTHING;

-- MIN-005 Items: SX Dầu gội Retro Nano (45kg batch)
INSERT INTO material_issue_note_items (min_id, mr_item_id, material_id, quantity, unit_cost, notes, created_at, updated_at)
SELECT m_note.id, NULL, m.id, 4.5, 280000, 'B3 cho SX dầu gội', '2025-05-12', '2025-05-12'
FROM material_issue_notes m_note, materials m WHERE m_note.min_number = 'MIN-2025-000005' AND m.code = 'ACT_B3'
ON CONFLICT DO NOTHING;

INSERT INTO material_issue_note_items (min_id, mr_item_id, material_id, quantity, unit_cost, notes, created_at, updated_at)
SELECT m_note.id, NULL, m.id, 2.0, 100000, 'Acid Citric cho SX dầu gội', '2025-05-12', '2025-05-12'
FROM material_issue_notes m_note, materials m WHERE m_note.min_number = 'MIN-2025-000005' AND m.code = 'ACI_Citric'
ON CONFLICT DO NOTHING;

INSERT INTO material_issue_note_items (min_id, mr_item_id, material_id, quantity, unit_cost, notes, created_at, updated_at)
SELECT m_note.id, NULL, m.id, 10.0, 480000, 'CTAC cho SX dầu gội', '2025-05-12', '2025-05-12'
FROM material_issue_notes m_note, materials m WHERE m_note.min_number = 'MIN-2025-000005' AND m.code = 'ACT_CTAC'
ON CONFLICT DO NOTHING;

-- MIN-009 Items: Xuất NVL cho gia công TAMI (80kg)
INSERT INTO material_issue_note_items (min_id, mr_item_id, material_id, quantity, unit_cost, notes, created_at, updated_at)
SELECT m_note.id, NULL, m.id, 8.0, 280000, 'B3 cho gia công TAMI', '2025-09-05', '2025-09-05'
FROM material_issue_notes m_note, materials m WHERE m_note.min_number = 'MIN-2025-000009' AND m.code = 'ACT_B3'
ON CONFLICT DO NOTHING;

INSERT INTO material_issue_note_items (min_id, mr_item_id, material_id, quantity, unit_cost, notes, created_at, updated_at)
SELECT m_note.id, NULL, m.id, 4.0, 100000, 'Acid Citric cho gia công', '2025-09-05', '2025-09-05'
FROM material_issue_notes m_note, materials m WHERE m_note.min_number = 'MIN-2025-000009' AND m.code = 'ACI_Citric'
ON CONFLICT DO NOTHING;

INSERT INTO material_issue_note_items (min_id, mr_item_id, material_id, quantity, unit_cost, notes, created_at, updated_at)
SELECT m_note.id, NULL, m.id, 20.0, 480000, 'CTAC cho gia công', '2025-09-05', '2025-09-05'
FROM material_issue_notes m_note, materials m WHERE m_note.min_number = 'MIN-2025-000009' AND m.code = 'ACT_CTAC'
ON CONFLICT DO NOTHING;

INSERT INTO material_issue_note_items (min_id, mr_item_id, material_id, quantity, unit_cost, notes, created_at, updated_at)
SELECT m_note.id, NULL, m.id, 1.5, 2100000, 'Hương Intense cho gia công', '2025-09-05', '2025-09-05'
FROM material_issue_notes m_note, materials m WHERE m_note.min_number = 'MIN-2025-000009' AND m.code = 'FRA_NTG'
ON CONFLICT DO NOTHING;


-- =============================================================================
-- 6. STOCK BALANCES (Tồn kho hiện tại từ spreadsheet)
-- Source: File 2 > Sheet "TỒN KHO" + File 4 > Sheet "QUẢN LÍ KHO"
-- Only top items with significant stock
-- =============================================================================

-- NVL Stock (Kho Tổng = warehouse_id 3)
INSERT INTO stock_balance (item_type, item_id, warehouse_id, quantity, unit_cost, total_cost, last_transaction_date, created_at, updated_at)
SELECT 'material', m.id, 3, 18.5, 100000, 1850000, '2025-12-01', NOW(), NOW()
FROM materials m WHERE m.code = 'ACI_Citric'
ON CONFLICT (item_type, item_id, warehouse_id, warehouse_location_id, batch_number, lot_number) DO UPDATE SET quantity = EXCLUDED.quantity, total_cost = EXCLUDED.total_cost;

INSERT INTO stock_balance (item_type, item_id, warehouse_id, quantity, unit_cost, total_cost, last_transaction_date, created_at, updated_at)
SELECT 'material', m.id, 3, 3.2, 200000, 640000, '2025-12-01', NOW(), NOW()
FROM materials m WHERE m.code = 'ACI_LA'
ON CONFLICT (item_type, item_id, warehouse_id, warehouse_location_id, batch_number, lot_number) DO UPDATE SET quantity = EXCLUDED.quantity, total_cost = EXCLUDED.total_cost;

INSERT INTO stock_balance (item_type, item_id, warehouse_id, quantity, unit_cost, total_cost, last_transaction_date, created_at, updated_at)
SELECT 'material', m.id, 3, 2.8, 350000, 980000, '2025-12-01', NOW(), NOW()
FROM materials m WHERE m.code = 'ACT_Allantoin Usp'
ON CONFLICT (item_type, item_id, warehouse_id, warehouse_location_id, batch_number, lot_number) DO UPDATE SET quantity = EXCLUDED.quantity, total_cost = EXCLUDED.total_cost;

INSERT INTO stock_balance (item_type, item_id, warehouse_id, quantity, unit_cost, total_cost, last_transaction_date, created_at, updated_at)
SELECT 'material', m.id, 3, 5.5, 280000, 1540000, '2025-12-01', NOW(), NOW()
FROM materials m WHERE m.code = 'ACT_B3'
ON CONFLICT (item_type, item_id, warehouse_id, warehouse_location_id, batch_number, lot_number) DO UPDATE SET quantity = EXCLUDED.quantity, total_cost = EXCLUDED.total_cost;

INSERT INTO stock_balance (item_type, item_id, warehouse_id, quantity, unit_cost, total_cost, last_transaction_date, created_at, updated_at)
SELECT 'material', m.id, 3, 12.0, 420000, 5040000, '2025-12-01', NOW(), NOW()
FROM materials m WHERE m.code = 'ACT_BTAC'
ON CONFLICT (item_type, item_id, warehouse_id, warehouse_location_id, batch_number, lot_number) DO UPDATE SET quantity = EXCLUDED.quantity, total_cost = EXCLUDED.total_cost;

INSERT INTO stock_balance (item_type, item_id, warehouse_id, quantity, unit_cost, total_cost, last_transaction_date, created_at, updated_at)
SELECT 'material', m.id, 3, 8.0, 480000, 3840000, '2025-12-01', NOW(), NOW()
FROM materials m WHERE m.code = 'ACT_CTAC'
ON CONFLICT (item_type, item_id, warehouse_id, warehouse_location_id, batch_number, lot_number) DO UPDATE SET quantity = EXCLUDED.quantity, total_cost = EXCLUDED.total_cost;

INSERT INTO stock_balance (item_type, item_id, warehouse_id, quantity, unit_cost, total_cost, last_transaction_date, created_at, updated_at)
SELECT 'material', m.id, 3, 4.5, 650000, 2925000, '2025-12-01', NOW(), NOW()
FROM materials m WHERE m.code = 'ACT_CX TX'
ON CONFLICT (item_type, item_id, warehouse_id, warehouse_location_id, batch_number, lot_number) DO UPDATE SET quantity = EXCLUDED.quantity, total_cost = EXCLUDED.total_cost;

-- Hương liệu stock
INSERT INTO stock_balance (item_type, item_id, warehouse_id, quantity, unit_cost, total_cost, last_transaction_date, created_at, updated_at)
SELECT 'material', m.id, 3, 1.2, 2100000, 2520000, '2025-12-01', NOW(), NOW()
FROM materials m WHERE m.code = 'FRA_NTG'
ON CONFLICT (item_type, item_id, warehouse_id, warehouse_location_id, batch_number, lot_number) DO UPDATE SET quantity = EXCLUDED.quantity, total_cost = EXCLUDED.total_cost;

INSERT INTO stock_balance (item_type, item_id, warehouse_id, quantity, unit_cost, total_cost, last_transaction_date, created_at, updated_at)
SELECT 'material', m.id, 3, 0.8, 1500000, 1200000, '2025-12-01', NOW(), NOW()
FROM materials m WHERE m.code = 'FRA_Sexy'
ON CONFLICT (item_type, item_id, warehouse_id, warehouse_location_id, batch_number, lot_number) DO UPDATE SET quantity = EXCLUDED.quantity, total_cost = EXCLUDED.total_cost;

INSERT INTO stock_balance (item_type, item_id, warehouse_id, quantity, unit_cost, total_cost, last_transaction_date, created_at, updated_at)
SELECT 'material', m.id, 3, 0.5, 1200000, 600000, '2025-12-01', NOW(), NOW()
FROM materials m WHERE m.code = 'FRA_VANBE'
ON CONFLICT (item_type, item_id, warehouse_id, warehouse_location_id, batch_number, lot_number) DO UPDATE SET quantity = EXCLUDED.quantity, total_cost = EXCLUDED.total_cost;

INSERT INTO stock_balance (item_type, item_id, warehouse_id, quantity, unit_cost, total_cost, last_transaction_date, created_at, updated_at)
SELECT 'material', m.id, 3, 0.7, 1800000, 1260000, '2025-12-01', NOW(), NOW()
FROM materials m WHERE m.code = 'FRA_CAFE'
ON CONFLICT (item_type, item_id, warehouse_id, warehouse_location_id, batch_number, lot_number) DO UPDATE SET quantity = EXCLUDED.quantity, total_cost = EXCLUDED.total_cost;

INSERT INTO stock_balance (item_type, item_id, warehouse_id, quantity, unit_cost, total_cost, last_transaction_date, created_at, updated_at)
SELECT 'material', m.id, 3, 1.5, 1500000, 2250000, '2025-12-01', NOW(), NOW()
FROM materials m WHERE m.code = 'FRA_PINKGRAPE'
ON CONFLICT (item_type, item_id, warehouse_id, warehouse_location_id, batch_number, lot_number) DO UPDATE SET quantity = EXCLUDED.quantity, total_cost = EXCLUDED.total_cost;


-- Finished products stock (Kho Tổng = warehouse_id 3)
INSERT INTO stock_balance (item_type, item_id, warehouse_id, quantity, unit_cost, total_cost, last_transaction_date, created_at, updated_at)
SELECT 'finished_product', fp.id, 3, 245, 22000, 5390000, '2025-12-01', NOW(), NOW()
FROM finished_products fp WHERE fp.code = 'GRN'
ON CONFLICT (item_type, item_id, warehouse_id, warehouse_location_id, batch_number, lot_number) DO UPDATE SET quantity = EXCLUDED.quantity, total_cost = EXCLUDED.total_cost;

INSERT INTO stock_balance (item_type, item_id, warehouse_id, quantity, unit_cost, total_cost, last_transaction_date, created_at, updated_at)
SELECT 'finished_product', fp.id, 3, 180, 28000, 5040000, '2025-12-01', NOW(), NOW()
FROM finished_products fp WHERE fp.code = 'KPMG'
ON CONFLICT (item_type, item_id, warehouse_id, warehouse_location_id, batch_number, lot_number) DO UPDATE SET quantity = EXCLUDED.quantity, total_cost = EXCLUDED.total_cost;

INSERT INTO stock_balance (item_type, item_id, warehouse_id, quantity, unit_cost, total_cost, last_transaction_date, created_at, updated_at)
SELECT 'finished_product', fp.id, 3, 320, 18000, 5760000, '2025-12-01', NOW(), NOW()
FROM finished_products fp WHERE fp.code = 'STPB'
ON CONFLICT (item_type, item_id, warehouse_id, warehouse_location_id, batch_number, lot_number) DO UPDATE SET quantity = EXCLUDED.quantity, total_cost = EXCLUDED.total_cost;

INSERT INTO stock_balance (item_type, item_id, warehouse_id, quantity, unit_cost, total_cost, last_transaction_date, created_at, updated_at)
SELECT 'finished_product', fp.id, 3, 95, 35000, 3325000, '2025-12-01', NOW(), NOW()
FROM finished_products fp WHERE fp.code = 'KUTRM'
ON CONFLICT (item_type, item_id, warehouse_id, warehouse_location_id, batch_number, lot_number) DO UPDATE SET quantity = EXCLUDED.quantity, total_cost = EXCLUDED.total_cost;

INSERT INTO stock_balance (item_type, item_id, warehouse_id, quantity, unit_cost, total_cost, last_transaction_date, created_at, updated_at)
SELECT 'finished_product', fp.id, 3, 150, 45000, 6750000, '2025-12-01', NOW(), NOW()
FROM finished_products fp WHERE fp.code = 'SRN'
ON CONFLICT (item_type, item_id, warehouse_id, warehouse_location_id, batch_number, lot_number) DO UPDATE SET quantity = EXCLUDED.quantity, total_cost = EXCLUDED.total_cost;

-- Reset sequences
SELECT setval('purchase_orders_id_seq', COALESCE((SELECT MAX(id) FROM purchase_orders), 0) + 1, false);
SELECT setval('purchase_order_items_id_seq', COALESCE((SELECT MAX(id) FROM purchase_order_items), 0) + 1, false);
SELECT setval('goods_receipt_notes_id_seq', COALESCE((SELECT MAX(id) FROM goods_receipt_notes), 0) + 1, false);
SELECT setval('material_issue_notes_id_seq', COALESCE((SELECT MAX(id) FROM material_issue_notes), 0) + 1, false);
SELECT setval('material_issue_note_items_id_seq', COALESCE((SELECT MAX(id) FROM material_issue_note_items), 0) + 1, false);
SELECT setval('stock_balance_id_seq', COALESCE((SELECT MAX(id) FROM stock_balance), 0) + 1, false);
