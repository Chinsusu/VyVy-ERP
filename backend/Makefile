.PHONY: run build test migrate-up migrate-down migrate-create docker-build docker-up docker-down

# Development
run:
	go run cmd/api/main.go

# Build
build:
	go build -o bin/api cmd/api/main.go

# Testing
test:
	go test -v ./...

test-coverage:
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out

# Database migrations
migrate-up:
	migrate -path migrations -database "postgres://postgres:postgres@localhost:5432/erp_warehouse?sslmode=disable" up

migrate-down:
	migrate -path migrations -database "postgres://postgres:postgres@localhost:5432/erp_warehouse?sslmode=disable" down

migrate-create:
	@read -p "Enter migration name: " name; \
	migrate create -ext sql -dir migrations -seq $$name

# Docker
docker-build:
	docker build -t vyvy-erp-backend .

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f backend

# Dependencies
deps:
	go mod download
	go mod tidy

# Linting
lint:
	golangci-lint run
