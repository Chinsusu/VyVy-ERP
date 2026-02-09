# DATABASE SCHEMA - ERP WAREHOUSE MANAGEMENT MODULE

## Tổng Quan Hệ Thống

Hệ thống quản lý kho cho công ty sản xuất mỹ phẩm với các tính năng:
- Quản lý nguyên liệu, bao bì, thành phẩm
- Nhập kho từ NCC và sản xuất
- Xuất kho cho sản xuất và bán hàng  
- Tracking batch/lot và expiry date
- Truy xuất nguồn gốc (traceability)
- Kiểm kê và báo cáo

---

## I. MASTER DATA TABLES

### 1. `materials` - Danh Mục Nguyên Liệu/Bao Bì

Lưu trữ thông tin về tất cả các loại vật tư: nguyên liệu, bao bì, hương liệu

```sql
CREATE TABLE materials (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,                    -- VD: ACI_Citric, ACT_B3, EMU_Cetyl
    trading_name VARCHAR(255) NOT NULL,                  -- Tên thương mại
    inci_name VARCHAR(255),                              -- Danh pháp quốc tế (INCI)
    material_type VARCHAR(50) NOT NULL,                  -- raw_material, packaging, fragrance, semi_finished
    category VARCHAR(100),                               -- VD: ACI (Acid), ACT (Active), EMU (Emulsifier), MOI (Moisturizer), OIL (Oil)
    sub_category VARCHAR(100),                           -- Phân loại chi tiết hơn
    unit VARCHAR(20) NOT NULL DEFAULT 'KG',              -- KG, L, PC (piece), BOX
    supplier_id BIGINT,                                  -- FK to suppliers
    
    -- Pricing
    standard_cost DECIMAL(15,2),                         -- Giá chuẩn
    last_purchase_price DECIMAL(15,2),                   -- Giá mua gần nhất
    
    -- Stock control
    min_stock_level DECIMAL(15,3) DEFAULT 0,            -- Tồn kho tối thiểu
    max_stock_level DECIMAL(15,3),                      -- Tồn kho tối đa
    reorder_point DECIMAL(15,3),                        -- Điểm đặt hàng lại
    reorder_quantity DECIMAL(15,3),                     -- Số lượng đặt hàng
    
    -- Quality & Safety
    requires_qc BOOLEAN DEFAULT FALSE,                   -- Yêu cầu QC trước khi nhập kho
    shelf_life_days INT,                                -- Hạn sử dụng (ngày)
    storage_conditions TEXT,                            -- Điều kiện bảo quản
    hazardous BOOLEAN DEFAULT FALSE,                    -- Hóa chất nguy hiểm
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

CREATE INDEX idx_materials_code ON materials(code);
CREATE INDEX idx_materials_type ON materials(material_type);
CREATE INDEX idx_materials_category ON materials(category);
CREATE INDEX idx_materials_supplier ON materials(supplier_id);
```

**Dữ liệu mẫu:**
```sql
INSERT INTO materials (code, trading_name, inci_name, material_type, category, unit, min_stock_level) VALUES
('ACI_Citric', 'CITRIC ACID', 'Citric acid', 'raw_material', 'ACI', 'KG', 5.0),
('ACT_B3', 'NIACINAMIDE / NICOTINAMIDE', 'Niacinamide', 'raw_material', 'ACT', 'KG', 2.0),
('EMU_Cetyl_Wax', 'CETYL ALCOHOL / THAIOL 1698', 'Cetyl Alcohol', 'raw_material', 'EMU', 'KG', 3.0),
('OIL_Dầu_Hạt_Nho', 'DẦU HẠT NHO; DẦU REFINED GRAPESEED OIL', 'Vitis Vinifera Seed oil Extract', 'raw_material', 'OIL', 'KG', 10.0);
```

---

### 2. `finished_products` - Danh Mục Thành Phẩm

```sql
CREATE TABLE finished_products (
    id BIGSERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,                    -- Mã SKU
    product_name VARCHAR(255) NOT NULL,
    product_name_en VARCHAR(255),                       -- Tên tiếng Anh
    
    -- Classification
    product_line VARCHAR(100),                          -- Dòng sản phẩm (VD: Hair Care, Skin Care)
    category VARCHAR(100),                              -- Loại (VD: Shampoo, Conditioner, Serum)
    brand VARCHAR(100),                                 -- Thương hiệu
    
    -- Packaging
    net_content VARCHAR(50),                            -- VD: 100ml, 500ml
    unit VARCHAR(20) NOT NULL DEFAULT 'PC',             -- PC (piece), BOX, BOTTLE
    
    -- Pricing
    standard_cost DECIMAL(15,2),                        -- Giá thành sản xuất
    selling_price DECIMAL(15,2),                        -- Giá bán
    retail_price DECIMAL(15,2),                         -- Giá bán lẻ
    
    -- Stock control
    min_stock_level DECIMAL(15,3) DEFAULT 0,
    max_stock_level DECIMAL(15,3),
    reorder_point DECIMAL(15,3),
    
    -- Quality
    shelf_life_months INT,                              -- Hạn sử dụng (tháng)
    requires_batch_tracking BOOLEAN DEFAULT TRUE,       -- Bắt buộc tracking batch
    
    -- Sales info
    barcode VARCHAR(100),                               -- Mã vạch
    qr_code VARCHAR(255),                               -- QR code
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_sellable BOOLEAN DEFAULT TRUE,                   -- Cho phép bán
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT
);

CREATE INDEX idx_fp_sku ON finished_products(sku);
CREATE INDEX idx_fp_category ON finished_products(category);
CREATE INDEX idx_fp_brand ON finished_products(brand);
```

---

### 3. `warehouses` - Danh Mục Kho

```sql
CREATE TABLE warehouses (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,                   -- VD: WH-HCM, WH-HN
    name VARCHAR(255) NOT NULL,
    warehouse_type VARCHAR(50),                         -- main, transit, retail, quarantine
    
    -- Location
    address TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    ward VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- Contact
    manager_id BIGINT,                                  -- FK to users
    phone VARCHAR(20),
    email VARCHAR(100),
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    allow_negative_stock BOOLEAN DEFAULT FALSE,         -- Cho phép xuất âm kho
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT
);

CREATE INDEX idx_warehouses_code ON warehouses(code);
CREATE INDEX idx_warehouses_type ON warehouses(warehouse_type);
```

**Dữ liệu mẫu:**
```sql
INSERT INTO warehouses (code, name, warehouse_type) VALUES
('WH-MAIN', 'Kho Chính - Nhà Trắc', 'main'),
('WH-QC', 'Kho QC/Cách Ly', 'quarantine'),
('WH-FG', 'Kho Thành Phẩm', 'main');
```

---

### 4. `warehouse_locations` - Vị Trí Trong Kho

Quản lý vị trí lưu trữ chi tiết (Zone-Rack-Bin)

```sql
CREATE TABLE warehouse_locations (
    id BIGSERIAL PRIMARY KEY,
    warehouse_id BIGINT NOT NULL,
    code VARCHAR(50) NOT NULL,                          -- VD: A-01-05 (Zone-Rack-Bin)
    name VARCHAR(255),
    location_type VARCHAR(50),                          -- zone, rack, bin, shelf
    parent_location_id BIGINT,                          -- FK tự tham chiếu
    
    -- Hierarchy
    zone VARCHAR(50),                                   -- Khu vực: A, B, C
    rack VARCHAR(50),                                   -- Kệ: 01, 02, 03
    bin VARCHAR(50),                                    -- Ngăn: 01, 02, 03
    
    -- Capacity
    max_capacity DECIMAL(15,3),                         -- Sức chứa tối đa
    current_usage DECIMAL(15,3) DEFAULT 0,              -- Đang sử dụng
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_available BOOLEAN DEFAULT TRUE,                  -- Còn trống
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (parent_location_id) REFERENCES warehouse_locations(id),
    UNIQUE (warehouse_id, code)
);

CREATE INDEX idx_wh_locations_warehouse ON warehouse_locations(warehouse_id);
CREATE INDEX idx_wh_locations_code ON warehouse_locations(code);
CREATE INDEX idx_wh_locations_parent ON warehouse_locations(parent_location_id);
```

---

### 5. `suppliers` - Danh Mục Nhà Cung Cấp

```sql
CREATE TABLE suppliers (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    
    -- Contact
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(255),
    
    -- Address
    address TEXT,
    city VARCHAR(100),
    tax_code VARCHAR(50),
    
    -- Business terms
    payment_terms VARCHAR(100),                         -- VD: Net 30, COD
    currency VARCHAR(10) DEFAULT 'VND',
    
    -- Performance
    rating DECIMAL(3,2),                                -- 1.00 - 5.00
    on_time_delivery_rate DECIMAL(5,2),                 -- %
    quality_score DECIMAL(5,2),                         -- %
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT FALSE,
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT
);

CREATE INDEX idx_suppliers_code ON suppliers(code);
CREATE INDEX idx_suppliers_name ON suppliers(name);
```

---

## II. TRANSACTION TABLES

### 6. `purchase_orders` - Đơn Đặt Hàng Mua

```sql
CREATE TABLE purchase_orders (
    id BIGSERIAL PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE NOT NULL,              -- PO-2025-001234
    po_date DATE NOT NULL,
    
    -- Supplier
    supplier_id BIGINT NOT NULL,
    
    -- Delivery
    expected_delivery_date DATE,
    delivery_warehouse_id BIGINT,
    delivery_address TEXT,
    
    -- Pricing
    subtotal DECIMAL(15,2),
    tax_amount DECIMAL(15,2),
    discount_amount DECIMAL(15,2),
    total_amount DECIMAL(15,2),
    currency VARCHAR(10) DEFAULT 'VND',
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft',                 -- draft, approved, sent, partial_received, received, cancelled
    approved_by BIGINT,
    approved_at TIMESTAMP,
    
    -- Notes
    notes TEXT,
    internal_notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (delivery_warehouse_id) REFERENCES warehouses(id)
);

CREATE INDEX idx_po_number ON purchase_orders(po_number);
CREATE INDEX idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_po_date ON purchase_orders(po_date);
```

---

### 7. `purchase_order_items` - Chi Tiết Đơn Đặt Hàng

```sql
CREATE TABLE purchase_order_items (
    id BIGSERIAL PRIMARY KEY,
    po_id BIGINT NOT NULL,
    line_number INT NOT NULL,
    
    -- Material
    material_id BIGINT NOT NULL,
    
    -- Quantity
    ordered_quantity DECIMAL(15,3) NOT NULL,
    received_quantity DECIMAL(15,3) DEFAULT 0,
    pending_quantity DECIMAL(15,3) GENERATED ALWAYS AS (ordered_quantity - received_quantity) STORED,
    unit VARCHAR(20) NOT NULL,
    
    -- Pricing
    unit_price DECIMAL(15,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    tax_percent DECIMAL(5,2) DEFAULT 0,
    line_total DECIMAL(15,2) GENERATED ALWAYS AS (
        (ordered_quantity * unit_price * (1 - discount_percent/100)) * (1 + tax_percent/100)
    ) STORED,
    
    -- Notes
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id),
    UNIQUE (po_id, line_number)
);

CREATE INDEX idx_po_items_po ON purchase_order_items(po_id);
CREATE INDEX idx_po_items_material ON purchase_order_items(material_id);
```

---

### 8. `goods_receipt_notes` - Phiếu Nhập Kho (GRN)

Ghi nhận hàng về từ NCC

```sql
CREATE TABLE goods_receipt_notes (
    id BIGSERIAL PRIMARY KEY,
    grn_number VARCHAR(50) UNIQUE NOT NULL,             -- GRN-2025-001234
    grn_date DATE NOT NULL,
    grn_type VARCHAR(50) DEFAULT 'from_supplier',       -- from_supplier, from_production, return, transfer, adjustment
    
    -- Reference
    po_id BIGINT,                                       -- FK to purchase_orders (nullable)
    supplier_id BIGINT,
    delivery_note_number VARCHAR(100),                  -- Số phiếu giao hàng của NCC
    
    -- Warehouse
    warehouse_id BIGINT NOT NULL,
    
    -- Status workflow
    status VARCHAR(50) DEFAULT 'pending_qc',            -- pending_qc, qc_passed, qc_failed, posted, cancelled
    qc_status VARCHAR(50),                              -- pass, fail, partial, pending
    qc_by BIGINT,
    qc_at TIMESTAMP,
    qc_notes TEXT,
    
    -- Posting (chính thức nhập kho)
    is_posted BOOLEAN DEFAULT FALSE,
    posted_by BIGINT,
    posted_at TIMESTAMP,
    
    -- Notes
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

CREATE INDEX idx_grn_number ON goods_receipt_notes(grn_number);
CREATE INDEX idx_grn_po ON goods_receipt_notes(po_id);
CREATE INDEX idx_grn_warehouse ON goods_receipt_notes(warehouse_id);
CREATE INDEX idx_grn_status ON goods_receipt_notes(status);
CREATE INDEX idx_grn_date ON goods_receipt_notes(grn_date);
```

---

### 9. `goods_receipt_note_items` - Chi Tiết Phiếu Nhập Kho

```sql
CREATE TABLE goods_receipt_note_items (
    id BIGSERIAL PRIMARY KEY,
    grn_id BIGINT NOT NULL,
    line_number INT NOT NULL,
    
    -- Material
    material_id BIGINT NOT NULL,
    po_item_id BIGINT,                                  -- Link to PO item (nullable)
    
    -- Quantity
    ordered_quantity DECIMAL(15,3),                     -- Từ PO (nếu có)
    received_quantity DECIMAL(15,3) NOT NULL,
    accepted_quantity DECIMAL(15,3),                    -- Sau QC
    rejected_quantity DECIMAL(15,3),                    -- Từ chối sau QC
    unit VARCHAR(20) NOT NULL,
    
    -- Batch tracking
    batch_number VARCHAR(100),
    lot_number VARCHAR(100),
    manufacturing_date DATE,
    expiry_date DATE,
    
    -- Location
    location_id BIGINT,
    
    -- QC
    qc_result VARCHAR(50),                              -- pass, fail, hold
    qc_notes TEXT,
    
    -- Pricing (for costing)
    unit_cost DECIMAL(15,2),
    total_cost DECIMAL(15,2) GENERATED ALWAYS AS (accepted_quantity * unit_cost) STORED,
    
    -- Notes
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    
    FOREIGN KEY (grn_id) REFERENCES goods_receipt_notes(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id),
    FOREIGN KEY (po_item_id) REFERENCES purchase_order_items(id),
    FOREIGN KEY (location_id) REFERENCES warehouse_locations(id),
    UNIQUE (grn_id, line_number)
);

CREATE INDEX idx_grn_items_grn ON goods_receipt_note_items(grn_id);
CREATE INDEX idx_grn_items_material ON goods_receipt_note_items(material_id);
CREATE INDEX idx_grn_items_batch ON goods_receipt_note_items(batch_number);
CREATE INDEX idx_grn_items_expiry ON goods_receipt_note_items(expiry_date);
```

---

### 10. `material_requests` - Yêu Cầu Xuất Nguyên Liệu (MR)

Phòng sản xuất yêu cầu xuất NVL

```sql
CREATE TABLE material_requests (
    id BIGSERIAL PRIMARY KEY,
    mr_number VARCHAR(50) UNIQUE NOT NULL,              -- MR-2025-001234
    mr_date DATE NOT NULL,
    
    -- Request info
    requested_by_user_id BIGINT NOT NULL,
    department VARCHAR(100),                            -- Phòng ban yêu cầu
    purpose VARCHAR(255),                               -- Mục đích: Sản xuất, R&D, Testing
    
    -- Reference (optional)
    production_order_number VARCHAR(100),               -- Lệnh sản xuất (nếu có)
    
    -- Warehouse
    warehouse_id BIGINT NOT NULL,
    
    -- Delivery
    required_date DATE,                                 -- Ngày cần hàng
    delivery_location TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft',                 -- draft, submitted, approved, picking, picked, issued, cancelled
    approved_by BIGINT,
    approved_at TIMESTAMP,
    
    -- Fulfillment
    is_fulfilled BOOLEAN DEFAULT FALSE,
    fulfilled_at TIMESTAMP,
    
    -- Notes
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

CREATE INDEX idx_mr_number ON material_requests(mr_number);
CREATE INDEX idx_mr_warehouse ON material_requests(warehouse_id);
CREATE INDEX idx_mr_status ON material_requests(status);
CREATE INDEX idx_mr_date ON material_requests(mr_date);
```

---

### 11. `material_request_items` - Chi Tiết Yêu Cầu Xuất

```sql
CREATE TABLE material_request_items (
    id BIGSERIAL PRIMARY KEY,
    mr_id BIGINT NOT NULL,
    line_number INT NOT NULL,
    
    -- Material
    material_id BIGINT NOT NULL,
    
    -- Quantity
    requested_quantity DECIMAL(15,3) NOT NULL,
    issued_quantity DECIMAL(15,3) DEFAULT 0,
    pending_quantity DECIMAL(15,3) GENERATED ALWAYS AS (requested_quantity - issued_quantity) STORED,
    unit VARCHAR(20) NOT NULL,
    
    -- Notes
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    
    FOREIGN KEY (mr_id) REFERENCES material_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id),
    UNIQUE (mr_id, line_number)
);

CREATE INDEX idx_mr_items_mr ON material_request_items(mr_id);
CREATE INDEX idx_mr_items_material ON material_request_items(material_id);
```

---

### 12. `material_issue_notes` - Phiếu Xuất Nguyên Liệu (MIN)

Xuất thực tế NVL ra khỏi kho

```sql
CREATE TABLE material_issue_notes (
    id BIGSERIAL PRIMARY KEY,
    min_number VARCHAR(50) UNIQUE NOT NULL,             -- MIN-2025-001234
    min_date DATE NOT NULL,
    issue_type VARCHAR(50) DEFAULT 'production',        -- production, sale, return_supplier, scrap, transfer
    
    -- Reference
    mr_id BIGINT,                                       -- FK to material_requests (nullable)
    
    -- Warehouse
    warehouse_id BIGINT NOT NULL,
    
    -- Receiver
    received_by_name VARCHAR(100),
    received_by_department VARCHAR(100),
    received_signature TEXT,
    
    -- Status
    is_posted BOOLEAN DEFAULT FALSE,
    posted_by BIGINT,
    posted_at TIMESTAMP,
    
    -- Notes
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    
    FOREIGN KEY (mr_id) REFERENCES material_requests(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

CREATE INDEX idx_min_number ON material_issue_notes(min_number);
CREATE INDEX idx_min_mr ON material_issue_notes(mr_id);
CREATE INDEX idx_min_warehouse ON material_issue_notes(warehouse_id);
CREATE INDEX idx_min_date ON material_issue_notes(min_date);
```

---

### 13. `material_issue_note_items` - Chi Tiết Phiếu Xuất

```sql
CREATE TABLE material_issue_note_items (
    id BIGSERIAL PRIMARY KEY,
    min_id BIGINT NOT NULL,
    line_number INT NOT NULL,
    
    -- Material
    material_id BIGINT NOT NULL,
    mr_item_id BIGINT,                                  -- Link to MR item (nullable)
    
    -- Quantity
    issue_quantity DECIMAL(15,3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    
    -- Batch tracking
    batch_number VARCHAR(100),
    lot_number VARCHAR(100),
    expiry_date DATE,
    
    -- Location
    location_id BIGINT,
    
    -- Costing (FIFO/LIFO)
    unit_cost DECIMAL(15,2),
    total_cost DECIMAL(15,2) GENERATED ALWAYS AS (issue_quantity * unit_cost) STORED,
    
    -- Notes
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    
    FOREIGN KEY (min_id) REFERENCES material_issue_notes(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id),
    FOREIGN KEY (mr_item_id) REFERENCES material_request_items(id),
    FOREIGN KEY (location_id) REFERENCES warehouse_locations(id),
    UNIQUE (min_id, line_number)
);

CREATE INDEX idx_min_items_min ON material_issue_note_items(min_id);
CREATE INDEX idx_min_items_material ON material_issue_note_items(material_id);
CREATE INDEX idx_min_items_batch ON material_issue_note_items(batch_number);
```

---

### 14. `delivery_orders` - Phiếu Xuất Kho Thành Phẩm (DO)

Xuất TP cho bán hàng

```sql
CREATE TABLE delivery_orders (
    id BIGSERIAL PRIMARY KEY,
    do_number VARCHAR(50) UNIQUE NOT NULL,              -- DO-2025-001234
    do_date DATE NOT NULL,
    
    -- Sales reference
    sales_order_number VARCHAR(100),                    -- Link to sales module (text for now)
    customer_name VARCHAR(255),
    customer_address TEXT,
    customer_phone VARCHAR(20),
    
    -- Warehouse
    warehouse_id BIGINT NOT NULL,
    
    -- Shipping
    shipping_method VARCHAR(100),                       -- JNT, SAE, GHTK, VTP, Nội bộ
    tracking_number VARCHAR(100),
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft',                 -- draft, picking, packed, shipped, delivered, cancelled
    is_posted BOOLEAN DEFAULT FALSE,
    posted_by BIGINT,
    posted_at TIMESTAMP,
    
    -- COD
    cod_amount DECIMAL(15,2),
    
    -- Notes
    notes TEXT,
    internal_notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

CREATE INDEX idx_do_number ON delivery_orders(do_number);
CREATE INDEX idx_do_warehouse ON delivery_orders(warehouse_id);
CREATE INDEX idx_do_status ON delivery_orders(status);
CREATE INDEX idx_do_date ON delivery_orders(do_date);
CREATE INDEX idx_do_tracking ON delivery_orders(tracking_number);
```

---

### 15. `delivery_order_items` - Chi Tiết Phiếu Xuất Thành Phẩm

```sql
CREATE TABLE delivery_order_items (
    id BIGSERIAL PRIMARY KEY,
    do_id BIGINT NOT NULL,
    line_number INT NOT NULL,
    
    -- Product
    finished_product_id BIGINT NOT NULL,
    
    -- Quantity
    ordered_quantity DECIMAL(15,3) NOT NULL,
    picked_quantity DECIMAL(15,3) DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    
    -- Batch tracking
    batch_number VARCHAR(100),
    expiry_date DATE,
    
    -- Location
    location_id BIGINT,
    
    -- Pricing (for accounting)
    unit_price DECIMAL(15,2),
    unit_cost DECIMAL(15,2),
    line_total DECIMAL(15,2) GENERATED ALWAYS AS (picked_quantity * unit_price) STORED,
    
    -- Notes
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    
    FOREIGN KEY (do_id) REFERENCES delivery_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (finished_product_id) REFERENCES finished_products(id),
    FOREIGN KEY (location_id) REFERENCES warehouse_locations(id),
    UNIQUE (do_id, line_number)
);

CREATE INDEX idx_do_items_do ON delivery_order_items(do_id);
CREATE INDEX idx_do_items_product ON delivery_order_items(finished_product_id);
CREATE INDEX idx_do_items_batch ON delivery_order_items(batch_number);
```

---

## III. INVENTORY TRACKING TABLES

### 16. `stock_ledger` - Sổ Cái Tồn Kho

Ghi nhận mọi giao dịch nhập/xuất kho (append-only, không sửa/xóa)

```sql
CREATE TABLE stock_ledger (
    id BIGSERIAL PRIMARY KEY,
    posting_date DATE NOT NULL,
    posting_time TIME NOT NULL,
    
    -- Item
    item_type VARCHAR(50) NOT NULL,                     -- material, finished_product
    item_id BIGINT NOT NULL,                            -- ID của material hoặc finished_product
    
    -- Warehouse & Location
    warehouse_id BIGINT NOT NULL,
    location_id BIGINT,
    
    -- Transaction
    transaction_type VARCHAR(50) NOT NULL,              -- receipt, issue, transfer_in, transfer_out, adjustment
    voucher_type VARCHAR(50) NOT NULL,                  -- GRN, MIN, DO, Transfer, Adjustment
    voucher_number VARCHAR(100) NOT NULL,
    
    -- Quantity (dương = nhập, âm = xuất)
    quantity DECIMAL(15,3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    
    -- Batch tracking
    batch_number VARCHAR(100),
    lot_number VARCHAR(100),
    expiry_date DATE,
    
    -- Costing
    valuation_rate DECIMAL(15,2),                       -- Đơn giá tính giá trị
    stock_value DECIMAL(15,2) GENERATED ALWAYS AS (quantity * valuation_rate) STORED,
    
    -- Balance after transaction
    balance_quantity DECIMAL(15,3),
    balance_value DECIMAL(15,2),
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (location_id) REFERENCES warehouse_locations(id)
);

CREATE INDEX idx_sl_item ON stock_ledger(item_type, item_id);
CREATE INDEX idx_sl_warehouse ON stock_ledger(warehouse_id);
CREATE INDEX idx_sl_batch ON stock_ledger(batch_number);
CREATE INDEX idx_sl_voucher ON stock_ledger(voucher_type, voucher_number);
CREATE INDEX idx_sl_posting_date ON stock_ledger(posting_date);
```

---

### 17. `stock_balance` - Tồn Kho Hiện Tại

Bảng tổng hợp tồn kho real-time (denormalized for performance)

```sql
CREATE TABLE stock_balance (
    id BIGSERIAL PRIMARY KEY,
    
    -- Item
    item_type VARCHAR(50) NOT NULL,
    item_id BIGINT NOT NULL,
    
    -- Warehouse & Location
    warehouse_id BIGINT NOT NULL,
    location_id BIGINT,
    
    -- Batch (nullable nếu không track batch)
    batch_number VARCHAR(100),
    lot_number VARCHAR(100),
    expiry_date DATE,
    
    -- Quantity
    available_quantity DECIMAL(15,3) DEFAULT 0,         -- Khả dụng
    reserved_quantity DECIMAL(15,3) DEFAULT 0,          -- Đã reserved
    total_quantity DECIMAL(15,3) GENERATED ALWAYS AS (available_quantity + reserved_quantity) STORED,
    unit VARCHAR(20),
    
    -- Valuation (FIFO/LIFO/Weighted Average)
    valuation_rate DECIMAL(15,2),
    total_value DECIMAL(15,2) GENERATED ALWAYS AS (total_quantity * valuation_rate) STORED,
    
    -- Last transaction
    last_transaction_date DATE,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (location_id) REFERENCES warehouse_locations(id),
    UNIQUE (item_type, item_id, warehouse_id, location_id, batch_number)
);

CREATE INDEX idx_sb_item ON stock_balance(item_type, item_id);
CREATE INDEX idx_sb_warehouse ON stock_balance(warehouse_id);
CREATE INDEX idx_sb_location ON stock_balance(location_id);
CREATE INDEX idx_sb_batch ON stock_balance(batch_number);
CREATE INDEX idx_sb_expiry ON stock_balance(expiry_date);
```

---

### 18. `stock_reservations` - Dự Trữ Hàng

Khi có đơn hàng, reserve hàng để không bán trùng

```sql
CREATE TABLE stock_reservations (
    id BIGSERIAL PRIMARY KEY,
    
    -- Item
    item_type VARCHAR(50) NOT NULL,
    item_id BIGINT NOT NULL,
    
    -- Warehouse
    warehouse_id BIGINT NOT NULL,
    location_id BIGINT,
    batch_number VARCHAR(100),
    
    -- Quantity
    reserved_quantity DECIMAL(15,3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    
    -- Reference
    reference_type VARCHAR(50) NOT NULL,                -- sales_order, production_order
    reference_number VARCHAR(100) NOT NULL,
    reference_line_number INT,
    
    -- Validity
    reserved_until DATE,                                -- Hết hạn reserve
    
    -- Status
    is_released BOOLEAN DEFAULT FALSE,                  -- Đã release (xuất kho)
    released_at TIMESTAMP,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (location_id) REFERENCES warehouse_locations(id)
);

CREATE INDEX idx_sr_item ON stock_reservations(item_type, item_id);
CREATE INDEX idx_sr_warehouse ON stock_reservations(warehouse_id);
CREATE INDEX idx_sr_reference ON stock_reservations(reference_type, reference_number);
```

---

## IV. SUPPORT TABLES

### 19. `stock_adjustments` - Điều Chỉnh Tồn Kho

Khi kiểm kê phát hiện chênh lệch

```sql
CREATE TABLE stock_adjustments (
    id BIGSERIAL PRIMARY KEY,
    adjustment_number VARCHAR(50) UNIQUE NOT NULL,      -- ADJ-2025-001234
    adjustment_date DATE NOT NULL,
    adjustment_type VARCHAR(50),                        -- physical_count, damage, theft, expired, correction
    
    -- Warehouse
    warehouse_id BIGINT NOT NULL,
    
    -- Reason
    reason TEXT,
    
    -- Approval
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by BIGINT,
    approved_at TIMESTAMP,
    
    -- Posting
    is_posted BOOLEAN DEFAULT FALSE,
    posted_by BIGINT,
    posted_at TIMESTAMP,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

CREATE INDEX idx_adj_number ON stock_adjustments(adjustment_number);
CREATE INDEX idx_adj_warehouse ON stock_adjustments(warehouse_id);
CREATE INDEX idx_adj_date ON stock_adjustments(adjustment_date);
```

---

### 20. `stock_adjustment_items` - Chi Tiết Điều Chỉnh

```sql
CREATE TABLE stock_adjustment_items (
    id BIGSERIAL PRIMARY KEY,
    adjustment_id BIGINT NOT NULL,
    line_number INT NOT NULL,
    
    -- Item
    item_type VARCHAR(50) NOT NULL,
    item_id BIGINT NOT NULL,
    
    -- Location
    warehouse_id BIGINT NOT NULL,
    location_id BIGINT,
    batch_number VARCHAR(100),
    
    -- Quantity
    book_quantity DECIMAL(15,3),                        -- Tồn sổ sách
    physical_quantity DECIMAL(15,3),                    -- Tồn thực tế
    variance_quantity DECIMAL(15,3) GENERATED ALWAYS AS (physical_quantity - book_quantity) STORED,
    unit VARCHAR(20) NOT NULL,
    
    -- Valuation
    unit_cost DECIMAL(15,2),
    variance_value DECIMAL(15,2) GENERATED ALWAYS AS (variance_quantity * unit_cost) STORED,
    
    -- Notes
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    
    FOREIGN KEY (adjustment_id) REFERENCES stock_adjustments(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (location_id) REFERENCES warehouse_locations(id),
    UNIQUE (adjustment_id, line_number)
);

CREATE INDEX idx_adj_items_adjustment ON stock_adjustment_items(adjustment_id);
CREATE INDEX idx_adj_items_item ON stock_adjustment_items(item_type, item_id);
```

---

### 21. `stock_transfers` - Chuyển Kho

```sql
CREATE TABLE stock_transfers (
    id BIGSERIAL PRIMARY KEY,
    transfer_number VARCHAR(50) UNIQUE NOT NULL,        -- TRF-2025-001234
    transfer_date DATE NOT NULL,
    
    -- Warehouses
    from_warehouse_id BIGINT NOT NULL,
    to_warehouse_id BIGINT NOT NULL,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft',                 -- draft, in_transit, received, cancelled
    
    -- Shipping
    shipped_by VARCHAR(100),
    shipped_at TIMESTAMP,
    received_by VARCHAR(100),
    received_at TIMESTAMP,
    
    -- Notes
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    
    FOREIGN KEY (from_warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (to_warehouse_id) REFERENCES warehouses(id)
);

CREATE INDEX idx_transfer_number ON stock_transfers(transfer_number);
CREATE INDEX idx_transfer_from ON stock_transfers(from_warehouse_id);
CREATE INDEX idx_transfer_to ON stock_transfers(to_warehouse_id);
```

---

### 22. `stock_transfer_items` - Chi Tiết Chuyển Kho

```sql
CREATE TABLE stock_transfer_items (
    id BIGSERIAL PRIMARY KEY,
    transfer_id BIGINT NOT NULL,
    line_number INT NOT NULL,
    
    -- Item
    item_type VARCHAR(50) NOT NULL,
    item_id BIGINT NOT NULL,
    
    -- Quantity
    transfer_quantity DECIMAL(15,3) NOT NULL,
    received_quantity DECIMAL(15,3) DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    
    -- Batch
    batch_number VARCHAR(100),
    expiry_date DATE,
    
    -- From Location
    from_location_id BIGINT,
    
    -- To Location
    to_location_id BIGINT,
    
    -- Notes
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    
    FOREIGN KEY (transfer_id) REFERENCES stock_transfers(id) ON DELETE CASCADE,
    FOREIGN KEY (from_location_id) REFERENCES warehouse_locations(id),
    FOREIGN KEY (to_location_id) REFERENCES warehouse_locations(id),
    UNIQUE (transfer_id, line_number)
);

CREATE INDEX idx_transfer_items_transfer ON stock_transfer_items(transfer_id);
CREATE INDEX idx_transfer_items_item ON stock_transfer_items(item_type, item_id);
```

---

## V. SYSTEM TABLES

### 23. `users` - Người Dùng

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Profile
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    
    -- Role & Permissions
    role VARCHAR(50) NOT NULL,                          -- admin, warehouse_manager, warehouse_staff, qc, production, sales
    department VARCHAR(100),
    
    -- Settings
    default_warehouse_id BIGINT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    
    FOREIGN KEY (default_warehouse_id) REFERENCES warehouses(id)
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

---

### 24. `audit_logs` - Nhật Ký Audit

```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    
    -- Action
    action VARCHAR(50) NOT NULL,                        -- create, update, delete, post, cancel, approve
    entity_type VARCHAR(100) NOT NULL,                  -- GRN, MIN, DO, etc.
    entity_id BIGINT NOT NULL,
    entity_number VARCHAR(100),                         -- Document number
    
    -- User
    user_id BIGINT,
    user_name VARCHAR(255),
    user_role VARCHAR(50),
    
    -- Changes
    old_values JSONB,
    new_values JSONB,
    
    -- Request info
    ip_address VARCHAR(50),
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
```

---

## VI. VIEWS (Materialized hoặc Normal)

### View 1: `v_material_stock_summary`

Tổng hợp tồn kho nguyên liệu theo warehouse

```sql
CREATE VIEW v_material_stock_summary AS
SELECT 
    m.id AS material_id,
    m.code,
    m.trading_name,
    m.unit,
    w.id AS warehouse_id,
    w.code AS warehouse_code,
    w.name AS warehouse_name,
    SUM(sb.available_quantity) AS available_quantity,
    SUM(sb.reserved_quantity) AS reserved_quantity,
    SUM(sb.total_quantity) AS total_quantity,
    SUM(sb.total_value) AS total_value,
    MIN(sb.expiry_date) AS nearest_expiry_date,
    m.min_stock_level,
    m.reorder_point,
    CASE 
        WHEN SUM(sb.available_quantity) <= m.min_stock_level THEN 'Low Stock'
        WHEN SUM(sb.available_quantity) >= m.max_stock_level THEN 'Overstock'
        ELSE 'OK'
    END AS stock_status
FROM materials m
LEFT JOIN stock_balance sb ON sb.item_type = 'material' AND sb.item_id = m.id
LEFT JOIN warehouses w ON w.id = sb.warehouse_id
WHERE m.is_active = TRUE
GROUP BY m.id, m.code, m.trading_name, m.unit, w.id, w.code, w.name, m.min_stock_level, m.max_stock_level;
```

---

### View 2: `v_expiring_items`

Hàng sắp hết hạn trong 30/60/90 ngày

```sql
CREATE VIEW v_expiring_items AS
SELECT 
    sb.item_type,
    sb.item_id,
    CASE 
        WHEN sb.item_type = 'material' THEN m.code
        WHEN sb.item_type = 'finished_product' THEN fp.sku
    END AS item_code,
    CASE 
        WHEN sb.item_type = 'material' THEN m.trading_name
        WHEN sb.item_type = 'finished_product' THEN fp.product_name
    END AS item_name,
    sb.warehouse_id,
    w.name AS warehouse_name,
    sb.location_id,
    wl.code AS location_code,
    sb.batch_number,
    sb.expiry_date,
    sb.total_quantity,
    sb.unit,
    sb.total_value,
    DATE_PART('day', sb.expiry_date - CURRENT_DATE) AS days_to_expiry,
    CASE 
        WHEN sb.expiry_date <= CURRENT_DATE THEN 'Expired'
        WHEN sb.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN '0-30 days'
        WHEN sb.expiry_date <= CURRENT_DATE + INTERVAL '60 days' THEN '31-60 days'
        WHEN sb.expiry_date <= CURRENT_DATE + INTERVAL '90 days' THEN '61-90 days'
        ELSE 'OK'
    END AS expiry_status
FROM stock_balance sb
LEFT JOIN materials m ON sb.item_type = 'material' AND sb.item_id = m.id
LEFT JOIN finished_products fp ON sb.item_type = 'finished_product' AND sb.item_id = fp.id
LEFT JOIN warehouses w ON w.id = sb.warehouse_id
LEFT JOIN warehouse_locations wl ON wl.id = sb.location_id
WHERE sb.expiry_date IS NOT NULL
    AND sb.expiry_date <= CURRENT_DATE + INTERVAL '90 days'
    AND sb.total_quantity > 0
ORDER BY sb.expiry_date ASC;
```

---

### View 3: `v_stock_movement_summary`

Báo cáo xuất nhập tồn theo ngày/tháng

```sql
CREATE VIEW v_stock_movement_summary AS
SELECT 
    sl.posting_date,
    sl.item_type,
    sl.item_id,
    CASE 
        WHEN sl.item_type = 'material' THEN m.code
        WHEN sl.item_type = 'finished_product' THEN fp.sku
    END AS item_code,
    CASE 
        WHEN sl.item_type = 'material' THEN m.trading_name
        WHEN sl.item_type = 'finished_product' THEN fp.product_name
    END AS item_name,
    sl.warehouse_id,
    w.name AS warehouse_name,
    sl.unit,
    
    -- Opening balance (tồn đầu kỳ)
    MIN(sl.balance_quantity - sl.quantity) AS opening_quantity,
    MIN(sl.balance_value - sl.stock_value) AS opening_value,
    
    -- Receipts (nhập)
    SUM(CASE WHEN sl.transaction_type IN ('receipt', 'transfer_in') THEN sl.quantity ELSE 0 END) AS receipt_quantity,
    SUM(CASE WHEN sl.transaction_type IN ('receipt', 'transfer_in') THEN sl.stock_value ELSE 0 END) AS receipt_value,
    
    -- Issues (xuất)
    ABS(SUM(CASE WHEN sl.transaction_type IN ('issue', 'transfer_out') THEN sl.quantity ELSE 0 END)) AS issue_quantity,
    ABS(SUM(CASE WHEN sl.transaction_type IN ('issue', 'transfer_out') THEN sl.stock_value ELSE 0 END)) AS issue_value,
    
    -- Adjustments (điều chỉnh)
    SUM(CASE WHEN sl.transaction_type = 'adjustment' THEN sl.quantity ELSE 0 END) AS adjustment_quantity,
    SUM(CASE WHEN sl.transaction_type = 'adjustment' THEN sl.stock_value ELSE 0 END) AS adjustment_value,
    
    -- Closing balance (tồn cuối kỳ)
    MAX(sl.balance_quantity) AS closing_quantity,
    MAX(sl.balance_value) AS closing_value
FROM stock_ledger sl
LEFT JOIN materials m ON sl.item_type = 'material' AND sl.item_id = m.id
LEFT JOIN finished_products fp ON sl.item_type = 'finished_product' AND sl.item_id = fp.id
LEFT JOIN warehouses w ON w.id = sl.warehouse_id
GROUP BY 
    sl.posting_date, 
    sl.item_type, 
    sl.item_id, 
    item_code, 
    item_name, 
    sl.warehouse_id, 
    w.name, 
    sl.unit;
```

---

## VII. TRIGGERS & FUNCTIONS

### Trigger 1: Auto-update `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER tr_materials_updated_at BEFORE UPDATE ON materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER tr_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
-- ... (apply to other tables)
```

---

### Trigger 2: Update `stock_balance` khi post GRN

```sql
CREATE OR REPLACE FUNCTION update_stock_on_grn_post()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_posted = TRUE AND OLD.is_posted = FALSE THEN
        -- Insert vào stock_ledger
        INSERT INTO stock_ledger (
            posting_date, posting_time, item_type, item_id, warehouse_id, location_id,
            transaction_type, voucher_type, voucher_number,
            quantity, unit, batch_number, lot_number, expiry_date, valuation_rate
        )
        SELECT 
            NEW.grn_date,
            CURRENT_TIME,
            'material',
            gi.material_id,
            NEW.warehouse_id,
            gi.location_id,
            'receipt',
            'GRN',
            NEW.grn_number,
            gi.accepted_quantity,
            gi.unit,
            gi.batch_number,
            gi.lot_number,
            gi.expiry_date,
            gi.unit_cost
        FROM goods_receipt_note_items gi
        WHERE gi.grn_id = NEW.id AND gi.accepted_quantity > 0;
        
        -- Update stock_balance
        INSERT INTO stock_balance (
            item_type, item_id, warehouse_id, location_id, 
            batch_number, lot_number, expiry_date, unit,
            available_quantity, valuation_rate
        )
        SELECT 
            'material',
            gi.material_id,
            NEW.warehouse_id,
            gi.location_id,
            gi.batch_number,
            gi.lot_number,
            gi.expiry_date,
            gi.unit,
            gi.accepted_quantity,
            gi.unit_cost
        FROM goods_receipt_note_items gi
        WHERE gi.grn_id = NEW.id AND gi.accepted_quantity > 0
        ON CONFLICT (item_type, item_id, warehouse_id, location_id, batch_number)
        DO UPDATE SET
            available_quantity = stock_balance.available_quantity + EXCLUDED.available_quantity,
            updated_at = CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_stock_on_grn_post
AFTER UPDATE ON goods_receipt_notes
FOR EACH ROW EXECUTE FUNCTION update_stock_on_grn_post();
```

---

### Trigger 3: Update PO status khi nhận đủ hàng

```sql
CREATE OR REPLACE FUNCTION update_po_status_on_receive()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE purchase_orders
    SET status = CASE 
        WHEN (SELECT SUM(received_quantity) FROM purchase_order_items WHERE po_id = OLD.po_id) 
             >= (SELECT SUM(ordered_quantity) FROM purchase_order_items WHERE po_id = OLD.po_id) 
        THEN 'received'
        ELSE 'partial_received'
    END
    WHERE id = OLD.po_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_po_status
AFTER UPDATE ON purchase_order_items
FOR EACH ROW EXECUTE FUNCTION update_po_status_on_receive();
```

---

## VIII. INDEXES SUMMARY

Các indexes quan trọng đã được tạo:

### Primary Keys
- Tất cả bảng đều có PRIMARY KEY auto-increment

### Foreign Keys
- Tất cả FK đều có index tự động

### Business Logic Indexes
- `materials.code` - Tìm kiếm nhanh theo mã NVL
- `stock_balance.(item_type, item_id, warehouse_id)` - Tra tồn kho
- `stock_ledger.posting_date` - Báo cáo theo ngày
- `stock_balance.expiry_date` - Cảnh báo hết hạn
- `delivery_orders.tracking_number` - Tracking vận đơn
- `goods_receipt_notes.po_id` - Link GRN với PO

---

## IX. DATA MIGRATION NOTES

### Từ Excel sang Database

1. **materials** - Import từ file "1.TÊN NGUYÊN LIỆU - BAO BÌ"
   ```sql
   -- Script Python/Go để đọc CSV và insert
   ```

2. **stock_balance** - Import tồn kho đầu kỳ từ file "BẢNG TỔNG KHO NGUYÊN LIỆU"
   ```sql
   -- Chỉ cần import "Tồn cuối kỳ" làm opening balance
   ```

3. **warehouses** - Tạo data cơ bản
   ```sql
   INSERT INTO warehouses (code, name, warehouse_type) VALUES
   ('WH-MAIN', 'Kho Chính - Nhà Trắc', 'main');
   ```

---

## X. PERFORMANCE OPTIMIZATION

### Partitioning (nếu data lớn)

```sql
-- Partition stock_ledger by posting_date (monthly)
CREATE TABLE stock_ledger (
    ...
) PARTITION BY RANGE (posting_date);

CREATE TABLE stock_ledger_2025_01 PARTITION OF stock_ledger
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
    
-- Tạo các partitions cho mỗi tháng
```

### Materialized Views

```sql
-- Refresh mỗi 1 giờ
CREATE MATERIALIZED VIEW mv_stock_summary AS
SELECT ... FROM stock_balance ...;

CREATE UNIQUE INDEX ON mv_stock_summary (item_id, warehouse_id);

-- Cron job refresh
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_stock_summary;
```

---

## XI. BACKUP & RECOVERY

```bash
# Backup daily
pg_dump -h localhost -U postgres -d erp_warehouse > backup_$(date +%Y%m%d).sql

# Backup schema only
pg_dump -h localhost -U postgres -d erp_warehouse -s > schema.sql

# Restore
psql -h localhost -U postgres -d erp_warehouse < backup_20250209.sql
```

---

## XII. NEXT STEPS

1. ✅ Tạo schema SQL
2. ⏳ Thiết kế API endpoints
3. ⏳ Thiết kế UI/UX
4. ⏳ Implement backend (Go)
5. ⏳ Implement frontend (React)
6. ⏳ Testing & UAT
7. ⏳ Migration data & Go-live

---

**Lưu ý:**
- Schema này đã cover đầy đủ workflow nhập xuất tồn mà mày mô tả
- Có thể mở rộng dễ dàng khi thêm module Mua Hàng, Sản Xuất, Bán Hàng sau
- Batch tracking và expiry date được tích hợp sẵn (quan trọng với mỹ phẩm)
- Audit trail đầy đủ cho compliance

Mày cần tao explain thêm phần nào không?
