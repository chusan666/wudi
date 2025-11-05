# Docker Deployment Stack

This repository contains a comprehensive Docker deployment stack for a monorepo application with Next.js frontend, Bun + Hono backend, PostgreSQL, Redis, and Playwright support.

## 🚀 Quick Start

```bash
# Clone and set up
git clone <repository-url>
cd <repository-name>

# Start all services
make up

# Access applications
# Web: http://localhost:3000
# API: http://localhost:3001
```

## 📁 Project Structure

```
├── apps/
│   ├── api/                 # Bun + Hono API with Playwright
│   │   ├── Dockerfile       # Multi-stage build with browser dependencies
│   │   └── src/
│   │       ├── index.ts     # API server
│   │       └── worker.ts    # Background worker
│   └── web/                 # Next.js frontend
│       ├── Dockerfile       # Multi-stage build with non-root user
│       └── src/
├── k8s/                     # Kubernetes manifests
│   └── deployment.yml       # Complete K8s setup
├── .github/workflows/       # CI/CD pipelines
│   └── ci-cd.yml           # GitHub Actions workflow
├── docker-compose.yml       # Development and production setup
├── docker-compose.test.yml  # Testing environment
├── Makefile                 # Convenient commands
├── DEPLOYMENT.md           # Comprehensive deployment guide
├── .env.production.example  # Production environment template
└── .env.staging.example     # Staging environment template
```

## 🐳 Docker Services

### Core Services
- **web**: Next.js application (Node.js 20 Alpine)
- **api**: Bun + Hono API with Playwright support
- **postgres**: PostgreSQL 16 database
- **redis**: Redis 7 cache and session store

### Optional Services
- **worker**: Background job processor (uses same image as API)

## 🔧 Environment Configuration

### Development
```bash
cp .env.example .env.local
# Edit .env.local with your values
make dev
```

### Production
```bash
cp .env.production.example .env.production
# Edit .env.production with production values
make prod
```

### Staging
```bash
cp .env.staging.example .env.staging
# Edit .env.staging with staging values
make staging
```

## 🛠 Make Commands

```bash
# Development
make up              # Start development environment
make down            # Stop all services
make logs            # View all logs
make logs-api        # View API logs
make logs-web        # View web logs

# Building
make build           # Build all Docker images
make clean           # Remove containers, images, volumes

# Testing
make test            # Run tests in containers
make health          # Check health of all services

# Production
make prod            # Deploy to production
make staging         # Deploy to staging
make worker          # Start with worker profile

# Utilities
make shell-api       # Open shell in API container
make shell-web       # Open shell in web container
make backup-db       # Backup database
make restore-db      # Restore database
make stats           # View resource usage
make prune           # Clean up Docker resources
```

## 🔒 Security Features

- **Non-root users**: All containers run as non-root users
- **Multi-stage builds**: Minimal production images
- **Health checks**: Comprehensive health monitoring
- **Secrets management**: Environment-based secrets
- **Network isolation**: Private Docker networks
- **Resource limits**: CPU and memory constraints

## 🎭 Playwright Integration

The API service includes full Playwright support:

- **Browser engines**: Chromium, Firefox, WebKit
- **System dependencies**: All required libraries
- **Headless operation**: Optimized for server environments
- **Browser caching**: Persistent browser installations

### Running Playwright Tests

```bash
# Install browsers (if needed)
make install-browsers

# Run tests in container
docker-compose exec api npx playwright test

# Debug with headed mode
docker-compose exec -e PLAYWRIGHT_HEADLESS=false api npx playwright test --headed
```

## 📊 Monitoring & Observability

### Health Endpoints
- **Web**: `GET /` (basic health check)
- **API**: `GET /health` (detailed health status)
- **Database**: Postgres health check
- **Redis**: Redis ping check

### Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web

# Last N lines
docker-compose logs --tail=100 api
```

### Resource Usage
```bash
# Real-time stats
make stats

# Docker stats
docker stats --no-stream
```

## 🚀 Deployment Options

### 1. Docker Compose (Local/Single Host)
```bash
# Production deployment
docker-compose --env-file .env.production up -d
```

### 2. Kubernetes
```bash
# Deploy to Kubernetes
kubectl apply -f k8s/deployment.yml

# Check status
kubectl get pods -n monorepo-app
kubectl get services -n monorepo-app
```

### 3. Cloud Services
- **AWS ECS**: Use provided task definitions
- **Google Cloud Run**: Deploy container images
- **Azure Container Instances**: Simple container hosting

## 🔄 CI/CD Pipeline

The GitHub Actions workflow includes:

1. **Code Quality**: Linting, type checking, security scanning
2. **Testing**: Unit tests, integration tests
3. **Building**: Multi-stage Docker builds with caching
4. **Security**: Trivy vulnerability scanning
5. **Deployment**: Automated staging and production deployments
6. **Notification**: Deployment status notifications

### Pipeline Triggers
- **Push to main**: Full pipeline including production deployment
- **Push to develop**: Pipeline with staging deployment
- **Pull requests**: Testing and validation only

## 📈 Scaling Strategies

### Horizontal Scaling
```bash
# Scale API services
docker-compose up -d --scale api=3

# Scale Web services
docker-compose up -d --scale web=2
```

### Kubernetes Auto-scaling
- **HPA**: Horizontal Pod Autoscaler
- **Metrics**: CPU and memory-based scaling
- **Custom metrics**: Application-specific scaling

### Load Balancing
- **Docker Compose**: Service discovery
- **Kubernetes**: Service and Ingress
- **Cloud**: Managed load balancers

## 🛠 Development Workflow

### 1. Local Development
```bash
# Start development
make dev

# Make changes
# Rebuild and restart
docker-compose up --build -d

# View logs
make logs-api
```

### 2. Testing
```bash
# Run all tests
make test

# Run specific service tests
docker-compose exec api bun test
docker-compose exec web pnpm test
```

### 3. Staging
```bash
# Deploy to staging
make staging

# Verify deployment
curl https://staging.yourdomain.com/health
```

### 4. Production
```bash
# Deploy to production
make prod

# Monitor deployment
make logs
make health
```

## 🔧 Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check logs
docker-compose logs api

# Inspect container
docker inspect monorepo-api

# Check resource usage
docker stats
```

#### Database Connection Issues
```bash
# Test database connection
docker-compose exec postgres psql -U user -d mydb

# Check network
docker-compose exec api ping postgres
```

#### Playwright Issues
```bash
# Reinstall browsers
docker-compose exec api npx playwright install

# Check browser installation
docker-compose exec api npx playwright install-deps
```

### Recovery Procedures
```bash
# Full reset (WARNING: deletes data)
make clean

# Reset specific service
docker-compose down postgres
docker-compose volume rm monorepo_postgres-data
docker-compose up -d postgres
```

## 📋 Maintenance

### Regular Tasks
- Update Docker images regularly
- Rotate secrets periodically
- Monitor disk space usage
- Review and clean up unused resources
- Update dependencies

### Updates
```bash
# Pull latest images
docker-compose pull

# Rebuild with latest code
docker-compose build --no-cache

# Rolling restart
docker-compose up -d --no-deps api
```

## 🌐 Networking

### Service Communication
- **Web → API**: HTTP requests on port 3001
- **API → Database**: PostgreSQL connection
- **API → Cache**: Redis connection
- **Worker → Database**: Background job processing

### Port Mappings
- **3000**: Web application
- **3001**: API server
- **5432**: PostgreSQL (internal)
- **6379**: Redis (internal)

## 📦 Container Images

### API Image
- **Base**: oven/bun:1
- **Size**: ~500MB (with Playwright)
- **Features**: Playwright browsers, non-root user
- **Optimizations**: Multi-stage build, layer caching

### Web Image
- **Base**: node:20-alpine
- **Size**: ~200MB
- **Features**: Next.js standalone, non-root user
- **Optimizations**: Multi-stage build, static asset serving

## 🎯 Best Practices

### Security
- Use environment variables for secrets
- Run containers as non-root users
- Implement proper authentication
- Enable HTTPS in production
- Regular security updates

### Performance
- Use multi-stage builds
- Implement proper caching
- Monitor resource usage
- Optimize database queries
- Use CDN for static assets

### Reliability
- Implement health checks
- Set up proper logging
- Use persistent volumes for data
- Implement backup strategies
- Plan for disaster recovery

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Comprehensive deployment guide
- **[CONTRIBUTING.md](./CONTRIBUTING.md)**: Development guidelines
- **[SETUP_SUMMARY.md](./SETUP_SUMMARY.md)**: Project overview

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and support:

1. Check the documentation
2. Review troubleshooting section
3. Search existing issues
4. Create a new issue with details
5. Contact the development team

---

**Built with ❤️ using Docker, Next.js, Bun, Hono, PostgreSQL, Redis, and Playwright**