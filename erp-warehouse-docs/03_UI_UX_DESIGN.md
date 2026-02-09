# UI/UX DESIGN DOCUMENT - ERP WAREHOUSE MODULE

## I. DESIGN SYSTEM

### 1. Color Palette (Based on Vuexy Template)

```css
/* Primary Colors */
--primary: #7367F0;           /* Purple - Main brand color */
--primary-light: #9E95F5;
--primary-dark: #5E50EE;

/* Secondary Colors */
--secondary: #82868B;         /* Gray */
--success: #28C76F;           /* Green - Success states */
--danger: #EA5455;            /* Red - Errors, alerts */
--warning: #FF9F43;           /* Orange - Warnings */
--info: #00CFE8;              /* Cyan - Info messages */

/* Background Colors */
--bg-primary: #FFFFFF;        /* Main background */
--bg-secondary: #F8F8F8;      /* Secondary background */
--bg-card: #FFFFFF;
--bg-sidebar: #FFFFFF;
--bg-hover: #F3F2F7;          /* Hover states */

/* Text Colors */
--text-primary: #5E5873;      /* Main text */
--text-secondary: #B9B9C3;    /* Secondary text */
--text-disabled: #DFDFE3;
--text-heading: #2C2C3E;      /* Headings */

/* Border Colors */
--border-color: #EBE9F1;
--border-light: #F3F2F7;

/* Status Colors (for stock levels) */
--stock-ok: #28C76F;          /* Tồn kho OK */
--stock-low: #FF9F43;         /* Tồn thấp */
--stock-critical: #EA5455;    /* Hết hàng */
--stock-overstock: #00CFE8;   /* Tồn quá nhiều */

/* Expiry Status Colors */
--expiry-ok: #28C76F;
--expiry-warning: #FF9F43;    /* 30-90 days */
--expiry-critical: #EA5455;   /* < 30 days */
--expiry-expired: #5E5873;    /* Đã hết hạn */
```

---

### 2. Typography

```css
/* Font Family */
--font-family: 'Montserrat', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

/* Font Sizes */
--font-size-xs: 0.75rem;      /* 12px */
--font-size-sm: 0.875rem;     /* 14px */
--font-size-base: 1rem;       /* 16px */
--font-size-lg: 1.125rem;     /* 18px */
--font-size-xl: 1.25rem;      /* 20px */
--font-size-2xl: 1.5rem;      /* 24px */
--font-size-3xl: 1.875rem;    /* 30px */

/* Font Weights */
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* Line Heights */
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

---

### 3. Spacing

```css
/* Spacing Scale (rem) */
--spacing-0: 0;
--spacing-1: 0.25rem;    /* 4px */
--spacing-2: 0.5rem;     /* 8px */
--spacing-3: 0.75rem;    /* 12px */
--spacing-4: 1rem;       /* 16px */
--spacing-5: 1.25rem;    /* 20px */
--spacing-6: 1.5rem;     /* 24px */
--spacing-8: 2rem;       /* 32px */
--spacing-10: 2.5rem;    /* 40px */
--spacing-12: 3rem;      /* 48px */
```

---

### 4. Shadows

```css
--shadow-sm: 0 2px 4px rgba(115, 103, 240, 0.08);
--shadow-md: 0 4px 8px rgba(115, 103, 240, 0.12);
--shadow-lg: 0 8px 16px rgba(115, 103, 240, 0.16);
--shadow-xl: 0 12px 24px rgba(115, 103, 240, 0.2);
```

---

### 5. Border Radius

```css
--radius-sm: 0.25rem;    /* 4px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-full: 9999px;   /* Fully rounded */
```

---

## II. COMPONENT LIBRARY

### 1. Buttons

#### Primary Button
```
Background: var(--primary)
Text: #FFFFFF
Hover: var(--primary-dark)
Focus: Box-shadow with primary color
Disabled: Opacity 0.65
```

#### Secondary Button
```
Background: Transparent
Border: 1px solid var(--primary)
Text: var(--primary)
Hover: Background var(--primary-light), Text #FFFFFF
```

#### Success/Danger/Warning Buttons
```
Tương tự Primary nhưng dùng màu success/danger/warning
```

**Sizes:**
- Small: Height 32px, Padding 8px 16px, Font-size 0.875rem
- Medium: Height 38px, Padding 10px 20px, Font-size 1rem (default)
- Large: Height 48px, Padding 12px 24px, Font-size 1.125rem

---

### 2. Form Controls

#### Text Input
```
Height: 38px
Padding: 10px 14px
Border: 1px solid var(--border-color)
Border-radius: var(--radius-md)
Focus: Border-color var(--primary), Box-shadow
```

#### Select Dropdown
```
Giống Text Input
Icon: Chevron down bên phải
```

#### Textarea
```
Min-height: 100px
Resize: vertical
```

#### Checkbox/Radio
```
Size: 18px × 18px
Border: 2px solid var(--border-color)
Checked: Background var(--primary)
```

#### Switch Toggle
```
Width: 40px, Height: 24px
Background: var(--border-color) (off), var(--primary) (on)
Circle: 18px diameter
```

---

### 3. Tables

#### Standard Data Table
```
Header:
  - Background: var(--bg-secondary)
  - Font-weight: 600
  - Text: var(--text-heading)
  - Border-bottom: 2px solid var(--border-color)

Rows:
  - Background: var(--bg-card)
  - Hover: Background var(--bg-hover)
  - Border-bottom: 1px solid var(--border-light)
  - Padding: 12px 16px

Alternating rows:
  - Optional: Even rows với background hơi khác

Actions column:
  - Align: Right
  - Icons: Edit, Delete, View
  - Icon size: 18px
  - Color: var(--text-secondary)
  - Hover: var(--primary)
```

---

### 4. Cards

#### Basic Card
```
Background: var(--bg-card)
Border: 1px solid var(--border-light)
Border-radius: var(--radius-lg)
Padding: 24px
Box-shadow: var(--shadow-sm)
```

#### Card Header
```
Border-bottom: 1px solid var(--border-light)
Padding-bottom: 16px
Margin-bottom: 16px
```

#### Card with Stats
```
Display: Grid 2-4 columns
Each stat:
  - Label: Text-secondary, Font-size sm
  - Value: Font-size 2xl, Font-weight bold, Color primary
  - Icon: Background với primary color faded
```

---

### 5. Modals/Dialogs

```
Overlay: Background rgba(0,0,0,0.5)
Modal:
  - Width: 500px (small), 800px (medium), 1200px (large)
  - Background: var(--bg-card)
  - Border-radius: var(--radius-lg)
  - Box-shadow: var(--shadow-xl)
  - Padding: 24px

Header:
  - Font-size: 1.25rem
  - Font-weight: 600
  - Border-bottom: 1px solid var(--border-light)
  - Close button: Top-right corner

Body:
  - Padding: 24px 0
  - Max-height: 60vh
  - Overflow-y: auto

Footer:
  - Border-top: 1px solid var(--border-light)
  - Padding-top: 16px
  - Align: Right
  - Buttons: Cancel (secondary), Submit (primary)
```

---

### 6. Badges/Pills

```
Status Badge:
  - Padding: 4px 12px
  - Border-radius: var(--radius-full)
  - Font-size: 0.75rem
  - Font-weight: 600
  
Colors by status:
  - Pending: Background warning-light, Text warning
  - Approved: Background success-light, Text success
  - Rejected: Background danger-light, Text danger
  - Completed: Background primary-light, Text primary
```

---

### 7. Alerts/Notifications

```
Alert Box:
  - Padding: 16px
  - Border-radius: var(--radius-md)
  - Border-left: 4px solid (status color)
  
Types:
  - Success: Background success-light
  - Warning: Background warning-light
  - Danger: Background danger-light
  - Info: Background info-light
```

---

### 8. Pagination

```
Display: Flex, Align center
Buttons:
  - Previous/Next: Icon buttons
  - Page numbers: Outlined buttons
  - Current page: Primary background
  - Disabled: Opacity 0.5, Cursor not-allowed
```

---

## III. LAYOUT STRUCTURE

### 1. Main Layout

```
┌─────────────────────────────────────────────────────┐
│  Header (Navbar)                                    │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│          │                                          │
│ Sidebar  │   Main Content Area                      │
│ (Menu)   │                                          │
│          │                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘

Header: Height 60px, Fixed top
Sidebar: Width 260px, Fixed left (collapsible to 80px)
Content: Padding 24px, Max-width 1440px
```

---

### 2. Header/Navbar

```
Components từ trái sang phải:
1. Logo + App Name (Kho Hàng)
2. Menu Toggle Button (Mobile)
3. [Spacer]
4. Search Bar (Global search)
5. Notifications Icon (Badge với count)
6. User Avatar + Dropdown Menu
   - Profile
   - Settings
   - Logout

Sticky: Yes
Box-shadow: var(--shadow-sm)
```

---

### 3. Sidebar/Menu

```
Sections:
1. Dashboard
   - Icon: Home
   - Link: /dashboard

2. Danh Mục (Master Data)
   - Nguyên liệu (Materials)
   - Thành phẩm (Finished Products)
   - Kho (Warehouses)
   - Nhà cung cấp (Suppliers)

3. Nhập Kho (Inbound)
   - Đơn đặt hàng (Purchase Orders)
   - Phiếu nhập kho (GRN)

4. Xuất Kho (Outbound)
   - Yêu cầu xuất NVL (Material Requests)
   - Phiếu xuất NVL (MIN)
   - Phiếu xuất TP (Delivery Orders)

5. Tồn Kho (Inventory)
   - Tồn kho hiện tại (Stock Balance)
   - Lịch sử giao dịch (Stock Ledger)
   - Chuyển kho (Stock Transfer)
   - Điều chỉnh kho (Stock Adjustment)

6. Báo Cáo (Reports)
   - Xuất nhập tồn
   - Hàng sắp hết hạn
   - Hàng tồn thấp
   - Giá trị tồn kho

Active state:
  - Background: var(--bg-hover)
  - Border-left: 3px solid var(--primary)
  - Text: var(--primary)
```

---

## IV. SCREEN DESIGNS

### Screen 1: Dashboard (Tổng Quan Kho)

**Layout: 12-column Grid**

```
┌────────────────────┬────────────────────┬────────────────────┐
│ Tổng Giá Trị Kho   │ Số Lượng NVL       │ Số Lượng TP        │
│ 2,500,000,000đ     │ 150 items          │ 80 items           │
│ ↑ +12% vs T1       │ ↓ -5 vs T1         │ → 0% vs T1         │
└────────────────────┴────────────────────┴────────────────────┘

┌────────────────────┬────────────────────┬────────────────────┐
│ Chờ Nhập Kho       │ Chờ Xuất Kho       │ Hàng Sắp Hết Hạn   │
│ 5 phiếu            │ 8 phiếu            │ 7 items            │
│ Cần xử lý          │ Cần xử lý          │ < 90 ngày          │
└────────────────────┴────────────────────┴────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ Giao Dịch Gần Đây                             [Xem Tất Cả]│
├────────────────────────────────────────────────────────────┤
│ GRN-2025-000790  │ Nhập kho  │ 09/02/2025 │ 3,936,000đ    │
│ MIN-2025-000888  │ Xuất kho  │ 09/02/2025 │ 410,000đ      │
│ DO-2025-001234   │ Xuất TP   │ 08/02/2025 │ 500,000đ      │
└────────────────────────────────────────────────────────────┘

┌───────────────────┬────────────────────────────────────────┐
│ Hàng Tồn Thấp     │ Chart: Tồn Kho Theo Thời Gian         │
│ (< Min Level)     │ (Line chart)                           │
│                   │                                        │
│ • ACI_Citric      │                                        │
│   2.1 / 5.0 KG    │                                        │
│                   │                                        │
│ • ACT_B3          │                                        │
│   1.5 / 2.0 KG    │                                        │
│                   │                                        │
│ [Xem Tất Cả 12]   │                                        │
└───────────────────┴────────────────────────────────────────┘
```

**Components:**
- 6 Stat Cards (grid 4 columns × 2 rows)
- Recent Transactions Table
- Low Stock Alert List (Card)
- Stock Value Chart (Line/Area chart)

---

### Screen 2: Materials List (Danh Sách Nguyên Liệu)

**Header:**
```
┌────────────────────────────────────────────────────────────┐
│ Nguyên Liệu                                  [+ Thêm Mới]  │
└────────────────────────────────────────────────────────────┘
```

**Filters:**
```
┌────────────────────────────────────────────────────────────┐
│ [Search: Tìm theo mã/tên...]                               │
│                                                            │
│ Loại: [All ▼] Category: [All ▼] NCC: [All ▼] Status: [Active ▼] │
│                                                            │
│ [ ] Chỉ hiện hàng tồn thấp   [ ] Chỉ hiện hàng yêu cầu QC│
└────────────────────────────────────────────────────────────┘
```

**Table:**
```
┌──────────┬────────────────┬─────┬─────────┬─────────┬────────┬──────────┐
│ Mã       │ Tên            │ Loại│ NCC     │ Tồn     │ Trạng  │ Actions  │
├──────────┼────────────────┼─────┼─────────┼─────────┼────────┼──────────┤
│ACI_Citric│CITRIC ACID     │ ACI │Nguyễn Bá│ 2.1 KG  │ [Low]  │[👁️][✏️][🗑️]│
│          │                │     │         │         │🟠      │          │
├──────────┼────────────────┼─────┼─────────┼─────────┼────────┼──────────┤
│ACT_B3    │NIACINAMIDE     │ ACT │Nguyễn Bá│15.5 KG  │ [OK]   │[👁️][✏️][🗑️]│
│          │                │     │         │         │🟢      │          │
└──────────┴────────────────┴─────┴─────────┴─────────┴────────┴──────────┘

Showing 1-20 of 150  [< 1 2 3 ... 8 >]
```

**Features:**
- Inline stock status indicator (color badge)
- Quick actions: View detail, Edit, Delete
- Sortable columns
- Bulk actions: Export CSV, Print

---

### Screen 3: Material Detail (Chi Tiết Nguyên Liệu)

**Layout: Tabs**

```
┌────────────────────────────────────────────────────────────┐
│ ← Back to Materials                                        │
│                                                            │
│ ACI_Citric - CITRIC ACID                      [Edit] [Delete] │
└────────────────────────────────────────────────────────────┘

[Thông Tin] [Tồn Kho] [Lịch Sử Giao Dịch]
────────────────────────────────────────────────────────────

TAB 1: Thông Tin
┌─────────────────────────────────────────┬─────────────────┐
│ Mã Nguyên Liệu: ACI_Citric             │ Ảnh:            │
│ Tên Thương Mại: CITRIC ACID             │ [Upload Image]  │
│ Tên INCI: Citric acid                   │                 │
│ Loại: Raw Material                      │                 │
│ Category: ACI (Acid)                    │                 │
│ Đơn Vị: KG                              │                 │
│                                         │                 │
│ Nhà Cung Cấp: Nguyễn Bá                 │                 │
│ Giá Chuẩn: 85,000đ/KG                   │                 │
│ Giá Mua Gần Nhất: 82,000đ/KG            │                 │
│                                         │                 │
│ Tồn Tối Thiểu: 5.0 KG                   │                 │
│ Tồn Tối Đa: 50.0 KG                     │                 │
│ Điểm Đặt Hàng: 10.0 KG                  │                 │
│ Số Lượng Đặt Hàng: 20.0 KG              │                 │
│                                         │                 │
│ [✓] Yêu Cầu QC                          │                 │
│ Hạn Sử Dụng: 730 ngày (2 năm)           │                 │
│ Điều Kiện Bảo Quản: Khô ráo, thoáng mát │                 │
│ [ ] Hóa Chất Nguy Hiểm                  │                 │
│                                         │                 │
│ Ghi Chú: ...                            │                 │
└─────────────────────────────────────────┴─────────────────┘

TAB 2: Tồn Kho
┌────────────────────────────────────────────────────────────┐
│ Tổng Tồn: 2.1 KG (Available) + 0.5 KG (Reserved) = 2.6 KG │
├────────────────────────────────────────────────────────────┤
│ Kho        │ Vị Trí    │ Batch       │ Hạn Dùng  │ SL      │
├────────────┼───────────┼─────────────┼───────────┼─────────┤
│ Kho Chính  │ A-01-05   │ BATCH-001   │15/01/2027 │ 2.1 KG  │
└────────────┴───────────┴─────────────┴───────────┴─────────┘

TAB 3: Lịch Sử Giao Dịch
┌────────────────────────────────────────────────────────────┐
│ Ngày     │ Loại      │ Phiếu           │ SL      │ Tồn    │
├──────────┼───────────┼─────────────────┼─────────┼────────┤
│09/02/2025│ Nhập      │ GRN-2025-000790 │+48.0 KG │ 48.0   │
│09/02/2025│ Xuất      │ MIN-2025-000888 │ -5.0 KG │ 43.0   │
└──────────┴───────────┴─────────────────┴─────────┴────────┘
```

---

### Screen 4: Create/Edit Material (Form Tạo/Sửa NVL)

**Layout: 2 columns**

```
┌────────────────────────────────────────────────────────────┐
│ ← Back                                                     │
│ Thêm Nguyên Liệu Mới                                       │
└────────────────────────────────────────────────────────────┘

┌─────────────────────────┬──────────────────────────────────┐
│ Thông Tin Cơ Bản        │ Thông Tin Kho                    │
├─────────────────────────┼──────────────────────────────────┤
│ Mã Nguyên Liệu *        │ Tồn Tối Thiểu                    │
│ [____________]          │ [_____] KG                       │
│                         │                                  │
│ Tên Thương Mại *        │ Tồn Tối Đa                       │
│ [____________]          │ [_____] KG                       │
│                         │                                  │
│ Tên INCI                │ Điểm Đặt Hàng                    │
│ [____________]          │ [_____] KG                       │
│                         │                                  │
│ Loại *                  │ Số Lượng Đặt Hàng                │
│ [Raw Material ▼]        │ [_____] KG                       │
│                         │                                  │
│ Category                │ Thông Tin Chất Lượng             │
│ [ACI ▼]                 │ ──────────────────               │
│                         │                                  │
│ Đơn Vị *                │ [✓] Yêu Cầu QC                   │
│ [KG ▼]                  │                                  │
│                         │ Hạn Sử Dụng                      │
│ Nhà Cung Cấp            │ [____] ngày                      │
│ [Select... ▼]           │                                  │
│                         │ Điều Kiện Bảo Quản               │
│ Giá Chuẩn               │ [____________________]           │
│ [_________] VND         │                                  │
│                         │ [ ] Hóa Chất Nguy Hiểm           │
├─────────────────────────┴──────────────────────────────────┤
│ Ghi Chú                                                    │
│ [___________________________________________________]      │
│                                                            │
└────────────────────────────────────────────────────────────┘

                                    [Cancel] [Save Material]
```

**Validation:**
- Required fields: *, hiển thị error message màu đỏ bên dưới field
- Mã nguyên liệu: Unique, format ACI_*, ACT_*, etc.
- Số lượng: Phải > 0

---

### Screen 5: Purchase Order List

Tương tự Materials List, nhưng thêm:
- Filters: Supplier, Status, Date range
- Status badge: Draft (gray), Approved (blue), Sent (cyan), Partial Received (yellow), Received (green), Cancelled (red)

---

### Screen 6: Create Purchase Order

**Workflow: Multi-step Form**

```
Step 1: Thông Tin Cơ Bản
Step 2: Chọn Nguyên Liệu
Step 3: Xác Nhận

[●──○──○]  Progress indicator

STEP 1:
┌────────────────────────────────────────────────────────────┐
│ Thông Tin Đơn Đặt Hàng                                     │
├────────────────────────────────────────────────────────────┤
│ Ngày Đặt Hàng *       [09/02/2025]                         │
│ Nhà Cung Cấp *        [Nguyễn Bá ▼]                        │
│ Ngày Giao Dự Kiến     [20/02/2025]                         │
│ Kho Nhận Hàng *       [Kho Chính ▼]                        │
│ Địa Chỉ Giao Hàng     [__________________________]         │
│ Ghi Chú               [__________________________]         │
└────────────────────────────────────────────────────────────┘

                                    [Cancel] [Next: Chọn NVL →]

STEP 2:
┌────────────────────────────────────────────────────────────┐
│ Chọn Nguyên Liệu                         [+ Thêm Dòng]     │
├────────────────────────────────────────────────────────────┤
│ #│ Nguyên Liệu *  │ SL *  │ ĐVT │ Đơn Giá * │ CK%│ Thuế%│ Thành Tiền│[X]│
├─┼────────────────┼───────┼─────┼───────────┼────┼──────┼───────────┼───┤
│1│[ACI_Citric ▼]  │[50.0] │ KG  │[85,000]   │[5] │[10]  │4,440,250đ │[X]│
│2│[Select... ▼]   │       │     │           │    │      │           │[+]│
└─┴────────────────┴───────┴─────┴───────────┴────┴──────┴───────────┴───┘

Tổng Phụ:       4,250,000đ
Chiết Khấu:      -212,500đ
Thuế VAT 10%:    +425,000đ
─────────────────────────────
Tổng Cộng:      4,462,500đ

                        [← Back] [Cancel] [Next: Xác Nhận →]

STEP 3: Preview & Confirm
[Hiển thị toàn bộ thông tin để review]
                                    [← Back] [Submit Order]
```

---

### Screen 7: GRN (Goods Receipt Note) - Nhập Kho

**Layout: Similar to PO Create**

```
┌────────────────────────────────────────────────────────────┐
│ Tạo Phiếu Nhập Kho                                         │
├────────────────────────────────────────────────────────────┤
│ Ngày Nhập *          [09/02/2025]                          │
│ Loại Nhập *          [Từ Nhà Cung Cấp ▼]                   │
│ Đơn Đặt Hàng         [PO-2025-000123 ▼]                    │
│ Nhà Cung Cấp         Nguyễn Bá (auto-fill from PO)         │
│ Số Phiếu Giao Hàng   [DN-NB-20250209-001]                  │
│ Kho Nhận *           [Kho Chính ▼]                         │
├────────────────────────────────────────────────────────────┤
│ Danh Sách Hàng Nhận                                        │
├─┬──────────┬──────┬──────┬──────┬──────┬──────┬──────┬───┤
│#│ NVL      │ Đặt  │ Nhận │ Batch│ NSX  │ HSD  │ Vị Trí│ Giá│
├─┼──────────┼──────┼──────┼──────┼──────┼──────┼──────┼───┤
│1│ACI_Citric│50.0KG│[50]KG│[___] │[___] │[___] │[▼]   │82k│
└─┴──────────┴──────┴──────┴──────┴──────┴──────┴──────┴───┘

                            [Cancel] [Save Draft] [Submit for QC]
```

**Sau khi submit:**
- Trạng thái: Pending QC
- QC Staff nhận được notification
- QC approve/reject từng item

---

### Screen 8: Stock Balance (Tồn Kho)

**Header:**
```
┌────────────────────────────────────────────────────────────┐
│ Tồn Kho Hiện Tại                          [Export Excel]   │
└────────────────────────────────────────────────────────────┘
```

**Filters:**
```
Loại: [Nguyên Liệu ▼] Kho: [All ▼] 
[Search...]
[ ] Chỉ hiện tồn > 0  [ ] Tồn thấp  [ ] Sắp hết hạn
```

**Table:**
```
┌──────────┬─────────────┬──────┬─────────┬──────────┬─────────┬────────┐
│ Mã       │ Tên         │ Kho  │ Khả Dụng│ Đã Đặt   │ Tổng    │ Giá Trị│
├──────────┼─────────────┼──────┼─────────┼──────────┼─────────┼────────┤
│ACI_Citric│CITRIC ACID  │WH-01 │ 43.0 KG │  5.0 KG  │ 48.0 KG │3.9M đ  │
│          │             │      │🟢       │          │         │        │
├──────────┼─────────────┼──────┼─────────┼──────────┼─────────┼────────┤
│          │ Total:      │      │         │          │         │125.5Mđ │
└──────────┴─────────────┴──────┴─────────┴──────────┴─────────┴────────┘

[Click vào row → Xem chi tiết theo batch, location]
```

---

### Screen 9: Expiring Items Alert

**Card-based Layout:**

```
┌────────────────────────────────────────────────────────────┐
│ Hàng Sắp Hết Hạn                                           │
│                                                            │
│ [Tabs: < 30 ngày | 30-60 ngày | 60-90 ngày | Đã hết hạn]  │
└────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🔴 ACT_Vitamin_E - VITAMIN E ACETATE                        │
│ Batch: BATCH-20240801-015                                   │
│ Hạn: 01/03/2025 (còn 20 ngày)                               │
│ Tồn: 3.5 KG tại A-02-03                                     │
│ Giá trị: 2,450,000đ                                         │
│                                                             │
│ [Tạo Phiếu Xuất Hủy] [Xuất Khuyến Mãi] [Ignore]            │
├─────────────────────────────────────────────────────────────┤
│ 🟠 OIL_Argan - DẦU ARGAN                                    │
│ ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## V. RESPONSIVE DESIGN

### Breakpoints
```
Mobile:   < 768px
Tablet:   768px - 1024px
Desktop:  > 1024px
```

### Mobile Adaptations
- Sidebar: Collapse to hamburger menu
- Tables: Horizontal scroll or card view
- Multi-column grids: Stack to single column
- Forms: Full-width fields
- Action buttons: Bottom fixed bar

---

## VI. ICONS

**Icon Library: Feather Icons hoặc Tabler Icons**

Common Icons:
- Home: 🏠
- Plus: ➕
- Edit: ✏️
- Delete: 🗑️
- View: 👁️
- Search: 🔍
- Filter: 🔽
- Export: 📥
- Print: 🖨️
- Notification: 🔔
- User: 👤
- Settings: ⚙️
- Logout: 🚪
- Check: ✓
- Close: ✕
- Arrow: →
- Calendar: 📅
- Warehouse: 🏭
- Box: 📦
- Truck: 🚚

---

## VII. ANIMATIONS & TRANSITIONS

```css
/* Transitions */
--transition-fast: 150ms ease-in-out;
--transition-base: 200ms ease-in-out;
--transition-slow: 300ms ease-in-out;

/* Hover Effects */
Button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

/* Page Transitions */
.page-enter {
  opacity: 0;
  transform: translateX(20px);
}
.page-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: all var(--transition-base);
}

/* Loading States */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## VIII. ACCESSIBILITY (WCAG 2.1 Level AA)

### Color Contrast
- Text/Background: Minimum 4.5:1
- Large text: Minimum 3:1
- Focus indicators: Visible 3px outline

### Keyboard Navigation
- Tab order: Logical flow
- Skip links: "Skip to main content"
- Focus trap: In modals
- Escape: Close modals

### Screen Readers
- ARIA labels on all interactive elements
- Alt text on images
- Role attributes
- Live regions for notifications

---

## IX. PERFORMANCE OPTIMIZATION

- Lazy loading for tables (virtual scroll if > 100 rows)
- Image optimization (WebP, lazy load)
- Code splitting by route
- Debounce search inputs (300ms)
- Cache API responses
- Minimize re-renders (React.memo, useMemo)

---

## X. ERROR STATES & EMPTY STATES

### Error States
```
┌────────────────────────────────────────┐
│         ⚠️                             │
│   Đã Có Lỗi Xảy Ra                     │
│   Không thể tải dữ liệu                │
│   [Thử Lại]                            │
└────────────────────────────────────────┘
```

### Empty States
```
┌────────────────────────────────────────┐
│         📦                             │
│   Chưa Có Dữ Liệu                      │
│   Hãy thêm nguyên liệu đầu tiên        │
│   [+ Thêm Nguyên Liệu]                 │
└────────────────────────────────────────┘
```

---

Đây là toàn bộ UI/UX design cho module Kho. Mày cần tao làm rõ thêm screen nào không?
