# Changelog

Tất cả thay đổi quan trọng của dự án VyVy ERP Warehouse Management System sẽ được ghi lại trong file này.

Định dạng dựa trên [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
và dự án tuân thủ [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0-rc5] - 2026-02-11
### Added
- **Security Audit & API Hardening**: All API endpoints now require JWT authentication.
- **RBAC Enforcement**: Implemented `RequireRole` middleware for sensitive operations (Delete, Approve, Post, etc.).
- **Security Test Suite**: New `security_test.go` to verify access control and forbidden patterns.

### Changed
- Updated all integration tests to support authenticated requests.

## [1.0.0-rc4] - 2026-02-11

### Added
- **API Integration Testing (Phase 8)**:
    - Backend: Comprehensive integration tests for `Material`, `Supplier`, `Warehouse`, `Purchase Order`, `GRN`, and `Material Request` APIs.
    - Backend: Verified end-to-end procurement workflow (PO -> GRN -> Stock Update).
    - Backend: Verified end-to-end internal requisition workflow (MR -> Reservation -> MIN -> Stock Deduction).
    - Backend: Implementation of `performRequest` and `setupTestApp` utilities for high-fidelity API testing.

### Fixed
- **API Security & Reliability**:
    - Backend: Standardized `user_id` handling across all handlers by enforcing `int64` from JWT claims and safe casting to `uint` where required.
    - Backend: Fixed critical bug in `MaterialIssueNoteService.Post` and `StockBalanceRepository` where `NULL` values in database queries caused failures in stock/reservation lookups.
    - Backend: Corrected JWT configuration for test environment (standardized Expiry and Refresh settings).

## [1.0.0-rc3] - 2026-02-11

### Added
- **Reports & Dashboard (Phase 7)**:
    - Backend: `ReportService` expanded with `GetLowStockReport` and `GetExpiringSoonReport`.
    - Backend: Server-side CSV export logic for all inventory reports.
    - Backend: New API endpoints: `/api/v1/reports/low-stock`, `/api/v1/reports/expiring-soon`.
    - Frontend: New dedicated report pages: `LowStockReportPage` and `ExpiringSoonReportPage`.
    - Frontend: Actionable Dashboard stat cards with direct links to detailed reports (Low Stock, Expiring Soon, Receipts).
    - Frontend: Integrated CSV Export functionality on all report pages.
    - Frontend: Visual stock status indicators and shortage calculations.

### Fixed
- **Deployment & Infrastructure**:
    - Backend: Updated `Dockerfile` to use Go 1.24.
    - Frontend: Updated `Dockerfile` to use Node.js 20.
    - Database: Fixed `stock_balances` table name mismatch in `GetInventoryValueReport` query.
    - Docker Compose: Streamlined configuration for production-like deployment (removed dev volume mounts).

## [1.0.0-rc2] - 2026-02-10

### Added
- **Inventory Management (Phase 6)**:
    - Backend: `StockAdjustment` and `StockTransfer` models with full transactional support.
    - Backend: `StockAdjustmentService` and `StockTransferService` with Draft → Posted workflow.
    - Backend: Automatic stock ledger and balance updates with FIFO tracking.
    - Backend: Standardized `user_id` context handling (int64) across all inventory handlers.
    - Frontend: `AdjustmentListPage`, `AdjustmentDetailPage`, and `AdjustmentCreatePage`.
    - Frontend: `TransferListPage`, `TransferDetailPage`, and `TransferCreatePage`.
    - Frontend: Real-time stock balance lookup during adjustment/transfer creation.
    - Frontend: Fixed critical React-Hook-Form event binding bug in inventory forms.

### Fixed
- **Database Schema**: Surgically added missing `deleted_at` column to `materials` and `finished_products` via `fix_schema` utility.
- **API Security**: Standardized context keys and type casting for `user_id` in inventory management handlers.

## [1.0.0-rc1] - 2026-02-10

### Added
- **Sales & Delivery Flow (Phase 5)**:
    - Backend: `DeliveryOrder` and `DeliveryOrderItem` models.
    - Backend: `DeliveryOrderService` with Picking, Packing, and Shipping logic.
    - Backend: Automated stock reduction and ledger updates for finished products.
    - Backend: Cost tracking and transaction integrity for shipments.
    - Frontend: `DOListPage`, `DODetailPage`, and `DOForm` for Sales Orders and Delivery Orders.
    - Frontend: Integrated finished product picking with real-time stock balance validation.
    - Frontend: Added "Sales & Delivery" navigation to the main Dashboard.

## [0.9.1] - 2026-02-10

### Added
- **Production Flow Refinements (Phase 4)**:
    - Backend: New `StockReservation` system to prevent over-allocation of materials.
    - Backend: Automatic stock holding logic during Material Request approval.
    - Backend: Advanced picking suggestions based on FEFO (Expiry) and FIFO (Age) logic.
    - Backend: Transactional integrity for reservation fulfillment during issuance.
    - Backend: Unit tests for core issuance and reservation logic.

## [0.9.0] - 2026-02-10

### Added
- **Material Issue Notes (MIN) Module (Phase 4)**:
    - Backend: `MaterialIssueNote` and `MaterialIssueNoteItem` models.
    - Backend: `MaterialIssueNoteService` with stock reduction and MR synchronization logic.
    - Backend: `StockService` with `/inventory/balance` endpoint for intelligent picking.
    - Backend: REST endpoints for MIN lifecycle (Draft, Post, Cancel).
    - Frontend: TypeScript types and API client for MIN.
    - Frontend: `MINListPage`, `MINDetailPage`, and `MINCreatePage`.
    - Frontend: `MINForm` with automated stock picking logic from specific batches/locations.
    - Frontend: Comprehensive validation and workflow integration.

## [0.8.0] - 2026-02-10

### Added
- **Material Requests Module (Phase 4)**:
    - Frontend: TypeScript types for `MaterialRequest` and `MaterialRequestItem`.
    - Frontend: API client with full CRUD and workflow (Approve/Cancel) support.
    - Frontend: React Query hooks for state management and cache coordination.
    - Frontend: `MRListPage` with search, status filtering, and pagination.
    - Frontend: `MRDetailPage` with workflow actions (Approve/Cancel) and item breakdown.
    - Frontend: `MRForm` component with validation and dynamic item management.
    - Frontend: Route registration and Dashboard integration.

### Fixed
- **TypeScript Build Errors**:
    - Fixed widespread implicit `any` errors in React Query hooks and components.
    - Corrected `@tanstack/react-query` import typo.
    - Optimized imports using `import type` for type-only files.
- **Tailwind CSS Build Fix**:
    - Resolved critical `undefined:NaN` scanner error in Tailwind 4 by transcribing `index.css` to standard CSS for core components.
    - Standardized primary color usage across the frontend to specific color levels.

---

## [0.6.0] - 2026-02-10

### Added - Finished Products Module (Complete ✅)

#### Backend - Finished Products (Complete ✅)
- **Finished Product Model** (`internal/models/finished_product.go`) — 22 comprehensive fields:
  - Basic: code, name, name_en, category, sub_category, unit, barcode
  - Specifications: net_weight, gross_weight, volume
  - Stock Management: min_stock_level, max_stock_level, reorder_point, shelf_life_days, storage_conditions
  - Pricing: standard_cost, selling_price
  - Status: is_active, notes
  - Audit: created_at, updated_at, created_by, updated_by
- **Finished Product DTOs** (`internal/dto/finished_product_dto.go`) — CreateFinishedProductRequest, UpdateFinishedProductRequest, FinishedProductFilterRequest with comprehensive validation
- **Finished Product Repository** (`internal/repository/finished_product_repo.go`) — CRUD operations + search (code, name, barcode) + filters (category, sub_category, is_active)
- **Finished Product Service** (`internal/service/finished_product_service.go`) — Code uniqueness validation, default values, user tracking
- **Finished Product Handlers** (`internal/api/handlers/finished_product.go`) — 5 endpoints:
  - `GET /api/v1/finished-products` — List products with filters (public)
  - `GET /api/v1/finished-products/:id` — Get product by ID (public)
  - `POST /api/v1/finished-products` — Create product (auth required)
  - `PUT /api/v1/finished-products/:id` — Update product (auth required)
  - `DELETE /api/v1/finished-products/:id` — Delete product (auth required)
- **Routes Integration** (`internal/api/routes/routes.go`) — Added finished products routes under `/api/v1/finished-products`

#### Frontend - Finished Products (Complete ✅)
- **Types** (`src/types/finishedProduct.ts`) — FinishedProduct, CreateFinishedProductInput, UpdateFinishedProductInput, FinishedProductFilters interfaces
- **API Client** (`src/api/finishedProducts.ts`) — 5 methods (getFinishedProducts, getFinishedProductById, createFinishedProduct, updateFinishedProduct, deleteFinishedProduct)
- **React Query Hooks** (`src/hooks/useFinishedProducts.ts`) — useFinishedProducts, useFinishedProduct, useCreateFinishedProduct, useUpdateFinishedProduct, useDeleteFinishedProduct with cache invalidation
- **FinishedProductListPage** (`src/pages/finished-products/FinishedProductListPage.tsx`) — Table with search by code/name/barcode, pagination
- **FinishedProductForm** (`src/components/finished-products/FinishedProductForm.tsx`) — Comprehensive 22-field form organized in 5 sections:
  1. Basic Information (code*, name*, name_en, category, sub_category, unit*, barcode)
  2. Specifications (net_weight, gross_weight, volume)
  3. Stock Management (min/max stock levels, reorder point, shelf life, storage conditions)
  4. Pricing (standard cost, selling price)
  5. Additional Information (notes, active status)
- **FinishedProductCreatePage** (`src/pages/finished-products/FinishedProductCreatePage.tsx`) — Wrapper for form creation
- **FinishedProductEditPage** (`src/pages/finished-products/FinishedProductEditPage.tsx`) — Loads and edits existing product
- **FinishedProductDetailPage** (`src/pages/finished-products/FinishedProductDetailPage.tsx`) — Display product with 5 information sections + delete confirmation
- **Routes Integration** (`src/App.tsx`) — 4 routes: /finished-products, /finished-products/new, /finished-products/:id, /finished-products/:id/edit
- **Dashboard Update** (`src/pages/dashboard/DashboardPage.tsx`) — Added active Finished Products card

**Features:**
- 22 comprehensive product fields covering specifications, pricing, and stock management
- Code uniqueness validation
- Search by code, name, or barcode
- Filter by category, sub-category, and status
- Pagination and sorting
- User audit tracking
- Form validation (code, name, unit required)
- Responsive design with Tailwind CSS

---

## [0.7.0] - 2026-02-10
### Added
- **Purchase Orders Module (Phase 3)**:
    - Backend: `PurchaseOrder` and `PurchaseOrderItem` models with workflow support.
    - Backend: Automatic total amount calculations (subtotal, tax, discount, grand total).
    - Backend: Workflow management (Draft → Approved → Cancelled).
    - Backend: 7 API endpoints for full lifecycle management.
    - Frontend: TypeScript types and API client.
    - Frontend: React Query hooks for state management and workflow transitions.
    - Frontend: `PurchaseOrderListPage` with filtering and status badges.
    - Frontend: `PurchaseOrderForm` with dynamic item rows and real-time calculations.
    - Frontend: `PurchaseOrderDetailPage` with workflow actions and confirmation modals.
    - Frontend: `DashboardPage` integration with new module card.

---

## [0.5.0] - 2026-02-09

### Added - Warehouses & Locations Module (Backend Complete ✅)

#### Backend - Warehouses (Complete ✅)
- **Warehouse Model** (`internal/models/warehouse.go`) — 11 fields with FK to users (manager_id), relationships to locations and manager
- **Warehouse DTOs** (`internal/dto/warehouse_dto.go`) — CreateWarehouseRequest, UpdateWarehouseRequest, WarehouseFilterRequest with validation
- **Warehouse Repository** (`internal/repository/warehouse_repo.go`) — CRUD operations + GetLocationsCount method
- **Warehouse Service** (`internal/service/warehouse_service.go`) — Code uniqueness validation, cascade delete protection (prevents delete if warehouse has locations)
- **Warehouse Handlers** (`internal/api/handlers/warehouse.go`) — 6 endpoints:
  - `GET /api/v1/warehouses` — List warehouses (public)
  - `GET /api/v1/warehouses/:id` — Get warehouse by ID (public)
  - `GET /api/v1/warehouses/:id/locations` — Get warehouse locations (public)
  - `POST /api/v1/warehouses` — Create warehouse (auth required)
  - `PUT /api/v1/warehouses/:id` — Update warehouse (auth required)
  - `DELETE /api/v1/warehouses/:id` — Delete warehouse (auth required, fails if has locations)

#### Backend - Warehouse Locations (Complete ✅)
- **WarehouseLocation Model** (`internal/models/warehouse_location.go`) — 13 fields with FK to warehouses (warehouse_id NOT NULL), location hierarchy helper (GetFullLocation method for Aisle-Rack-Shelf-Bin format)
- **Location DTOs** (`internal/dto/warehouse_location_dto.go`) — CreateWarehouseLocationRequest (warehouse_id required), UpdateWarehouseLocationRequest, WarehouseLocationFilterRequest
- **Location Repository** (`internal/repository/warehouse_location_repo.go`) — CRUD operations + ListByWarehouseID method + Warehouse preloading
- **Location Service** (`internal/service/warehouse_location_service.go`) — Warehouse existence validation, code uniqueness validation, user tracking
- **Location Handlers** (`internal/api/handlers/warehouse_location.go`) — 5 endpoints:
  - `GET /api/v1/warehouse-locations` — List locations (public)
  - `GET /api/v1/warehouse-locations/:id` — Get location by ID (public)
  - `POST /api/v1/warehouse-locations` — Create location (auth required)
  - `PUT /api/v1/warehouse-locations/:id` — Update location (auth required)
  - `DELETE /api/v1/warehouse-locations/:id` — Delete location (auth required)

#### Routes Integration
- **Routes** (`internal/api/routes/routes.go`) — Integrated warehouse and location repositories, services, handlers, and routes under `/api/v1/warehouses` and `/api/v1/warehouse-locations`

**Backend Features:**
- ✅ Parent-child relationship (Warehouse ← Locations via warehouse_id FK)
- ✅ Manager assignment (FK to users table via manager_id)
- ✅ Cascade delete protection (cannot delete warehouse with existing locations)
- ✅ Code uniqueness validation (both entities)
- ✅ Location hierarchy (aisle, rack, shelf, bin) with formatted display
- ✅ Warehouse types (main, satellite, etc.)
- ✅ Location types (storage, picking, receiving, staging)
- ✅ Locations count in warehouse responses
- ✅ Search & filters for both entities
- ✅ Pagination & sorting
- ✅ User tracking (created_by, updated_by)

**Next Steps:**
- ✅ Frontend implementation complete!

#### Frontend - Warehouses & Locations UI (Complete ✅)
- **Warehouse Types** (`src/types/warehouse.ts`) — TypeScript interfaces: Warehouse, CreateWarehouseInput, UpdateWarehouseInput, WarehouseFilters, WarehouseListResponse
- **Location Types** (`src/types/warehouseLocation.ts`) — WarehouseLocation, CreateWarehouseLocationInput, UpdateWarehouseLocationInput, WarehouseLocationFilters with formatLocationHierarchy helper
- **Warehouses API Client** (`src/api/warehouses.ts`) — 6 methods: getWarehouses, getWarehouseById, getWarehouseLocations, createWarehouse, updateWarehouse, deleteWarehouse
- **Locations API Client** (`src/api/warehouseLocations.ts`) — 5 methods: getLocations, getLocationById, createLocation, updateLocation, deleteLocation
- **Warehouse Hooks** (`src/hooks/useWarehouses.ts`) — useWarehouses, useWarehouse, useWarehouseLocations, useCreateWarehouse, useUpdateWarehouse, useDeleteWarehouse
- **Location Hooks** (`src/hooks/useWarehouseLocations.ts`) — useWarehouseLocations (standalone), useWarehouseLocation, useCreateLocation, useUpdateLocation, useDeleteLocation with warehouse cache coordination
- **WarehouseListPage** (`src/pages/warehouses/WarehouseListPage.tsx`) — Table with search, locations count badge, pagination
- **WarehouseForm** (`src/components/warehouses/WarehouseForm.tsx`) — Reusable form for Create/Edit with 11 fields and validation
- **WarehouseCreatePage** (`src/pages/warehouses/WarehouseCreatePage.tsx`) — New warehouse creation page
- **WarehouseEditPage** (`src/pages/warehouses/WarehouseEditPage.tsx`) — Edit existing warehouse with data loading
- **WarehouseDetailPage** (`src/pages/warehouses/WarehouseDetailPage.tsx`) — Warehouse details with **NESTED LOCATION MANAGEMENT** (add/delete locations inline, location hierarchy display, delete confirmation with cascade warning)
- **Routes Integration** (`src/App.tsx`) — Warehouse routes: /warehouses, /warehouses/new, /warehouses/:id, /warehouses/:id/edit
- **Dashboard Navigation** (`src/pages/dashboard/DashboardPage.tsx`) — Warehouses module card with navigation link

**Frontend Features:**
- ✅ Full CRUD operations for warehouses and locations
- ✅ Nested location management in Warehouse Detail page
- ✅ Inline location creation form (no separate page needed)
- ✅ Location hierarchy display (Aisle-Rack-Shelf-Bin format)
- ✅ Locations count badge in warehouse list
- ✅ Cascade delete warning (shows location count, prevents delete if locations exist)
- ✅ Form validation (code, name required)
- ✅ Loading and error states
- ✅ Warehouse types (main, satellite, returns, staging)
- ✅ Location types (storage, picking, receiving, staging, shipping)
- ✅ Search & pagination
- ✅ Responsive design with Tailwind CSS
- ✅ Status badges (Active/Inactive)

**Full Module Status:**
- ✅ Backend API complete (11 endpoints)
- ✅ Frontend UI complete (full CRUD for both entities)
- ✅ Parent-child relationship working
- ✅ Cascade delete protection implemented
- ✅ All routes and navigation integrated

---

## [0.4.0] - 2026-02-09

### Added - Phase 2: Suppliers Module (In Progress)

#### Backend - Suppliers API (Complete ✅)
- **Supplier Model** (`internal/models/supplier.go`) — GORM model with 17 fields: code, name, name_en, tax_code, contact_person, phone, email, address, city, country, payment_terms, credit_limit, is_active, notes + audit fields
- **Supplier DTOs** (`internal/dto/supplier_dto.go`) — CreateSupplierRequest, UpdateSupplierRequest, SupplierFilterRequest with validation tags
- **Supplier Repository** (`internal/repository/supplier_repo.go`) — CRUD operations: Create, GetByID, GetByCode, List with filters (search, country, city, is_active), Update, Delete (soft)
- **Supplier Service** (`internal/service/supplier_service.go`) — Business logic: code uniqueness validation, CRUD operations with user tracking (created_by, updated_by)
- **Supplier Handlers** (`internal/api/handlers/supplier.go`) — HTTP endpoints: List, GetByID, Create, Update, Delete
- **Routes Integration** (`internal/api/routes/routes.go`) — Supplier routes under `/api/v1/suppliers` with auth middleware for protected endpoints

**API Endpoints:**
- `GET /api/v1/suppliers` — List suppliers with filters (search, country, city, is_active) and pagination
- `GET /api/v1/suppliers/:id` — Get single supplier
- `POST /api/v1/suppliers` — Create supplier (auth required)
- `PUT /api/v1/suppliers/:id` — Update supplier (auth required)
- `DELETE /api/v1/suppliers/:id` — Soft delete supplier (auth required)

#### Frontend - Suppliers UI (Complete ✅)
- **Supplier Types** (`src/types/supplier.ts`) — TypeScript interfaces: Supplier, CreateSupplierInput, UpdateSupplierInput, SupplierFilters, SupplierListResponse
- **Suppliers API Client** (`src/api/suppliers.ts`) — Axios methods: getSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier
- **React Query Hooks** (`src/hooks/useSuppliers.ts`) — useSuppliers, useSupplier, useCreateSupplier, useUpdateSupplier, useDeleteSupplier with automatic cache invalidation
- **SupplierForm Component** (`src/components/suppliers/SupplierForm.tsx`) — Reusable form with full validation for all 17 fields, supports Create/Edit modes
- **SupplierListPage** (`src/pages/suppliers/SupplierListPage.tsx`) — Table with search, filters, pagination controls
- **SupplierCreatePage** (`src/pages/suppliers/SupplierCreatePage.tsx`) — New supplier creation page
- **SupplierEditPage** (`src/pages/suppliers/SupplierEditPage.tsx`) — Edit existing supplier with data loading
- **SupplierDetailPage** (`src/pages/suppliers/SupplierDetailPage.tsx`) — Supplier details display with delete confirmation modal
- **Routes Integration** (`src/App.tsx`) — Supplier routes: /suppliers, /suppliers/new, /suppliers/:id, /suppliers/:id/edit
- **Dashboard Navigation** (`src/pages/dashboard/DashboardPage.tsx`) — Suppliers module card with navigation link

**Frontend Features:**
- Full CRUD operations with React Query
- Form validation for required fields (code, name, email format)
- Loading and error states throughout
- Search by code, name, tax code, email
- Pagination controls
- Delete confirmation modal
- Responsive design with Tailwind CSS
- Status badges (Active/Inactive)

**Infrastructure:**
- ✅ Backend API complete with 5 endpoints
- ✅ Frontend UI complete with full CRUD functionality
- ✅ All supplier routes integrated
- ✅ Dashboard navigation active

---

## [0.3.0] - 2026-02-09

### Added - Phase 2: Materials CRUD Module

#### Backend - Materials API
- **Material Model** (`internal/models/material.go`) — GORM model with 24 fields matching database schema, SafeMaterial DTO
- **Material DTOs** (`internal/dto/material_dto.go`) — CreateMaterialRequest, UpdateMaterialRequest, MaterialFilterRequest with validation tags
- **Material Repository** (`internal/repository/material_repo.go`) — CRUD operations: Create, GetByID, GetByCode, List with filters, Update, Delete (soft), Restore, HardDelete
- **Material Service** (`internal/service/material_service.go`) — Business logic: code uniqueness validation, CRUD operations with user tracking
- **Material Handlers** (`internal/api/handlers/material.go`) — HTTP endpoints: List (GET /materials), GetByID (GET /materials/:id), Create (POST), Update (PUT), Delete (DELETE)
- **Routes Integration** (`internal/api/routes/routes.go`) — Material routes under `/api/v1/materials` with auth middleware for protected endpoints

**API Endpoints:**
- `GET /api/v1/materials` — List materials with filters (search, type, category, supplier, QC, hazardous, active) and pagination
- `GET /api/v1/materials/:id` — Get single material
- `POST /api/v1/materials` — Create material (auth required)
- `PUT /api/v1/materials/:id` — Update material (auth required)
- `DELETE /api/v1/materials/:id` — Soft delete material (auth required)

#### Frontend - Materials UI (Complete ✅)
- **Material Types** (`src/types/material.ts`) — TypeScript interfaces: Material, CreateMaterialInput, UpdateMaterialInput, MaterialFilters, MaterialListResponse
- **Materials API Client** (`src/api/materials.ts`) — Axios methods: getMaterials, getMaterialById, createMaterial, updateMaterial, deleteMaterial
- **React Query Hooks** (`src/hooks/useMaterials.ts`) — useMaterials, useMaterial, useCreateMaterial, useUpdateMaterial, useDeleteMaterial with automatic cache invalidation
- **MaterialForm Component** (`src/components/materials/MaterialForm.tsx`) — Reusable form with full validation for all 24 fields, supports Create/Edit modes
- **MaterialListPage** (`src/pages/materials/MaterialListPage.tsx`) — Table with search, filters, pagination controls, status badges
- **MaterialCreatePage** (`src/pages/materials/MaterialCreatePage.tsx`) — New material creation page
- **MaterialEditPage** (`src/pages/materials/MaterialEditPage.tsx`) — Edit existing material with data loading
- **MaterialDetailPage** (`src/pages/materials/MaterialDetailPage.tsx`) — Material details display with delete confirmation modal
- **Routes Integration** (`src/App.tsx`) — Material routes: /materials, /materials/new, /materials/:id, /materials/:id/edit
- **Dashboard Navigation** (`src/pages/dashboard/DashboardPage.tsx`) — Materials module card with navigation link

**Frontend Features:**
- Full CRUD operations with React Query
- Form validation for required fields
- Loading and error states throughout
- Search and pagination controls
- Status badges (Active/Inactive, QC Required, Hazardous)
- Delete confirmation modal
- Responsive design with Tailwind CSS

### Infrastructure
- ✅ Backend compiles successfully with Materials module
- ✅ All Material endpoints ready for testing
- ✅ Frontend UI complete with full CRUD functionality

---

## [0.2.0] - 2026-02-09

### Added - Backend Foundation (Phase 1)

#### Frontend Setup (React + Vite + TypeScript)
- **Project Initialization** — Vite 7.3.1 with React 19 + TypeScript template
- **Tailwind CSS** — Configured with Vuexy theme colors (primary, secondary, success, danger, warning, info), custom shadows, Inter font
- **Global Styles** (`src/index.css`) — Reusable component classes: card, btn, input, label, badge variants
- **API Client** (`src/lib/axios.ts`) — Axios with auth interceptors, automatic token refresh on 401
- **TypeScript Types** (`src/types/auth.ts`) — User, LoginRequest, LoginResponse, APIResponse interfaces
- **Zustand Store** (`src/stores/authStore.ts`) — Auth state management with localStorage persistence
- **Auth API** (`src/api/auth.ts`) — Login, logout, getCurrentUser, refreshToken methods
- **Login Page** (`src/pages/auth/LoginPage.tsx`) — Form with validation, error handling, loading states, Lucide icons
- **Dashboard Page** (`src/pages/dashboard/DashboardPage.tsx`) — User info display, logout, placeholder module cards
- **Protected Route** (`src/components/auth/ProtectedRoute.tsx`) — Authentication guard component
- **React Router** — BrowserRouter with protected routes setup
- **React Query** — QueryClient configuration with custom defaults
- **Environment Config** — `.env` and `.env.example` with API base URL
- **Docker** — Frontend service enabled in `docker-compose.yml` (port 3000)
- **Build Test** — `npm run build` ✅ Success

> [!NOTE]
> Frontend dev server has Tailwind v4 `@apply` directive runtime issues. Build completes successfully but dev server CSS compilation needs debugging. Backend API fully functional.


#### Dependencies (Frontend)
- `react` v19.0.0 + `react-dom` v19.0.0
- `react-router-dom` v7.6.2 — Routing
- `axios` v1.9.1 — HTTP client
- `zustand` v5.0.3 — State management
- `@tanstack/react-query` v6.2.1 — Data fetching
- `lucide-react` v0.515.0 — Icons
- `tailwindcss` v4.1.0 — Styling
- `typescript` v5.7.3

#### Authentication Module
- **User Model** (`internal/models/user.go`) — User entity with bcrypt password hashing, SafeUser DTO for API responses
- **JWT Utilities** (`internal/utils/jwt.go`) — Token generation/validation with custom claims (user_id, username, email, role)
- **User Repository** (`internal/repository/user_repo.go`) — CRUD operations, GetByEmail, GetByUsername, UpdateLastLogin
- **Auth Service** (`internal/service/auth_service.go`) — Login with credential validation, token refresh, inactive user check
- **Auth Handlers** (`internal/api/handlers/auth.go`) — Login, Logout, RefreshToken, Me endpoints with request validation
- **Auth Middleware** (`internal/api/middleware/auth.go`) — JWT validation, role-based access control (RBAC)
- **Auth Routes** — `POST /api/v1/auth/login`, `POST /auth/logout`, `POST /auth/refresh`, `GET /auth/me` (protected)
- **Seed Data** (`seeds/001_seed_users.sql`) — 5 test users: admin, warehouse_manager, warehouse_staff, qc_staff, procurement_staff (password: `password123`)

#### Development Environment
- Go 1.24.13 installation (official method)
- Docker 28.2.2 and Docker Compose 1.29.2 setup
- Complete backend project structure (`cmd/`, `internal/`, `migrations/`, `seeds/`, `tests/`)

#### Backend Core Infrastructure
- **Main Application** (`cmd/api/main.go`) — Entry point with Gin router, middleware setup, health check endpoint
- **Configuration Management** (`internal/config/config.go`) — Viper-based config loader for server, database, JWT, CORS, logging
- **Database Module** (`internal/database/database.go`) — GORM PostgreSQL connection with connection pooling
- **API Response Utilities** (`internal/utils/response.go`) — Standardized JSON responses, error handling, pagination helpers
- **Routes Setup** (`internal/api/routes/routes.go`) — API v1 router group configuration

#### Middleware
- **CORS Middleware** (`internal/api/middleware/cors.go`) — Configurable allowed origins, preflight handling
- **Logger Middleware** (`internal/api/middleware/logger.go`) — Request/response logging with latency tracking
- **Error Handler Middleware** (`internal/api/middleware/error_handler.go`) — Panic recovery and error normalization

#### Database Migrations (5/24 tables)
- `000001_create_users.up/down.sql` — Users table with roles, authentication fields, audit columns
- `000002_create_suppliers.up/down.sql` — Suppliers with contact info, payment terms, credit limits
- `000003_create_warehouses.up/down.sql` — Warehouses with manager assignment, location info
- `000004_create_warehouse_locations.up/down.sql` — Storage locations (aisle, rack, shelf, bin structure)
- `000005_create_materials.up/down.sql` — Materials with pricing, stock control, QC requirements, shelf life

**Note:** Migrations 000006-000025 (19 tables + 3 views) created but will be applied in next deployment:
- `finished_products` — Product master data with shelf life, costing
- `purchase_orders` + `purchase_order_items` — PO management
- `goods_receipt_notes` + `goods_receipt_note_items` — GRN with QC workflow
- `material_requests` + `material_request_items` — Material requisitions
- `material_issue_notes` + `material_issue_note_items` — Material issuance with FIFO/FEFO
- `delivery_orders` + `delivery_order_items` — Finished goods delivery
- `stock_ledger` — Transaction history (all stock movements)
- `stock_balance` — Current stock levels with batch/lot tracking, generated available_quantity column
- `stock_reservations` — Stock allocation for orders
- `stock_adjustments` + `stock_adjustment_items` — Inventory adjustments
- `stock_transfers` + `stock_transfer_items` — Inter-warehouse transfers
- `audit_logs` — System audit trail with JSONB change tracking
- Views: `v_material_stock_summary`, `v_expiring_items`, `v_stock_movement_summary`


#### DevOps & Configuration
- `docker-compose.yml` — PostgreSQL 15 Alpine service with health checks, volume persistence
- `backend/Dockerfile` — Multi-stage build (builder + alpine runtime)
- `backend/Makefile` — Development commands (run, build, test, migrate, docker)
- `backend/.env.example` — Environment variables template
- `backend/.gitignore` — Git ignore rules for backend

#### Dependencies (Go modules)
- `github.com/gin-gonic/gin` v1.11.0 — Web framework
- `gorm.io/gorm` v1.31.1 + `gorm.io/driver/postgres` v1.6.0 — ORM and PostgreSQL driver
- `github.com/golang-jwt/jwt/v5` v5.3.1 — JWT authentication
- `github.com/spf13/viper` v1.21.0 — Configuration management
- `go.uber.org/zap` v1.27.1 — Structured logging
- `github.com/go-playground/validator/v10` v10.30.1 — Request validation
- `github.com/shopspring/decimal` v1.4.0 — Precise decimal arithmetic
- `golang.org/x/crypto` v0.47.0 — Password hashing

### Fixed
- SQL syntax error in `000002_create_suppliers.down.sql` (DROP TABLE IF NOT EXISTS → DROP TABLE IF EXISTS)

### Infrastructure
- PostgreSQL 15 Alpine container running successfully with auto-migrations on startup
- Backend Go application compiles successfully
- Health check endpoint: `GET /health` returns `{"status":"healthy","database":"connected"}`

---

## [0.1.0] - 2026-02-09

### Added - Tài liệu dự án (Documentation)

#### Database & Data
- `01_DATABASE_SCHEMA.md` — Schema đầy đủ cho 24 bảng PostgreSQL (Master Data, Transactions, Inventory, System), bao gồm DDL, views, triggers, indexes, seed data, backup/recovery
- `04_DATA_DICTIONARY.md` — Data dictionary chi tiết: columns, data types, nullability, defaults, constraints, enums, foreign keys, business rules cho từng bảng

#### API
- `02_API_DOCUMENTATION.md` — REST API documentation: endpoints cho tất cả modules (Materials, PO, GRN, MR, MIN, DO, Stock, Adjustments, Transfers, Reports, Dashboard), authentication (JWT), pagination, filtering, error handling, rate limiting

#### UI/UX
- `03_UI_UX_DESIGN.md` — Thiết kế UI/UX dựa trên Vuexy template: design system (colors, typography, spacing), component library (Button, Input, Table, Modal, Card, Badge, Alert, Pagination), layout structure, 9 screen mockups, responsive design, accessibility (WCAG 2.1 AA), animations, performance optimization

#### Business Logic
- `05_BUSINESS_LOGIC.md` — Nghiệp vụ và workflows: Purchase flow (PO → GRN → QC → Post), Production flow (MR → Picking → MIN), Sales flow (DO → Pick/Pack/Ship), stock valuation (FIFO/FEFO), batch tracking & traceability, alerts & notifications, reports, RBAC (7 roles)

#### Architecture & Standards
- `06_PROMPTS_FOR_ANTIGRAVITY.md` — 12 prompts phân chia implementation theo từng phase với code examples
- `07_PROJECT_STRUCTURE.md` — Folder structure chi tiết (backend Go + frontend React), roadmap 9 phases (~16 sprints), CI/CD pipeline (GitHub Actions), environment variables, security/performance/deployment checklists
- `08_ARCHITECTURE_DESIGN.md` — Clean Architecture (Hexagonal), 6 design patterns (Repository, Service, Factory, Strategy, Unit of Work, Observer), CQRS, frontend architecture, RBAC, testing pyramid, monitoring
- `09_CODING_STANDARDS.md` — Coding conventions cho Go và React/TypeScript, testing standards, git commit format, linting config, code review checklists
- `10_TECH_STACK_DECISIONS.md` — Phân tích và lý do chọn từng công nghệ với bảng so sánh alternatives

#### Project
- `README.md` — Tổng quan dự án, danh sách features, tech stack, hướng dẫn sử dụng, roadmap

### Tech Stack
- **Backend:** Go 1.21+, Gin, GORM/sqlc, PostgreSQL 15+, JWT, Zap
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Query, React Hook Form + Zod, TanStack Table, Recharts
- **DevOps:** Docker, Docker Compose, GitHub Actions, golang-migrate
