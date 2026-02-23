-- ============================================================
-- VyVy-ERP Seed Data: Real Business Data from Google Sheets
-- Source: 5 Google Spreadsheets (Kho NVL, SP, Bao Bì, Đối soát)
-- Generated: 2026-02-12
-- ============================================================
-- Run each section independently (no transaction)
-- so ON CONFLICT works per-statement

-- ============================================================
-- 1. SUPPLIERS (Nhà cung cấp) - from File 2 THIẾT LẬP
-- ============================================================
INSERT INTO suppliers (code, name, supplier_group, country, is_active) VALUES
-- Nguyên liệu suppliers
('NB', 'Nguyễn Bá', 'NGUYÊN_LIỆU', 'Vietnam', true),
('GREEN', 'CÔNG TY TNHH GREEN COSMETICS INGREDIENTS', 'NGUYÊN_LIỆU', 'Vietnam', true),
('ORGANIC', 'Organic', 'NGUYÊN_LIỆU', 'Vietnam', true),
('HOA_MAI', 'CÔNG TY HÓA CHẤT HOA MAI', 'NGUYÊN_LIỆU', 'Vietnam', true),
('BAHH', 'BAHH (HƯƠNG LIỆU)', 'NGUYÊN_LIỆU', 'Vietnam', true),
('DIRECTION', 'Direction', 'NGUYÊN_LIỆU', 'Vietnam', true),
('CATCHERS', 'Catchers', 'NGUYÊN_LIỆU', 'Vietnam', true),
('CHEMIELAB', 'Chemielab', 'NGUYÊN_LIỆU', 'Vietnam', true),
('GARDEN_LAB', 'Garden Lab', 'NGUYÊN_LIỆU', 'Vietnam', true),
('GREEN_LAB', 'Green Lab', 'NGUYÊN_LIỆU', 'Vietnam', true),
('PG_GROUP', 'CÔNG TY TNHH SẢN XUẤT THƯƠNG MẠI DỊCH VỤ PHẠM GIA GROUP', 'NGUYÊN_LIỆU', 'Vietnam', true),
('ICC', 'CÔNG TY TNHH IC-BIOTECH VIỆT NAM', 'NGUYÊN_LIỆU', 'Vietnam', true),
('BGG', 'BGG World', 'NGUYÊN_LIỆU', 'Vietnam', true),
('THU_HUYEN', 'Thu Huyen', 'NGUYÊN_LIỆU', 'Vietnam', true),
('DAUPERVN', 'Daupervietnam - Tinh dầu Kodo', 'NGUYÊN_LIỆU', 'Vietnam', true),
-- Bao bì suppliers
('MONGO', 'CÔNG TY TNHH TUYỀN MONGO COSMETIC PACKAGING', 'BAO_BÌ', 'Vietnam', true),
('WONDERLAND', 'CÔNG TY TNHH SẢN XUẤT WONDERLAND', 'BAO_BÌ', 'Vietnam', true),
('INNN', 'CÔNG TY TNHH IN NHANH NHANH', 'BAO_BÌ', 'Vietnam', true),
('VNGUYEN', 'CÔNG TY CỔ PHẦN BAO BÌ VIỄN NGUYÊN', 'BAO_BÌ', 'Vietnam', true),
('KNGOC', 'CÔNG TY TNHH KHANG NGỌC', 'BAO_BÌ', 'Vietnam', true),
('THT', 'CÔNG TY TNHH THƯƠNG MẠI VÀ SẢN XUẤT BAO BÌ THT', 'BAO_BÌ', 'Vietnam', true),
('VIETHAS', 'CÔNG TY TNHH GIẢI PHÁP CÔNG NGHỆ VIETHAS', 'BAO_BÌ', 'Vietnam', true),
('MAX', 'CÔNG TY CỔ PHẦN SẢN XUẤT THƯƠNG MẠI XUẤT NHẬP KHẨU MAX VALUE', 'BAO_BÌ', 'Vietnam', true),
('MATIC', 'CÔNG TY CP MATIC', 'BAO_BÌ', 'Vietnam', true),
('KH_HUYNH', 'CTY TNHH QUẢNG CÁO THƯƠNG MẠI DV KHÁNH QUỲNH', 'BAO_BÌ', 'Vietnam', true),
('KHANG', 'CÔNG TY CỔ PHẦN CÔNG NGHIỆP IN & BAO BÌ KHANG', 'BAO_BÌ', 'Vietnam', true),
('TGH', 'CÔNG TY TNHH THƯƠNG MẠI VÀ SẢN XUẤT TGH VIỆT NAM', 'BAO_BÌ', 'Vietnam', true),
('IN_DVM', 'CÔNG TY TNHH SẢN XUẤT THƯƠNG MẠI ĐỨC VIỆT MỸ', 'BAO_BÌ', 'Vietnam', true),
('IN_HPHUOC', 'CÔNG TY TNHH THƯƠNG MẠI SẢN XUẤT IN ẤN HIỆP PHƯỚC', 'BAO_BÌ', 'Vietnam', true),
('PH_NGUYEN', 'CÔNG TY TNHH TM&SX PHÚC NGUYÊN', 'BAO_BÌ', 'Vietnam', true),
('TR_PHAT', 'CÔNG TY TNHH SX & XNK GT TRƯỜNG PHÁT', 'BAO_BÌ', 'Vietnam', true),
('DAPHAT', 'CÔNG TY TNHH ĐỒNG AN PHÁT', 'BAO_BÌ', 'Vietnam', true),
-- Gia công (outsource manufacturing) suppliers
('TAMI', 'CÔNG TY TNHH SX DƯỢC MỸ PHẨM TAMI NATURAL HOME', 'GIA_CÔNG', 'Vietnam', true),
('CHEMLINK', 'CÔNG TY TNHH HÓA DƯỢC MỸ PHẨM CHEMLINK', 'GIA_CÔNG', 'Vietnam', true),
('M_HOA', 'CÔNG TY TNHH MỸ PHẨM MỘC HOA', 'GIA_CÔNG', 'Vietnam', true),
('LYONA', 'CÔNG TY TNHH ĐÀO TẠO SẢN XUẤT THƯƠNG MẠI LYONA BEAUTY & COSMETICS', 'GIA_CÔNG', 'Vietnam', true),
('N_TRAC', 'CÔNG TY TNHH SX & TM NGUYỄN TRẮC', 'GIA_CÔNG', 'Vietnam', true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  supplier_group = EXCLUDED.supplier_group;

-- ============================================================
-- 2. WAREHOUSES (Kho hàng) - from File 2 & 4 THIẾT LẬP
-- ============================================================
INSERT INTO warehouses (code, name, warehouse_type, address, city, is_active) VALUES
-- 2 placeholder records to offset IDs (server cũ đã có 2 records trước khi seed)
('_PLACEHOLDER_1', 'Placeholder 1', 'main', NULL, NULL, false),
('_PLACEHOLDER_2', 'Placeholder 2', 'main', NULL, NULL, false),
-- Real warehouses: KHO_TONG=3, LAB=4, KHO_MY=5, TAMI=6, CHEMLINK=7, M_HOA=8, LYONA=9, N_TRAC=10
('KHO_TONG', 'CÔNG TY TNHH AQUARIUS COSMETICS - VYVY HAIR CARE', 'main', '187 Bành Văn Trân, Phường 7, Tân Bình, Thành Phố Hồ Chí Minh, Việt Nam', 'Hồ Chí Minh', true),
('LAB', 'KHO PHÒNG LAB', 'production', '187 Bành Văn Trân, Phường 7, Tân Bình, Thành Phố Hồ Chí Minh, Việt Nam', 'Hồ Chí Minh', true),
('KHO_MY', 'KHO THUÊ NGOÀI', 'external', NULL, NULL, true),
('TAMI', 'CÔNG TY TNHH SX DƯỢC MỸ PHẨM TAMI NATURAL HOME', 'outsource', 'Lô 48, đường số 11, Khu công nghiệp Tân Đức, Xã Hựu Thạnh, Huyện Đức Hoà, Tỉnh Long An, Việt Nam', 'Long An', true),
('CHEMLINK', 'CÔNG TY TNHH HÓA DƯỢC MỸ PHẨM CHEMLINK', 'outsource', '28/5B Ấp Thới Tây 1, Xã Tân Hiệp, Huyện Hóc Môn, Thành phố Hồ Chí Minh, Việt Nam', 'Hồ Chí Minh', true),
('M_HOA', 'CÔNG TY TNHH MỸ PHẨM MỘC HOA', 'outsource', '5/12 Ấp Thới Tứ, Xã Thới Tam Thôn, Huyện Hóc Môn, Thành phố Hồ Chí Minh, Việt Nam', 'Hồ Chí Minh', true),
('LYONA', 'CÔNG TY TNHH ĐÀO TẠO SẢN XUẤT THƯƠNG MẠI LYONA BEAUTY & COSMETICS', 'outsource', 'Số 60/2, khu phố Tân Thắng, Phường Tân Bình, Thành phố Dĩ An, Tỉnh Bình Dương, Việt Nam', 'Bình Dương', true),
('N_TRAC', 'CÔNG TY TNHH SX & TM NGUYỄN TRẮC', 'outsource', 'Lô A9, Đường số 2, Đường số 8, Cụm công nghiệp Hải Sơn, Xã Long Thượng, Huyện Cần Giuộc, Tỉnh Long An, Việt Nam', 'Long An', true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  warehouse_type = EXCLUDED.warehouse_type,
  address = EXCLUDED.address,
  city = EXCLUDED.city;

-- ============================================================
-- 3. MATERIALS - Acids & Active Ingredients (from File 3 NGUYÊN LIỆU)
-- ============================================================
INSERT INTO materials (code, trading_name, inci_name, material_type, category, unit, is_active) VALUES
-- Acids
('ACI_Citric', 'CITRIC ACID', 'Citric acid', 'raw_material', 'ACID', 'KG', true),
('ACI_Fe-A', 'FERRULIC ACID', 'Ferrulic Acid', 'raw_material', 'ACID', 'KG', true),
('ACI_LA', 'LACTIC ACID / ACID LACTIC 88%-PURAC', 'Lactic acid', 'raw_material', 'ACID', 'KG', true),
('ACI_Ma-A', 'MANDELIC ACID', 'Mandelic Acid', 'raw_material', 'ACID', 'KG', true),
('ACI_BHA', 'ACID SALICYLIC', 'Salicylic Acid', 'raw_material', 'ACID', 'KG', true),
('ACI_Tranexamic Acid', 'TRANEXAMIC ACID 99 MSDS', 'Tranexamic Acid', 'raw_material', 'ACID', 'KG', true),
('ACI_TURPINAL', 'TURPINAL SL', 'Etidronic acid', 'raw_material', 'ACID', 'KG', true),
('ACI_Vi-C', 'VITAMIN C', 'Ascorbic acid', 'raw_material', 'ACID', 'KG', true),
-- Active ingredients
('ACT_Allantoin Usp', 'ALLANTOIN USP', 'Allantoin', 'raw_material', 'HOẠT_CHẤT', 'KG', true),
('ACT_B3', 'NIACINAMIDE / NICOTINAMIDE', 'Niacinamide', 'raw_material', 'HOẠT_CHẤT', 'KG', true),
('ACT_Baicapil', 'BAICAPIL', 'Propanediol, Aqua, Arginine, Lactic Acid...', 'raw_material', 'HOẠT_CHẤT', 'KG', true),
('ACT_BIOHAIR N17-COLLA', 'BIO HAIR N17- COLLA', 'soluble collagen/acetyl tetra peptide 3', 'raw_material', 'HOẠT_CHẤT', 'KG', true),
('ACT_BTAC', 'HÓA CHẤT MICONIUM BTAC-80', 'Behentrimonium chloride', 'raw_material', 'HOẠT_CHẤT', 'KG', true),
('ACT_Cao BX', 'CHIẾT XUẤT CAO BỒ KẾT', 'Gleditsia fruit extract', 'raw_material', 'HOẠT_CHẤT', 'KG', true),
('ACT_CTAC', 'CTAC', 'Cetrimonium chloride', 'raw_material', 'HOẠT_CHẤT', 'KG', true),
('ACT_CX TX', 'CHIẾT XUẤT TRÀ XANH', 'Camellia sinensis leaf extract', 'raw_material', 'HOẠT_CHẤT', 'KG', true),
('ACT_Gloryage® Se6Umcut', 'SE6UM CUT', 'Cyclodextrin, Camellia Oleifera Seed Extract', 'raw_material', 'HOẠT_CHẤT', 'KG', true),
('ACT_KOH', 'POTASSIUM HYDROXYDE', 'Potassium hydroxide', 'raw_material', 'HOẠT_CHẤT', 'KG', true),
('ACT_PHENYL', 'DC556 (PHENYL TRIMETHICONE)', 'Phenyl trimethicone', 'raw_material', 'HOẠT_CHẤT', 'KG', true),
('ACT_PinoPlex', 'PINOPLEX', 'Pinus Sylvestris Cone Extract', 'raw_material', 'HOẠT_CHẤT', 'KG', true),
('ACT_PROC22', 'PROCONDITION 22', 'Brassicamidopropyl Dimethylamine', 'raw_material', 'HOẠT_CHẤT', 'KG', true),
('ACT_PROCARE 12S', 'PROCARE 12S', 'Water, Olive Oil, PEG-8 Esters...', 'raw_material', 'HOẠT_CHẤT', 'KG', true),
('ACT_PRODEW 500', 'PRODEW 500', 'Sodium PCA, Sodium Lactate, Arginine...', 'raw_material', 'HOẠT_CHẤT', 'KG', true),
('ACT_Pure Astaxanthin', 'PURE ASTAXANTHIN 100GR', 'Heamatococus Pluvialis Extract', 'raw_material', 'HOẠT_CHẤT', 'KG', true),
('ACT_SERASHINE', 'SERASHINE EM301-A', NULL, 'raw_material', 'HOẠT_CHẤT', 'KG', true),
('ACT_Silk Soft', 'SILK SOFT', 'Polyquterium-31, Ceteareth 20...', 'raw_material', 'HOẠT_CHẤT', 'KG', true),
('ACT_Tio2 Cr-50 Cs', 'ACT_TIO2 CR-50 CS', NULL, 'raw_material', 'HOẠT_CHẤT', 'KG', true),
('ACT_Maqui Berry', 'MAQUI BERRY', 'Water, Butylene Glycol, Aristotelia Chilensis Fruit Extract', 'raw_material', 'HOẠT_CHẤT', 'KG', true),
('Aqua', 'NƯỚC CẤT 2 LẦN', 'Water', 'raw_material', 'DUNG_MÔI', 'KG', true),
-- Emulsifiers
('EMU_CERIN', 'CERIN', NULL, 'raw_material', 'NHŨ_HÓA', 'KG', true),
('EMU_Cetyl Wax', 'CETYL ALCOHOL / THAIOL 1698', 'Cetyl Alcohol', 'raw_material', 'NHŨ_HÓA', 'KG', true),
('EMU_Cosmagel 305', 'COSMAGEL 305 / AQUAGEL 45', NULL, 'raw_material', 'NHŨ_HÓA', 'KG', true),
('EMU_Gs-Peg100', 'GLYCERYL STEARATE AND PEG-100 STEARATE', NULL, 'raw_material', 'NHŨ_HÓA', 'KG', true),
-- Semi-finished products
('BTP_BT', 'BỘT TẮM LÁ DAO', NULL, 'semi_finished', 'BÁN_THÀNH_PHẨM', 'KG', true),
('BTP_SMOOTH', 'DẦU GỘI SMOOTH', NULL, 'semi_finished', 'BÁN_THÀNH_PHẨM', 'KG', true)
ON CONFLICT (code) DO UPDATE SET
  trading_name = EXCLUDED.trading_name,
  inci_name = EXCLUDED.inci_name,
  material_type = EXCLUDED.material_type,
  category = EXCLUDED.category;

-- ============================================================
-- 4. MATERIALS - Fragrances (from File 3 HƯƠNG LIỆU)
-- ============================================================
INSERT INTO materials (code, trading_name, inci_name, material_type, category, unit, is_active) VALUES
('FRA_NTG', 'FRAGRANCE NTG SOHK013930 / Hương Intense', NULL, 'raw_material', 'HƯƠNG_LIỆU', 'KG', true),
('FRA_Sexy', 'EAU SO SEXY CSN036860 / Hương So Sexy', NULL, 'raw_material', 'HƯƠNG_LIỆU', 'KG', true),
('FRA_VANBE', 'Hương Vani béo', NULL, 'raw_material', 'HƯƠNG_LIỆU', 'KG', true),
('FRA_ROSEWATER', 'Hương Nước Hoa Hồng', NULL, 'raw_material', 'HƯƠNG_LIỆU', 'KG', true),
('FRA_VANI', 'Hương Sweet vanilla (Org)', NULL, 'raw_material', 'HƯƠNG_LIỆU', 'KG', true),
('FRA_WHIS', 'Hương Whiskey', NULL, 'raw_material', 'HƯƠNG_LIỆU', 'KG', true),
('FRA_CAFE', 'Hương cà phê', NULL, 'raw_material', 'HƯƠNG_LIỆU', 'KG', true),
('FRA_GREENTEA', 'GREENTEA AQUA V1 CSN039522', NULL, 'raw_material', 'HƯƠNG_LIỆU', 'KG', true),
('FRA_PINKGRAPE', 'Hương Bưởi Hồng (Org)', NULL, 'raw_material', 'HƯƠNG_LIỆU', 'KG', true),
('FRA_MUSK', 'Xạ Hương', NULL, 'raw_material', 'HƯƠNG_LIỆU', 'KG', true),
('FRA_MELON', 'Dưa Lưới', NULL, 'raw_material', 'HƯƠNG_LIỆU', 'KG', true),
('FRA_PEAR', 'Quả Lê', NULL, 'raw_material', 'HƯƠNG_LIỆU', 'KG', true),
('FRA_NASHI', 'Hương Nashi season', NULL, 'raw_material', 'HƯƠNG_LIỆU', 'KG', true),
('FRA_ARGAN', 'Hương Moroccan Argan', NULL, 'raw_material', 'HƯƠNG_LIỆU', 'KG', true),
('FRA_BEAUTE', 'Hương Beaute Somre', NULL, 'raw_material', 'HƯƠNG_LIỆU', 'KG', true),
('FRA_TONKA', 'Hương Đậu Tonka', NULL, 'raw_material', 'HƯƠNG_LIỆU', 'KG', true),
('FRA_COCONUTL', 'Hương Coconut Line', NULL, 'raw_material', 'HƯƠNG_LIỆU', 'KG', true),
('FRA_PMG', 'Hương kem Pick me, girl!', NULL, 'raw_material', 'HƯƠNG_LIỆU', 'KG', true),
('FRA_PRETTYM', 'Hương Pretty Melody', NULL, 'raw_material', 'HƯƠNG_LIỆU', 'KG', true),
('FRA_SUMMERS', 'Hương Summer Spring', NULL, 'raw_material', 'HƯƠNG_LIỆU', 'KG', true),
('FRA_BLOM', 'Hương Bloming Sakura', NULL, 'raw_material', 'HƯƠNG_LIỆU', 'KG', true),
('FRA_9S', 'Hương Nine Soul', NULL, 'raw_material', 'HƯƠNG_LIỆU', 'KG', true),
('FRA_CHERRY', 'Hương Cherry', NULL, 'raw_material', 'HƯƠNG_LIỆU', 'KG', true),
('FRA_APPLE', 'Hương Táo xanh', NULL, 'raw_material', 'HƯƠNG_LIỆU', 'KG', true),
('FRA_LYCHEE', 'Hương vải', NULL, 'raw_material', 'HƯƠNG_LIỆU', 'KG', true),
('FRA_BELLE', 'Hương Belle Epoque', NULL, 'raw_material', 'HƯƠNG_LIỆU', 'KG', true)
ON CONFLICT (code) DO UPDATE SET
  trading_name = EXCLUDED.trading_name,
  material_type = EXCLUDED.material_type,
  category = EXCLUDED.category;

-- ============================================================
-- 5. MATERIALS - Packaging (from File 3 BAO BÌ)
-- ============================================================
INSERT INTO materials (code, trading_name, material_type, category, unit, is_active) VALUES
-- Tubes
('TP-100', 'Tuýp 100 gr', 'packaging', 'BAO_BÌ', 'Tuýp', true),
('TP-50', 'Tuýp nhựa 50ml', 'packaging', 'BAO_BÌ', 'Tuýp', true),
('TP-70', 'Tuýp nhựa 70ml', 'packaging', 'BAO_BÌ', 'Tuýp', true),
-- PET bottles
('C-PET-NAU-100', 'Chai PET nâu 100ml', 'packaging', 'BAO_BÌ', 'Chai', true),
('C-PET-NAU-200', 'Chai PET nâu 200ml', 'packaging', 'BAO_BÌ', 'Chai', true),
('C-PET-NAU-300', 'Chai PET nâu 300ml', 'packaging', 'BAO_BÌ', 'Chai', true),
('C-PET-NAU-500', 'Chai PET nâu 500ml', 'packaging', 'BAO_BÌ', 'Chai', true),
('C-PET-TRANGDUC-150', 'Chai 150 ml trắng đục', 'packaging', 'BAO_BÌ', 'Chai', true),
('C-PET-TRANGDUC-200', 'Chai 200 ml trắng đục', 'packaging', 'BAO_BÌ', 'Chai', true),
('C-PET-TRG-250', 'Chai 250 ml trong', 'packaging', 'BAO_BÌ', 'Chai', true),
('C-PET-NAU-30', 'Chai nâu 30 ml', 'packaging', 'BAO_BÌ', 'Chai', true),
('C-PET-NAU-50', 'Chai nâu 50 ml / Vỏ chai pet 50ml', 'packaging', 'BAO_BÌ', 'Chai', true),
('C-PET-TRG-30', 'Chai trong 30 ml', 'packaging', 'BAO_BÌ', 'Chai', true),
('C-PET-TRG-50', 'Chai trong 50 ml', 'packaging', 'BAO_BÌ', 'Chai', true),
('C-PET-TRG-1L', 'Chai 1l trong', 'packaging', 'BAO_BÌ', 'Chai', true),
-- Product-specific bottles
('C-GBN-310', 'Chai sản phẩm 310ml (Retro Nano)', 'packaging', 'BAO_BÌ', 'Chai', true),
('C-GBN-350', 'Chai sản phẩm 350ml (Retro Nano)', 'packaging', 'BAO_BÌ', 'Chai', true),
('C-GBPN-280', 'Chai sản phẩm 280ml (Retro smooth +)', 'packaging', 'BAO_BÌ', 'Chai', true),
('C-SD-150', 'Chai sản phẩm 150ml (Must have)', 'packaging', 'BAO_BÌ', 'Chai', true),
('C-SHN-100', 'Chai sản phẩm hồng 100ml (Must have 01)', 'packaging', 'BAO_BÌ', 'Chai', true),
('C-STN-100', 'Chai sản phẩm vàng 100ml (Must have 02)', 'packaging', 'BAO_BÌ', 'Chai', true),
('C-XBN-115', 'Chai sản phẩm 115ml (Fast & Furious)', 'packaging', 'BAO_BÌ', 'Chai', true),
('C-XBN-150', 'Chai sản phẩm 150ml (Fast & Furious)', 'packaging', 'BAO_BÌ', 'Chai', true),
('C-SNL-500', 'Chai sản phẩm 500ml (Wake up)', 'packaging', 'BAO_BÌ', 'Chai', true),
('C-SNN-200', 'Chai sản phẩm 200ml (Wake up)', 'packaging', 'BAO_BÌ', 'Chai', true),
('C-SNN-230', 'Chai sản phẩm 230ml (Wake up)', 'packaging', 'BAO_BÌ', 'Chai', true),
-- Jars
('L-PMG-250', 'Hủ sản phẩm (Pick me, girls! 250gr)', 'packaging', 'BAO_BÌ', 'Hủ', true),
('L-PMG-350', 'Hủ sản phẩm (Pick me, girls! 350gr)', 'packaging', 'BAO_BÌ', 'Hủ', true),
('L-UBK-250', 'Hủ sản phẩm (Vitamin hair 250gr)', 'packaging', 'BAO_BÌ', 'Hủ', true),
('L-UPH-250', 'Hủ sản phẩm (As A Habit 250gr)', 'packaging', 'BAO_BÌ', 'Hủ', true),
('L-UPH-350', 'Hũ sản phẩm (As a habit 350gr)', 'packaging', 'BAO_BÌ', 'Hủ', true),
-- Boxes
('H-GBN-310', 'Hộp sản phẩm (Retro nano 310ml)', 'packaging', 'BAO_BÌ', 'Hộp', true),
('H-GBPN-280', 'Hộp sản phẩm (Retro smooth 280ml)', 'packaging', 'BAO_BÌ', 'Hộp', true),
('H-PMG-250', 'Hộp sản phẩm (Pick me, girls)', 'packaging', 'BAO_BÌ', 'Hộp', true),
('H-UBK-250', 'Hộp sản phẩm (Vitamin hair 250gr)', 'packaging', 'BAO_BÌ', 'Hộp', true),
('H-UPH-250', 'Hộp sản phẩm (As a habit 250gr)', 'packaging', 'BAO_BÌ', 'Hộp', true),
('H-XBN-115', 'Hộp sản phẩm (Fast & Furious 115ml)', 'packaging', 'BAO_BÌ', 'Hộp', true),
-- Labels/Stickers
('TE-CG', 'Tem chống giả', 'packaging', 'BAO_BÌ', 'Cái', true),
('TE-CK', 'Tem check mã vạch', 'packaging', 'BAO_BÌ', 'Cái', true),
-- Bags
('T-BT-120', 'Túi sản phẩm (Wake Up 120gr)', 'packaging', 'BAO_BÌ', 'Túi', true),
('T-BT-150', 'Túi sản phẩm (Wake Up 150gr)', 'packaging', 'BAO_BÌ', 'Túi', true),
('T-ZIPGKRAFT-120', 'Túi zip giấy Kraft 100gr', 'packaging', 'BAO_BÌ', 'Túi', true)
ON CONFLICT (code) DO UPDATE SET
  trading_name = EXCLUDED.trading_name,
  material_type = EXCLUDED.material_type,
  category = EXCLUDED.category;

-- ============================================================
-- 6. FINISHED PRODUCTS (from File 4 THIẾT LẬP + QUẢN LÍ KHO)
-- ============================================================
INSERT INTO finished_products (code, name, category, sub_category, product_type, sales_status, unit, standard_cost, reorder_point, is_active) VALUES
-- Sản phẩm bán chính (Đang bán)
('GRN', 'DẦU GỘI RETRO NANO 350ML', 'tóc', 'Dầu gội', 'SẢN_PHẨM_BÁN', 'ĐANG_BÁN', 'Chai', NULL, 1000, true),
('GRS', 'DẦU GỘI RETRO SMOOTH 350ML', 'tóc', 'Dầu gội', 'SẢN_PHẨM_BÁN', 'ĐANG_BÁN', 'Chai', NULL, 1000, true),
('XFF', 'TINH CHẤT BƯỞI FAST & FURIOUS 150ML', 'tóc', 'Xịt dưỡng', 'SẢN_PHẨM_BÁN', 'ĐANG_BÁN', 'Chai', NULL, 1000, true),
('AAH', 'KEM Ủ PHỤC HỒI AS A HABIT BIO 350GR', 'tóc', 'Kem ủ', 'SẢN_PHẨM_BÁN', 'ĐANG_BÁN', 'Hủ', NULL, 1000, true),
('MH02', 'SỮA DƯỠNG TÓC MUST HAVE 02 150ML', 'tóc', 'Sữa dưỡng', 'SẢN_PHẨM_BÁN', 'ĐANG_BÁN', 'Chai', NULL, 1000, true),
('MH01', 'SỮA DƯỠNG TÓC MUST HAVE 01 150ML - TÓC NHUÔM', 'tóc', 'Sữa dưỡng', 'SẢN_PHẨM_BÁN', 'ĐANG_BÁN', 'Chai', NULL, 1000, true),
('KPMG', 'KEM BODY CREAM PICK ME, GIRL! 350GR', 'da', 'Kem body', 'SẢN_PHẨM_BÁN', 'ĐANG_BÁN', 'Hủ', NULL, 1000, true),
('SWL', 'SỮA Ủ WAKE UP BODY 500ML', 'da', 'Sữa ủ', 'SẢN_PHẨM_BÁN', 'ĐANG_BÁN', 'Chai', NULL, 1000, true),
('SWN', 'SỮA Ủ WAKE UP BODY 230ML', 'da', 'Sữa ủ', 'SẢN_PHẨM_BÁN', 'ĐANG_BÁN', 'Chai', NULL, 1000, true),
('BLD', 'BỘT TẮM LÁ DAO WAKE UP BODY 150GR', 'da', 'Bột tắm', 'SẢN_PHẨM_BÁN', 'ĐANG_BÁN', 'Chai', NULL, 1000, true),
('DB20', 'DẦU BƠ AVOCADO OIL 20ML', 'da', 'Dầu dưỡng', 'SẢN_PHẨM_BÁN', 'ĐANG_BÁN', 'Chai', NULL, 1000, true),
('DB50', 'DẦU BƠ AVOCADO OIL 50ML', 'da', 'Dầu dưỡng', 'SẢN_PHẨM_BÁN', 'ĐANG_BÁN', 'Chai', 23500, 1000, true),
('CBK', 'DẦU GỘI CAO BỒ KẾT CLASSIC 150ML', 'tóc', 'Dầu gội', 'SẢN_PHẨM_BÁN', 'ĐANG_BÁN', 'Chai', 73800, 1000, true),
('XBN', 'XỊT BƯỞI KÍCH MỌC TÓC FAST & FURIOUS 115ML', 'tóc', 'Xịt dưỡng', 'SẢN_PHẨM_BÁN', 'ĐANG_BÁN', 'Chai', 13985, 1000, true),
('BT', 'BỘT TẮM LÁ DAO WAKE UP BODY 120GR', 'da', 'Bột tắm', 'SẢN_PHẨM_BÁN', 'ĐANG_BÁN', 'Gói', 20607, 0, true),
('SNL', 'SỮA Ủ WAKE UP BODY 500ML', 'da', 'Sữa ủ', 'SẢN_PHẨM_BÁN', 'ĐANG_BÁN', 'Chai', 53740, 0, true),
('SNN', 'SỮA Ủ WAKE UP BODY 200ML', 'da', 'Sữa ủ', 'SẢN_PHẨM_BÁN', 'ĐANG_BÁN', 'Chai', 26289, 0, true),
('PMG450', 'KEM BODY CREAM PICK ME, GIRL! 450GR', 'da', 'Kem body', 'SẢN_PHẨM_BÁN', 'ĐANG_BÁN', 'Túi', NULL, 0, true),
-- Ngưng bán
('BCC', 'XỊT BƯỞI CAO CẤP 100ML', 'tóc', 'Xịt dưỡng', 'SẢN_PHẨM_BÁN', 'NGƯNG_BÁN', 'Chai', 15984, 0, true),
('DB10', 'DẦU BƠ AVOCADO OIL 10ML', 'da', 'Dầu dưỡng', 'SẢN_PHẨM_BÁN', 'NGƯNG_BÁN', 'Chai', 6400, 0, true),
('GBN', 'DẦU GỘI RETRO NANO 315ML', 'tóc', 'Dầu gội', 'SẢN_PHẨM_BÁN', 'NGƯNG_BÁN', 'Chai', 31864, 0, true),
('GBPN', 'DẦU GỘI RETRO SMOOTH 280ML', 'tóc', 'Dầu gội', 'SẢN_PHẨM_BÁN', 'NGƯNG_BÁN', 'Chai', 36415, 0, true),
('PMG', 'KEM BODY CREAM PICK ME, GIRL! 250GR', 'da', 'Kem body', 'SẢN_PHẨM_BÁN', 'NGƯNG_BÁN', 'Hủ', 79784, 0, true),
('UBK', 'KEM Ủ BỒ KẾT VITAMIN HAIR 250GR', 'tóc', 'Kem ủ', 'SẢN_PHẨM_BÁN', 'NGƯNG_BÁN', 'Hủ', 43050, 0, true),
('UPH', 'KEM Ủ PHỤC HỒI AS A HABIT 250GR', 'tóc', 'Kem ủ', 'SẢN_PHẨM_BÁN', 'NGƯNG_BÁN', 'Hủ', 43381, 0, true),
('SHN', 'SỮA DƯỠNG TÓC MUST HAVE HỒNG 100ML', 'tóc', 'Sữa dưỡng', 'SẢN_PHẨM_BÁN', 'NGƯNG_BÁN', 'Chai', 15806, 0, true),
('STN', 'SỮA DƯỠNG TÓC MUST HAVE VÀNG 100ML', 'tóc', 'Sữa dưỡng', 'SẢN_PHẨM_BÁN', 'NGƯNG_BÁN', 'Chai', 15264, 0, true),
-- Sản phẩm quà (mini/sample)
('BTMN', '(QT) BỘT TẮM LÁ DAO WAKE UP BODY 30G', 'da', 'Bột tắm', 'SẢN_PHẨM_QUÀ', 'ĐANG_BÁN', 'Gói', NULL, 0, true),
('GRMN', '(QT) DẦU GỘI RETRO NANO 50ML', 'tóc', 'Dầu gội', 'SẢN_PHẨM_QUÀ', 'ĐANG_BÁN', 'Chai', NULL, 0, true),
('GSMN', '(QT) DẦU GỘI RETRO SMOOTH 50ML', 'tóc', 'Dầu gội', 'SẢN_PHẨM_QUÀ', 'ĐANG_BÁN', 'Chai', NULL, 0, true),
('KDMN', '(QT) KEM BODY CREAM PICK ME, GIRL! 50GR', 'da', 'Kem body', 'SẢN_PHẨM_QUÀ', 'ĐANG_BÁN', 'Tuýp', NULL, 0, true),
('MHMN', '(QT) SỮA DƯỠNG TÓC MUST HAVE 50ML', 'tóc', 'Sữa dưỡng', 'SẢN_PHẨM_QUÀ', 'ĐANG_BÁN', 'Chai', NULL, 0, true),
('SR5', '(QT) SERUM FLASHY 5ML', 'tóc', 'Serum', 'SẢN_PHẨM_QUÀ', 'ĐANG_BÁN', 'Tuýp', NULL, 0, true),
('SWMN', '(QT) SỮA Ủ WAKE UP BODY 50ML', 'da', 'Sữa ủ', 'SẢN_PHẨM_QUÀ', 'ĐANG_BÁN', 'Tuýp', NULL, 0, true),
('XFFMN', '(QT) TINH CHẤT BƯỞI FAST & FURIOUS 50ML', 'tóc', 'Xịt dưỡng', 'SẢN_PHẨM_QUÀ', 'ĐANG_BÁN', 'Chai', NULL, 0, true),
('UMMN', '(QT) KEM Ủ PHỤC HỒI AS A HABIT BIO 50GR', 'tóc', 'Kem ủ', 'SẢN_PHẨM_QUÀ', 'ĐANG_BÁN', 'Tuýp', NULL, 0, true),
-- Phụ kiện
('BONG', 'BÔNG TẮM VYVY SKINCARE', 'da', 'Phụ kiện', 'PHỤ_KIỆN', 'ĐANG_BÁN', 'Cái', NULL, 0, true),
('MCBD', 'MŨ TRÙM TÓC CHẤM BI ĐEN', 'tóc', 'Phụ kiện', 'PHỤ_KIỆN', 'ĐANG_BÁN', 'Cái', NULL, 0, true),
('SCBK', 'SRUNCHIES CHẤM BI KEM', 'tóc', 'Phụ kiện', 'PHỤ_KIỆN', 'ĐANG_BÁN', 'Cái', NULL, 0, true),
('GAO', 'BỘ GÁO DỪA, DỤNG CỤ PHA BỘT', 'da', 'Phụ kiện', 'PHỤ_KIỆN', 'NGƯNG_BÁN', 'Bộ', NULL, 0, true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  product_type = EXCLUDED.product_type,
  sales_status = EXCLUDED.sales_status,
  standard_cost = EXCLUDED.standard_cost,
  reorder_point = EXCLUDED.reorder_point;
