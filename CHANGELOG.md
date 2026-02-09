# Changelog

Tất cả thay đổi quan trọng của dự án VyVy ERP Warehouse Management System sẽ được ghi lại trong file này.

Định dạng dựa trên [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
và dự án tuân thủ [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

#### Frontend - Suppliers UI (In Progress 🔄)
- **Supplier Types** (`src/types/supplier.ts`) — TypeScript interfaces: Supplier, CreateSupplierInput, UpdateSupplierInput, SupplierFilters, SupplierListResponse
- **Suppliers API Client** (`src/api/suppliers.ts`) — Axios methods: getSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier
- **React Query Hooks** (`src/hooks/useSuppliers.ts`) — useSuppliers, useSupplier, useCreateSupplier, useUpdateSupplier, useDeleteSupplier with automatic cache invalidation

**Next Steps:**
- Complete frontend UI components (SupplierForm, SupplierList, SupplierCreate, SupplierEdit, SupplierDetail)
- Add routes and navigation
- Update Dashboard

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
