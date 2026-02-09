# CODING STANDARDS - ERP WAREHOUSE MODULE

## I. GO CODING STANDARDS

### 1. Naming Conventions

#### A. Package Names
```go
// ✅ GOOD: Short, lowercase, no underscores
package material
package repository
package service

// ❌ BAD
package Material
package material_repository
package materialRepo
```

#### B. Variable Names
```go
// ✅ GOOD: camelCase, descriptive
var materialID int64
var purchaseOrder *PurchaseOrder
var totalAmount decimal.Decimal

// ❌ BAD: Too short, unclear
var m int64
var po *PurchaseOrder
var amt decimal.Decimal

// Constants: PascalCase for exported, camelCase for internal
const MaxRetryAttempts = 3
const defaultTimeout = 30 * time.Second
```

#### C. Function Names
```go
// ✅ GOOD: Verb + Noun, clear intent
func CreatePurchaseOrder(req CreatePORequest) (*PurchaseOrder, error)
func GetMaterialByID(id int64) (*Material, error)
func ValidateStockAvailability(items []Item) error

// ❌ BAD: Unclear, inconsistent
func PO(req CreatePORequest) (*PurchaseOrder, error)
func Material(id int64) (*Material, error)
func Check(items []Item) error
```

#### D. Interface Names
```go
// ✅ GOOD: -er suffix for single-method, descriptive for multi-method
type Reader interface {
    Read(p []byte) (n int, err error)
}

type MaterialRepository interface {
    Create(ctx context.Context, m *Material) error
    FindByID(ctx context.Context, id int64) (*Material, error)
}

// ❌ BAD: I prefix (C# style), unclear
type IMaterial interface {...}
type Repo interface {...}
```

---

### 2. Code Organization

#### A. File Structure
```go
// material.go - Domain entity
package domain

import (
    "time"
    "github.com/shopspring/decimal"
)

// Material represents raw material or packaging
type Material struct {
    ID           int64           `gorm:"primaryKey" json:"id"`
    Code         string          `gorm:"uniqueIndex;not null" json:"code"`
    TradingName  string          `json:"trading_name"`
    // ... other fields
}

// NewMaterial creates a new Material
func NewMaterial(code, name string) *Material {
    return &Material{
        Code:        code,
        TradingName: name,
        IsActive:    true,
    }
}

// Validate checks business rules
func (m *Material) Validate() error {
    if m.Code == "" {
        return ErrMaterialCodeRequired
    }
    return nil
}
```

#### B. Error Handling
```go
// Define custom errors
var (
    ErrMaterialNotFound      = errors.New("material not found")
    ErrInvalidMaterialCode   = errors.New("invalid material code")
    ErrDuplicateMaterialCode = errors.New("material code already exists")
)

// Wrap errors with context
func (s *MaterialService) Create(ctx context.Context, req CreateMaterialRequest) (*Material, error) {
    material := NewMaterial(req.Code, req.TradingName)
    
    if err := material.Validate(); err != nil {
        return nil, fmt.Errorf("validation failed: %w", err)
    }
    
    if err := s.repo.Create(ctx, material); err != nil {
        return nil, fmt.Errorf("failed to create material: %w", err)
    }
    
    return material, nil
}

// Check errors
if err != nil {
    if errors.Is(err, ErrMaterialNotFound) {
        // Handle not found
    }
    // ...
}
```

#### C. Context Usage
```go
// ✅ GOOD: Always pass context as first parameter
func (s *MaterialService) GetByID(ctx context.Context, id int64) (*Material, error) {
    // Check context cancellation
    select {
    case <-ctx.Done():
        return nil, ctx.Err()
    default:
    }
    
    return s.repo.FindByID(ctx, id)
}

// ❌ BAD: No context
func (s *MaterialService) GetByID(id int64) (*Material, error) {
    return s.repo.FindByID(id)
}
```

---

### 3. Code Style

#### A. Comments
```go
// ✅ GOOD: Explain WHY, not WHAT
// Calculate FIFO cost by taking materials from oldest batches first.
// This ensures compliance with accounting standards.
func (s *StockService) CalculateFIFOCost(material *Material, qty decimal.Decimal) decimal.Decimal {
    // ...
}

// ❌ BAD: States the obvious
// Get material by ID
func (s *MaterialService) GetByID(id int64) (*Material, error) {
    // ...
}

// Package comment (required for exported packages)
// Package service provides business logic for warehouse operations.
package service
```

#### B. Function Length
```go
// ✅ GOOD: Short, focused functions (< 50 lines)
func (po *PurchaseOrder) CalculateTotals() {
    po.Subtotal = po.calculateSubtotal()
    po.TotalAmount = po.calculateTotal()
}

func (po *PurchaseOrder) calculateSubtotal() decimal.Decimal {
    total := decimal.Zero
    for _, item := range po.Items {
        total = total.Add(item.CalculateLineTotal())
    }
    return total
}

// ❌ BAD: Long, does too much (> 100 lines)
func (po *PurchaseOrder) Process() {
    // 150 lines of mixed logic
}
```

#### C. Struct Tags
```go
// ✅ GOOD: Consistent order (json, gorm, binding)
type Material struct {
    ID          int64  `json:"id" gorm:"primaryKey"`
    Code        string `json:"code" gorm:"uniqueIndex;not null" binding:"required"`
    TradingName string `json:"trading_name" gorm:"size:255;not null" binding:"required"`
}

// ❌ BAD: Inconsistent, missing tags
type Material struct {
    ID          int64  `gorm:"primaryKey"`
    Code        string `json:"code"`
    TradingName string
}
```

---

### 4. Testing Standards

#### A. Table-Driven Tests
```go
func TestMaterial_Validate(t *testing.T) {
    tests := []struct {
        name    string
        material *Material
        wantErr bool
        errType error
    }{
        {
            name: "valid material",
            material: &Material{
                Code:        "ACI_Citric",
                TradingName: "CITRIC ACID",
            },
            wantErr: false,
        },
        {
            name: "empty code",
            material: &Material{
                Code:        "",
                TradingName: "CITRIC ACID",
            },
            wantErr: true,
            errType: ErrMaterialCodeRequired,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := tt.material.Validate()
            if tt.wantErr {
                assert.Error(t, err)
                assert.ErrorIs(t, err, tt.errType)
            } else {
                assert.NoError(t, err)
            }
        })
    }
}
```

#### B. Test Naming
```go
// ✅ GOOD: Test{FunctionName}_{Scenario}
func TestPurchaseOrder_Approve_Success(t *testing.T) {...}
func TestPurchaseOrder_Approve_AlreadyApproved(t *testing.T) {...}
func TestStockService_CalculateFIFO_InsufficientStock(t *testing.T) {...}

// ❌ BAD: Unclear
func TestApprove(t *testing.T) {...}
func TestCase1(t *testing.T) {...}
```

---

### 5. Best Practices

#### A. Dependency Injection
```go
// ✅ GOOD: Constructor injection
type MaterialService struct {
    repo         MaterialRepository
    validator    Validator
    eventBus     EventBus
}

func NewMaterialService(
    repo MaterialRepository,
    validator Validator,
    eventBus EventBus,
) *MaterialService {
    return &MaterialService{
        repo:      repo,
        validator: validator,
        eventBus:  eventBus,
    }
}

// ❌ BAD: Global variables
var globalRepo MaterialRepository

func CreateMaterial(m *Material) error {
    return globalRepo.Create(m)
}
```

#### B. Interface Segregation
```go
// ✅ GOOD: Small, focused interfaces
type MaterialReader interface {
    FindByID(ctx context.Context, id int64) (*Material, error)
    FindAll(ctx context.Context, filter Filter) ([]*Material, error)
}

type MaterialWriter interface {
    Create(ctx context.Context, m *Material) error
    Update(ctx context.Context, m *Material) error
    Delete(ctx context.Context, id int64) error
}

// ❌ BAD: Fat interface
type MaterialRepository interface {
    FindByID(ctx context.Context, id int64) (*Material, error)
    FindAll(ctx context.Context, filter Filter) ([]*Material, error)
    Create(ctx context.Context, m *Material) error
    Update(ctx context.Context, m *Material) error
    Delete(ctx context.Context, id int64) error
    // 20 more methods...
}
```

#### C. Avoid Naked Returns
```go
// ✅ GOOD: Explicit return
func divide(a, b int) (int, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}

// ❌ BAD: Naked return (confusing)
func divide(a, b int) (result int, err error) {
    if b == 0 {
        err = errors.New("division by zero")
        return
    }
    result = a / b
    return
}
```

---

## II. REACT/TYPESCRIPT CODING STANDARDS

### 1. Component Structure

#### A. Functional Components
```tsx
// ✅ GOOD: Typed props, clear structure
import React from 'react';

interface MaterialCardProps {
  material: Material;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="card">
      <h3>{material.trading_name}</h3>
      <p>Code: {material.code}</p>
      <div className="actions">
        <button onClick={() => onEdit(material.id)}>Edit</button>
        <button onClick={() => onDelete(material.id)}>Delete</button>
      </div>
    </div>
  );
};

// ❌ BAD: Untyped, unclear
export function Card(props) {
  return <div>{props.data.name}</div>;
}
```

#### B. Custom Hooks
```tsx
// ✅ GOOD: Reusable, typed, clear naming
import { useQuery } from '@tanstack/react-query';
import { materialsApi } from '@/api/materials';

interface UseMaterialsParams {
  page: number;
  limit: number;
  search?: string;
}

export const useMaterials = (params: UseMaterialsParams) => {
  return useQuery({
    queryKey: ['materials', params],
    queryFn: () => materialsApi.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Usage
const { data, isLoading, error } = useMaterials({ page: 1, limit: 20 });

// ❌ BAD: Generic, untyped
export function useData(params) {
  return useQuery(['data', params], () => fetch('/api/data'));
}
```

---

### 2. TypeScript Best Practices

#### A. Type Definitions
```typescript
// ✅ GOOD: Clear, specific types
interface Material {
  id: number;
  code: string;
  trading_name: string;
  material_type: 'raw_material' | 'packaging' | 'fragrance';
  unit: 'KG' | 'L' | 'PC' | 'BOX';
  min_stock_level: number;
  is_active: boolean;
}

interface CreateMaterialRequest {
  code: string;
  trading_name: string;
  material_type: Material['material_type'];
  unit: Material['unit'];
}

type MaterialStatus = 'active' | 'inactive';

// ❌ BAD: Any, unclear
interface Material {
  id: any;
  data: any;
  type: string;
}
```

#### B. Avoid `any`
```typescript
// ✅ GOOD: Use specific types or `unknown`
function parseJSON(json: string): unknown {
  return JSON.parse(json);
}

const result = parseJSON('{"name": "test"}');
if (typeof result === 'object' && result !== null && 'name' in result) {
  console.log(result.name);
}

// ❌ BAD: Using any
function parseJSON(json: string): any {
  return JSON.parse(json);
}
```

#### C. Generic Types
```typescript
// ✅ GOOD: Reusable generic types
interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}

// Usage
type MaterialsResponse = PaginatedResponse<Material>;
```

---

### 3. React Patterns

#### A. Prop Drilling Solution
```tsx
// ✅ GOOD: Context for deep props
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// ❌ BAD: Prop drilling through many levels
<App user={user}>
  <Layout user={user}>
    <Sidebar user={user}>
      <UserMenu user={user} />
    </Sidebar>
  </Layout>
</App>
```

#### B. Performance Optimization
```tsx
// ✅ GOOD: Memoization for expensive components
import React, { memo, useMemo, useCallback } from 'react';

export const MaterialRow = memo<MaterialRowProps>(({ material, onEdit }) => {
  return (
    <tr>
      <td>{material.code}</td>
      <td>{material.trading_name}</td>
      <td>
        <button onClick={() => onEdit(material.id)}>Edit</button>
      </td>
    </tr>
  );
});

// Parent component
const MaterialList: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  
  // Memoize callback to prevent re-renders
  const handleEdit = useCallback((id: number) => {
    navigate(`/materials/${id}/edit`);
  }, [navigate]);
  
  // Memoize expensive calculation
  const totalValue = useMemo(() => {
    return materials.reduce((sum, m) => sum + m.value, 0);
  }, [materials]);
  
  return (
    <>
      <p>Total Value: {totalValue}</p>
      <table>
        <tbody>
          {materials.map(material => (
            <MaterialRow
              key={material.id}
              material={material}
              onEdit={handleEdit}
            />
          ))}
        </tbody>
      </table>
    </>
  );
};
```

---

### 4. File Organization

```
features/materials/
├── components/
│   ├── MaterialList.tsx
│   ├── MaterialForm.tsx
│   ├── MaterialDetail.tsx
│   └── __tests__/
│       └── MaterialList.test.tsx
├── hooks/
│   ├── useMaterials.ts
│   └── useCreateMaterial.ts
├── api/
│   └── materialsApi.ts
└── types/
    └── material.ts
```

---

### 5. Naming Conventions

```typescript
// Components: PascalCase
MaterialList.tsx
CreatePOForm.tsx

// Hooks: camelCase with 'use' prefix
useMaterials.ts
usePurchaseOrders.ts

// Utils/Helpers: camelCase
formatCurrency.ts
validateEmail.ts

// Types/Interfaces: PascalCase
Material.ts
PurchaseOrder.ts

// Constants: UPPER_SNAKE_CASE
export const API_BASE_URL = 'http://localhost:8080';
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
```

---

## III. CSS/TAILWIND STANDARDS

### 1. Component Styling

```tsx
// ✅ GOOD: Consistent, organized classes
<button
  className="
    px-4 py-2 
    bg-primary text-white 
    rounded-md 
    hover:bg-primary-dark 
    disabled:opacity-50 
    transition-colors duration-200
  "
>
  Submit
</button>

// Extract repeated patterns
const buttonBaseClasses = "px-4 py-2 rounded-md transition-colors duration-200";
const buttonPrimaryClasses = "bg-primary text-white hover:bg-primary-dark";

<button className={cn(buttonBaseClasses, buttonPrimaryClasses)}>
  Submit
</button>
```

### 2. Responsive Design

```tsx
// ✅ GOOD: Mobile-first approach
<div className="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  gap-4
">
  {/* Cards */}
</div>

// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Title
</h1>
```

---

## IV. GIT COMMIT STANDARDS

### 1. Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 2. Types

```
feat:     New feature
fix:      Bug fix
docs:     Documentation only
style:    Code style (formatting, missing semicolons)
refactor: Code refactoring (no functionality change)
perf:     Performance improvement
test:     Adding tests
chore:    Build process, dependencies
```

### 3. Examples

```
feat(materials): Add bulk import from Excel

Implement CSV/Excel parsing and batch material creation.
Includes validation and error reporting.

Closes #123

---

fix(grn): Fix stock balance calculation after QC reject

When QC rejects items, stock balance was not updated correctly.
Now properly handles partial acceptance.

Fixes #456

---

refactor(stock): Extract FIFO logic to separate service

Move FIFO cost calculation from StockService to 
dedicated FIFOValuationService for better testability.
```

---

## V. CODE REVIEW CHECKLIST

### Backend (Go)

- [ ] Follows naming conventions
- [ ] Context used correctly
- [ ] Errors wrapped with context
- [ ] No magic numbers (use constants)
- [ ] Database transactions used where needed
- [ ] Input validation present
- [ ] Unit tests included
- [ ] No SQL injection vulnerabilities
- [ ] Proper error handling
- [ ] Documentation comments for exported functions

### Frontend (React/TypeScript)

- [ ] Components properly typed
- [ ] No `any` types
- [ ] Props interface defined
- [ ] Hooks follow rules (not in conditionals)
- [ ] Performance optimization (memo, useMemo, useCallback)
- [ ] Accessibility attributes (ARIA)
- [ ] Responsive design
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Empty states handled

### General

- [ ] Follows SOLID principles
- [ ] DRY (Don't Repeat Yourself)
- [ ] KISS (Keep It Simple, Stupid)
- [ ] YAGNI (You Aren't Gonna Need It)
- [ ] Code is self-documenting
- [ ] No commented-out code
- [ ] No debug logs in production
- [ ] Security best practices followed

---

## VI. LINTING & FORMATTING

### Backend (Go)

```bash
# Install tools
go install golang.org/x/tools/cmd/goimports@latest
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Format code
gofmt -w .
goimports -w .

# Lint
golangci-lint run

# .golangci.yml
linters:
  enable:
    - gofmt
    - goimports
    - govet
    - errcheck
    - staticcheck
    - unused
    - gosimple
    - structcheck
```

### Frontend (React/TypeScript)

```bash
# Install
npm install -D eslint prettier

# .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    'react/prop-types': 'off',
  },
};

# .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}

# Format
npm run lint
npm run format
```

---

Đây là toàn bộ Coding Standards! Còn phần nào cần bổ sung không?
