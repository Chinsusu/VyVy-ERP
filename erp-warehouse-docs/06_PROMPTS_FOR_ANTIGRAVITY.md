# PROMPTS FOR GOOGLE ANTIGRAVITY - ERP WAREHOUSE MODULE

## CÁC FILE TÀI LIỆU REFERENCE

Trước khi bắt đầu code, hãy đọc các file sau:
1. `01_DATABASE_SCHEMA.md` - Database schema đầy đủ
2. `02_API_DOCUMENTATION.md` - API endpoints và request/response
3. `03_UI_UX_DESIGN.md` - Thiết kế giao diện (Vuexy color scheme)
4. `04_DATA_DICTIONARY.md` - Chi tiết các bảng, cột
5. `05_BUSINESS_LOGIC.md` - Nghiệp vụ và workflows

---

## TECH STACK

### Backend
- Language: **Go 1.21+**
- Framework: **Gin** (web framework)
- Database: **PostgreSQL 15+**
- ORM: **GORM** hoặc **sqlc** (recommend sqlc cho performance)
- Authentication: **JWT**
- Validation: **go-playground/validator**
- Config: **viper**
- Logging: **zap** hoặc **logrus**

### Frontend
- Framework: **React 18+** with **TypeScript**
- Styling: **Tailwind CSS** (with Vuexy color palette)
- State Management: **Zustand** hoặc **React Query** (TanStack Query)
- Routing: **React Router v6**
- Forms: **React Hook Form** + **Zod**
- Tables: **TanStack Table**
- Charts: **Recharts** hoặc **Chart.js**
- Date picker: **react-datepicker**
- UI Components: Custom components (không dùng UI library nặng)

### DevOps
- Docker + Docker Compose
- PostgreSQL container
- Go app container
- React app (Vite build)

---

## FOLDER STRUCTURE

```
erp-warehouse/
├── backend/
│   ├── cmd/
│   │   └── api/
│   │       └── main.go
│   ├── internal/
│   │   ├── api/
│   │   │   ├── handlers/
│   │   │   │   ├── materials.go
│   │   │   │   ├── purchase_orders.go
│   │   │   │   ├── grn.go
│   │   │   │   ├── material_requests.go
│   │   │   │   ├── stock.go
│   │   │   │   └── ...
│   │   │   ├── middleware/
│   │   │   │   ├── auth.go
│   │   │   │   ├── cors.go
│   │   │   │   └── logger.go
│   │   │   └── routes/
│   │   │       └── routes.go
│   │   ├── models/
│   │   │   ├── material.go
│   │   │   ├── purchase_order.go
│   │   │   ├── grn.go
│   │   │   ├── stock.go
│   │   │   └── ...
│   │   ├── repository/
│   │   │   ├── material_repo.go
│   │   │   ├── po_repo.go
│   │   │   ├── grn_repo.go
│   │   │   └── ...
│   │   ├── service/
│   │   │   ├── material_service.go
│   │   │   ├── po_service.go
│   │   │   ├── grn_service.go
│   │   │   ├── stock_service.go
│   │   │   └── ...
│   │   ├── utils/
│   │   │   ├── response.go
│   │   │   ├── pagination.go
│   │   │   ├── validator.go
│   │   │   └── ...
│   │   └── config/
│   │       └── config.go
│   ├── migrations/
│   │   ├── 000001_create_materials_table.up.sql
│   │   ├── 000001_create_materials_table.down.sql
│   │   └── ...
│   ├── go.mod
│   ├── go.sum
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── materials.ts
│   │   │   ├── purchaseOrders.ts
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   └── ...
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── MainLayout.tsx
│   │   │   └── features/
│   │   │       ├── materials/
│   │   │       │   ├── MaterialList.tsx
│   │   │       │   ├── MaterialForm.tsx
│   │   │       │   └── MaterialDetail.tsx
│   │   │       ├── purchase/
│   │   │       └── ...
│   │   ├── hooks/
│   │   │   ├── useMaterials.ts
│   │   │   ├── usePurchaseOrders.ts
│   │   │   └── ...
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   └── ...
│   │   ├── types/
│   │   │   ├── material.ts
│   │   │   ├── purchaseOrder.ts
│   │   │   └── ...
│   │   ├── utils/
│   │   │   ├── format.ts
│   │   │   └── ...
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## PROMPT 1: Tạo Database Schema & Migrations

```
Hãy đọc file `01_DATABASE_SCHEMA.md` và tạo:

1. PostgreSQL migration files cho tất cả các bảng trong schema
   - Sử dụng golang-migrate format
   - File `.up.sql` và `.down.sql` cho mỗi bảng
   - Thứ tự migration: Master data tables trước, sau đó Transaction tables, cuối cùng là Inventory tables
   - Bao gồm tất cả indexes, foreign keys, constraints

2. Tạo file `schema.sql` chứa toàn bộ schema để có thể import trực tiếp

3. Tạo seed data cho:
   - warehouses (3 kho: WH-MAIN, WH-QC, WH-FG)
   - warehouse_locations (10-15 vị trí mẫu)
   - users (admin, warehouse_manager, warehouse_staff, qc_staff)
   - suppliers (5 nhà cung cấp mẫu)
   - materials (20 nguyên liệu từ file Excel đã được import)

Lưu ý:
- Tuân thủ naming convention: snake_case
- Tất cả bảng đều có created_at, updated_at
- Sử dụng BIGSERIAL cho primary keys
- Decimal(15,2) cho tiền, Decimal(15,3) cho số lượng
- Trigger auto-update updated_at
```

---

## PROMPT 2: Backend - Models & Repository Layer

```
Hãy đọc file `01_DATABASE_SCHEMA.md` và `04_DATA_DICTIONARY.md` để tạo:

1. Go models cho tất cả các entities:
   - Package: `internal/models`
   - Sử dụng GORM tags (hoặc pure struct nếu dùng sqlc)
   - Bao gồm JSON tags cho API response
   - Validation tags (binding:"required")
   - Example: Material, PurchaseOrder, GRN, StockBalance, etc.

2. Repository layer:
   - Package: `internal/repository`
   - Interface-based design
   - CRUD operations cho mỗi entity
   - Query builders cho filters, pagination, search
   - Transaction support

Example structure:
```go
// internal/models/material.go
type Material struct {
    ID           int64     `gorm:"primaryKey" json:"id"`
    Code         string    `gorm:"uniqueIndex;not null" json:"code" binding:"required"`
    TradingName  string    `json:"trading_name" binding:"required"`
    // ... other fields
    CreatedAt    time.Time `json:"created_at"`
    UpdatedAt    time.Time `json:"updated_at"`
}

// internal/repository/material_repo.go
type MaterialRepository interface {
    Create(ctx context.Context, material *Material) error
    FindByID(ctx context.Context, id int64) (*Material, error)
    FindAll(ctx context.Context, filter MaterialFilter) ([]Material, int64, error)
    Update(ctx context.Context, material *Material) error
    Delete(ctx context.Context, id int64) error
}
```

Yêu cầu:
- Clean architecture
- Context-aware
- Error handling rõ ràng
- Pagination support
```

---

## PROMPT 3: Backend - Service Layer & Business Logic

```
Hãy đọc file `05_BUSINESS_LOGIC.md` và implement:

1. Service layer cho các workflows:
   - MaterialService
   - PurchaseOrderService (with approval logic)
   - GRNService (with QC workflow)
   - MaterialRequestService
   - StockService (valuation, balance calculation)

2. Business logic implementation:
   - PO approval workflow
   - GRN → QC → Post workflow
   - Stock reservation & release
   - FIFO/FEFO stock valuation
   - Batch tracking

Example:
```go
// internal/service/grn_service.go
type GRNService struct {
    grnRepo   repository.GRNRepository
    stockRepo repository.StockRepository
    poRepo    repository.PurchaseOrderRepository
}

func (s *GRNService) Create(ctx context.Context, req CreateGRNRequest) (*GRN, error) {
    // 1. Validate PO exists and approved
    // 2. Validate received_qty <= ordered_qty
    // 3. Generate GRN number
    // 4. Create GRN with status = pending_qc
    // 5. Send notification to QC team
}

func (s *GRNService) QCApprove(ctx context.Context, id int64, req QCApproveRequest) error {
    // 1. Check GRN status = pending_qc
    // 2. Update items with QC results
    // 3. Update GRN status = qc_passed
    // 4. Notify warehouse staff
}

func (s *GRNService) Post(ctx context.Context, id int64) error {
    // 1. Check QC passed
    // 2. Begin transaction
    // 3. Insert stock_ledger entries
    // 4. Update stock_balance
    // 5. Update GRN.is_posted = true
    // 6. Update PO received_quantity
    // 7. Commit transaction
}
```

Yêu cầu:
- Transaction handling (rollback on error)
- Validation logic
- Number generation (PO-{YEAR}-{SEQ})
- Business rules enforcement
```

---

## PROMPT 4: Backend - API Handlers & Routes

```
Hãy đọc file `02_API_DOCUMENTATION.md` và implement:

1. REST API handlers:
   - Package: `internal/api/handlers`
   - Gin framework
   - Request binding & validation
   - Standardized response format
   - Error handling

2. Routes setup:
   - Package: `internal/api/routes`
   - Route grouping
   - Middleware (auth, logging, CORS)

Response format:
```go
type APIResponse struct {
    Success bool        `json:"success"`
    Message string      `json:"message,omitempty"`
    Data    interface{} `json:"data,omitempty"`
    Error   *APIError   `json:"error,omitempty"`
}

type PaginatedResponse struct {
    Items      interface{} `json:"items"`
    Pagination Pagination  `json:"pagination"`
}
```

Example:
```go
// internal/api/handlers/materials.go
func (h *MaterialHandler) List(c *gin.Context) {
    var filter MaterialFilter
    if err := c.ShouldBindQuery(&filter); err != nil {
        c.JSON(400, APIResponse{Success: false, Error: &APIError{Code: "INVALID_INPUT"}})
        return
    }
    
    materials, total, err := h.service.List(c.Request.Context(), filter)
    if err != nil {
        c.JSON(500, APIResponse{Success: false, Error: &APIError{Code: "INTERNAL_ERROR"}})
        return
    }
    
    c.JSON(200, APIResponse{
        Success: true,
        Data: PaginatedResponse{
            Items: materials,
            Pagination: CalculatePagination(filter.Page, filter.Limit, total),
        },
    })
}
```

Routes:
```go
// internal/api/routes/routes.go
func Setup(r *gin.Engine) {
    api := r.Group("/api/v1")
    api.Use(middleware.Auth())
    
    // Materials
    materials := api.Group("/materials")
    materials.GET("", materialHandler.List)
    materials.GET("/:id", materialHandler.GetByID)
    materials.POST("", materialHandler.Create)
    materials.PUT("/:id", materialHandler.Update)
    materials.DELETE("/:id", materialHandler.Delete)
    
    // Purchase Orders
    po := api.Group("/purchase-orders")
    po.GET("", poHandler.List)
    po.POST("", poHandler.Create)
    po.PUT("/:id/approve", poHandler.Approve)
    
    // ... other routes
}
```

Yêu cầu:
- RESTful conventions
- JWT authentication
- Request validation
- Pagination support
- Filter & search
```

---

## PROMPT 5: Frontend - Setup & Common Components

```
Hãy đọc file `03_UI_UX_DESIGN.md` và tạo:

1. Vite + React + TypeScript project setup:
   - Tailwind CSS config với Vuexy color palette
   - React Router v6
   - Axios client setup
   - Zustand store

2. Common components (package: `src/components/common`):
   - Button (Primary, Secondary, Success, Danger)
   - Input, Select, Textarea
   - Table (với sort, pagination)
   - Modal/Dialog
   - Card
   - Badge
   - Alert
   - Pagination
   - LoadingSpinner
   - EmptyState

Tailwind config:
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7367F0',
          light: '#9E95F5',
          dark: '#5E50EE',
        },
        success: '#28C76F',
        danger: '#EA5455',
        warning: '#FF9F43',
        info: '#00CFE8',
        text: {
          primary: '#5E5873',
          secondary: '#B9B9C3',
          heading: '#2C2C3E',
        },
        border: '#EBE9F1',
      },
    },
  },
};
```

Example Button:
```tsx
// src/components/common/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  children,
  onClick,
}) => {
  const baseClasses = 'rounded-md font-medium transition-all';
  const sizeClasses = {
    sm: 'h-8 px-4 text-sm',
    md: 'h-10 px-5 text-base',
    lg: 'h-12 px-6 text-lg',
  };
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'border border-primary text-primary hover:bg-primary-light hover:text-white',
    // ... other variants
  };
  
  return (
    <button
      className={cn(baseClasses, sizeClasses[size], variantClasses[variant])}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
};
```

Yêu cầu:
- TypeScript strict mode
- Responsive design
- Accessibility (ARIA labels)
- Vuexy design system
```

---

## PROMPT 6: Frontend - Layout & Navigation

```
Hãy đọc file `03_UI_UX_DESIGN.md` phần "Layout Structure" và implement:

1. MainLayout component:
   - Header (với search, notifications, user menu)
   - Sidebar (collapsible menu)
   - Content area

2. Sidebar menu structure:
   - Dashboard
   - Danh Mục (Materials, Finished Products, Warehouses, Suppliers)
   - Nhập Kho (PO, GRN)
   - Xuất Kho (MR, MIN, DO)
   - Tồn Kho (Stock Balance, Ledger, Transfer, Adjustment)
   - Báo Cáo

Example:
```tsx
// src/components/layout/Sidebar.tsx
const menuItems = [
  {
    label: 'Dashboard',
    icon: <HomeIcon />,
    path: '/dashboard',
  },
  {
    label: 'Danh Mục',
    icon: <FolderIcon />,
    children: [
      { label: 'Nguyên liệu', path: '/materials' },
      { label: 'Thành phẩm', path: '/finished-products' },
      { label: 'Kho', path: '/warehouses' },
      { label: 'Nhà cung cấp', path: '/suppliers' },
    ],
  },
  // ... other menu items
];
```

Yêu cầu:
- Active menu item highlighting
- Collapsible sidebar (desktop)
- Hamburger menu (mobile)
- Smooth transitions
```

---

## PROMPT 7: Frontend - Materials Module (CRUD)

```
Hãy đọc file `02_API_DOCUMENTATION.md` section "Materials" và `03_UI_UX_DESIGN.md` screen designs để implement:

1. MaterialList page:
   - Table với columns: Code, Name, Type, Category, Supplier, Stock, Status, Actions
   - Filters (search, type, category, supplier, status)
   - Pagination
   - Quick actions (View, Edit, Delete)
   - "Add New" button

2. MaterialForm (Create/Edit):
   - Two-column layout
   - Form validation (React Hook Form + Zod)
   - Auto-save draft (optional)
   - Success/Error messages

3. MaterialDetail page:
   - Tabs: Thông Tin, Tồn Kho, Lịch Sử Giao Dịch
   - Stock summary cards
   - Transaction history table

API integration:
```tsx
// src/api/materials.ts
export const materialsApi = {
  list: (params: MaterialFilterParams) => 
    api.get<PaginatedResponse<Material>>('/materials', { params }),
  
  getById: (id: number) => 
    api.get<APIResponse<Material>>(`/materials/${id}`),
  
  create: (data: CreateMaterialRequest) => 
    api.post<APIResponse<Material>>('/materials', data),
  
  update: (id: number, data: UpdateMaterialRequest) => 
    api.put<APIResponse<Material>>(`/materials/${id}`, data),
  
  delete: (id: number) => 
    api.delete<APIResponse<void>>(`/materials/${id}`),
};

// src/hooks/useMaterials.ts
export const useMaterials = (params: MaterialFilterParams) => {
  return useQuery({
    queryKey: ['materials', params],
    queryFn: () => materialsApi.list(params),
  });
};
```

Yêu cầu:
- React Query for data fetching
- Optimistic updates
- Loading states (skeleton)
- Error handling
- Responsive table
```

---

## PROMPT 8: Frontend - Purchase Order Flow

```
Implement toàn bộ Purchase Order flow:

1. PO List
2. Create PO (Multi-step form):
   - Step 1: Thông tin cơ bản (supplier, dates, warehouse)
   - Step 2: Chọn materials (table with add/remove rows)
   - Step 3: Preview & Confirm
3. PO Detail (với action buttons: Approve, Cancel)
4. Approve modal

Multi-step form:
```tsx
// src/components/features/purchase/CreatePOForm.tsx
const [currentStep, setCurrentStep] = useState(1);
const [formData, setFormData] = useState<POFormData>({});

const steps = [
  { number: 1, title: 'Thông Tin Cơ Bản', component: <Step1 /> },
  { number: 2, title: 'Chọn Nguyên Liệu', component: <Step2 /> },
  { number: 3, title: 'Xác Nhận', component: <Step3 /> },
];

// Step 2: Dynamic table rows
const [items, setItems] = useState([{ material_id: '', quantity: '', unit_price: '' }]);

const addRow = () => {
  setItems([...items, { material_id: '', quantity: '', unit_price: '' }]);
};

const removeRow = (index: number) => {
  setItems(items.filter((_, i) => i !== index));
};

// Auto-calculate totals
const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
const total = subtotal - discount + tax;
```

Yêu cầu:
- Form state management
- Auto-calculation (totals)
- Material search/select (với autocomplete)
- Validation per step
```

---

## PROMPT 9: Frontend - GRN & QC Workflow

```
Implement GRN workflow:

1. Create GRN form:
   - Select PO (auto-fill supplier, items)
   - Input received quantities, batch, expiry, location
   - Submit for QC

2. QC Approve screen:
   - List of pending QC GRNs
   - QC form for each item (accept/reject quantities)
   - Approve/Reject action

3. Post GRN:
   - Confirmation modal
   - Show stock impact preview
   - Post action

Example QC form:
```tsx
// src/components/features/grn/QCApproveForm.tsx
<Table>
  <thead>
    <tr>
      <th>Material</th>
      <th>Received</th>
      <th>Accepted</th>
      <th>Rejected</th>
      <th>QC Result</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>
    {items.map((item, index) => (
      <tr key={index}>
        <td>{item.material_name}</td>
        <td>{item.received_quantity}</td>
        <td>
          <Input
            type="number"
            value={item.accepted_quantity}
            onChange={(e) => updateItem(index, 'accepted_quantity', e.target.value)}
          />
        </td>
        <td>{item.received_quantity - item.accepted_quantity}</td>
        <td>
          <Select
            value={item.qc_result}
            options={[{ value: 'pass', label: 'Pass' }, { value: 'fail', label: 'Fail' }]}
          />
        </td>
        <td>
          <Input value={item.qc_notes} />
        </td>
      </tr>
    ))}
  </tbody>
</Table>
```

Yêu cầu:
- Workflow status display
- Action buttons based on status
- Real-time validation
```

---

## PROMPT 10: Frontend - Stock Management & Reports

```
Implement:

1. Stock Balance screen:
   - Filters (item type, warehouse, batch, expiring soon, low stock)
   - Table with expand/collapse (show batches)
   - Export to Excel

2. Stock Ledger:
   - Transaction history
   - Filters (date range, voucher type, item)

3. Expiring Items Alert:
   - Card-based layout
   - Tabs (< 30 days, 30-60, 60-90, Expired)
   - Actions (Create scrap order, Discount sale)

4. Reports:
   - Stock Movement Report (XNT)
   - Inventory Value Report
   - Low Stock Report

Example Stock Balance table:
```tsx
<Table>
  <thead>
    <tr>
      <th></th> {/* Expand button */}
      <th>Code</th>
      <th>Name</th>
      <th>Warehouse</th>
      <th>Available</th>
      <th>Reserved</th>
      <th>Total</th>
      <th>Value</th>
    </tr>
  </thead>
  <tbody>
    {materials.map((material) => (
      <>
        <tr onClick={() => toggleExpand(material.id)}>
          <td><ExpandIcon /></td>
          <td>{material.code}</td>
          <td>{material.name}</td>
          <td>{material.warehouse_name}</td>
          <td>{material.available_quantity}</td>
          <td>{material.reserved_quantity}</td>
          <td>{material.total_quantity}</td>
          <td>{formatCurrency(material.total_value)}</td>
        </tr>
        {expanded[material.id] && material.batches.map((batch) => (
          <tr className="bg-gray-50">
            <td colSpan={2}></td>
            <td colSpan={2}>Batch: {batch.batch_number}</td>
            <td>{batch.quantity}</td>
            <td></td>
            <td></td>
            <td>Expiry: {formatDate(batch.expiry_date)}</td>
          </tr>
        ))}
      </>
    ))}
  </tbody>
</Table>
```

Yêu cầu:
- Expand/collapse rows
- Export functionality
- Charts (Recharts)
- Date range picker
```

---

## PROMPT 11: Docker & Deployment

```
Tạo:

1. Dockerfile cho backend (Go):
   - Multi-stage build
   - Alpine base image
   - Migrate database on startup

2. Dockerfile cho frontend (React):
   - Build với Vite
   - Nginx serve static files

3. docker-compose.yml:
   - PostgreSQL service
   - Backend service (depends on postgres)
   - Frontend service (depends on backend)
   - Volumes for persistence

Example docker-compose.yml:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: erp_warehouse
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgres://postgres:postgres@postgres:5432/erp_warehouse?sslmode=disable
      JWT_SECRET: your-secret-key
    depends_on:
      - postgres

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

Yêu cầu:
- Production-ready images
- Environment variables
- Health checks
- Restart policies
```

---

## PROMPT 12: Testing & Documentation

```
Tạo:

1. Backend tests:
   - Unit tests cho services (table-driven tests)
   - Integration tests cho repositories
   - API tests (httptest)

2. Frontend tests:
   - Component tests (React Testing Library)
   - E2E tests (Playwright hoặc Cypress)

3. API documentation:
   - Swagger/OpenAPI spec
   - Generate từ code annotations

4. README.md:
   - Setup instructions
   - Architecture overview
   - API endpoints summary
   - Development guide

Example service test:
```go
func TestPurchaseOrderService_Create(t *testing.T) {
    tests := []struct {
        name    string
        input   CreatePORequest
        wantErr bool
    }{
        {
            name: "valid PO",
            input: CreatePORequest{
                SupplierID: 1,
                Items: []POItem{{MaterialID: 1, Quantity: 10}},
            },
            wantErr: false,
        },
        {
            name: "invalid supplier",
            input: CreatePORequest{
                SupplierID: 999,
            },
            wantErr: true,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // Test logic
        })
    }
}
```

Yêu cầu:
- >80% code coverage (backend)
- Test happy path & error cases
- Mock dependencies
```

---

## LƯU Ý QUAN TRỌNG

### Code Style
- Go: Follow Effective Go guidelines
- React: Functional components + hooks
- TypeScript: Strict mode
- Comments: Explain "why", not "what"

### Security
- JWT authentication
- Input validation
- SQL injection prevention (use parameterized queries)
- XSS prevention (sanitize inputs)
- CORS configuration

### Performance
- Database indexes on foreign keys
- Pagination for large datasets
- Lazy loading images
- React.memo for expensive components
- Debounce search inputs

### Error Handling
- Meaningful error messages
- Error logging (Sentry or similar)
- Graceful degradation
- Retry logic for transient errors

---

Đây là tất cả prompts cần thiết. Với mỗi prompt, hãy đọc kỹ các file reference và follow đúng design/architecture đã định!
