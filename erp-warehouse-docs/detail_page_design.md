# Tài Liệu Thiết Kế UI/UX — Detail Page Pattern

> **Chuẩn tham chiếu:** `MaterialDetailPage.tsx`
> Áp dụng đồng nhất cho: Nhà Cung Cấp, Kho Hàng, Thành Phẩm, Đơn Mua Hàng, Lệnh Nhập Kho, Kế Hoạch Sản Xuất.

---

## I. Cấu Trúc Layout Tổng Quan

```
1. Back Button  (text-sm, text-gray-500 hover:text-gray-900, mb-4)
2. Header       (flex items-start justify-between, mb-4)
3. Info Bar     (card mb-6 py-3 — flex divide-x, các key metrics ngang)
4. Grid 2/3 + 1/3     (grid grid-cols-1 lg:grid-cols-3 gap-6)
   ├── Cột trái (lg:col-span-2 space-y-6)
   │   ├── Section Card 1 (nội dung chính)
   │   ├── Section Card 2 (nội dung phụ)
   │   └── AuditLogPanel
   └── Sidebar (space-y-6)
       ├── Sidebar Card 1
       └── Sidebar Card 2
5. Delete Modal (fixed inset-0 overlay)
```

---

## II. Chi Tiết Từng Phần

### 1. Back Button

```tsx
<button
    onClick={() => navigate('/list-route')}
    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 text-sm"
>
    <ArrowLeft className="w-4 h-4" />
    Tên Module
</button>
```

- Là `<button onClick={navigate}>` hoặc `<Link>` tùy context
- Text = tên module list page (ví dụ: "Nguyên Vật Liệu", "Nhà Cung Cấp")
- **Không** dùng "Quay lại danh sách"

---

### 2. Header

```tsx
{/* Header */}
<div className="flex items-start justify-between mb-4">
    {/* LEFT: icon + title + badges */}
    <div className="flex items-center gap-4">
        {/* Icon container */}
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
            <IconName className="w-6 h-6 text-primary" />
        </div>
        {/* Text */}
        <div>
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{record.code_or_name}</h1>
                {/* Type badge (nếu có) */}
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    Loại
                </span>
                {/* Status badge */}
                {record.is_active
                    ? <span className="badge badge-success">Đang HĐ</span>
                    : <span className="badge badge-secondary">Ngừng HĐ</span>}
            </div>
            {/* Subtitle line 1 */}
            <p className="text-gray-600 mt-0.5">{record.display_name}</p>
            {/* Subtitle line 2 (optional, italic) */}
            {record.secondary_name && (
                <p className="text-gray-400 text-xs italic mt-0.5">{record.secondary_name}</p>
            )}
        </div>
    </div>

    {/* RIGHT: action buttons */}
    <div className="flex items-center gap-2">
        <Link to={`/route/${record.id}/edit`} className="btn btn-secondary flex items-center gap-2">
            <Edit className="w-4 h-4" /> Điều chỉnh
        </Link>
        <button onClick={() => setShowDelete(true)} className="btn btn-danger flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Xóa
        </button>
    </div>
</div>
```

**Quy tắc header:**
| Phần | Class | Ghi chú |
|------|-------|---------|
| Icon container | `w-12 h-12 rounded-xl bg-primary/10` | icon `w-6 h-6 text-primary` |
| Title | `text-2xl font-bold text-gray-900` | code hoặc tên chính |
| Type badge | `inline-flex px-2.5 py-1 rounded-full text-xs` | màu theo loại |
| Status badge | `badge badge-success` / `badge-secondary` | chuẩn badge component |
| Subtitle | `text-gray-600 mt-0.5` | tên phụ |
| Edit button | `btn btn-secondary` | luôn có |
| Delete button | `btn btn-danger` | luôn có |

---

### 3. Info Bar (Key Metrics Ngang)

Dành cho 3–6 thông tin quan trọng nhất, hiển thị **ngang** trong 1 card, chia cột bằng `divide-x`.

```tsx
{/* Info Bar */}
<div className="card mb-6 py-3">
    <div className="flex divide-x divide-gray-200">
        <div className="flex-1 px-4 first:pl-0">
            <p className="text-xs text-gray-500">Label</p>
            <p className="font-medium text-sm text-gray-900 mt-0.5">Value</p>
        </div>
        <div className="flex-1 px-4">
            <p className="text-xs text-gray-500">Label</p>
            <p className="font-medium text-sm text-gray-900 mt-0.5">Value</p>
        </div>
        {/* ... */}
        <div className="flex-1 px-4 last:pr-0">
            <p className="text-xs text-gray-500">Label</p>
            <p className="font-medium text-sm text-gray-900 mt-0.5">Value</p>
        </div>
    </div>
</div>
```

**Quy tắc Info Bar:**
- Chọn 4–6 metrics quan trọng nhất để hiển thị ngang
- Không dùng cho info nhiều dòng (dành cho Section Cards)
- `first:pl-0` và `last:pr-0` để căn chỉnh lề

---

### 4. Section Cards (Cột trái, lg:col-span-2)

```tsx
<div className="card">
    <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
        <IconName className="w-4 h-4 text-primary" />
        Tiêu đề Section
        {/* Count badge (optional) */}
        <span className="text-sm text-gray-400 font-normal">({count})</span>
    </h3>
    {/* Content */}
</div>
```

**Nội dung bên trong Section Card:**

*Dạng danh sách item (ví dụ: danh sach NCC):*
```tsx
<div className="space-y-2">
    {items.map(item => (
        <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
            {/* ... */}
        </div>
    ))}
</div>
```

*Dạng grid 2 cột (ví dụ: tồn kho min/max):*
```tsx
<div className="grid grid-cols-2 gap-4">
    <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500">Label</p>
        <p className="font-semibold text-gray-900 mt-1">Value</p>
    </div>
</div>
```

*Dạng inline row (dùng cho sidebar):*
```tsx
<div className="flex items-center justify-between py-2 border-b border-gray-100">
    <span className="text-sm text-gray-600">Label</span>
    <span className="badge badge-success">Value</span>
</div>
```

---

### 5. Audit Log

```tsx
{/* Đặt ở CUỐI cột trái, trong lg:col-span-2 */}
<AuditLogPanel tableName="table_name" recordId={record.id} />
```

- **Luôn đặt trong cột trái** (`lg:col-span-2`), không full-width bên ngoài grid.
- Không đặt bên ngoài grid hay trong sidebar.

---

### 6. Sidebar Cards (Cột phải, 1/3)

```tsx
<div className="space-y-6">
    <div className="card">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <IconName className="w-4 h-4 text-primary" />
            Tiêu đề
        </h3>
        <div className="space-y-3 text-sm">
            {/* Dùng inline row hoặc label+value stack */}
        </div>
    </div>
</div>
```

**Sidebar thường chứa:**
- Thông tin phân loại (Loại, Nhóm, Category)
- Thông tin tài chính (Thanh toán, Hạn mức)
- Thông tin chất lượng/an toàn
- Ghi chú

---

### 7. Delete Confirmation Modal

```tsx
{showDelete && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Xác Nhận Xóa</h3>
            <p className="text-gray-600 mb-6">
                Bạn có chắc muốn xóa <strong>{record.code_or_name}</strong>?
                Thao tác này không thể hoàn tác.
            </p>
            <div className="flex items-center justify-end gap-3">
                <button onClick={() => setShowDelete(false)} className="btn btn-secondary"
                    disabled={deleteAction.isPending}>Hủy</button>
                <button onClick={handleDelete} className="btn btn-danger"
                    disabled={deleteAction.isPending}>
                    {deleteAction.isPending ? 'Đang xóa...' : 'Xóa'}
                </button>
            </div>
        </div>
    </div>
)}
```

---

## III. Áp Dụng Cho Từng Page

| Page | Icon Header | h1 hiển thị | Subtitle | Info Bar (4-6 metrics) | Cột trái chính |
|------|------------|-------------|----------|----------------------|----------------|
| **NVL** *(chuẩn)* | `Package` | `code` | `trading_name` | Đặc tính / Đặc tính phụ / ĐVT / Giá vốn / Giá GN | NCC list + Tồn kho |
| **Nhà Cung Cấp** | `Users` | `name` | `code` + MST | Người LH / ĐT / Email / Địa chỉ / Nhóm | NVL cung cấp + Tài liệu |
| **Kho Hàng** | `Warehouse` | `name` | `code` + loại kho | Loại / Địa điểm / Tổng vị trí / Sức chứa | Danh sách vị trí |
| **Thành Phẩm** | `Package` | `code` | `name` + SKU | ĐVT / Giá bán / Giá vốn / BOM | BOM list + Tồn kho |
| **Đơn Mua Hàng** | `ShoppingCart` | `po_number` | Nhà cung cấp + ngày | Tổng tiền / Trạng thái / Ngày đặt / Ngày giao | Items PO table |
| **Lệnh Nhập Kho** | `PackageCheck` | `grn_number` | PO ref + ngày | Tổng items / Trạng thái / Kho nhận | Items GRN table |
| **KHSX** | `Factory` | `plan_number` | Phòng ban + kho | Trạng thái / Ngày bắt đầu / Tiến độ | Materials list |

---

## IV. Checklist Cho Mỗi Detail Page Mới

- [ ] Back button: `text-gray-500 hover:text-gray-900 mb-4 text-sm`
- [ ] Header: icon `w-12 h-12 rounded-xl` + title `text-2xl font-bold` + badges
- [ ] Info Bar: `card mb-6 py-3` + `flex divide-x divide-gray-200`
- [ ] Grid: `grid grid-cols-1 lg:grid-cols-3 gap-6`
- [ ] Section card h3: `text-base font-semibold` + icon `w-4 h-4 text-primary`
- [ ] AuditLogPanel trong cột trái (lg:col-span-2), không ngoài grid
- [ ] Delete modal: `bg-black bg-opacity-50` overlay + `rounded-lg p-6 max-w-md`
- [ ] Loading: spinner inline (`animate-spin h-5 w-5 border-b-2 border-primary`)
- [ ] Error: `bg-red-50 border border-red-200 rounded-lg p-4 text-red-700`
