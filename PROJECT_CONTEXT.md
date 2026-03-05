# VyVy ERP — Project Context

> **Mục đích**: Đọc file này đầu tiên trong mỗi conversation mới để nắm ngữ cảnh dự án.
> **Cập nhật lần cuối**: 2026-03-05 (rc20 — PO Assignee, ASSIGN audit log, layout PO 2-cột mới)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Go (Gin, GORM) |
| Frontend | React + TypeScript + Vite |
| State | React Query (TanStack) |
| DB | PostgreSQL 15 (Docker: `vyvy_postgres`) |
| Styling | Vanilla CSS + Lucide icons |
| i18n | i18next (EN + VI) |
| Auth | JWT + RBAC |

## Roles hệ thống

| Role | Quyền |
|------|-------|
| `admin` | Toàn quyền, xóa records |
| `warehouse_manager` | Approve MR, MIN, transfers, adjustments |
| `procurement_manager` | Approve PO |
| `warehouse_admin` | Tạo/sửa warehouse |
| User thường | Xem + tạo draft |

## Ports & Docker

| Service | Container | Port |
|---------|-----------|------|
| Frontend | `vyvy_frontend` | 3000 (nginx) |
| Backend API | `vyvy_backend` | 8080 |
| PostgreSQL | `vyvy_postgres` | 5432 |

**DB credentials**: `postgres` / `postgres123` / DB: `erp_warehouse`

**Khởi động**: `docker compose up -d` tại `/opt/VyVy-ERP`

**Rebuild**: `docker compose build backend && docker compose up -d backend`

---

## Database — 25 migrations

### Core Tables
| Table | Mô tả |
|-------|-------|
| `users` | Auth + RBAC (roles: admin, warehouse_manager, procurement_manager, ...) |
| `suppliers` | Nhà cung cấp NVL, bao bì, gia công |
| `warehouses` | Các kho (Tổng, Lab, Mỹ, outsource...) |
| `warehouse_locations` | Vị trí trong kho |
| `materials` | 104 NVL (acids, fragrances, packaging). Có `supplier_id`, `standard_cost`, `last_purchase_price` |
| `finished_products` | 41 thành phẩm |
| `product_formulas` | BOM (bill of materials) cho thành phẩm |

### Purchasing & Production
| Table | Mô tả |
|-------|-------|
| `purchase_orders` / `_items` | Đơn mua hàng. Status: draft → approved. Cần `procurement_manager` approve. `assigned_to` (FK → users) phân công người phụ trách |
| `goods_receipt_notes` / `_items` | Phiếu nhập kho (GRN). Post → stock_balance + |
| `material_requests` / `_items` | KHSX — Kế hoạch sản xuất. Status: draft → approved → issued → closed/cancelled |
| `material_issue_notes` / `_items` | Phiếu xuất NVL (MIN). Post → stock_balance - |
| **`production_tasks`** | **MỚI** — Công việc trong KHSX (category, assigned_to, timeline, progress) |

### Sales & Delivery
| Table | Mô tả |
|-------|-------|
| `sales_channels` | Shopee, Tiktok, FB, Lazada, Chi nhánh |
| `delivery_orders` / `_items` | Đơn giao hàng (DO) |
| `carriers` | ĐVVC: JNT, SAE, VTP, GHTK, GHN, NỘI BỘ |
| `shipping_reconciliations` / `_items` | Đối soát vận đơn |
| `return_orders` / `_items` | Hoàn hàng (RO) |

### Inventory
| Table | Mô tả |
|-------|-------|
| `stock_ledger` | Sổ kho (mọi biến động) |
| `stock_balance` | Tồn kho hiện tại. `AvailableQuantity = Quantity - ReservedQuantity` |
| `stock_reservations` | Giữ hàng khi approve MR |
| `stock_adjustments` / `_items` | Điều chỉnh kho |
| `stock_transfers` / `_items` | Chuyển kho |

### Audit
| Table | Mô tả |
|-------|-------|
| `audit_logs` | Log mọi thay đổi. Columns: `changed_fields JSONB`, `old_values JSONB`, `new_values JSONB`, `ip_address VARCHAR(45)` |

---

## API Endpoints (`/api/v1/`)

### Auth
- `POST /auth/login` → `{access_token, refresh_token}`
- `POST /auth/logout`, `POST /auth/refresh`, `GET /auth/me`

### Master Data
- `/materials` — CRUD
- `/suppliers` — CRUD
- `/warehouses` — CRUD + `/:id/locations`
- `/finished-products` — CRUD + `/:id/formulas` (BOM)

### Purchasing & Production
- `/purchase-orders` — CRUD + `/:id/approve` (procurement_manager) + `/:id/cancel` + `/:id/assign` (phân công người phụ trách)
- `/grns` — CRUD + `/:id/qc` + `/:id/post`
- `/material-requests` — CRUD + `/:id/approve` (warehouse_manager) + `/:id/cancel`
  - **`GET /:id/tasks`** — danh sách production tasks
  - **`POST /:id/tasks`** — tạo task
  - **`PUT /:id/tasks/:taskId`** — cập nhật task (progress, status, assignee...)
  - **`DELETE /:id/tasks/:taskId`** — xóa task
- `/material-issue-notes` — CRUD + `/:id/post` + `/:id/cancel`

### Sales & Delivery
- `/delivery-orders` — CRUD + `/:id/ship` + `/:id/cancel`
- `/sales-channels` — CRUD
- `/carriers` — CRUD
- `/reconciliations` — CRUD + `/:id/items` + `/:id/confirm`
- `/return-orders` — CRUD + `/:id/approve` + `/:id/receive` + `/:id/items/:itemId/inspect` + `/:id/complete` + `/:id/cancel`

### Inventory
- `/inventory/balance` — query tồn kho
- `/inventory/adjustments` — CRUD + `/:id/post` + `/:id/cancel`
- `/inventory/transfers` — CRUD + `/:id/post` + `/:id/cancel`

### Reports & Alerts
- `/dashboard/stats` — KPI cards
- `/reports/stock-movement`, `/inventory-value`, `/low-stock`, `/expiring-soon`
- `/alerts/summary`, `/alerts/low-stock`, `/alerts/expiring-soon`

### Audit
- `GET /audit-logs?table=<table>&record_id=<id>` — lịch sử chỉnh sửa của 1 record

---

## Key Business Flows

### MR Approve (KHSX Duyệt) — **Logic quan trọng**
```
1. Kiểm tra tồn kho từng NVL trong MR
2. Có đủ stock → tạo StockReservation (FIFO)
3. THIẾU STOCK → tự động tạo draft PO nhóm theo supplier
   - PO number: AUTO-YYMMDD-MR{id}[-S{supplierID}]
   - PO status: draft (cần procurement_manager approve)
   - Nếu NVL không có supplier → dùng nhà cung cấp đầu tiên trong DB
4. KHSX chuyển sang approved dù thiếu stock
```

### PO → GRN (Nhập kho)
```
Create PO (draft) → Approve (procurement_manager) → GRN → Post → stock_balance +
```

### MR → MIN (Xuất kho sản xuất)
```
Create MR (draft) → Approve → [auto-create PO nếu thiếu stock] → Create MIN → Post → stock_balance -
```

### DO → Return Order
```
DO (shipped) → Create RO → Approve → Receive → Inspect Items → Complete
```

---

## Frontend Structure

```
frontend/src/
├── components/
│   ├── common/
│   │   ├── AuditLogPanel.tsx      # Hiển thị lịch sử chỉnh sửa (ai sửa, field nào, cũ→mới)
│   │   └── PageSizeSelector.tsx   # Chọn 10/20/50/All items/page
│   ├── layout/AppLayout.tsx       # Sidebar + header
│   ├── materials/MaterialForm.tsx
│   ├── suppliers/SupplierForm.tsx
│   └── production/                # MỚI
│       ├── ProductionTaskPanel.tsx   # CRUD tasks trong KHSX
│       ├── ProductionTimeline.tsx    # Gantt chart CSS thuần (planned vs actual)
│       └── ProductionProgressChart.tsx  # Donut chart tỷ lệ hoàn thành
├── hooks/
│   ├── useAuditLogs.ts             # GET /audit-logs
│   ├── useProductionTasks.ts       # MỚI — CRUD production tasks
│   ├── useMaterialRequests.ts
│   ├── useFinishedProducts.ts
│   └── ...
├── pages/
│   ├── material-requests/
│   │   ├── MRListPage.tsx          # Có pagination + page size
│   │   ├── MRDetailPage.tsx        # Tích hợp ProductionTaskPanel + Timeline + Chart + AuditLog
│   │   ├── MRCreatePage.tsx
│   │   └── MREditPage.tsx
│   └── [16 other modules...]
├── types/
│   └── materialRequest.ts          # ProductionTask, CreateProductionTaskInput interfaces
└── lib/axios.ts                    # Axios instance (baseURL: /api/v1)
```

---

## Backend Structure

```
backend/
├── cmd/server/main.go
├── internal/
│   ├── api/
│   │   ├── handlers/
│   │   │   ├── audit_log.go        # GetHistory endpoint
│   │   │   ├── production_task.go  # MỚI — List/Create/Update/Delete tasks
│   │   │   └── [other handlers]
│   │   ├── middleware/auth.go       # JWT + RBAC. userID stored in context as int64
│   │   └── routes/routes.go        # Wiring tất cả routes
│   ├── models/
│   │   ├── audit_log.go            # JSONMap, StringSlice types cho JSONB
│   │   ├── production_task.go      # MỚI — ProductionTask + SafeProductionTask
│   │   └── ...
│   ├── repository/
│   │   ├── audit_log_repo.go
│   │   ├── production_task_repo.go # MỚI
│   │   └── ...
│   ├── service/
│   │   ├── audit_log_service.go    # Log(tableName, action, recordID, userID, username, old, new)
│   │   ├── production_task_service.go  # MỚI
│   │   ├── material_request_service.go # Approve logic với auto-PO
│   │   └── ...
│   └── utils/                      # SuccessResponse(), ErrorResponse(), pagination helpers
└── migrations/
    ├── 000024_create_audit_logs.up.sql   # audit_logs: changed_fields JSONB, ip_address VARCHAR(45)
    └── 000025_create_production_tasks.up.sql  # MỚI
```

---

## Pagination Convention

Backend trả về:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total_items": 100,
    "total_pages": 10
  }
}
```
Frontend dùng `limit` (không phải `page_size`), `total_items` (không phải `total`).

---

## Audit Log

- **Đã fix**: `changed_fields TEXT[]` → `JSONB`, `ip_address INET` → `VARCHAR(45)`
- Các service đã tích hợp: materials, suppliers, finished_products, material_requests, **purchase_orders** (bao gồm item-level snapshot, APPROVE, CANCEL, **ASSIGN**)
- Frontend component: `AuditLogPanel` hiển thị field label tiếng Việt, giá trị cũ → mới, user đã sửa
- **PO đặc biệt**: 
  - Backend dùng `poHeaderSnapshot` + `poItemSnapshot[]` (có `material_name`) để log trước/sau update
  - Frontend `renderItemDiff()` nhận `materialLookup Map<number, string>` từ PO hiện tại làm fallback khi log cũ không có `material_name`
  - `NOISE_FIELDS = {updated_at, created_at, deleted_at, updated_by, created_by}` bị filter khỏi display
- **ASSIGN action**: `old_values` và `new_values` chứa cả `assigned_to` (ID) + `assigned_to_name` (tên). AuditLogPanel hiển thị "Phụ trách: [tên cũ] → [tên mới]".

---

## Production Tasks (`production_tasks` table)

Categories: `pha_che`, `dong_goi`, `kiem_tra`, `dong_thung`, `in_an`, `van_chuyen`, `other`

Status: `pending` → `in_progress` → `completed` | `cancelled`

Fields: `task_name`, `category`, `assigned_to` (FK users), `planned_start/end`, `actual_start/end`, `progress_percent` (0-100), `sort_order`

---

## Seed Data

- Admin account: `admin` (xem file `create_admin.sql`)
- 38 suppliers, 10 warehouses, 104 materials, 41 finished products
- 15 POs, 13 GRNs, 13 MINs

---

## Git & Deploy

- **Repo**: `github.com:Chinsusu/VyVy-ERP.git` (branch: `main`)
- **Push**: `/push-github` workflow (ssh-add ~/.ssh/id_ed25519 → git push)
- **Build flow**: sửa code → `docker compose build [backend|frontend]` → `docker compose up -d [backend|frontend]`
- **Check logs**: `docker logs vyvy_backend --tail=30`

---

## Common Gotchas & Notes

1. **Không có `yarn dev` hay hot reload** — phải build Docker mỗi khi sửa code
2. **Migration thủ công**: Khi thêm bảng mới, chạy SQL trực tiếp: `docker exec vyvy_postgres psql -U postgres -d erp_warehouse -f /path/to/migration.sql`
3. **GORM userID type**: handlers lấy userID từ context là `int64`, models dùng `uint` hoặc `*uint` — cần cast cẩn thận
4. **IDE lint errors** về `Cannot find module` (react, lucide-react...) là giả — node_modules chỉ tồn tại trong Docker container, build vẫn thành công
5. **Pagination**: frontend dùng `data.pagination.limit` và `data.pagination.total_items` (không phải `page_size`/`total`)
6. **Auto-PO khi approve MR**: nếu NVL không gán supplier, tạm dùng supplier đầu tiên trong DB → cần người dùng tự cập nhật
