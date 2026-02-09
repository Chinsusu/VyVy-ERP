# PROJECT STRUCTURE & IMPLEMENTATION GUIDE

## I. FOLDER STRUCTURE CHI TIẾT

```
erp-warehouse/
│
├── backend/                                 # Go Backend
│   ├── cmd/
│   │   └── api/
│   │       └── main.go                      # Entry point
│   │
│   ├── internal/
│   │   ├── api/
│   │   │   ├── handlers/
│   │   │   │   ├── materials.go             # Material CRUD handlers
│   │   │   │   ├── purchase_orders.go       # PO handlers
│   │   │   │   ├── grn.go                   # GRN handlers
│   │   │   │   ├── material_requests.go     # MR handlers
│   │   │   │   ├── material_issue_notes.go  # MIN handlers
│   │   │   │   ├── delivery_orders.go       # DO handlers
│   │   │   │   ├── stock.go                 # Stock balance/ledger
│   │   │   │   ├── adjustments.go           # Stock adjustments
│   │   │   │   ├── transfers.go             # Stock transfers
│   │   │   │   ├── suppliers.go             # Suppliers
│   │   │   │   ├── warehouses.go            # Warehouses
│   │   │   │   ├── finished_products.go     # Finished products
│   │   │   │   ├── dashboard.go             # Dashboard stats
│   │   │   │   ├── reports.go               # Reports
│   │   │   │   └── auth.go                  # Login, logout
│   │   │   │
│   │   │   ├── middleware/
│   │   │   │   ├── auth.go                  # JWT authentication
│   │   │   │   ├── cors.go                  # CORS config
│   │   │   │   ├── logger.go                # Request logging
│   │   │   │   ├── error_handler.go         # Error handling
│   │   │   │   └── rate_limiter.go          # Rate limiting
│   │   │   │
│   │   │   └── routes/
│   │   │       └── routes.go                # Route definitions
│   │   │
│   │   ├── models/
│   │   │   ├── material.go
│   │   │   ├── finished_product.go
│   │   │   ├── warehouse.go
│   │   │   ├── warehouse_location.go
│   │   │   ├── supplier.go
│   │   │   ├── purchase_order.go
│   │   │   ├── purchase_order_item.go
│   │   │   ├── grn.go
│   │   │   ├── grn_item.go
│   │   │   ├── material_request.go
│   │   │   ├── material_request_item.go
│   │   │   ├── material_issue_note.go
│   │   │   ├── material_issue_note_item.go
│   │   │   ├── delivery_order.go
│   │   │   ├── delivery_order_item.go
│   │   │   ├── stock_ledger.go
│   │   │   ├── stock_balance.go
│   │   │   ├── stock_reservation.go
│   │   │   ├── stock_adjustment.go
│   │   │   ├── stock_adjustment_item.go
│   │   │   ├── stock_transfer.go
│   │   │   ├── stock_transfer_item.go
│   │   │   ├── user.go
│   │   │   └── audit_log.go
│   │   │
│   │   ├── repository/
│   │   │   ├── material_repo.go
│   │   │   ├── purchase_order_repo.go
│   │   │   ├── grn_repo.go
│   │   │   ├── material_request_repo.go
│   │   │   ├── material_issue_note_repo.go
│   │   │   ├── delivery_order_repo.go
│   │   │   ├── stock_repo.go
│   │   │   ├── supplier_repo.go
│   │   │   ├── warehouse_repo.go
│   │   │   ├── finished_product_repo.go
│   │   │   └── user_repo.go
│   │   │
│   │   ├── service/
│   │   │   ├── material_service.go
│   │   │   ├── purchase_order_service.go    # PO workflow
│   │   │   ├── grn_service.go               # GRN + QC workflow
│   │   │   ├── material_request_service.go  # MR workflow
│   │   │   ├── material_issue_service.go    # MIN workflow
│   │   │   ├── delivery_order_service.go    # DO workflow
│   │   │   ├── stock_service.go             # Stock valuation, balance
│   │   │   ├── adjustment_service.go        # Stock adjustment
│   │   │   ├── transfer_service.go          # Stock transfer
│   │   │   ├── supplier_service.go
│   │   │   ├── warehouse_service.go
│   │   │   ├── auth_service.go              # Login, JWT
│   │   │   ├── report_service.go            # Reports generation
│   │   │   └── notification_service.go      # Email/SMS notifications
│   │   │
│   │   ├── utils/
│   │   │   ├── response.go                  # Standard API response
│   │   │   ├── pagination.go                # Pagination helper
│   │   │   ├── validator.go                 # Custom validators
│   │   │   ├── generator.go                 # Number generation (PO-xxx)
│   │   │   ├── jwt.go                       # JWT helpers
│   │   │   └── errors.go                    # Custom error types
│   │   │
│   │   └── config/
│   │       └── config.go                    # App configuration
│   │
│   ├── migrations/
│   │   ├── 000001_create_users.up.sql
│   │   ├── 000001_create_users.down.sql
│   │   ├── 000002_create_suppliers.up.sql
│   │   ├── 000002_create_suppliers.down.sql
│   │   ├── 000003_create_warehouses.up.sql
│   │   ├── 000003_create_warehouses.down.sql
│   │   ├── 000004_create_warehouse_locations.up.sql
│   │   ├── 000004_create_warehouse_locations.down.sql
│   │   ├── 000005_create_materials.up.sql
│   │   ├── 000005_create_materials.down.sql
│   │   ├── 000006_create_finished_products.up.sql
│   │   ├── 000006_create_finished_products.down.sql
│   │   ├── 000007_create_purchase_orders.up.sql
│   │   ├── 000007_create_purchase_orders.down.sql
│   │   ├── 000008_create_purchase_order_items.up.sql
│   │   ├── 000008_create_purchase_order_items.down.sql
│   │   ├── 000009_create_grn.up.sql
│   │   ├── 000009_create_grn.down.sql
│   │   ├── 000010_create_grn_items.up.sql
│   │   ├── 000010_create_grn_items.down.sql
│   │   ├── 000011_create_material_requests.up.sql
│   │   ├── 000012_create_material_issue_notes.up.sql
│   │   ├── 000013_create_delivery_orders.up.sql
│   │   ├── 000014_create_stock_ledger.up.sql
│   │   ├── 000015_create_stock_balance.up.sql
│   │   ├── 000016_create_stock_reservations.up.sql
│   │   ├── 000017_create_stock_adjustments.up.sql
│   │   ├── 000018_create_stock_transfers.up.sql
│   │   └── 000019_create_audit_logs.up.sql
│   │
│   ├── seeds/
│   │   ├── seed_users.sql
│   │   ├── seed_suppliers.sql
│   │   ├── seed_warehouses.sql
│   │   ├── seed_warehouse_locations.sql
│   │   └── seed_materials.sql
│   │
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── service/
│   │   │   │   ├── material_service_test.go
│   │   │   │   ├── po_service_test.go
│   │   │   │   └── stock_service_test.go
│   │   │   └── repository/
│   │   │
│   │   ├── integration/
│   │   │   └── api/
│   │   │       ├── material_test.go
│   │   │       └── po_test.go
│   │   │
│   │   └── e2e/
│   │       └── workflow_test.go
│   │
│   ├── docs/
│   │   └── swagger.yaml                    # API documentation
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── go.mod
│   ├── go.sum
│   ├── Dockerfile
│   ├── Makefile
│   └── README.md
│
├── frontend/                                # React Frontend
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts                   # Axios instance
│   │   │   ├── materials.ts
│   │   │   ├── purchaseOrders.ts
│   │   │   ├── grn.ts
│   │   │   ├── materialRequests.ts
│   │   │   ├── deliveryOrders.ts
│   │   │   ├── stock.ts
│   │   │   ├── suppliers.ts
│   │   │   ├── warehouses.ts
│   │   │   ├── finishedProducts.ts
│   │   │   ├── reports.ts
│   │   │   └── auth.ts
│   │   │
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── Textarea.tsx
│   │   │   │   ├── Checkbox.tsx
│   │   │   │   ├── Radio.tsx
│   │   │   │   ├── Switch.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   ├── Pagination.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Alert.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── ErrorState.tsx
│   │   │   │   └── ConfirmDialog.tsx
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── MainLayout.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   │
│   │   │   └── features/
│   │   │       ├── auth/
│   │   │       │   ├── LoginForm.tsx
│   │   │       │   └── ProtectedRoute.tsx
│   │   │       │
│   │   │       ├── dashboard/
│   │   │       │   ├── Dashboard.tsx
│   │   │       │   ├── StatsCard.tsx
│   │   │       │   ├── RecentTransactions.tsx
│   │   │       │   └── StockChart.tsx
│   │   │       │
│   │   │       ├── materials/
│   │   │       │   ├── MaterialList.tsx
│   │   │       │   ├── MaterialForm.tsx
│   │   │       │   ├── MaterialDetail.tsx
│   │   │       │   └── MaterialFilters.tsx
│   │   │       │
│   │   │       ├── purchase/
│   │   │       │   ├── POList.tsx
│   │   │       │   ├── CreatePOForm.tsx
│   │   │       │   │   ├── Step1Basic.tsx
│   │   │       │   │   ├── Step2Items.tsx
│   │   │       │   │   └── Step3Confirm.tsx
│   │   │       │   ├── PODetail.tsx
│   │   │       │   └── ApproveModal.tsx
│   │   │       │
│   │   │       ├── grn/
│   │   │       │   ├── GRNList.tsx
│   │   │       │   ├── CreateGRNForm.tsx
│   │   │       │   ├── GRNDetail.tsx
│   │   │       │   ├── QCApproveForm.tsx
│   │   │       │   └── PostGRNModal.tsx
│   │   │       │
│   │   │       ├── material-requests/
│   │   │       │   ├── MRList.tsx
│   │   │       │   ├── CreateMRForm.tsx
│   │   │       │   ├── MRDetail.tsx
│   │   │       │   └── PickingList.tsx
│   │   │       │
│   │   │       ├── material-issue/
│   │   │       │   ├── MINList.tsx
│   │   │       │   ├── CreateMINForm.tsx
│   │   │       │   └── MINDetail.tsx
│   │   │       │
│   │   │       ├── delivery/
│   │   │       │   ├── DOList.tsx
│   │   │       │   ├── CreateDOForm.tsx
│   │   │       │   ├── DODetail.tsx
│   │   │       │   └── PickPackShip.tsx
│   │   │       │
│   │   │       ├── stock/
│   │   │       │   ├── StockBalance.tsx
│   │   │       │   ├── StockLedger.tsx
│   │   │       │   ├── StockAdjustment.tsx
│   │   │       │   ├── StockTransfer.tsx
│   │   │       │   └── ExpiringItems.tsx
│   │   │       │
│   │   │       ├── reports/
│   │   │       │   ├── StockMovementReport.tsx
│   │   │       │   ├── InventoryValueReport.tsx
│   │   │       │   └── LowStockReport.tsx
│   │   │       │
│   │   │       ├── suppliers/
│   │   │       │   ├── SupplierList.tsx
│   │   │       │   └── SupplierForm.tsx
│   │   │       │
│   │   │       ├── warehouses/
│   │   │       │   ├── WarehouseList.tsx
│   │   │       │   ├── WarehouseForm.tsx
│   │   │       │   └── LocationManager.tsx
│   │   │       │
│   │   │       └── finished-products/
│   │   │           ├── ProductList.tsx
│   │   │           └── ProductForm.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useMaterials.ts
│   │   │   ├── usePurchaseOrders.ts
│   │   │   ├── useGRN.ts
│   │   │   ├── useStock.ts
│   │   │   ├── useAuth.ts
│   │   │   ├── usePagination.ts
│   │   │   └── useDebounce.ts
│   │   │
│   │   ├── store/
│   │   │   ├── authStore.ts               # Zustand store
│   │   │   └── uiStore.ts                 # Sidebar collapsed, etc.
│   │   │
│   │   ├── types/
│   │   │   ├── api.ts                     # APIResponse, PaginatedResponse
│   │   │   ├── material.ts
│   │   │   ├── purchaseOrder.ts
│   │   │   ├── grn.ts
│   │   │   ├── stock.ts
│   │   │   └── user.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── format.ts                  # Date, currency formatting
│   │   │   ├── constants.ts               # Status, enums
│   │   │   └── helpers.ts
│   │   │
│   │   ├── styles/
│   │   │   └── globals.css                # Tailwind imports
│   │   │
│   │   ├── App.tsx                        # Main app component
│   │   ├── main.tsx                       # Entry point
│   │   └── routes.tsx                     # Route definitions
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── Dockerfile
│   └── README.md
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## II. TECH STACK VERSIONS

```
Backend:
- Go: 1.21+
- Gin: v1.9.1
- GORM: v1.25.5 (or sqlc)
- PostgreSQL driver: github.com/lib/pq
- JWT: github.com/golang-jwt/jwt/v5
- Viper: github.com/spf13/viper
- Zap: go.uber.org/zap
- golang-migrate: v4.16.2

Frontend:
- React: 18.2.0
- TypeScript: 5.0+
- Vite: 4.5+
- React Router: 6.20+
- TanStack Query: 5.0+
- Zustand: 4.4+
- React Hook Form: 7.48+
- Zod: 3.22+
- Tailwind CSS: 3.4+
- Axios: 1.6+
- date-fns: 2.30+
- Recharts: 2.10+

Database:
- PostgreSQL: 15+

DevOps:
- Docker: 24+
- Docker Compose: 2.23+
```

---

## III. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Sprint 1-2, 2-3 tuần)

**Backend:**
1. Setup project structure
2. Database schema + migrations
3. Models (GORM/sqlc)
4. Repository layer (interface-based)
5. Basic API setup (Gin routes, middleware)
6. JWT authentication

**Frontend:**
1. Setup Vite + React + TypeScript
2. Tailwind config (Vuexy colors)
3. Common components (Button, Input, Table, Modal)
4. Layout (Header, Sidebar, MainLayout)
5. Routing setup
6. API client setup (Axios)

**Deliverable:** 
- Runnable app skeleton
- Login working
- Database setup

---

### Phase 2: Master Data (Sprint 3-4, 2-3 tuần)

**Backend:**
1. Materials CRUD API
2. Finished Products CRUD API
3. Suppliers CRUD API
4. Warehouses + Locations CRUD API

**Frontend:**
1. Materials module (List, Form, Detail)
2. Finished Products module
3. Suppliers module
4. Warehouses module

**Deliverable:**
- Master data management complete
- Can create/view/edit materials, suppliers, warehouses

---

### Phase 3: Purchase Flow (Sprint 5-6, 2-3 tuần)

**Backend:**
1. Purchase Order service (Create, Approve, Cancel)
2. GRN service (Create, QC, Post)
3. Stock ledger + balance update logic
4. Number generation (PO-{YEAR}-{SEQ})

**Frontend:**
1. PO List + Create (multi-step form)
2. PO Detail + Approve
3. GRN List + Create
4. QC Approve screen
5. Post GRN

**Deliverable:**
- Complete purchase flow: PO → GRN → QC → Post → Stock updated

---

### Phase 4: Production/Issue Flow (Sprint 7-8, 2-3 tuần)

**Backend:**
1. Material Request service (Create, Approve, Picking)
2. Material Issue Note service (Create, Post)
3. Stock reservation logic
4. FIFO/FEFO picking suggestion

**Frontend:**
1. MR List + Create
2. MR Approve + Picking list
3. MIN Create + Post
4. Stock reservation display

**Deliverable:**
- Material request → Issue flow working
- Stock reservation functional

---

### Phase 5: Sales/Delivery Flow (Sprint 9-10, 2-3 tuần)

**Backend:**
1. Delivery Order service (Create, Pick, Pack, Ship)
2. Finished product stock management

**Frontend:**
1. DO List + Create
2. DO Detail (Pick/Pack/Ship workflow)
3. Tracking integration (optional)

**Deliverable:**
- Sales order → Delivery order → Stock decrease

---

### Phase 6: Inventory Management (Sprint 11-12, 2-3 tuần)

**Backend:**
1. Stock Balance view API
2. Stock Ledger API
3. Stock Adjustment service
4. Stock Transfer service
5. Alerts (low stock, expiring)

**Frontend:**
1. Stock Balance screen (with batch details)
2. Stock Ledger (transaction history)
3. Stock Adjustment form
4. Stock Transfer form
5. Expiring Items alert page
6. Low Stock alert page

**Deliverable:**
- Complete inventory visibility
- Adjustment & transfer working

---

### Phase 7: Reports & Dashboard (Sprint 13-14, 2-3 tuần)

**Backend:**
1. Stock Movement Report API
2. Inventory Value Report API
3. Dashboard stats API
4. Export to Excel functionality

**Frontend:**
1. Dashboard with stats cards & charts
2. Stock Movement Report
3. Inventory Value Report
4. Low Stock Report
5. Export buttons

**Deliverable:**
- Informative dashboard
- Key reports available

---

### Phase 8: Testing & UAT (Sprint 15, 1-2 tuần)

1. Unit tests (services, repositories)
2. Integration tests (API endpoints)
3. E2E tests (critical workflows)
4. User Acceptance Testing
5. Bug fixes
6. Performance optimization

**Deliverable:**
- Test coverage >80%
- UAT sign-off

---

### Phase 9: Deployment & Go-Live (Sprint 16, 1 tuần)

1. Production environment setup
2. Data migration from Excel
3. User training
4. Go-live pilot (1-2 warehouses)
5. Monitor & support

**Deliverable:**
- System live in production
- Users trained

---

## IV. DEVELOPMENT WORKFLOW

### Git Workflow

```
main (production)
  ├── develop (staging)
      ├── feature/materials-crud
      ├── feature/po-workflow
      ├── feature/grn-qc
      └── bugfix/stock-calculation
```

**Branch naming:**
- `feature/{feature-name}`
- `bugfix/{bug-name}`
- `hotfix/{critical-fix}`

**Commit messages:**
```
feat: Add material CRUD API
fix: Fix stock calculation in GRN post
chore: Update dependencies
docs: Add API documentation
test: Add unit tests for PO service
```

---

### CI/CD Pipeline (GitHub Actions hoặc GitLab CI)

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-go@v4
        with:
          go-version: '1.21'
      - run: cd backend && go test ./...
  
  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm ci && npm test
  
  build-docker:
    needs: [backend-test, frontend-test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: docker-compose build
```

---

## V. ENVIRONMENT VARIABLES

### Backend (.env)
```
# Database
DATABASE_URL=postgres://user:password@localhost:5432/erp_warehouse?sslmode=disable

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY_HOURS=24

# Server
PORT=8080
GIN_MODE=release

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://erp.company.com

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@company.com
SMTP_PASSWORD=your-smtp-password

# File Upload
MAX_UPLOAD_SIZE_MB=10
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_APP_NAME=Warehouse Management System
```

---

## VI. DATABASE BACKUP & RECOVERY

### Daily Backup Script
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="erp_warehouse"

pg_dump -h localhost -U postgres $DB_NAME > $BACKUP_DIR/erp_warehouse_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "erp_warehouse_*.sql" -mtime +7 -delete
```

### Restore
```bash
psql -h localhost -U postgres erp_warehouse < backup_20250209.sql
```

---

## VII. MONITORING & LOGGING

### Application Logging
- Backend: Structured logging với Zap
- Log levels: DEBUG, INFO, WARN, ERROR
- Log rotation (daily, 100MB max)

### Performance Monitoring
- API response time tracking
- Slow query logging (>1s)
- Error rate monitoring

### Alerts
- Email alert khi:
  - API error rate > 5%
  - Database connection pool full
  - Disk space < 10%

---

## VIII. SECURITY CHECKLIST

- [ ] Environment variables không commit vào Git
- [ ] JWT secret mạnh (>32 chars)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitize inputs)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] HTTPS in production
- [ ] Password hashing (bcrypt)
- [ ] Input validation on both frontend & backend
- [ ] Role-based access control (RBAC)
- [ ] Audit logging for critical actions
- [ ] Regular dependency updates

---

## IX. PERFORMANCE OPTIMIZATION

### Database
- [ ] Indexes on foreign keys
- [ ] Composite indexes for common queries
- [ ] Partitioning for stock_ledger (if large)
- [ ] Materialized views for reports
- [ ] Connection pooling

### Backend
- [ ] Caching (Redis for hot data)
- [ ] Pagination for all list APIs
- [ ] Lazy loading for associations
- [ ] Background jobs for heavy tasks (reports)

### Frontend
- [ ] Code splitting by route
- [ ] Image optimization (WebP)
- [ ] Lazy load components
- [ ] Debounce search inputs
- [ ] Virtual scrolling for large tables
- [ ] React.memo for expensive components

---

## X. DEPLOYMENT CHECKLIST

### Pre-deployment
- [ ] All tests passing
- [ ] Code review approved
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] Backup database
- [ ] Rollback plan ready

### Deployment Steps
1. Pull latest code
2. Run migrations
3. Build Docker images
4. Stop old containers
5. Start new containers
6. Health check
7. Monitor logs

### Post-deployment
- [ ] Smoke tests
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Notify users (if breaking changes)

---

Đây là toàn bộ Project Structure! Bây giờ tao sẽ đóng gói tất cả vào ZIP.
