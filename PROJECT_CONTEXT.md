# VyVy ERP — Project Context

> **Mục đích**: Tài liệu tóm tắt toàn bộ dự án. Đọc file này đầu tiên trong conversation mới để nắm ngữ cảnh.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Go (Gin, GORM) |
| Frontend | React + TypeScript + Vite |
| State | React Query (TanStack) |
| DB | PostgreSQL 15 (Docker: `vyvy_postgres`) |
| Styling | Vanilla CSS + Lucide icons |
| i18n | i18next (EN + VI) |
| Auth | JWT + RBAC (admin, warehouse_manager, user) |

## Ports

| Service | Port |
|---------|------|
| Frontend dev | 5173 |
| Frontend prod | 3000 |
| Backend API | 8080 |
| PostgreSQL | 5432 |

## Database: `erp_warehouse` (30 migrations)

### Core Tables
| Table | Purpose |
|-------|---------|
| `users` | Auth + RBAC |
| `suppliers` | NCC (nguyên liệu, bao bì, gia công) |
| `warehouses` | 10 kho (Tổng, Lab, Mỹ, 5 outsource...) |
| `warehouse_locations` | Vị trí trong kho |
| `materials` | 104 NVL (acids, fragrances, packaging) |
| `finished_products` | 41 thành phẩm |

### Purchasing & Production
| Table | Purpose |
|-------|---------|
| `purchase_orders` / `_items` | Đơn mua hàng |
| `goods_receipt_notes` / `_items` | Phiếu nhập kho (GRN) |
| `material_requests` / `_items` | Yêu cầu vật tư (MR) |
| `material_issue_notes` / `_items` | Phiếu xuất kho (MIN) |

### Sales & Delivery
| Table | Purpose |
|-------|---------|
| `sales_channels` | Kênh bán: Shopee, Tiktok, FB, Lazada, Chi nhánh |
| `delivery_orders` / `_items` | Đơn giao hàng (DO) |
| `carriers` | ĐVVC: JNT, SAE, VTP, GHTK, GHN, NỘI BỘ |
| `shipping_reconciliations` / `_items` | Đối soát vận đơn |
| `return_orders` / `_items` | Hoàn hàng (RO) |

### Inventory
| Table | Purpose |
|-------|---------|
| `stock_ledger` | Sổ kho (mọi biến động) |
| `stock_balance` | Tồn kho hiện tại |
| `stock_reservations` | Giữ hàng |
| `stock_adjustments` / `_items` | Điều chỉnh kho |
| `stock_transfers` / `_items` | Chuyển kho |

## API Endpoints (`/api/v1/`)

### Auth
- `POST /auth/login`, `POST /auth/register`, `GET /auth/me`

### Master Data
- `/materials` — CRUD + `/search`
- `/suppliers` — CRUD
- `/warehouses` — CRUD + `/:id/locations` (CRUD)
- `/finished-products` — CRUD + `/search`

### Purchasing
- `/purchase-orders` — CRUD + `/:id/items` + `/:id/submit` + `/:id/approve`
- `/grns` — CRUD + `/:id/items` + `/:id/post`

### Production
- `/material-requests` — CRUD + `/:id/submit` + `/:id/approve` + `/:id/reject`
- `/material-issue-notes` — CRUD + `/:id/post`

### Sales & Delivery
- `/delivery-orders` — CRUD + `/:id/ship` + `/:id/deliver` + `/:id/cancel`
- `/sales-channels` — CRUD
- `/carriers` — CRUD
- `/reconciliations` — CRUD + `/:id/items` + `/:id/confirm`
- `/return-orders` — CRUD + `/:id/approve` + `/:id/receive` + `/:id/items/:itemId/inspect` + `/:id/complete` + `/:id/cancel`

### Inventory
- `/inventory/adjustments` — CRUD + `/:id/post`
- `/inventory/transfers` — CRUD + `/:id/ship` + `/:id/receive`
- `/stock/balance` — query balances

### Reports & Alerts
- `/dashboard/summary` — KPI cards
- `/reports/stock-movement` + `/inventory-value` + `/sales-by-channel`
- `/alerts/low-stock` + `/expiring-soon`

## Frontend Pages (17 modules, 55+ pages)

| Module | Pages | Path |
|--------|-------|------|
| Dashboard | 1 | `/` |
| Materials | 4 | `/materials/*` |
| Finished Products | 4 | `/finished-products/*` |
| Suppliers | 4 | `/suppliers/*` |
| Warehouses | 4 | `/warehouses/*` |
| Purchase Orders | 4 | `/purchase-orders/*` |
| GRN | 3 | `/grns/*` |
| Material Requests | 4 | `/material-requests/*` |
| Issue Notes (MIN) | 3 | `/material-issue-notes/*` |
| Delivery Orders | 4 | `/delivery-orders/*` |
| Sales Channels | 4 | `/sales-channels/*` |
| Carriers | 4 | `/carriers/*` |
| Reconciliations | 3 | `/reconciliations/*` |
| Return Orders | 3 | `/return-orders/*` |
| Adjustments | 3 | `/inventory/adjustments/*` |
| Transfers | 3 | `/inventory/transfers/*` |
| Reports | 4 | `/reports/*` |

## Code Architecture

```
backend/
├── cmd/server/main.go          # Entrypoint
├── config/config.go            # ENV-based config
├── internal/
│   ├── api/
│   │   ├── handlers/           # HTTP handlers (1 per module)
│   │   ├── middleware/          # Auth, RBAC, CORS
│   │   └── routes/routes.go    # All route wiring
│   ├── dto/                    # Request/response DTOs
│   ├── models/                 # GORM models + SafeDTOs
│   ├── repository/             # Data access (interface + impl)
│   ├── service/                # Business logic
│   └── utils/                  # Response helpers, pagination
├── migrations/                 # 000001-000030 SQL migrations
└── seeds/                      # seed_data.sql, seed_transactions.sql

frontend/
├── src/
│   ├── api/                    # Axios API clients
│   ├── components/layout/      # AppLayout (sidebar + header)
│   ├── hooks/                  # React Query hooks
│   ├── lib/                    # axios instance, i18n config
│   ├── locales/{en,vi}/        # i18n JSON files
│   ├── pages/                  # 17 module folders
│   ├── stores/                 # Zustand (authStore)
│   └── types/                  # TypeScript interfaces
```

## Key Workflows

### DO → Return Order
```
DO(shipped/delivered) → Create RO → Approve → Receive → Inspect Items → Complete
```

### PO → GRN (Stock In)
```
Create PO → Submit → Approve → Create GRN → Post (stock balance +)
```

### MR → MIN (Stock Out)
```
Create MR → Submit → Approve → Create MIN → Post (stock balance -)
```

## Latest Version: `1.0.0-rc11` (2026-02-12)

## Seed Data Accounts
- Default admin: see `seeds/` for credentials
- Test data: 38 suppliers, 10 warehouses, 104 materials, 41 products, 15 POs, 13 GRNs, 13 MINs
