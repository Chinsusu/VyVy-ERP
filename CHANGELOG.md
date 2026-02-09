# Changelog

Tất cả thay đổi quan trọng của dự án VyVy ERP Warehouse Management System sẽ được ghi lại trong file này.

Định dạng dựa trên [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
và dự án tuân thủ [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
