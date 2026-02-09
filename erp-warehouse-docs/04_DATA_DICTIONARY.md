# DATA DICTIONARY - ERP WAREHOUSE MODULE

## Mục Đích
Tài liệu này định nghĩa chi tiết tất cả các bảng, cột, kiểu dữ liệu, ràng buộc và mối quan hệ trong database.

---

## MASTER DATA TABLES

### 1. materials

**Mô tả:** Lưu trữ danh mục nguyên liệu, bao bì, hương liệu sử dụng trong sản xuất

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGSERIAL | No | AUTO | Primary key |
| code | VARCHAR(50) | No | - | Mã nguyên liệu (unique, VD: ACI_Citric) |
| trading_name | VARCHAR(255) | No | - | Tên thương mại |
| inci_name | VARCHAR(255) | Yes | NULL | Tên quốc tế (INCI - International Nomenclature of Cosmetic Ingredients) |
| material_type | VARCHAR(50) | No | - | Loại: raw_material, packaging, fragrance, semi_finished |
| category | VARCHAR(100) | Yes | NULL | Phân loại: ACI, ACT, EMU, MOI, OIL, etc. |
| sub_category | VARCHAR(100) | Yes | NULL | Phân loại chi tiết hơn |
| unit | VARCHAR(20) | No | 'KG' | Đơn vị tính: KG, L, PC, BOX |
| supplier_id | BIGINT | Yes | NULL | FK → suppliers.id |
| standard_cost | DECIMAL(15,2) | Yes | NULL | Giá thành chuẩn |
| last_purchase_price | DECIMAL(15,2) | Yes | NULL | Giá mua lần cuối |
| min_stock_level | DECIMAL(15,3) | No | 0 | Mức tồn kho tối thiểu |
| max_stock_level | DECIMAL(15,3) | Yes | NULL | Mức tồn kho tối đa |
| reorder_point | DECIMAL(15,3) | Yes | NULL | Điểm đặt hàng lại |
| reorder_quantity | DECIMAL(15,3) | Yes | NULL | Số lượng đặt hàng |
| requires_qc | BOOLEAN | No | FALSE | Yêu cầu QC trước khi nhập kho |
| shelf_life_days | INT | Yes | NULL | Hạn sử dụng (ngày) |
| storage_conditions | TEXT | Yes | NULL | Điều kiện bảo quản |
| hazardous | BOOLEAN | No | FALSE | Hóa chất nguy hiểm |
| is_active | BOOLEAN | No | TRUE | Đang hoạt động |
| notes | TEXT | Yes | NULL | Ghi chú |
| created_at | TIMESTAMP | No | NOW() | Ngày tạo |
| created_by | BIGINT | Yes | NULL | Người tạo |
| updated_at | TIMESTAMP | No | NOW() | Ngày cập nhật |
| updated_by | BIGINT | Yes | NULL | Người cập nhật |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (code)
- INDEX (material_type)
- INDEX (category)
- INDEX (supplier_id)

**Foreign Keys:**
- supplier_id → suppliers(id)

---

### 2. finished_products

**Mô tả:** Danh mục thành phẩm

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGSERIAL | No | AUTO | Primary key |
| sku | VARCHAR(50) | No | - | Mã SKU (unique) |
| product_name | VARCHAR(255) | No | - | Tên sản phẩm |
| product_name_en | VARCHAR(255) | Yes | NULL | Tên tiếng Anh |
| product_line | VARCHAR(100) | Yes | NULL | Dòng sản phẩm: Hair Care, Skin Care |
| category | VARCHAR(100) | Yes | NULL | Loại: Shampoo, Conditioner, Serum |
| brand | VARCHAR(100) | Yes | NULL | Thương hiệu |
| net_content | VARCHAR(50) | Yes | NULL | Dung tích: 100ml, 500ml |
| unit | VARCHAR(20) | No | 'PC' | Đơn vị: PC, BOX, BOTTLE |
| standard_cost | DECIMAL(15,2) | Yes | NULL | Giá thành sản xuất |
| selling_price | DECIMAL(15,2) | Yes | NULL | Giá bán sỉ |
| retail_price | DECIMAL(15,2) | Yes | NULL | Giá bán lẻ |
| min_stock_level | DECIMAL(15,3) | No | 0 | Tồn tối thiểu |
| max_stock_level | DECIMAL(15,3) | Yes | NULL | Tồn tối đa |
| reorder_point | DECIMAL(15,3) | Yes | NULL | Điểm đặt hàng |
| shelf_life_months | INT | Yes | NULL | Hạn dùng (tháng) |
| requires_batch_tracking | BOOLEAN | No | TRUE | Bắt buộc tracking batch |
| barcode | VARCHAR(100) | Yes | NULL | Mã vạch |
| qr_code | VARCHAR(255) | Yes | NULL | QR code |
| is_active | BOOLEAN | No | TRUE | Đang bán |
| is_sellable | BOOLEAN | No | TRUE | Cho phép bán |
| notes | TEXT | Yes | NULL | Ghi chú |
| created_at | TIMESTAMP | No | NOW() | Ngày tạo |
| created_by | BIGINT | Yes | NULL | Người tạo |
| updated_at | TIMESTAMP | No | NOW() | Ngày cập nhật |
| updated_by | BIGINT | Yes | NULL | Người cập nhật |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (sku)
- INDEX (category)
- INDEX (brand)

---

### 3. warehouses

**Mô tả:** Danh sách kho hàng

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGSERIAL | No | AUTO | Primary key |
| code | VARCHAR(50) | No | - | Mã kho (unique, VD: WH-MAIN) |
| name | VARCHAR(255) | No | - | Tên kho |
| warehouse_type | VARCHAR(50) | Yes | NULL | Loại: main, transit, retail, quarantine |
| address | TEXT | Yes | NULL | Địa chỉ |
| city | VARCHAR(100) | Yes | NULL | Thành phố |
| district | VARCHAR(100) | Yes | NULL | Quận/Huyện |
| ward | VARCHAR(100) | Yes | NULL | Phường/Xã |
| postal_code | VARCHAR(20) | Yes | NULL | Mã bưu điện |
| manager_id | BIGINT | Yes | NULL | FK → users.id (Quản lý kho) |
| phone | VARCHAR(20) | Yes | NULL | Số điện thoại |
| email | VARCHAR(100) | Yes | NULL | Email |
| is_active | BOOLEAN | No | TRUE | Đang hoạt động |
| allow_negative_stock | BOOLEAN | No | FALSE | Cho phép xuất âm kho |
| created_at | TIMESTAMP | No | NOW() | Ngày tạo |
| created_by | BIGINT | Yes | NULL | Người tạo |
| updated_at | TIMESTAMP | No | NOW() | Ngày cập nhật |
| updated_by | BIGINT | Yes | NULL | Người cập nhật |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (code)
- INDEX (warehouse_type)

---

### 4. warehouse_locations

**Mô tả:** Vị trí lưu trữ trong kho (Zone-Rack-Bin)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGSERIAL | No | AUTO | Primary key |
| warehouse_id | BIGINT | No | - | FK → warehouses.id |
| code | VARCHAR(50) | No | - | Mã vị trí: A-01-05 |
| name | VARCHAR(255) | Yes | NULL | Tên mô tả |
| location_type | VARCHAR(50) | Yes | NULL | zone, rack, bin, shelf |
| parent_location_id | BIGINT | Yes | NULL | FK → warehouse_locations.id (tự tham chiếu) |
| zone | VARCHAR(50) | Yes | NULL | Khu vực: A, B, C |
| rack | VARCHAR(50) | Yes | NULL | Kệ: 01, 02 |
| bin | VARCHAR(50) | Yes | NULL | Ngăn: 01, 02 |
| max_capacity | DECIMAL(15,3) | Yes | NULL | Sức chứa tối đa |
| current_usage | DECIMAL(15,3) | No | 0 | Đang sử dụng |
| is_active | BOOLEAN | No | TRUE | Đang hoạt động |
| is_available | BOOLEAN | No | TRUE | Còn trống |
| created_at | TIMESTAMP | No | NOW() | Ngày tạo |
| created_by | BIGINT | Yes | NULL | Người tạo |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (warehouse_id, code)
- INDEX (warehouse_id)
- INDEX (code)
- INDEX (parent_location_id)

---

### 5. suppliers

**Mô tả:** Nhà cung cấp

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGSERIAL | No | AUTO | Primary key |
| code | VARCHAR(50) | No | - | Mã NCC (unique) |
| name | VARCHAR(255) | No | - | Tên công ty |
| short_name | VARCHAR(100) | Yes | NULL | Tên viết tắt |
| contact_person | VARCHAR(100) | Yes | NULL | Người liên hệ |
| phone | VARCHAR(20) | Yes | NULL | Điện thoại |
| email | VARCHAR(100) | Yes | NULL | Email |
| website | VARCHAR(255) | Yes | NULL | Website |
| address | TEXT | Yes | NULL | Địa chỉ |
| city | VARCHAR(100) | Yes | NULL | Thành phố |
| tax_code | VARCHAR(50) | Yes | NULL | Mã số thuế |
| payment_terms | VARCHAR(100) | Yes | NULL | Điều khoản thanh toán: Net 30, COD |
| currency | VARCHAR(10) | No | 'VND' | Tiền tệ |
| rating | DECIMAL(3,2) | Yes | NULL | Đánh giá: 1.00-5.00 |
| on_time_delivery_rate | DECIMAL(5,2) | Yes | NULL | Tỷ lệ giao đúng hạn (%) |
| quality_score | DECIMAL(5,2) | Yes | NULL | Điểm chất lượng (%) |
| is_active | BOOLEAN | No | TRUE | Đang hợp tác |
| is_approved | BOOLEAN | No | FALSE | Đã phê duyệt |
| notes | TEXT | Yes | NULL | Ghi chú |
| created_at | TIMESTAMP | No | NOW() | Ngày tạo |
| created_by | BIGINT | Yes | NULL | Người tạo |
| updated_at | TIMESTAMP | No | NOW() | Ngày cập nhật |
| updated_by | BIGINT | Yes | NULL | Người cập nhật |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (code)
- INDEX (name)

---

## TRANSACTION TABLES

### 6. purchase_orders

**Mô tả:** Đơn đặt hàng mua

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGSERIAL | No | AUTO | Primary key |
| po_number | VARCHAR(50) | No | - | Số PO (unique, VD: PO-2025-000123) |
| po_date | DATE | No | - | Ngày đặt hàng |
| supplier_id | BIGINT | No | - | FK → suppliers.id |
| expected_delivery_date | DATE | Yes | NULL | Ngày giao dự kiến |
| delivery_warehouse_id | BIGINT | Yes | NULL | FK → warehouses.id |
| delivery_address | TEXT | Yes | NULL | Địa chỉ giao hàng |
| subtotal | DECIMAL(15,2) | Yes | NULL | Tổng phụ |
| tax_amount | DECIMAL(15,2) | Yes | NULL | Thuế |
| discount_amount | DECIMAL(15,2) | Yes | NULL | Chiết khấu |
| total_amount | DECIMAL(15,2) | Yes | NULL | Tổng cộng |
| currency | VARCHAR(10) | No | 'VND' | Tiền tệ |
| status | VARCHAR(50) | No | 'draft' | draft, approved, sent, partial_received, received, cancelled |
| approved_by | BIGINT | Yes | NULL | FK → users.id |
| approved_at | TIMESTAMP | Yes | NULL | Thời gian phê duyệt |
| notes | TEXT | Yes | NULL | Ghi chú |
| internal_notes | TEXT | Yes | NULL | Ghi chú nội bộ |
| created_at | TIMESTAMP | No | NOW() | Ngày tạo |
| created_by | BIGINT | Yes | NULL | Người tạo |
| updated_at | TIMESTAMP | No | NOW() | Ngày cập nhật |
| updated_by | BIGINT | Yes | NULL | Người cập nhật |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (po_number)
- INDEX (supplier_id)
- INDEX (status)
- INDEX (po_date)

**Foreign Keys:**
- supplier_id → suppliers(id)
- delivery_warehouse_id → warehouses(id)

---

### 7. purchase_order_items

**Mô tả:** Chi tiết đơn đặt hàng

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGSERIAL | No | AUTO | Primary key |
| po_id | BIGINT | No | - | FK → purchase_orders.id |
| line_number | INT | No | - | Số dòng |
| material_id | BIGINT | No | - | FK → materials.id |
| ordered_quantity | DECIMAL(15,3) | No | - | Số lượng đặt |
| received_quantity | DECIMAL(15,3) | No | 0 | Số lượng đã nhận |
| pending_quantity | DECIMAL(15,3) | - | COMPUTED | = ordered - received |
| unit | VARCHAR(20) | No | - | Đơn vị |
| unit_price | DECIMAL(15,2) | No | - | Đơn giá |
| discount_percent | DECIMAL(5,2) | No | 0 | Chiết khấu (%) |
| tax_percent | DECIMAL(5,2) | No | 0 | Thuế (%) |
| line_total | DECIMAL(15,2) | - | COMPUTED | Thành tiền |
| notes | TEXT | Yes | NULL | Ghi chú |
| created_at | TIMESTAMP | No | NOW() | Ngày tạo |
| created_by | BIGINT | Yes | NULL | Người tạo |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (po_id, line_number)
- INDEX (po_id)
- INDEX (material_id)

**Foreign Keys:**
- po_id → purchase_orders(id) ON DELETE CASCADE
- material_id → materials(id)

---

### 8. goods_receipt_notes

**Mô tả:** Phiếu nhập kho

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | BIGSERIAL | No | AUTO | Primary key |
| grn_number | VARCHAR(50) | No | - | Số GRN (unique) |
| grn_date | DATE | No | - | Ngày nhập |
| grn_type | VARCHAR(50) | No | 'from_supplier' | from_supplier, from_production, return, transfer, adjustment |
| po_id | BIGINT | Yes | NULL | FK → purchase_orders.id |
| supplier_id | BIGINT | Yes | NULL | FK → suppliers.id |
| delivery_note_number | VARCHAR(100) | Yes | NULL | Số phiếu giao hàng NCC |
| warehouse_id | BIGINT | No | - | FK → warehouses.id |
| status | VARCHAR(50) | No | 'pending_qc' | pending_qc, qc_passed, qc_failed, posted, cancelled |
| qc_status | VARCHAR(50) | Yes | NULL | pass, fail, partial, pending |
| qc_by | BIGINT | Yes | NULL | FK → users.id |
| qc_at | TIMESTAMP | Yes | NULL | Thời gian QC |
| qc_notes | TEXT | Yes | NULL | Ghi chú QC |
| is_posted | BOOLEAN | No | FALSE | Đã post vào kho |
| posted_by | BIGINT | Yes | NULL | FK → users.id |
| posted_at | TIMESTAMP | Yes | NULL | Thời gian post |
| notes | TEXT | Yes | NULL | Ghi chú |
| created_at | TIMESTAMP | No | NOW() | Ngày tạo |
| created_by | BIGINT | Yes | NULL | Người tạo |
| updated_at | TIMESTAMP | No | NOW() | Ngày cập nhật |
| updated_by | BIGINT | Yes | NULL | Người cập nhật |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (grn_number)
- INDEX (po_id)
- INDEX (warehouse_id)
- INDEX (status)
- INDEX (grn_date)

---

(Tiếp tục cho các bảng khác tương tự...)

---

## BUSINESS RULES & CONSTRAINTS

### 1. Materials
- `code` phải unique
- `min_stock_level` >= 0
- `max_stock_level` >= `min_stock_level` (nếu có)
- `shelf_life_days` > 0 (nếu có)

### 2. Purchase Orders
- `po_number` auto-generate: PO-{YEAR}-{SEQUENCE}
- `total_amount` = subtotal - discount + tax
- Không thể xóa PO đã approved
- Không thể edit PO đã received

### 3. GRN
- `grn_number` auto-generate: GRN-{YEAR}-{SEQUENCE}
- Chỉ post được khi QC đã approve
- `received_quantity` <= `ordered_quantity` (từ PO)
- Sau khi post, không thể edit

### 4. Stock Balance
- `total_quantity` = `available_quantity` + `reserved_quantity`
- `available_quantity` không được âm (trừ khi warehouse cho phép)

---

## ENUMERATIONS (Enum Values)

### material_type
- raw_material
- packaging
- fragrance
- semi_finished

### warehouse_type
- main
- transit
- retail
- quarantine

### po_status
- draft
- approved
- sent
- partial_received
- received
- cancelled

### grn_status
- pending_qc
- qc_passed
- qc_failed
- posted
- cancelled

### transaction_type (stock_ledger)
- receipt
- issue
- transfer_in
- transfer_out
- adjustment

---

Còn tiếp...
