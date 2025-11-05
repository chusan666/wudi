# Docker Deployment Guide

This guide covers deploying the monorepo application using Docker and Docker Compose, including local development, staging, and production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Configuration](#environment-configuration)
4. [Local Development](#local-development)
5. [Staging Deployment](#staging-deployment)
6. [Production Deployment](#production-deployment)
7. [Service Management](#service-management)
8. [Health Checks](#health-checks)
9. [Monitoring and Logs](#monitoring-and-logs)
10. [Playwright Configuration](#playwright-configuration)
11. [Scaling Strategies](#scaling-strategies)
12. [Cloud Deployment](#cloud-deployment)
13. [Troubleshooting](#troubleshooting)

## Prerequisites

- Docker 20.10+ and Docker Compose 2.0+
- Node.js 18+ and pnpm 8+ (for local development)
- Make (optional, for convenient commands)
- Sufficient disk space for Docker images and volumes

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd <repository-name>

# Set up environment
cp .env.example .env.local

# Start all services
make up

# Or using Docker Compose directly
docker-compose up -d
```

Access your applications:
- **Web**: http://localhost:3000
- **API**: http://localhost:3001
- **API Health**: http://localhost:3001/health

## Environment Configuration

### Environment Files

The application supports multiple environment configurations:

- `.env.local` - Local development (copy from `.env.example`)
- `.env.staging` - Staging environment (copy from `.env.staging.example`)
- `.env.production` - Production environment (copy from `.env.production.example`)

### Key Environment Variables

#### Database Configuration
```bash
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=your_db_name
DATABASE_URL=postgresql://user:password@postgres:5432/dbname
```

#### Redis Configuration
```bash
REDIS_URL=redis://redis:6379
```

#### Application URLs
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

#### Security Secrets
Generate secure secrets with:
```bash
openssl rand -base64 32
```

Required secrets:
- `JWT_SECRET` - For JWT token signing
- `SESSION_SECRET` - For session management
- `ENCRYPTION_KEY` - For data encryption

## Local Development

### Using Make Commands

```bash
# Start development environment
make dev

# View logs
make logs

# Stop services
make down

# Clean up everything
make clean
```

### Manual Docker Compose

```bash
# Start with custom environment file
docker-compose --env-file .env.local up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Development Workflow

1. Make changes to your code
2. Rebuild and restart services:
   ```bash
   docker-compose up --build -d
   ```
3. View logs to debug issues:
   ```bash
   docker-compose logs -f api
   docker-compose logs -f web
   ```

## Staging Deployment

### Environment Setup

```bash
# Create staging environment file
cp .env.staging.example .env.staging

# Edit with staging-specific values
nano .env.staging
```

### Deploy to Staging

```bash
# Deploy using Make
make staging

# Or using Docker Compose
docker-compose --env-file .env.staging up -d
```

### Staging Considerations

- Use staging-specific database credentials
- Configure staging URLs (e.g., `staging.yourdomain.com`)
- Enable debug logging for troubleshooting
- Test with realistic data volumes

## Production Deployment

### Environment Setup

```bash
# Create production environment file
cp .env.production.example .env.production

# Edit with production values
nano .env.production
```

### Security Checklist

- [ ] Use strong, unique passwords for database
- [ ] Generate new secrets for JWT, sessions, encryption
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up firewall rules
- [ ] Enable audit logging
- [ ] Configure backup strategies

### Deploy to Production

```bash
# Deploy using Make
make prod

# Or using Docker Compose
docker-compose --env-file .env.production up -d
```

### Production Best Practices

1. **Resource Limits**: Configure memory and CPU limits
2. **Health Checks**: Ensure all health checks are properly configured
3. **Logging**: Centralize logs with proper rotation
4. **Monitoring**: Set up monitoring and alerting
5. **Backups**: Automate database backups
6. **Updates**: Plan for zero-downtime deployments

## Service Management

### Available Services

- **web**: Next.js frontend application
- **api**: Bun + Hono backend API
- **postgres**: PostgreSQL database
- **redis**: Redis cache and session store
- **worker**: Background job processor (optional)

### Service Dependencies

```
web → api → postgres
web → api → redis
api → postgres
api → redis
worker → postgres
worker → redis
```

### Managing Individual Services

```bash
# Restart specific service
docker-compose restart api

# Scale services
docker-compose up -d --scale api=3 --scale web=2

# Run commands in containers
docker-compose exec api bash
docker-compose exec web bash
```

## Health Checks

### Built-in Health Checks

All services include health checks:

- **Postgres**: `pg_isready` command
- **Redis**: `redis-cli ping` command  
- **API**: HTTP request to `/health` endpoint
- **Web**: HTTP request to root path

### Custom Health Checks

Monitor health status:

```bash
# Check all services
make health

# Check individual service
curl http://localhost:3001/health
```

### Health Check Configuration

Health checks are configured in `docker-compose.yml`:
- **Interval**: 30 seconds
- **Timeout**: 10 seconds  
- **Retries**: 3 attempts
- **Start Period**: 40 seconds

## Monitoring and Logs

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web

# Last 100 lines
docker-compose logs --tail=100 api
```

### Log Management

- Logs are stored in Docker's logging driver
- Configure log rotation in production
- Consider centralized logging (ELK stack, etc.)

### Monitoring Metrics

```bash
# Container resource usage
docker stats

# Detailed container info
docker inspect monorepo-api
```

## Playwright Configuration

### Browser Dependencies

The API Dockerfile includes all necessary system dependencies for Playwright:

- Browser engines (Chromium, Firefox, WebKit)
- System libraries for headless operation
- Font rendering support

### Environment Variables

```bash
PLAYWRIGHT_BROWSERS_PATH=/home/bunuser/.ms-playwright
PLAYWRIGHT_HEADLESS=true
```

### Running Playwright Tests

```bash
# Install browsers (if needed)
make install-browsers

# Run tests
docker-compose exec api npx playwright test

# Run with headed mode (for debugging)
docker-compose exec -e PLAYWRIGHT_HEADLESS=false api npx playwright test --headed
```

### Browser Debugging

For debugging Playwright tests:

```bash
# Open shell in API container
make shell-api

# Run tests with debugging
npx playwright test --debug
```

## Scaling Strategies

### Horizontal Scaling

```bash
# Scale API services
docker-compose up -d --scale api=3

# Scale Web services  
docker-compose up -d --scale web=2
```

### Load Balancing

For production deployments:

1. **API Load Balancer**: Use nginx, HAProxy, or cloud load balancer
2. **Database**: Use read replicas for read-heavy workloads
3. **Redis**: Use Redis Cluster for high availability

### Resource Optimization

Monitor and optimize:
- Memory usage per container
- CPU utilization
- Database connection pooling
- Redis memory usage

## Cloud Deployment

### AWS ECS

1. **Push images to ECR**
2. **Create ECS task definitions**
3. **Configure ECS services**
4. **Set up Application Load Balancer**

### Kubernetes

1. **Create Docker registry secret**
2. **Deploy ConfigMaps and Secrets**
3. **Apply Kubernetes manifests**
4. **Configure Ingress and Services**

Example Kubernetes deployment snippet:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: your-registry/api:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
```

### Google Cloud Run

1. **Build and push images to GCR**
2. **Deploy to Cloud Run**
3. **Configure environment variables**
4. **Set up traffic management**

## Troubleshooting

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

# Check network connectivity
docker-compose exec api ping postgres
```

#### Playwright Browser Issues

```bash
# Reinstall browsers
docker-compose exec api npx playwright install

# Check browser installation
docker-compose exec api npx playwright install-deps

# Test browser launch
docker-compose exec api npx playwright install --with-deps
```

### Performance Issues

```bash
# Monitor resource usage
docker stats --no-stream

# Check database performance
docker-compose exec postgres psql -U user -d mydb -c "SELECT * FROM pg_stat_activity;"

# Analyze slow queries
docker-compose exec postgres psql -U user -d mydb -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

### Recovery Procedures

```bash
# Full reset (WARNING: deletes all data)
make clean

# Reset specific service
docker-compose down postgres
docker-compose volume rm monorepo_postgres-data
docker-compose up -d postgres

# Restore from backup
make restore-db
```

## Security Considerations

### Container Security

- Run containers as non-root users
- Use minimal base images
- Regular security scanning
- Keep dependencies updated

### Network Security

- Use private networks
- Configure firewall rules
- Enable TLS/SSL
- Implement rate limiting

### Data Security

- Encrypt sensitive data at rest
- Use connection encryption
- Implement proper access controls
- Regular security audits

## Backup and Recovery

### Database Backups

```bash
# Create backup
make backup-db

# Manual backup
docker-compose exec postgres pg_dump -U user mydb > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U user mydb < backup.sql
```

### Application State Backup

- Backup environment files
- Document configuration changes
- Version control deployment manifests
- Test recovery procedures

## Maintenance

### Regular Tasks

- Update Docker images
- Rotate secrets
- Clean up unused resources
- Monitor disk space
- Review logs for errors

### Updates and Upgrades

```bash
# Pull latest images
docker-compose pull

# Rebuild with latest code
docker-compose build --no-cache

# Rolling restart
docker-compose up -d --no-deps api
```

## Support

For issues and questions:

1. Check this documentation
2. Review service logs
3. Consult troubleshooting section
4. Create an issue in the repository
5. Contact the development team