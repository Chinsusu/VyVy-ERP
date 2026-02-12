# VyVy ERP — UAT Test Plan

> **Version**: 1.0.0-rc11 | **Date**: 2026-02-12  
> **Scope**: Phase 3 (Sales Channels), Phase 4 (Carriers + Reconciliation), Phase 5 (Return Orders) + Regression

---

## 1. Điều kiện tiên quyết

- [ ] Backend running trên port 8080
- [ ] Frontend running trên port 5173
- [ ] PostgreSQL running (Docker `vyvy_postgres`)
- [ ] Migration 000030 đã apply
- [ ] Seed data đã import (suppliers, warehouses, materials, products, POs, GRNs, MINs)
- [ ] Login thành công với tài khoản admin

---

## 2. Sales Channels (Phase 3)

### 2.1 CRUD
- [ ] **List**: Truy cập `/sales-channels` → hiển thị danh sách 5 kênh (Shopee, Tiktok, Facebook, Lazada, Chi nhánh)
- [ ] **Create**: Tạo kênh mới → form validation → lưu thành công → redirect về list
- [ ] **Detail**: Click vào kênh → hiển thị chi tiết
- [ ] **Edit**: Sửa thông tin kênh → lưu thành công
- [ ] **Delete**: Xóa kênh (admin only) → confirm → xóa thành công

### 2.2 Integration với DO
- [ ] Tạo DO mới → chọn Sales Channel từ dropdown
- [ ] List DO → filter theo Sales Channel
- [ ] Detail DO → hiển thị tên kênh bán

### 2.3 Report
- [ ] `/reports/sales-by-channel` → hiển thị doanh thu theo kênh

---

## 3. Carrier Management (Phase 4)

### 3.1 CRUD
- [ ] **List**: Truy cập `/carriers` → hiển thị 6 carriers (JNT, SAE, VTP, GHTK, GHN, NỘI BỘ)
- [ ] **Create**: Tạo carrier mới → lưu thành công
- [ ] **Detail**: Xem chi tiết carrier
- [ ] **Edit**: Sửa thông tin carrier
- [ ] **Delete**: Xóa carrier (admin only)

### 3.2 Integration với DO
- [ ] Tạo DO → chọn Carrier từ dropdown
- [ ] List DO → filter theo Carrier
- [ ] Detail DO → hiển thị tên carrier

---

## 4. Shipping Reconciliation (Phase 4)

- [ ] **Create**: Tạo phiếu đối soát → chọn carrier + khoảng thời gian
- [ ] **Add Items**: Thêm DO items vào phiếu đối soát
- [ ] **Detail**: Xem chi tiết → hiển thị items, tổng tiền
- [ ] **Confirm**: Warehouse manager confirm đối soát → status = confirmed
- [ ] **List**: Filter theo carrier, status

---

## 5. Return Orders (Phase 5) ⭐

### 5.1 Tạo đơn hoàn
- [ ] Từ DO Detail (shipped/delivered) → click "Tạo đơn hoàn" → redirect tới form create với DO pre-filled
- [ ] Hoặc truy cập `/return-orders/new` → nhập DO ID → Load DO info
- [ ] Validate: chỉ cho phép DO status = shipped/delivered
- [ ] Chọn items từ DO → nhập SL hoàn (max = SL giao)
- [ ] Chọn loại hoàn: Khách trả / Hư hỏng / Sai hàng / Từ chối nhận
- [ ] Chọn carrier, tracking number, resolution
- [ ] Submit → tạo RO status = pending

### 5.2 Workflow: Approve
- [ ] RO List → click vào RO (pending) → Detail page
- [ ] Click "Duyệt" → status chuyển sang **approved**
- [ ] Chỉ warehouse_manager mới duyệt được

### 5.3 Workflow: Receive
- [ ] RO (approved) → click "Nhận hàng" → status = **receiving**

### 5.4 Workflow: Inspect Items
- [ ] RO (receiving/inspecting) → click icon kiểm tra từng item
- [ ] Modal hiện lên: chọn tình trạng (Tốt/Hư hỏng/Lỗi)
- [ ] Nhập SL nhập kho + SL thanh lý (tổng ≤ SL hoàn)
- [ ] Chọn kho nhập
- [ ] Lưu → status chuyển sang **inspecting**

### 5.5 Workflow: Complete
- [ ] Sau khi inspect hết items → click "Hoàn tất"
- [ ] Validate: tất cả items phải đã inspect
- [ ] Status = **completed**, cập nhật total_restocked/total_scrapped

### 5.6 Workflow: Cancel
- [ ] RO (pending/approved/receiving/inspecting) → click "Hủy"
- [ ] Confirm dialog → status = **cancelled**

### 5.7 List & Filter
- [ ] `/return-orders` → hiển thị danh sách RO
- [ ] Filter theo status (6 options)
- [ ] Filter theo loại hoàn (4 options)
- [ ] Pagination hoạt động đúng

---

## 6. Regression Tests

### 6.1 Dashboard
- [ ] `/` → hiển thị KPI cards (tổng NVL, thành phẩm, đơn hàng...)

### 6.2 Master Data
- [ ] Materials: CRUD + search
- [ ] Finished Products: CRUD + search
- [ ] Suppliers: CRUD
- [ ] Warehouses: CRUD + locations

### 6.3 Purchasing
- [ ] PO: Create → Submit → Approve workflow
- [ ] GRN: Create từ PO → Post (tăng stock)

### 6.4 Production
- [ ] MR: Create → Submit → Approve workflow
- [ ] MIN: Create → Post (giảm stock)

### 6.5 Delivery Orders
- [ ] DO: Create → Ship → Deliver workflow
- [ ] DO hiển thị Sales Channel + Carrier

### 6.6 Inventory
- [ ] Stock adjustments: Create → Post
- [ ] Stock transfers: Create → Ship → Receive
- [ ] Stock balance: query đúng

### 6.7 Reports
- [ ] Stock Movement report
- [ ] Inventory Value report
- [ ] Low Stock alerts
- [ ] Expiring Soon alerts

### 6.8 i18n
- [ ] Chuyển ngôn ngữ EN ↔ VI → tất cả labels thay đổi
- [ ] Sidebar: tất cả menu items hiển thị đúng ngôn ngữ

---

## 7. Kết quả

| # | Module | Kết quả | Ghi chú |
|---|--------|---------|---------|
| 1 | Sales Channels | ⬜ | |
| 2 | Carriers | ⬜ | |
| 3 | Reconciliation | ⬜ | |
| 4 | Return Orders | ⬜ | |
| 5 | Dashboard | ⬜ | |
| 6 | Master Data | ⬜ | |
| 7 | Purchasing | ⬜ | |
| 8 | Production | ⬜ | |
| 9 | Delivery Orders | ⬜ | |
| 10 | Inventory | ⬜ | |
| 11 | Reports | ⬜ | |
| 12 | i18n | ⬜ | |

**Legend**: ✅ Pass | ⚠️ Partial | ❌ Fail | ⬜ Not tested
