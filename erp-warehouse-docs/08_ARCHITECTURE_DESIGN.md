# ARCHITECTURE DESIGN - ERP WAREHOUSE MODULE

## I. TỔNG QUAN KIẾN TRÚC

### 1. Architectural Style

**Clean Architecture (Hexagonal Architecture / Ports & Adapters)**

```
┌─────────────────────────────────────────────────────────────┐
│                         Presentation Layer                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   REST API  │  │   GraphQL   │  │     CLI     │        │
│  │  (Gin/HTTP) │  │  (Optional) │  │  (Cobra)    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  Use Cases / Services                 │  │
│  │  - MaterialService                                    │  │
│  │  - PurchaseOrderService (workflows)                   │  │
│  │  - StockService (valuation, reservation)             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        Domain Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Business Logic / Entities                │  │
│  │  - Material, PurchaseOrder, Stock                     │  │
│  │  - Business rules, validations                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  PostgreSQL │  │    Redis    │  │    SMTP     │        │
│  │ (Repository)│  │   (Cache)   │  │   (Email)   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

**Dependency Rule:** 
- Dependencies chỉ point vào trong (Domain không depend vào Infrastructure)
- Domain Layer ở trung tâm, không biết gì về database, HTTP, external services
- Infrastructure implement interfaces định nghĩa trong Domain/Application

---

### 2. Layered Architecture Chi Tiết

#### A. Presentation Layer (HTTP Handlers)
**Responsibility:** 
- Nhận HTTP requests
- Validate input (binding)
- Call Application Layer (Services)
- Format HTTP response
- Error handling

**Components:**
- Handlers (controllers)
- Middleware (auth, logging, CORS)
- Routes
- DTOs (Data Transfer Objects)

**Example:**
```go
// internal/api/handlers/material.go
type MaterialHandler struct {
    service service.MaterialService
}

func (h *MaterialHandler) Create(c *gin.Context) {
    var req CreateMaterialRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, ErrorResponse(err))
        return
    }
    
    material, err := h.service.Create(c.Request.Context(), req)
    if err != nil {
        c.JSON(500, ErrorResponse(err))
        return
    }
    
    c.JSON(201, SuccessResponse(material))
}
```

---

#### B. Application Layer (Services / Use Cases)
**Responsibility:**
- Orchestrate business workflows
- Coordinate multiple repositories
- Transaction management
- Business logic execution
- Call domain entities

**Components:**
- Services (use cases)
- DTOs
- Mappers (entity ↔ DTO)

**Example:**
```go
// internal/service/purchase_order_service.go
type PurchaseOrderService struct {
    poRepo       repository.PurchaseOrderRepository
    materialRepo repository.MaterialRepository
    supplierRepo repository.SupplierRepository
    txManager    repository.TransactionManager
}

func (s *PurchaseOrderService) Create(ctx context.Context, req CreatePORequest) (*PurchaseOrder, error) {
    // 1. Validate supplier exists
    supplier, err := s.supplierRepo.FindByID(ctx, req.SupplierID)
    if err != nil {
        return nil, ErrSupplierNotFound
    }
    
    // 2. Validate materials exist
    for _, item := range req.Items {
        if _, err := s.materialRepo.FindByID(ctx, item.MaterialID); err != nil {
            return nil, ErrMaterialNotFound
        }
    }
    
    // 3. Create PO (business logic in domain entity)
    po := NewPurchaseOrder(req)
    po.CalculateTotals() // Domain logic
    
    // 4. Save to database
    if err := s.poRepo.Create(ctx, po); err != nil {
        return nil, err
    }
    
    return po, nil
}

func (s *PurchaseOrderService) Approve(ctx context.Context, id int64, approverID int64) error {
    return s.txManager.WithTransaction(ctx, func(ctx context.Context) error {
        // 1. Load PO
        po, err := s.poRepo.FindByID(ctx, id)
        if err != nil {
            return err
        }
        
        // 2. Business rule: Check status
        if po.Status != StatusDraft {
            return ErrCannotApprove
        }
        
        // 3. Approve (domain logic)
        po.Approve(approverID)
        
        // 4. Save
        return s.poRepo.Update(ctx, po)
    })
}
```

---

#### C. Domain Layer (Entities / Business Logic)
**Responsibility:**
- Core business logic
- Business rules
- Validations
- State changes

**Components:**
- Entities (rich domain models)
- Value Objects
- Domain Events (optional)
- Business rules

**Example:**
```go
// internal/domain/purchase_order.go
type PurchaseOrder struct {
    ID                   int64
    PONumber             string
    PODate               time.Time
    SupplierID           int64
    Status               POStatus
    Items                []PurchaseOrderItem
    Subtotal             decimal.Decimal
    TaxAmount            decimal.Decimal
    DiscountAmount       decimal.Decimal
    TotalAmount          decimal.Decimal
    ApprovedBy           *int64
    ApprovedAt           *time.Time
}

// Business logic in domain entity
func (po *PurchaseOrder) CalculateTotals() {
    po.Subtotal = decimal.Zero
    for _, item := range po.Items {
        po.Subtotal = po.Subtotal.Add(item.CalculateLineTotal())
    }
    po.TotalAmount = po.Subtotal.Sub(po.DiscountAmount).Add(po.TaxAmount)
}

func (po *PurchaseOrder) Approve(approverID int64) error {
    if po.Status != StatusDraft {
        return ErrCannotApprove
    }
    
    po.Status = StatusApproved
    po.ApprovedBy = &approverID
    now := time.Now()
    po.ApprovedAt = &now
    
    return nil
}

func (po *PurchaseOrder) CanDelete() bool {
    return po.Status == StatusDraft || po.Status == StatusCancelled
}

// Value Object
type PurchaseOrderItem struct {
    MaterialID       int64
    OrderedQuantity  decimal.Decimal
    UnitPrice        decimal.Decimal
    DiscountPercent  decimal.Decimal
    TaxPercent       decimal.Decimal
}

func (item *PurchaseOrderItem) CalculateLineTotal() decimal.Decimal {
    subtotal := item.OrderedQuantity.Mul(item.UnitPrice)
    discount := subtotal.Mul(item.DiscountPercent).Div(decimal.NewFromInt(100))
    afterDiscount := subtotal.Sub(discount)
    tax := afterDiscount.Mul(item.TaxPercent).Div(decimal.NewFromInt(100))
    return afterDiscount.Add(tax)
}
```

---

#### D. Infrastructure Layer (Repository / External Services)
**Responsibility:**
- Database access
- External API calls
- File storage
- Email/SMS sending
- Caching

**Components:**
- Repository implementations
- Database queries
- External service adapters

**Example:**
```go
// internal/repository/purchase_order_repo.go
type purchaseOrderRepository struct {
    db *gorm.DB
}

func NewPurchaseOrderRepository(db *gorm.DB) PurchaseOrderRepository {
    return &purchaseOrderRepository{db: db}
}

func (r *purchaseOrderRepository) Create(ctx context.Context, po *PurchaseOrder) error {
    return r.db.WithContext(ctx).Create(po).Error
}

func (r *purchaseOrderRepository) FindByID(ctx context.Context, id int64) (*PurchaseOrder, error) {
    var po PurchaseOrder
    err := r.db.WithContext(ctx).
        Preload("Items").
        Preload("Supplier").
        First(&po, id).Error
    
    if errors.Is(err, gorm.ErrRecordNotFound) {
        return nil, ErrNotFound
    }
    return &po, err
}

func (r *purchaseOrderRepository) Update(ctx context.Context, po *PurchaseOrder) error {
    return r.db.WithContext(ctx).Save(po).Error
}
```

---

## II. DESIGN PATTERNS

### 1. Repository Pattern

**Purpose:** Abstraction layer giữa business logic và data access

```go
// Domain/Application layer define interface
type PurchaseOrderRepository interface {
    Create(ctx context.Context, po *PurchaseOrder) error
    FindByID(ctx context.Context, id int64) (*PurchaseOrder, error)
    FindAll(ctx context.Context, filter POFilter) ([]*PurchaseOrder, int64, error)
    Update(ctx context.Context, po *PurchaseOrder) error
    Delete(ctx context.Context, id int64) error
}

// Infrastructure layer implement
type postgresqlPORepository struct {
    db *gorm.DB
}
```

**Benefits:**
- Testable (mock repository)
- Flexible (swap database)
- Clean separation

---

### 2. Service/Use Case Pattern

**Purpose:** Encapsulate business workflows

```go
type PurchaseOrderService interface {
    Create(ctx context.Context, req CreatePORequest) (*PurchaseOrder, error)
    Approve(ctx context.Context, id int64, approverID int64) error
    Cancel(ctx context.Context, id int64, reason string) error
    GetByID(ctx context.Context, id int64) (*PurchaseOrder, error)
    List(ctx context.Context, filter POFilter) ([]*PurchaseOrder, int64, error)
}
```

---

### 3. Factory Pattern

**Purpose:** Create complex objects

```go
func NewPurchaseOrder(req CreatePORequest) *PurchaseOrder {
    po := &PurchaseOrder{
        PONumber:   generatePONumber(),
        PODate:     req.PODate,
        SupplierID: req.SupplierID,
        Status:     StatusDraft,
        Items:      make([]PurchaseOrderItem, 0),
    }
    
    for _, itemReq := range req.Items {
        item := PurchaseOrderItem{
            MaterialID:      itemReq.MaterialID,
            OrderedQuantity: itemReq.Quantity,
            UnitPrice:       itemReq.UnitPrice,
        }
        po.Items = append(po.Items, item)
    }
    
    po.CalculateTotals()
    return po
}
```

---

### 4. Strategy Pattern (Stock Valuation)

**Purpose:** Interchangeable algorithms

```go
// Strategy interface
type StockValuationStrategy interface {
    CalculateCost(item *StockItem, quantity decimal.Decimal) decimal.Decimal
}

// FIFO strategy
type FIFOStrategy struct{}

func (s *FIFOStrategy) CalculateCost(item *StockItem, qty decimal.Decimal) decimal.Decimal {
    // Lấy batch cũ nhất
    // ...
}

// Weighted Average strategy
type WeightedAverageStrategy struct{}

func (s *WeightedAverageStrategy) CalculateCost(item *StockItem, qty decimal.Decimal) decimal.Decimal {
    // Tính trung bình gia quyền
    // ...
}

// Usage
type StockService struct {
    strategy StockValuationStrategy
}
```

---

### 5. Unit of Work Pattern (Transaction Management)

**Purpose:** Manage database transactions

```go
type TransactionManager interface {
    WithTransaction(ctx context.Context, fn func(ctx context.Context) error) error
}

type gormTransactionManager struct {
    db *gorm.DB
}

func (tm *gormTransactionManager) WithTransaction(ctx context.Context, fn func(context.Context) error) error {
    tx := tm.db.WithContext(ctx).Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
            panic(r)
        }
    }()
    
    // Pass transaction context to function
    txCtx := context.WithValue(ctx, "tx", tx)
    if err := fn(txCtx); err != nil {
        tx.Rollback()
        return err
    }
    
    return tx.Commit().Error
}

// Usage in service
func (s *GRNService) Post(ctx context.Context, id int64) error {
    return s.txManager.WithTransaction(ctx, func(ctx context.Context) error {
        // 1. Update GRN
        // 2. Insert stock_ledger
        // 3. Update stock_balance
        // 4. Update PO received_quantity
        // All or nothing
    })
}
```

---

### 6. Observer Pattern (Notifications)

**Purpose:** Decouple event producers and consumers

```go
// Event
type DomainEvent interface {
    EventType() string
    OccurredAt() time.Time
}

type POApprovedEvent struct {
    POID       int64
    PONumber   string
    ApprovedBy int64
    occurredAt time.Time
}

// Observer
type EventListener interface {
    Handle(event DomainEvent) error
}

type EmailNotificationListener struct {
    emailService EmailService
}

func (l *EmailNotificationListener) Handle(event DomainEvent) error {
    switch e := event.(type) {
    case *POApprovedEvent:
        return l.emailService.SendPOApprovalEmail(e.POID)
    }
    return nil
}

// Event Bus
type EventBus struct {
    listeners map[string][]EventListener
}

func (bus *EventBus) Publish(event DomainEvent) {
    for _, listener := range bus.listeners[event.EventType()] {
        go listener.Handle(event) // Async
    }
}
```

---

## III. CQRS (Command Query Responsibility Segregation) - Optional

Nếu cần scale read/write khác nhau:

```
Write Side (Commands):
- CreatePO
- ApprovePO
- PostGRN
→ Write to PostgreSQL (normalized)

Read Side (Queries):
- GetPOList
- GetStockBalance
- GenerateReport
→ Read from Materialized Views / Redis cache
```

---

## IV. FRONTEND ARCHITECTURE

### Component Hierarchy

```
App
├── Router
├── AuthProvider
├── QueryClientProvider
└── MainLayout
    ├── Header
    │   ├── SearchBar
    │   ├── Notifications
    │   └── UserMenu
    ├── Sidebar
    │   └── MenuItems
    └── Content
        └── Routes
            ├── Dashboard
            ├── MaterialList
            │   ├── MaterialTable
            │   │   ├── MaterialRow
            │   │   └── Pagination
            │   └── MaterialFilters
            ├── MaterialForm
            ├── POList
            └── ...
```

### State Management Strategy

```
Global State (Zustand):
- Auth state (user, token)
- UI state (sidebar collapsed, theme)

Server State (React Query):
- Materials list
- PO list
- Stock balance
- Caching, auto-refetch

Local State (useState):
- Form inputs
- Modal open/close
- Expanded rows
```

### Feature-based Folder Structure

```
features/
├── materials/
│   ├── components/
│   │   ├── MaterialList.tsx
│   │   ├── MaterialForm.tsx
│   │   └── MaterialFilters.tsx
│   ├── hooks/
│   │   ├── useMaterials.ts
│   │   └── useCreateMaterial.ts
│   ├── api/
│   │   └── materialsApi.ts
│   └── types/
│       └── material.ts
├── purchase/
└── ...
```

---

## V. API DESIGN PRINCIPLES

### RESTful Conventions

```
GET    /materials           - List materials
GET    /materials/:id       - Get single material
POST   /materials           - Create material
PUT    /materials/:id       - Update material
DELETE /materials/:id       - Delete material

POST   /purchase-orders/:id/approve   - Action
POST   /grn/:id/qc-approve             - Action
POST   /grn/:id/post                   - Action
```

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "error": null
}

// Error response
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { "field": "code", "issue": "already exists" }
  }
}
```

---

## VI. DATABASE DESIGN PRINCIPLES

### Normalization
- 3NF (Third Normal Form)
- No redundant data (except denormalized views)

### Indexing Strategy
- Primary keys: Auto-indexed
- Foreign keys: Always indexed
- Search fields: Indexed (code, name)
- Date fields: Indexed (posting_date, expiry_date)
- Composite indexes: (item_type, item_id, warehouse_id)

### Partitioning (for large tables)
```sql
-- Partition stock_ledger by posting_date (monthly)
CREATE TABLE stock_ledger (
    ...
) PARTITION BY RANGE (posting_date);
```

---

## VII. SECURITY ARCHITECTURE

### Authentication Flow

```
1. User login → POST /auth/login
2. Server validate credentials
3. Generate JWT token (payload: user_id, role, exp)
4. Return token to client
5. Client store in memory/localStorage
6. Include token in Authorization header: Bearer <token>
7. Server middleware verify JWT
8. Extract user info from token
9. Check permissions
10. Allow/Deny request
```

### Authorization (RBAC)

```go
type Permission string

const (
    PermCreatePO     Permission = "po:create"
    PermApprovePO    Permission = "po:approve"
    PermQCApprove    Permission = "qc:approve"
    PermViewStock    Permission = "stock:view"
)

type Role struct {
    Name        string
    Permissions []Permission
}

var Roles = map[string]Role{
    "admin": {
        Name:        "Admin",
        Permissions: []Permission{/* all */},
    },
    "warehouse_manager": {
        Name: "Warehouse Manager",
        Permissions: []Permission{
            PermApprovePO,
            PermViewStock,
        },
    },
    "qc_staff": {
        Name: "QC Staff",
        Permissions: []Permission{
            PermQCApprove,
            PermViewStock,
        },
    },
}

// Middleware
func RequirePermission(perm Permission) gin.HandlerFunc {
    return func(c *gin.Context) {
        user := getCurrentUser(c)
        if !user.HasPermission(perm) {
            c.JSON(403, ErrorResponse("Permission denied"))
            c.Abort()
            return
        }
        c.Next()
    }
}

// Usage
router.POST("/purchase-orders/:id/approve", 
    RequirePermission(PermApprovePO),
    handler.Approve)
```

---

## VIII. SCALABILITY CONSIDERATIONS

### Horizontal Scaling

```
Load Balancer
    ├── API Server 1
    ├── API Server 2
    └── API Server 3
        │
        └── PostgreSQL (Master-Slave replication)
            └── Redis (Cache)
```

### Caching Strategy

```
Cache Layer (Redis):
- Material list (TTL: 1 hour)
- User permissions (TTL: 30 minutes)
- Dashboard stats (TTL: 5 minutes)

Cache Invalidation:
- On create/update/delete → Invalidate relevant cache
```

### Background Jobs (Optional)

```
Message Queue (RabbitMQ / Redis):
- Generate reports (async)
- Send email notifications
- Sync data to data warehouse
```

---

## IX. TESTING STRATEGY

### Testing Pyramid

```
       /\
      /E2E\           (Few)
     /──────\
    /  API  \         (Some)
   /─────────\
  / Unit Tests \      (Many)
 /─────────────\
```

### Test Levels

**1. Unit Tests (70%)**
```go
func TestPurchaseOrder_CalculateTotals(t *testing.T) {
    po := &PurchaseOrder{
        Items: []PurchaseOrderItem{
            {OrderedQuantity: 10, UnitPrice: 100},
            {OrderedQuantity: 5, UnitPrice: 200},
        },
    }
    
    po.CalculateTotals()
    
    assert.Equal(t, decimal.NewFromInt(2000), po.Subtotal)
}
```

**2. Integration Tests (20%)**
```go
func TestPurchaseOrderRepository_Create(t *testing.T) {
    db := setupTestDB(t)
    repo := NewPurchaseOrderRepository(db)
    
    po := &PurchaseOrder{...}
    err := repo.Create(context.Background(), po)
    
    assert.NoError(t, err)
    assert.NotZero(t, po.ID)
}
```

**3. E2E Tests (10%)**
```typescript
test('Create purchase order workflow', async () => {
  await loginAsManager();
  await navigateTo('/purchase-orders/create');
  await fillPOForm();
  await submitForm();
  await expect(page).toHaveText('PO created successfully');
});
```

---

## X. MONITORING & OBSERVABILITY

### Logging Levels

```
DEBUG: Detailed info for debugging
INFO:  Normal operations (PO created, GRN posted)
WARN:  Potential issues (Low stock, API slow)
ERROR: Errors that need attention
```

### Metrics to Track

```
- API response time (p50, p95, p99)
- Error rate (%)
- Database query time
- Active users
- Stock movements (daily)
- Background job queue size
```

### Health Check Endpoint

```go
GET /health
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "uptime": "72h30m"
}
```

---

Đây là toàn bộ Architecture Design! Có thắc mắc gì không?
