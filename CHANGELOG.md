# Changelog

Tất cả thay đổi quan trọng của dự án VyVy ERP Warehouse Management System sẽ được ghi lại trong file này.

Định dạng dựa trên [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
và dự án tuân thủ [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0] - 2026-02-09

### Added - Backend Foundation (Phase 1)

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
