# BUSINESS LOGIC & WORKFLOWS

## I. WORKFLOW TỔNG QUAN

```
PURCHASE FLOW:
PO (Draft) → PO (Approved) → GRN (Pending QC) → GRN (QC Passed) → GRN (Posted) → Stock Updated

PRODUCTION FLOW:
MR (Draft) → MR (Approved) → MR (Picking) → MIN (Posted) → Stock Decreased

SALES FLOW:
SO → DO (Picking) → DO (Packed) → DO (Shipped) → DO (Delivered) → Stock Decreased
```

---

## II. NGHIỆP VỤ CHI TIẾT

### 1. Tạo Purchase Order (PO)

**Input:**
- Thông tin NCC
- Danh sách nguyên liệu + số lượng + giá

**Process:**
1. Validate:
   - NCC phải active
   - Materials phải tồn tại và active
   - Số lượng > 0
   - Giá >= 0
2. Tính toán:
   - Line total = qty × price × (1 - discount%) × (1 + tax%)
   - Subtotal = Σ(qty × price)
   - Total = subtotal - discount + tax
3. Generate PO number: `PO-{YEAR}-{SEQUENCE}`
4. Set status = 'draft'
5. Save to DB

**Output:**
- PO record với status draft

**Business Rules:**
- 1 PO có thể có nhiều items (1-N)
- PO chỉ có thể edit khi status = draft
- PO phải approved trước khi gửi cho NCC

---

### 2. Approve Purchase Order

**Input:**
- PO ID
- User (có quyền approve)

**Process:**
1. Check PO status = 'draft'
2. Validate user có quyền
3. Update:
   - status = 'approved'
   - approved_by = user_id
   - approved_at = now()
4. Send notification đến NCC (optional)

**Output:**
- PO status updated

**Business Rules:**
- Chỉ Manager hoặc Admin mới approve được
- Không thể unapprove

---

### 3. Nhận Hàng (Create GRN)

**Input:**
- PO ID (optional, nếu nhập từ PO)
- Ngày nhập
- Warehouse
- Danh sách hàng nhận (material, quantity, batch, expiry, location)

**Process:**
1. Validate:
   - PO phải approved (nếu có)
   - Warehouse phải active
   - Materials phải tồn tại
   - Số lượng nhận <= số lượng đặt (nếu từ PO)
   - Expiry date > current date
2. Generate GRN number: `GRN-{YEAR}-{SEQUENCE}`
3. Set status = 'pending_qc' (nếu material requires_qc = true)
4. Save GRN và GRN items
5. Update PO items: received_quantity += nhận thêm
6. Gửi notification cho QC team

**Output:**
- GRN record với status pending_qc

**Business Rules:**
- Nếu material không requires_qc → Auto QC pass
- 1 PO có thể nhận nhiều lần (partial receive)
- Batch number phải unique trong warehouse

---

### 4. QC Approve GRN

**Input:**
- GRN ID
- QC result cho từng item (pass/fail, accepted_qty, rejected_qty)

**Process:**
1. Check GRN status = 'pending_qc'
2. Validate user có role QC
3. For each item:
   - accepted_quantity + rejected_quantity = received_quantity
   - qc_result = pass/fail/partial
4. Update GRN:
   - status = 'qc_passed' (nếu all pass) hoặc 'qc_failed'
   - qc_by = user_id
   - qc_at = now()
   - qc_notes
5. Gửi notification đến warehouse staff

**Output:**
- GRN với QC status updated

**Business Rules:**
- Chỉ QC staff mới approve được
- QC fail → Tạo phiếu trả hàng cho NCC
- QC partial → 1 phần nhập kho, 1 phần trả

---

### 5. Post GRN (Nhập Kho Chính Thức)

**Input:**
- GRN ID

**Process:**
1. Check GRN status = 'qc_passed'
2. For each GRN item (accepted_quantity > 0):
   a. Insert vào `stock_ledger`:
      - transaction_type = 'receipt'
      - voucher_type = 'GRN'
      - quantity = accepted_quantity (dương)
      - valuation_rate = unit_cost
   b. Update `stock_balance`:
      - available_quantity += accepted_quantity
      - Nếu record không tồn tại → Insert mới
      - Nếu tồn tại → Cộng thêm
   c. Tính lại balance_quantity và balance_value trong stock_ledger
3. Update GRN:
   - is_posted = true
   - posted_by = user_id
   - posted_at = now()
4. Update PO status:
   - Nếu tất cả items đã received đủ → status = 'received'
   - Nếu còn pending → status = 'partial_received'

**Output:**
- Stock_ledger records created
- Stock_balance updated
- GRN posted

**Business Rules:**
- Sau khi post, không thể edit GRN
- Stock_ledger là append-only (không xóa/sửa)
- Batch tracking bắt buộc với mỹ phẩm

---

### 6. Tạo Material Request (MR)

**Input:**
- Phòng ban yêu cầu
- Mục đích (sản xuất, R&D, etc.)
- Warehouse
- Danh sách materials + số lượng

**Process:**
1. Validate:
   - User thuộc phòng ban được phép request
   - Materials tồn tại
   - Số lượng > 0
2. Generate MR number: `MR-{YEAR}-{SEQUENCE}`
3. Set status = 'draft'
4. Check stock availability:
   - Nếu không đủ → Cảnh báo
5. Save MR và MR items

**Output:**
- MR record với status draft

**Business Rules:**
- 1 MR phục vụ 1 production order hoặc 1 mục đích cụ thể
- Không thể request quá số lượng tồn kho available

---

### 7. Approve MR & Start Picking

**Input:**
- MR ID

**Process:**
1. Check MR status = 'draft' hoặc 'submitted'
2. Validate user có quyền approve
3. Check stock có đủ không:
   - For each item: available_quantity >= requested_quantity
   - Nếu không đủ → Reject hoặc partial approve
4. Update MR:
   - status = 'approved'
   - approved_by = user_id
   - approved_at = now()
5. Auto-reserve stock:
   - Insert vào `stock_reservations`
   - Update `stock_balance`: 
     - available_quantity -= requested
     - reserved_quantity += requested
6. Generate picking list:
   - Suggest locations dựa trên FIFO/FEFO
   - Batch có expiry_date sớm nhất
   - Location gần nhất
7. Update status = 'picking'

**Output:**
- MR approved
- Stock reserved
- Picking list ready

**Business Rules:**
- Stock reservation timeout: 24 giờ (nếu không pick)
- Picking list ưu tiên FEFO cho mỹ phẩm

---

### 8. Xuất Kho (Create MIN)

**Input:**
- MR ID
- Danh sách materials đã pick (material, quantity, batch, location)
- Người nhận

**Process:**
1. Check MR status = 'picking' hoặc 'picked'
2. Validate:
   - Số lượng xuất <= số lượng request
   - Batch tồn tại và đủ số lượng
3. Generate MIN number: `MIN-{YEAR}-{SEQUENCE}`
4. Save MIN và MIN items
5. Set status = draft (chờ post)

**Output:**
- MIN record

---

### 9. Post MIN (Xuất Kho Chính Thức)

**Input:**
- MIN ID

**Process:**
1. For each MIN item:
   a. Insert vào `stock_ledger`:
      - transaction_type = 'issue'
      - quantity = -issue_quantity (âm)
      - valuation_rate = cost từ stock_balance
   b. Update `stock_balance`:
      - available_quantity -= issue_quantity
      - (Nếu đã reserved thì: reserved_quantity -= issue_quantity)
   c. Tính lại balance
2. Update MIN:
   - is_posted = true
   - posted_by, posted_at
3. Update MR:
   - issued_quantity += issue_quantity
   - Nếu đã xuất đủ → status = 'issued', is_fulfilled = true
4. Release stock reservation

**Output:**
- Stock decreased
- MIN posted
- MR fulfilled

**Business Rules:**
- Không cho phép xuất âm kho (trừ khi warehouse config cho phép)
- Cost method: FIFO, LIFO, hoặc Weighted Average
- Sau khi post, không thể edit

---

### 10. Tạo Delivery Order (DO)

**Input:**
- Sales Order number (từ module Sales)
- Thông tin khách hàng
- Warehouse
- Danh sách sản phẩm + số lượng

**Process:**
1. Validate:
   - Finished products tồn tại
   - Stock đủ
2. Generate DO number: `DO-{YEAR}-{SEQUENCE}`
3. Auto-reserve stock
4. Set status = 'draft'

**Output:**
- DO record

**Business Rules:**
- 1 Sales Order có thể tạo nhiều DO (giao nhiều lần)
- Tự động allocate theo FEFO

---

### 11. Picking & Packing DO

**Process tương tự MIN:**
- Picking list
- QC xuất (kiểm tra sản phẩm trước khi đóng gói)
- Đóng gói
- In tem giao hàng

---

### 12. Ship & Deliver

**Process:**
1. Bàn giao cho shipper
2. Update tracking_number
3. Update status = 'shipped'
4. Webhook từ đơn vị vận chuyển update trạng thái
5. Khi giao thành công:
   - status = 'delivered'
   - actual_delivery_date
6. Post DO (giống POST MIN):
   - Xuất kho chính thức
   - Giảm stock

---

### 13. Stock Adjustment (Kiểm Kê)

**Input:**
- Warehouse
- Danh sách items: book_quantity vs physical_quantity

**Process:**
1. Tính variance = physical - book
2. Tạo Stock Adjustment record
3. Phê duyệt
4. Post adjustment:
   - Insert vào stock_ledger với transaction_type = 'adjustment'
   - quantity = variance (có thể + hoặc -)
   - Update stock_balance

**Output:**
- Stock adjusted

**Business Rules:**
- Adjustment phải có lý do rõ ràng
- Cần approval từ Manager
- Ảnh minh chứng (nếu variance lớn)

---

### 14. Stock Transfer (Chuyển Kho)

**Process:**
1. Tạo Stock Transfer record
2. From warehouse xuất kho:
   - Insert stock_ledger với transaction_type = 'transfer_out'
   - Decrease stock_balance
3. To warehouse nhập kho:
   - Insert stock_ledger với transaction_type = 'transfer_in'
   - Increase stock_balance
4. Tracking in_transit status

**Business Rules:**
- Batch number và expiry date giữ nguyên
- Có thể có thất thoát trong quá trình chuyển

---

## III. STOCK VALUATION METHODS

### FIFO (First-In-First-Out)
- Hàng nhập trước xuất trước
- Cost = Giá của batch cũ nhất còn tồn

### LIFO (Last-In-First-Out)
- Hàng nhập sau xuất trước
- Cost = Giá của batch mới nhất

### Weighted Average
- Cost = Tổng giá trị tồn / Tổng số lượng tồn
- Tính lại cost sau mỗi lần nhập

**Recommended cho mỹ phẩm: FIFO hoặc FEFO (First-Expire-First-Out)**

---

## IV. BATCH TRACKING & TRACEABILITY

### Forward Tracing
```
Batch NVL (ACT_B3-BATCH001)
  → Dùng trong Production Order PO-PROD-001
  → Tạo ra Finished Product Batch (FG-BATCH-0150)
  → Xuất trong Delivery Order DO-2025-001234
  → Giao cho Khách Hàng XYZ
```

### Backward Tracing
```
Khách khiếu nại sản phẩm (DO-2025-001234)
  ← Finished Product Batch: FG-BATCH-0150
  ← Production Order: PO-PROD-001
  ← Nguyên liệu sử dụng:
     - ACT_B3-BATCH001 (5.0 KG)
     - EMU_Cetyl-BATCH002 (3.0 KG)
  ← Nhập từ GRN:
     - GRN-2025-000790 (Nhà cung cấp: Nguyễn Bá)
```

**Implementation:**
- Lưu trữ trong bảng `production_material_usage` (module sản xuất)
- Link: MIN → Production Order → Finished Goods → DO

---

## V. ALERTS & NOTIFICATIONS

### 1. Low Stock Alert
**Trigger:** `stock_balance.available_quantity < material.min_stock_level`

**Action:**
- Email đến Procurement team
- Dashboard alert
- Suggest tạo PO tự động

### 2. Expiring Items Alert
**Trigger:** `stock_balance.expiry_date < CURRENT_DATE + 90 days`

**Levels:**
- Critical (< 30 days): Email urgent
- Warning (30-60 days): Dashboard notification
- Info (60-90 days): Soft reminder

**Action:**
- Xuất khuyến mãi
- Xuất hủy
- Chuyển sang kho outlet

### 3. QC Pending Alert
**Trigger:** GRN pending QC > 24 giờ

**Action:**
- Email đến QC team
- Escalate đến QC Manager

### 4. Stock Reservation Timeout
**Trigger:** Stock reserved > 24 giờ mà chưa issue

**Action:**
- Auto-release reservation
- Notify requester

---

## VI. REPORTS

### 1. Báo Cáo Xuất Nhập Tồn (Stock Movement)
**Parameters:**
- From date, To date
- Item
- Warehouse

**Output:**
- Opening balance
- Receipts
- Issues
- Adjustments
- Closing balance

### 2. Báo Cáo Giá Trị Tồn Kho
**Parameters:**
- As of date
- Warehouse
- Category

**Output:**
- Item list với:
  - Quantity
  - Unit cost
  - Total value

### 3. Báo Cáo Tuổi Tồn Kho (Inventory Aging)
**Output:**
- 0-30 days
- 31-60 days
- 61-90 days
- 90+ days (slow-moving)

### 4. Báo Cáo Hiệu Suất Kho
**KPIs:**
- Inventory Turnover Ratio = COGS / Average Inventory
- Stock-out Rate = (Số lần hết hàng / Tổng số requests) × 100%
- Perfect Order Rate = (Đơn giao đúng hạn, đủ hàng / Tổng đơn) × 100%

---

## VII. PERMISSIONS & ROLES

| Role | Permissions |
|------|-------------|
| Admin | Full access |
| Warehouse Manager | View all, Approve PO/MR/Adjustments, Manage users |
| Warehouse Staff | Create/Edit GRN, MIN, DO, View stock |
| QC Staff | QC approve/reject GRN |
| Production Staff | Create MR, View stock |
| Sales Staff | Create DO, View stock |
| Procurement Staff | Create/Edit PO (draft only) |

---

Đây là toàn bộ business logic. Còn phần nào cần làm rõ không?
