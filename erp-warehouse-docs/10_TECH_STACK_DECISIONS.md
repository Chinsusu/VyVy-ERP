# TECH STACK DECISIONS - ERP WAREHOUSE MODULE

## I. BACKEND STACK

### 1. Programming Language: **Go (Golang)**

#### Why Go?

✅ **Pros:**
- **Performance:** Compiled language, fast execution (comparable to C++)
- **Concurrency:** Built-in goroutines and channels for handling multiple requests
- **Simplicity:** Easy to learn, minimal syntax, fast development
- **Standard Library:** Excellent built-in packages (net/http, database/sql, crypto)
- **Static Typing:** Catch errors at compile time
- **Fast Compilation:** Quick build times
- **Single Binary:** Easy deployment (no runtime dependencies)
- **Memory Efficient:** Low memory footprint
- **Growing Ecosystem:** Rich third-party libraries

❌ **Cons:**
- Verbose error handling (`if err != nil`)
- No generics until Go 1.18 (now resolved)
- Less mature ORM compared to Java/C#
- Smaller talent pool compared to Python/JavaScript

#### Alternatives Considered

| Language | Pros | Cons | Why Not Chosen |
|----------|------|------|----------------|
| **Node.js** | Large ecosystem, JavaScript everywhere, async by default | Single-threaded, callback hell, memory leaks | Not ideal for CPU-intensive tasks |
| **Python** | Easy to learn, Django/Flask mature, great for data science | Slow performance, GIL limits concurrency | Too slow for high-traffic scenarios |
| **Java** | Mature ecosystem, Spring Boot powerful, enterprise-ready | Verbose, heavy JVM, slow startup | Overkill for this project size |
| **C#/.NET** | Great tooling, ASP.NET Core performant, LINQ powerful | Windows-centric (historically), smaller Linux community | Preference for open-source ecosystem |

**Decision:** Go offers the best balance of performance, simplicity, and modern features for a warehouse management system.

---

### 2. Web Framework: **Gin**

#### Why Gin?

✅ **Pros:**
- **Fast:** One of the fastest Go web frameworks (benchmarks show 40x faster than Martini)
- **Lightweight:** Minimal overhead
- **Routing:** Easy route grouping and parameter handling
- **Middleware:** Simple middleware chaining
- **JSON Handling:** Built-in JSON validation and binding
- **Documentation:** Good community support
- **Production-Ready:** Used by many companies

❌ **Cons:**
- Less "opinionated" than full frameworks like Buffalo
- Manual setup for some features (compared to Rails/Django)

#### Alternatives Considered

| Framework | Pros | Cons | Why Not Chosen |
|-----------|------|------|----------------|
| **Echo** | Fast, similar to Gin, good docs | Slightly smaller community | Gin has more stars/usage |
| **Fiber** | Inspired by Express.js, very fast | Uses Fasthttp (non-standard net/http) | Compatibility concerns |
| **Chi** | Lightweight, idiomatic Go, minimal | More boilerplate compared to Gin | Need faster development |
| **Standard net/http** | No dependencies, full control | Too low-level, lots of boilerplate | Slower development |

**Decision:** Gin provides the best balance of performance, ease of use, and community support.

---

### 3. Database: **PostgreSQL 15+**

#### Why PostgreSQL?

✅ **Pros:**
- **ACID Compliance:** Full transaction support
- **Rich Data Types:** JSONB, Arrays, UUID, Date/Time
- **Advanced Features:** CTEs, Window Functions, Full-Text Search
- **Extensibility:** PostGIS for geospatial, pg_trgm for fuzzy search
- **Performance:** Excellent query optimizer, partitioning, parallel queries
- **Reliability:** Proven in production for decades
- **Open Source:** Free, active community
- **Scalability:** Master-slave replication, logical replication
- **Indexing:** B-tree, Hash, GiST, GIN, BRIN

❌ **Cons:**
- More complex than MySQL for simple queries
- Heavier resource usage than MySQL
- Steeper learning curve

#### Alternatives Considered

| Database | Pros | Cons | Why Not Chosen |
|----------|------|------|----------------|
| **MySQL** | Simpler, faster for reads, huge community | Limited features, weaker JSON support | Need advanced features (CTEs, window functions) |
| **MongoDB** | Schema-less, horizontal scaling, fast writes | No ACID for multi-document, complex queries harder | Need strong consistency & relational data |
| **SQLite** | Embedded, zero-config, file-based | Single-writer, no network access, limited scalability | Need multi-user concurrent access |
| **SQL Server** | Enterprise features, great tooling | Expensive, Windows-centric | Budget & open-source preference |

**Decision:** PostgreSQL provides the best features for complex warehouse operations (batch tracking, traceability, reporting).

---

### 4. ORM/Query Builder: **GORM** (with option for **sqlc**)

#### Why GORM?

✅ **Pros:**
- **Auto Migration:** Easy schema changes
- **Associations:** Preload, eager loading, lazy loading
- **Hooks:** BeforeCreate, AfterUpdate, etc.
- **Soft Delete:** Built-in support
- **Raw SQL:** Escape hatch when needed
- **Active Community:** Widely used

❌ **Cons:**
- **Performance:** Slower than raw SQL for complex queries
- **Magic:** Can hide complexity
- **N+1 Queries:** Easy to fall into traps

#### Alternative: **sqlc**

✅ **Pros:**
- **Type-Safe:** Generate Go code from SQL
- **Performance:** Raw SQL performance
- **No Magic:** Explicit queries
- **Compile-Time Errors:** Catch SQL errors early

❌ **Cons:**
- **More Boilerplate:** Need to write SQL manually
- **No Migrations:** Need separate tool
- **Steeper Learning Curve:** More setup

#### Decision

**Recommendation:** Start with **GORM** for faster development, switch to **sqlc** for performance-critical queries.

```go
// GORM for simple CRUD
db.Where("code = ?", code).First(&material)

// sqlc for complex reports
report, err := queries.GetStockMovementReport(ctx, params)
```

---

### 5. Authentication: **JWT (JSON Web Tokens)**

#### Why JWT?

✅ **Pros:**
- **Stateless:** No server-side session storage
- **Scalable:** Works across multiple servers
- **Self-Contained:** All info in token
- **Cross-Domain:** CORS-friendly
- **Mobile-Friendly:** Easy to use in mobile apps

❌ **Cons:**
- **Token Size:** Larger than session IDs
- **Cannot Revoke:** Need blacklist or short expiry
- **Vulnerable if Exposed:** Store securely

#### Alternatives Considered

| Method | Pros | Cons | Why Not Chosen |
|--------|------|------|----------------|
| **Session Cookies** | Secure, server-controlled, can revoke | Needs session store (Redis), CSRF protection | Not stateless, harder to scale |
| **OAuth2** | Industry standard, supports third-party login | Complex setup, overkill for internal apps | Too complex for this use case |
| **API Keys** | Simple, easy to implement | Hard to manage, no expiry, less secure | Need user-specific auth |

**Decision:** JWT provides the best balance of security, scalability, and simplicity.

**Implementation:**
```go
// JWT payload
type JWTClaims struct {
    UserID int64  `json:"user_id"`
    Role   string `json:"role"`
    jwt.StandardClaims
}

// Expiry: 24 hours
// Refresh token: 7 days
```

---

### 6. Validation: **go-playground/validator**

#### Why validator?

✅ **Pros:**
- **Struct Tags:** Declarative validation
- **Custom Validators:** Extensible
- **Error Messages:** Detailed validation errors
- **Performance:** Fast
- **Widely Used:** De facto standard in Go

```go
type CreateMaterialRequest struct {
    Code        string `json:"code" binding:"required,min=3,max=50"`
    TradingName string `json:"trading_name" binding:"required,max=255"`
    Unit        string `json:"unit" binding:"required,oneof=KG L PC BOX"`
}
```

---

### 7. Logging: **Zap** (Uber)

#### Why Zap?

✅ **Pros:**
- **Fast:** Blazing fast structured logging
- **Structured:** JSON output for log aggregation
- **Levels:** Debug, Info, Warn, Error, Fatal
- **Context:** Add fields to logs
- **Production-Ready:** Used by Uber

#### Alternative: **Logrus**

✅ **Pros:**
- **Simpler API:** Easier to use
- **Hooks:** Send logs to external services

❌ **Cons:**
- **Slower:** Zap is 4-10x faster

**Decision:** Zap for production performance, Logrus for simpler projects.

---

## II. FRONTEND STACK

### 1. Framework: **React 18**

#### Why React?

✅ **Pros:**
- **Popular:** Largest ecosystem, huge community
- **Component-Based:** Reusable UI components
- **Virtual DOM:** Efficient re-renders
- **Hooks:** Modern state management
- **TypeScript Support:** Excellent type checking
- **React Query:** Powerful data fetching
- **Job Market:** Most in-demand frontend skill

❌ **Cons:**
- **JSX:** Learning curve for beginners
- **Boilerplate:** More setup than Vue
- **Rapid Changes:** Ecosystem evolves fast

#### Alternatives Considered

| Framework | Pros | Cons | Why Not Chosen |
|-----------|------|------|----------------|
| **Vue 3** | Easier to learn, cleaner syntax, Composition API | Smaller ecosystem, less jobs | React's ecosystem is more mature |
| **Angular** | Full framework, TypeScript native, enterprise-ready | Steep learning curve, verbose, heavy | Overkill, slower development |
| **Svelte** | No virtual DOM, faster, less code | Smaller community, fewer libraries | Riskier for long-term maintenance |
| **Solid.js** | Faster than React, reactive primitives | Very small community, immature ecosystem | Too new, lack of libraries |

**Decision:** React's ecosystem and community make it the safest choice for long-term maintenance.

---

### 2. Build Tool: **Vite**

#### Why Vite?

✅ **Pros:**
- **Fast:** Instant HMR (Hot Module Replacement)
- **Simple Config:** Minimal setup
- **Modern:** ESM-based
- **Plugins:** Rich plugin ecosystem
- **TypeScript:** First-class support
- **Production Build:** Optimized with Rollup

❌ **Cons:**
- **Newer:** Less mature than Webpack (but stable now)

#### Alternatives Considered

| Tool | Pros | Cons | Why Not Chosen |
|------|------|------|----------------|
| **Webpack** | Mature, powerful, huge ecosystem | Slow dev server, complex config | Vite is faster |
| **Parcel** | Zero config, fast | Less flexible than Vite/Webpack | Need more control |
| **Turbopack** | Next-gen bundler, very fast | Too new, unstable | Too risky |

**Decision:** Vite offers the best developer experience with minimal configuration.

---

### 3. Language: **TypeScript**

#### Why TypeScript?

✅ **Pros:**
- **Type Safety:** Catch errors at compile time
- **IntelliSense:** Better IDE autocomplete
- **Refactoring:** Safer code changes
- **Documentation:** Types as documentation
- **Large Adoption:** Industry standard
- **JavaScript Superset:** Use any JS library

❌ **Cons:**
- **Learning Curve:** Need to learn type system
- **Build Step:** Transpilation required
- **Verbose:** More code than JavaScript

#### Alternative: **JavaScript**

✅ **Pros:**
- **Simpler:** No type annotations
- **Faster:** No build step (with modern browsers)

❌ **Cons:**
- **No Type Safety:** Runtime errors
- **Harder Refactoring:** No compiler help

**Decision:** TypeScript's benefits far outweigh the learning curve for a long-term project.

---

### 4. Styling: **Tailwind CSS**

#### Why Tailwind?

✅ **Pros:**
- **Utility-First:** Fast development
- **Customizable:** Easy to match design system (Vuexy colors)
- **No CSS Files:** Style in JSX
- **PurgeCSS:** Small production bundle
- **Responsive:** Easy breakpoints
- **Dark Mode:** Built-in support

❌ **Cons:**
- **Verbose:** Long class names
- **Learning Curve:** Need to learn utilities

#### Alternatives Considered

| Library | Pros | Cons | Why Not Chosen |
|---------|------|------|----------------|
| **CSS Modules** | Scoped styles, no class name conflicts | More files, slower development | Need faster styling |
| **Styled Components** | CSS-in-JS, dynamic styles | Runtime overhead, larger bundle | Performance concerns |
| **Bootstrap** | Ready components, familiar | Generic look, heavy, less flexible | Need custom design |
| **Material-UI** | Google design, ready components | Opinionated, hard to customize | Design doesn't match Vuexy |

**Decision:** Tailwind provides the flexibility to match Vuexy design system while maintaining fast development.

---

### 5. State Management: **Zustand** + **React Query**

#### Why Zustand?

✅ **Pros:**
- **Simple:** No boilerplate (unlike Redux)
- **Small:** 1KB gzipped
- **Fast:** No context providers
- **TypeScript:** Great type inference
- **DevTools:** Redux DevTools compatible

#### Why React Query?

✅ **Pros:**
- **Server State:** Automatic caching, refetching, background updates
- **Pagination:** Built-in pagination support
- **Optimistic Updates:** Instant UI feedback
- **Error Handling:** Retry logic, error states
- **DevTools:** Inspect cache

#### Decision

**Split responsibilities:**
- **Zustand:** UI state (sidebar collapsed, theme, auth)
- **React Query:** Server state (API data, caching)

```typescript
// Zustand (UI state)
const useUIStore = create((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));

// React Query (Server state)
const { data, isLoading } = useQuery({
  queryKey: ['materials'],
  queryFn: materialsApi.list,
});
```

#### Alternatives Considered

| Library | Pros | Cons | Why Not Chosen |
|---------|------|------|----------------|
| **Redux** | Predictable, DevTools, huge ecosystem | Too much boilerplate, steep learning curve | Overkill for this project |
| **MobX** | Reactive, less boilerplate | Magical, harder to debug | Prefer explicit state updates |
| **Recoil** | Atomic state, concurrent mode ready | Experimental, smaller community | Too new |
| **Context API** | Built-in, no library | Performance issues, re-renders | Not suitable for frequent updates |

**Decision:** Zustand + React Query provide the best balance of simplicity and features.

---

### 6. Forms: **React Hook Form** + **Zod**

#### Why React Hook Form?

✅ **Pros:**
- **Performance:** Minimal re-renders
- **Simple API:** Easy to use
- **Validation:** Built-in validation
- **TypeScript:** Excellent type support
- **Small:** 9KB gzipped

#### Why Zod?

✅ **Pros:**
- **TypeScript-First:** Infer types from schema
- **Validation:** Runtime validation
- **Composable:** Reusable schemas
- **Error Messages:** Custom error messages

```typescript
// Schema
const materialSchema = z.object({
  code: z.string().min(3).max(50),
  trading_name: z.string().min(1).max(255),
  unit: z.enum(['KG', 'L', 'PC', 'BOX']),
});

type MaterialFormData = z.infer<typeof materialSchema>;

// Form
const { register, handleSubmit, formState: { errors } } = useForm<MaterialFormData>({
  resolver: zodResolver(materialSchema),
});
```

#### Alternatives Considered

| Library | Pros | Cons | Why Not Chosen |
|---------|------|------|----------------|
| **Formik** | Popular, mature, rich ecosystem | Performance issues, more complex | React Hook Form is faster |
| **Final Form** | Performance, subscription-based | Smaller community | Less popular |
| **Yup** (validation) | Popular, similar to Zod | Not TypeScript-first | Prefer Zod's type inference |

**Decision:** React Hook Form + Zod provide the best performance and type safety.

---

### 7. Tables: **TanStack Table (React Table v8)**

#### Why TanStack Table?

✅ **Pros:**
- **Headless:** Full control over UI
- **Performance:** Virtual scrolling for large datasets
- **Features:** Sorting, filtering, pagination, column resizing
- **TypeScript:** Excellent type support
- **Framework Agnostic:** Works with React, Vue, Solid

```typescript
const table = useReactTable({
  data: materials,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});
```

#### Alternatives Considered

| Library | Pros | Cons | Why Not Chosen |
|---------|------|------|----------------|
| **AG Grid** | Feature-rich, enterprise-grade | Heavy, expensive (commercial license) | Overkill, need flexibility |
| **Material-React-Table** | Built on TanStack, ready components | Less flexible | Prefer headless |
| **React Data Grid** | Performant, virtual scrolling | Less flexible than TanStack | Community smaller |

**Decision:** TanStack Table provides maximum flexibility while maintaining performance.

---

## III. DEVOPS & INFRASTRUCTURE

### 1. Containerization: **Docker**

#### Why Docker?

✅ **Pros:**
- **Consistency:** Same environment dev → prod
- **Isolation:** No dependency conflicts
- **Portability:** Run anywhere
- **Version Control:** Dockerfile in git
- **Fast Deployment:** Pull and run

#### Docker Compose for Local Development

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
  backend:
    build: ./backend
    depends_on: [postgres]
  frontend:
    build: ./frontend
    depends_on: [backend]
```

---

### 2. CI/CD: **GitHub Actions**

#### Why GitHub Actions?

✅ **Pros:**
- **Integrated:** Built into GitHub
- **Free:** 2000 minutes/month for private repos
- **Simple:** YAML configuration
- **Marketplace:** Pre-built actions

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-go@v4
      - run: go test ./...
```

#### Alternatives: GitLab CI, Jenkins, CircleCI

**Decision:** GitHub Actions is simpler and free for our use case.

---

### 3. Database Migrations: **golang-migrate**

#### Why golang-migrate?

✅ **Pros:**
- **Simple:** Up/down migrations
- **Database Agnostic:** Works with PostgreSQL, MySQL, etc.
- **CLI:** Easy to run migrations
- **Library:** Can embed in Go code

```bash
migrate -path ./migrations -database postgres://... up
```

---

## IV. OPTIONAL / NICE-TO-HAVE

### 1. Caching: **Redis** (if needed)

**Use Cases:**
- Session storage
- Cache frequently accessed data (materials list)
- Rate limiting
- Real-time features (pub/sub)

### 2. Message Queue: **RabbitMQ** or **Redis Pub/Sub** (if needed)

**Use Cases:**
- Async email sending
- Background jobs (report generation)
- Event-driven architecture

### 3. Monitoring: **Prometheus** + **Grafana** (if needed)

**Metrics:**
- API response time
- Error rate
- Database query time
- Active users

---

## V. SUMMARY TABLE

| Category | Choice | Alternative | Reason |
|----------|--------|-------------|--------|
| **Backend Language** | Go | Node.js, Python | Performance + Simplicity |
| **Web Framework** | Gin | Echo, Fiber | Fast + Popular |
| **Database** | PostgreSQL | MySQL, MongoDB | Advanced features |
| **ORM** | GORM (+ sqlc) | sqlx, sqlc | Developer productivity |
| **Auth** | JWT | Sessions | Stateless + Scalable |
| **Validation** | go-playground/validator | - | Industry standard |
| **Logging** | Zap | Logrus | Performance |
| **Frontend Framework** | React | Vue, Angular | Ecosystem + Jobs |
| **Build Tool** | Vite | Webpack | Speed + DX |
| **Language** | TypeScript | JavaScript | Type safety |
| **Styling** | Tailwind CSS | CSS Modules | Flexibility |
| **State (UI)** | Zustand | Redux | Simplicity |
| **State (Server)** | React Query | SWR | Features |
| **Forms** | React Hook Form + Zod | Formik + Yup | Performance |
| **Tables** | TanStack Table | AG Grid | Flexibility |
| **Containerization** | Docker | - | Industry standard |
| **CI/CD** | GitHub Actions | GitLab CI | Integration |
| **Migrations** | golang-migrate | - | Simplicity |

---

## VI. LONG-TERM CONSIDERATIONS

### Scalability
- **Horizontal Scaling:** Add more Go servers behind load balancer
- **Database:** PostgreSQL read replicas for reports
- **Caching:** Redis for hot data

### Maintenance
- **Go:** Long-term support, backward compatibility
- **React:** Large community, frequent updates
- **PostgreSQL:** Proven reliability

### Team
- **Go:** Easier to hire (growing popularity)
- **React:** Largest talent pool
- **TypeScript:** Increasingly required skill

### Cost
- **Open Source:** All tools are free
- **Hosting:** Can run on cheap VPS ($20-50/month)
- **Scaling:** Pay as you grow

---

Đây là toàn bộ Tech Stack Decisions! Có câu hỏi gì không?
