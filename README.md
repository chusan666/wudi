# 🚀 KOL Analytics APIs

Advanced marketing endpoints providing comprehensive influencer analytics covering profiles, pricing, audience demographics, content performance, conversion metrics, and marketing indices.

## ✨ Features

### 🎯 Core Analytics Endpoints
- **Profile Management**: Comprehensive influencer dossiers with certifications and categories
- **Pricing Intelligence**: Service rates, historical pricing, and cooperation history
- **Audience Insights**: Demographics, interests, engagement patterns, and growth trends
- **Performance Metrics**: Content KPIs, engagement rates, and reach analytics
- **Conversion Tracking**: Campaign metrics, ROI analysis, and attribution models
- **Marketing Indices**: RED index, trend data, and competitive benchmarking

### 🏗️ Architecture Highlights
- **Layered Architecture**: Clean separation of concerns with Routes → Controllers → Services → Data Access
- **Type-Safe**: Full TypeScript implementation with strict mode
- **High Performance**: Multi-layer caching with Redis and intelligent TTL strategies
- **Scalable Crawler**: Playwright-based data extraction with credential management
- **Robust Error Handling**: Graceful degradation and comprehensive error responses
- **Observability**: Structured logging, health checks, and performance monitoring

### 🔧 Technology Stack
- **Runtime**: Bun (v1.3+) - Ultra-fast JavaScript runtime
- **Framework**: Hono - Lightweight, performant web framework
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for high-performance caching
- **Crawler**: Playwright for reliable web scraping
- **Validation**: Zod for runtime type validation
- **Testing**: Vitest with comprehensive test coverage
- **Packaging**: pnpm workspaces for monorepo management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun 1.3+
- PostgreSQL 15+
- Redis 7+
- pnpm 8+
- Docker & Docker Compose (optional)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd kol-analytics
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment**
```bash
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your configuration
```

4. **Start services with Docker**
```bash
docker-compose up -d postgres redis
```

5. **Run database migrations**
```bash
./scripts/migrate-db.sh
```

6. **Start development server**
```bash
pnpm dev
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Core Endpoints

| Endpoint | Description | Cache TTL |
|----------|-------------|-----------|
| `GET /api/kol/:id/profile` | Influencer profile and recent activity | 1 hour |
| `GET /api/kol/:id/pricing` | Current rates and pricing history | 30 minutes |
| `GET /api/kol/:id/audience` | Audience demographics and insights | 2 hours |
| `GET /api/kol/:id/performance` | Content performance metrics | 30 minutes |
| `GET /api/kol/:id/conversion` | Conversion and campaign metrics | 1 hour |
| `GET /api/kol/:id/marketing-index` | Marketing indices and trends | 15 minutes |

### Example Requests

```bash
# Get KOL profile
curl "http://localhost:3000/api/kol/kol-123/profile"

# Get performance metrics for videos in last 30 days
curl "http://localhost:3000/api/kol/kol-123/performance?contentType=video&period=30d"

# Force refresh cached data
curl "http://localhost:3000/api/kol/kol-123/profile?refresh=true"

# Invalidate cache
curl -X POST "http://localhost:3000/api/kol/kol-123/refresh-cache"
```

### Response Format

All responses follow a consistent structure:

```json
{
  "success": true,
  "data": {
    // Endpoint-specific data
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "req_123456789",
    "cache": {
      "hit": true,
      "ttl": 3600
    }
  }
}
```

## 🏗️ Project Structure

```
kol-analytics/
├── apps/
│   └── api/                    # Main API application
│       ├── src/
│       │   ├── routes/          # Route definitions
│       │   ├── controllers/     # HTTP handlers
│       │   ├── services/        # Business logic
│       │   ├── data-access/     # Database, cache, crawler
│       │   ├── middleware/      # Cross-cutting concerns
│       │   ├── config/          # Configuration
│       │   ├── utils/           # Helper functions
│       │   └── types/           # TypeScript definitions
│       ├── prisma/              # Database schema
│       ├── tests/               # Test files
│       └── Dockerfile
├── docs/                        # Documentation
├── scripts/                     # Utility scripts
├── docker-compose.yml           # Development environment
├── package.json                 # Monorepo configuration
└── pnpm-workspace.yaml         # Workspace configuration
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test --coverage

# Run tests in watch mode
pnpm test:watch

# Run specific test file
bun test apps/api/src/services/kol.service.test.ts
```

### Test Structure

- **Unit Tests**: Service layer logic and utilities
- **Integration Tests**: API endpoints with mocked dependencies
- **E2E Tests**: Full request/response cycles (planned)

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run all services
docker-compose up -d

# Scale the API
docker-compose up -d --scale api=3

# View logs
docker-compose logs -f api
```

### Environment Variables

Key production variables:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
CRAWLER_USERNAME=your_username
CRAWLER_PASSWORD=your_password
```

## 📊 Monitoring & Observability

### Health Checks

- **Basic**: `GET /health` - Service availability
- **Detailed**: `GET /health/detailed` - Database, Redis, memory status

### Logging

Structured JSON logging with:
- Request tracking with unique IDs
- Performance metrics
- Error context and stack traces
- Component-level categorization

### Performance Monitoring

- Response time tracking
- Cache hit/miss ratios
- Database query performance
- Error rate monitoring

## 🔧 Configuration

### Cache Strategy

| Endpoint | TTL | Refresh Strategy |
|----------|-----|------------------|
| Profile | 1 hour | Auto-refresh when stale |
| Pricing | 30 min | Manual refresh available |
| Audience | 2 hours | Daily background refresh |
| Performance | 30 min | Real-time aggregation |
| Conversion | 1 hour | Campaign-based updates |
| Marketing Index | 15 min | Frequent trend updates |

### Crawler Configuration

- **Concurrent Requests**: Configurable (default: 3)
- **Request Delay**: Respect platform limits (default: 2s)
- **Timeout**: Per-request timeout (default: 30s)
- **Credential Rotation**: Secure session management
- **Error Handling**: Graceful degradation on failures

## 🤝 Contributing

### Development Workflow

1. Create feature branch from `main`
2. Implement changes with comprehensive tests
3. Ensure all tests pass: `pnpm test`
4. Run type checking: `pnpm build`
5. Submit pull request with detailed description

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Consistent code style
- **Prettier**: Automated formatting
- **Conventional Commits**: Standardized commit messages
- **Test Coverage**: Minimum 80% coverage required

### Adding New Features

1. **Define Types**: Add TypeScript interfaces in `src/types/`
2. **Update Schema**: Modify Prisma schema if needed
3. **Implement Service**: Add business logic in `src/services/`
4. **Create Controller**: Handle HTTP requests in `src/controllers/`
5. **Add Routes**: Define endpoints with validation in `src/routes/`
6. **Write Tests**: Comprehensive test coverage
7. **Update Documentation**: Keep API docs current

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: [docs/API.md](./docs/API.md)
- **Development Guide**: [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)
- **Issues**: GitHub Issues for bug reports and feature requests
- **Discussions**: GitHub Discussions for questions and community support

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core KOL analytics endpoints
- ✅ Multi-layer caching strategy
- ✅ Playwright-based crawler
- ✅ Comprehensive test coverage
- ✅ Docker deployment

### Phase 2 (Planned)
- 🔄 Additional platform support (Douyin, Bilibili, Kuaishou)
- 🔄 Real-time WebSocket updates
- 🔄 Advanced analytics dashboard
- 🔄 API rate limiting and authentication
- 🔄 Background job processing

### Phase 3 (Future)
- 📋 Machine learning predictions
- 📋 Advanced audience segmentation
- 📋 Competitive analysis tools
- 📋 Custom report generation
- 📋 Multi-tenant support

---

**Built with ❤️ using Bun, Hono, and modern TypeScript practices**