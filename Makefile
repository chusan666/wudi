.PHONY: help build up down logs clean test lint format dev prod staging worker

# Default target
help:
	@echo "Available commands:"
	@echo "  build          - Build all Docker images"
	@echo "  up             - Start all services (development)"
	@echo "  down           - Stop all services"
	@echo "  logs           - Show logs for all services"
	@echo "  logs-api       - Show logs for API service"
	@echo "  logs-web       - Show logs for Web service"
	@echo "  clean          - Remove containers, images, and volumes"
	@echo "  test           - Run tests in containers"
	@echo "  lint           - Run linting in containers"
	@echo "  format         - Format code in containers"
	@echo "  dev            - Start development environment"
	@echo "  prod           - Start production environment"
	@echo "  staging        - Start staging environment"
	@echo "  worker         - Start services with worker profile"
	@echo "  shell-api      - Open shell in API container"
	@echo "  shell-web      - Open shell in Web container"
	@echo "  db-migrate     - Run database migrations"
	@echo "  db-seed        - Seed database with sample data"

# Build all Docker images
build:
	@echo "Building Docker images..."
	docker compose build

# Start all services (development)
up:
	@echo "Starting development environment..."
	docker compose up -d
	@echo "Services are starting..."
	@echo "Web: http://localhost:3000"
	@echo "API: http://localhost:3001"
	@echo "Postgres: localhost:5432"
	@echo "Redis: localhost:6379"

# Stop all services
down:
	@echo "Stopping all services..."
	docker compose down

# Show logs for all services
logs:
	docker compose logs -f

# Show logs for API service
logs-api:
	docker compose logs -f api

# Show logs for Web service
logs-web:
	docker compose logs -f web

# Clean up containers, images, and volumes
clean:
	@echo "Removing containers, images, and volumes..."
	docker compose down -v --rmi all

# Run tests in containers
test:
	@echo "Running tests..."
	docker compose -f docker-compose.test.yml up --build --abort-on-container-exit
	docker compose -f docker-compose.test.yml down -v

# Run linting in containers
lint:
	@echo "Running linting..."
	docker compose exec api bun run lint
	docker compose exec web pnpm run lint

# Format code in containers
format:
	@echo "Formatting code..."
	docker compose exec api bun run format
	docker compose exec web pnpm run format

# Start development environment
dev:
	@echo "Starting development environment..."
	cp .env.example .env.local || true
	docker compose --env-file .env.local up -d

# Start production environment
prod:
	@echo "Starting production environment..."
	docker compose --env-file .env.production up -d

# Start staging environment
staging:
	@echo "Starting staging environment..."
	docker compose --env-file .env.staging up -d

# Start services with worker profile
worker:
	@echo "Starting services with worker..."
	docker compose --profile worker up -d

# Open shell in API container
shell-api:
	docker compose exec api bash

# Open shell in Web container
shell-web:
	docker compose exec web bash

# Run database migrations
db-migrate:
	@echo "Running database migrations..."
	docker compose exec api bun run db:migrate

# Seed database with sample data
db-seed:
	@echo "Seeding database..."
	docker compose exec api bun run db:seed

# Health check for all services
health:
	@echo "Checking health of all services..."
	@curl -f http://localhost:3000/health || echo "Web service is not healthy"
	@curl -f http://localhost:3001/health || echo "API service is not healthy"
	@docker compose exec -T postgres pg_isready -U user || echo "Postgres is not ready"
	@docker compose exec -T redis redis-cli ping || echo "Redis is not ready"

# Install Playwright browsers (run if needed)
install-browsers:
	@echo "Installing Playwright browsers..."
	docker compose exec api npx playwright install

# Backup database
backup-db:
	@echo "Creating database backup..."
	docker compose exec -T postgres pg_dump -U user mydb > backup_$(shell date +%Y%m%d_%H%M%S).sql

# Restore database from backup
restore-db:
	@echo "Restoring database from backup..."
	@read -p "Enter backup file path: " backup_file; \
	docker compose exec -T postgres psql -U user mydb < $$backup_file

# View resource usage
stats:
	@echo "Container resource usage:"
	docker stats --no-stream

# Prune unused Docker resources
prune:
	@echo "Pruning unused Docker resources..."
	docker system prune -f