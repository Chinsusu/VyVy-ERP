# VyVy-ERP Development Guide

> Tài liệu chuẩn hóa cho dev, deploy, và test. Server này chỉ chạy dự án VyVy-ERP.

---

## 📋 Port Map

| Service          | Port  | Protocol | Mô tả                                      |
|------------------|-------|----------|---------------------------------------------|
| **Frontend Dev** | 5173  | HTTP     | Vite dev server (`npm run dev`)             |
| **Frontend Prod**| 3000  | HTTP     | Nginx container (Docker, `3000 → 80`)       |
| **Backend API**  | 8080  | HTTP     | Go/Gin API server                           |
| **PostgreSQL**   | 5432  | TCP      | Database (internal Docker network only)     |

> [!IMPORTANT]
> - **Development**: Truy cập `http://localhost:5173` (Vite proxy → backend:8080)
> - **Production**: Truy cập `http://localhost:3000` (Nginx reverse proxy → backend:8080)
> - PostgreSQL **không expose** ra host mặc định. Muốn truy cập từ pgAdmin/DBeaver, uncomment port trong `docker-compose.yml`.

---

## 🏗️ Kiến trúc

```
Browser → :5173 (Vite Dev) ──proxy──→ :8080 (Backend API) → :5432 (PostgreSQL)
Browser → :3000 (Nginx Prod) ─proxy──→ :8080 (Backend API) → :5432 (PostgreSQL)
```

### Docker Containers

| Container Name   | Image                     | Network               | Dependencies    |
|------------------|---------------------------|----------------------|-----------------|
| `vyvy_postgres`  | postgres:15-alpine        | vyvy-erp_vyvy-network | —               |
| `vyvy_backend`   | vyvy_erp_backend          | vyvy-erp_vyvy-network | postgres        |
| `vyvy_frontend`  | vyvy_erp_frontend         | vyvy-erp_vyvy-network | backend         |
| `vyvy_tunnel`    | cloudflare/cloudflared    | host                  | frontend        |

---

## 🚀 Cách Chạy

### Mode 1: Development (Khuyến nghị khi dev)

```bash
# 1. Start database + backend
docker-compose up -d postgres
docker run -d --name vyvy_backend \
  --network vyvy-erp_vyvy-network \
  -p 8080:8080 \
  -e DATABASE_HOST=postgres \
  -e DATABASE_PORT=5432 \
  -e DATABASE_USER=postgres \
  -e DATABASE_PASSWORD=postgres \
  -e DATABASE_NAME=erp_warehouse \
  -e DATABASE_SSLMODE=disable \
  -e JWT_SECRET=dev-secret-key-change-in-production-abcdefghijklmnopqrstuvwxyz123456 \
  -e GIN_MODE=release \
  -e PORT=8080 \
  vyvy_erp_backend

# 2. Start frontend dev server
cd frontend
npm run dev

# 3. Mở browser: http://localhost:5173
# Login: admin@vyvy.com / password123
```

### Mode 2: Production (Docker Compose)

```bash
# Build tất cả
docker-compose build --no-cache

# Start tất cả
docker-compose up -d

# Tạo admin user (lần đầu deploy)
docker exec -i vyvy_postgres psql -U postgres -d erp_warehouse < create_admin.sql

# Mở browser: http://localhost:3000 hoặc https://erp.eaktur.com
# Login: admin@vyvy.com / password123
```

### Khởi động lại backend (sau khi sửa code Go)

```bash
docker stop vyvy_backend && docker rm vyvy_backend
cd backend && docker build --no-cache -t vyvy_erp_backend .
# Chạy lại lệnh docker run ở trên
```

---

## 🔧 Config Files

| File                        | Mô tả                                     |
|-----------------------------|--------------------------------------------|
| `docker-compose.yml`        | Orchestration cho cả 3 services            |
| `frontend/vite.config.ts`   | Vite dev server + proxy `/api → :8080`     |
| `frontend/nginx.conf`       | Nginx reverse proxy cho production         |
| `frontend/Dockerfile`       | Multi-stage build: npm build → Nginx       |
| `backend/Dockerfile`        | Multi-stage build: go build → Alpine       |

### Vite Proxy (Development)

```typescript
// frontend/vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',  // Backend phải expose port 8080 ra host
      changeOrigin: true,
    },
  },
}
```

### Nginx Proxy (Production)

```nginx
# frontend/nginx.conf
location /api/ {
    proxy_pass http://backend:8080;  # 'backend' = Docker container name
}
```

---

## 🧪 Testing

### Chạy TypeScript Check (Frontend)

```bash
cd frontend
npx tsc -b          # Build check, sẽ báo lỗi nếu có TS errors
```

### Chạy Backend Tests

```bash
cd backend
go test ./... -v
```

### Kiểm tra API thủ công

```bash
# Login lấy token
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# Test Sales Channels API
curl -s http://localhost:8080/api/v1/sales-channels \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Test tạo Sales Channel mới
curl -s -X POST http://localhost:8080/api/v1/sales-channels \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Zalo","type":"social","is_active":true}' | python3 -m json.tool
```

---

## 🛑 Troubleshooting

### Port đã bị dùng

```bash
# Kiểm tra ai đang dùng port
ss -tlnp | grep -E "5173|8080|3000"

# Kill process dùng port 5173
kill -9 $(lsof -t -i :5173)
```

### Frontend Docker build lỗi TS6133

```bash
# Kiểm tra unused variables
cd frontend && npx tsc -b 2>&1 | grep TS6133

# Nếu có lỗi: xóa dòng import/declaration không dùng
```

### Backend container không connect được database

```bash
# Kiểm tra postgres container đang chạy
docker ps | grep postgres

# Kiểm tra network
docker network inspect vyvy-erp_vyvy-network
```

### Nginx lỗi "host not found in upstream"

```bash
# Backend container phải chạy trước và cùng Docker network
docker inspect vyvy_backend --format '{{.NetworkSettings.Networks}}'
```

---

## 📁 Cấu Trúc Dự Án

```
VyVy-ERP/
├── backend/                    # Go API server
│   ├── cmd/api/main.go        # Entry point
│   ├── internal/              # Business logic
│   ├── migrations/            # SQL migration files
│   └── Dockerfile
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── api/               # API client functions
│   │   ├── components/        # Reusable components
│   │   ├── hooks/             # React Query hooks
│   │   ├── locales/           # i18n (en, vi)
│   │   ├── pages/             # Page components
│   │   ├── types/             # TypeScript types
│   │   ├── lib/i18n.ts        # i18n config
│   │   └── App.tsx            # Routes
│   ├── vite.config.ts         # Dev server + proxy
│   ├── nginx.conf             # Production proxy
│   └── Dockerfile
├── docker-compose.yml          # Production orchestration
├── DEV_GUIDE.md               # ← Bạn đang đọc file này
└── CHANGELOG.md
```

---

## 🔐 Credentials (Development)

| Service    | Username | Password   |
|------------|----------|------------|
| App Login  | admin    | admin123   |
| PostgreSQL | postgres | postgres   |

---

**Last Updated:** 2026-02-12
