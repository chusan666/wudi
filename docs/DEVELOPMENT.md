# KOL Analytics API - Development Guide

## Getting Started

### Prerequisites

- Node.js 18+ or Bun 1.3+
- PostgreSQL 15+
- Redis 7+
- pnpm 8+
- Docker & Docker Compose (optional)

### Local Development Setup

1. **Clone and Install Dependencies**
```bash
git clone <repository-url>
cd kol-analytics
pnpm install
```

2. **Environment Configuration**
```bash
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your local configuration
```

3. **Database Setup**
```bash
# Start PostgreSQL and Redis with Docker
docker-compose up -d postgres redis

# Run database migrations
cd apps/api
bunx prisma migrate dev
bunx prisma generate
```

4. **Start Development Server**
```bash
cd apps/api
bun dev
```

The API will be available at `http://localhost:3000`

### Development Commands

```bash
# Install dependencies
pnpm install

# Start development server with hot reload
pnpm dev

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Build for production
pnpm build

# Start production server
pnpm start

# Database operations
bunx prisma migrate dev    # Run migrations
bunx prisma studio         # Open database GUI
bunx prisma generate       # Generate client
```

## Architecture Overview

### Layered Architecture

The API follows a strict layered architecture pattern:

```
┌─────────────────┐
│     Routes      │  ← HTTP endpoints, validation
├─────────────────┤
│  Controllers    │  ← Request/response handling
├─────────────────┤
│    Services     │  ← Business logic implementation
├─────────────────┤
│  Data Access    │  ← Database, cache, external APIs
└─────────────────┘
```

### Directory Structure

```
src/
├── routes/          # Route definitions and validation
├── controllers/     # HTTP request/response handlers
├── services/        # Business logic implementation
├── data-access/     # Database, cache, crawler interfaces
├── middleware/      # Cross-cutting concerns
├── config/          # Configuration management
├── utils/           # Helper functions
└── types/           # TypeScript type definitions
```

## Key Concepts

### Error Handling

- **Global**: Use `app.onError()` for unhandled exceptions
- **Custom Error Classes**: Extend `AppError` for specific error types
- **Validation**: Use Zod schemas for request validation
- **Graceful Degradation**: Handle external service failures gracefully

### Caching Strategy

- **Multi-layer**: Memory → Redis → Database
- **TTL-based**: Different TTLs per endpoint
- **Invalidation**: Pattern-based cache invalidation
- **Fallback**: Serve stale data when cache fails

### Data Refresh Patterns

- **Auto-refresh**: Based on data age
- **Manual refresh**: Via cache invalidation endpoint
- **Background jobs**: For heavy data processing
- **Graceful failure**: Return cached/stale data on errors

## Database Schema

### Core Tables

- `kol_profiles`: Basic influencer information
- `kol_pricing`: Pricing and rate information
- `kol_campaigns`: Campaign history and performance
- `kol_audience`: Audience demographics and insights
- `kol_performance`: Content performance metrics
- `kol_conversion`: Conversion and ROI data
- `kol_marketing_index`: Marketing indices and trends

### Relationships

```
kol_profiles (1) ──────── (N) kol_pricing
       │
       ├─ (N) kol_campaigns
       ├─ (N) kol_audience
       ├─ (N) kol_performance
       ├─ (N) kol_conversion
       └─ (N) kol_marketing_index
```

## Crawler Integration

### Platform Support

- **Xiaohongshu**: Primary platform with full feature support
- **Douyin**: Planned integration
- **Bilibili**: Planned integration
- **Kuaishou**: Planned integration

### Authentication

- **Session Cookies**: For authenticated crawling
- **Credential Rotation**: Automatic session management
- **Rate Limiting**: Respect platform limits
- **Error Handling**: Graceful degradation on auth failures

### Data Extraction

```typescript
// Example crawler implementation
class XiaohongshuCrawler extends PlatformCrawler {
  async extractKolProfile(platformUserId: string) {
    return this.withPage(async (page) => {
      const url = `https://www.xiaohongshu.com/user/profile/${platformUserId}`;
      await page.goto(url, { waitUntil: 'networkidle' });
      
      return page.evaluate(() => ({
        username: document.querySelector('.username')?.textContent,
        followerCount: parseInt(document.querySelector('.followers')?.textContent || '0'),
        // ... more extraction logic
      }));
    });
  }
}
```

## Testing

### Test Structure

```
src/
├── routes/
│   └── kol.routes.test.ts
├── services/
│   └── kol.service.test.ts
├── middleware/
│   └── cache.test.ts
└── utils/
    └── response.test.ts
```

### Test Patterns

```typescript
// Service test example
describe('KolService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return cached profile data', async () => {
    // Arrange
    const mockProfile = { id: 'kol-123', username: 'test' };
    vi.mocked(redisClient.get).mockResolvedValue(mockProfile);

    // Act
    const result = await kolService.getProfile('kol-123');

    // Assert
    expect(result).toEqual(mockProfile);
    expect(redisClient.get).toHaveBeenCalledWith('kol:profile:kol-123');
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test --coverage

# Run tests in watch mode
pnpm test:watch

# Run specific test file
bun test src/services/kol.service.test.ts
```

## Performance Optimization

### Database Optimization

- **Indexes**: Strategic indexing on frequently queried fields
- **Connection Pooling**: Prisma connection management
- **Query Optimization**: Efficient queries with proper joins
- **Read Replicas**: For read-heavy workloads (future)

### Caching Optimization

- **Redis Clustering**: For high availability
- **Cache Warming**: Pre-populate frequently accessed data
- **Compression**: For large cached objects
- **Metrics**: Cache hit/miss ratio monitoring

### API Optimization

- **Response Compression**: Gzip for API responses
- **Pagination**: For large datasets
- **Field Selection**: Allow partial response fields
- **Batch Endpoints**: For multiple KOL data requests

## Monitoring and Observability

### Logging

- **Structured Logging**: JSON format with consistent fields
- **Log Levels**: Debug, Info, Warn, Error
- **Request Tracing**: Request ID propagation
- **Error Context**: Detailed error information

### Metrics

- **Response Times**: Endpoint performance
- **Error Rates**: Error frequency by type
- **Cache Performance**: Hit/miss ratios
- **Database Performance**: Query times and connection stats

### Health Checks

- **Basic Health**: Simple liveness check
- **Detailed Health**: Service dependency status
- **Graceful Degradation**: Continue operating with degraded services
- **Circuit Breakers**: Prevent cascading failures

## Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f api

# Scale the API
docker-compose up -d --scale api=3
```

### Environment Variables

Key environment variables for production:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
CRAWLER_USERNAME=...
CRAWLER_PASSWORD=...
CRAWLER_SESSION_COOKIES=...
```

### Security Considerations

- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Prevention**: Prisma ORM protection
- **Rate Limiting**: Prevent abuse and DoS attacks
- **CORS Configuration**: Proper cross-origin settings
- **Secrets Management**: Environment variables for sensitive data

## Contributing

### Code Style

- **TypeScript**: Strict mode enabled
- **Prettier**: Consistent formatting
- **ESLint**: Code quality rules
- **Conventional Commits**: Standardized commit messages

### Development Workflow

1. Create feature branch from `main`
2. Implement changes with tests
3. Run `pnpm test` and `pnpm build`
4. Submit pull request for review
5. Merge after approval

### Adding New Endpoints

1. **Define Types**: Add TypeScript types in `src/types/`
2. **Database Schema**: Add/update Prisma schema if needed
3. **Service Layer**: Implement business logic in `src/services/`
4. **Controller**: Add request handling in `src/controllers/`
5. **Routes**: Define endpoint with validation in `src/routes/`
6. **Tests**: Add comprehensive test coverage
7. **Documentation**: Update API documentation

## Troubleshooting

### Common Issues

**Database Connection Issues**
```bash
# Check database status
docker-compose logs postgres

# Test connection
bunx prisma db pull
```

**Cache Issues**
```bash
# Check Redis status
docker-compose logs redis

# Clear cache
redis-cli FLUSHALL
```

**Crawler Issues**
```bash
# Check crawler logs
docker-compose logs api | grep crawler

# Test crawler manually
bun -e "import('./src/data-access/crawler.ts').then(m => m.crawlerManager.initialize())"
```

### Performance Debugging

```bash
# Enable debug logging
DEBUG=* bun dev

# Profile memory usage
node --inspect bun dev

# Monitor database queries
DEBUG=prisma:query bun dev
```

## Additional Resources

- [Bun Documentation](https://bun.sh/docs)
- [Hono Framework](https://hono.dev/)
- [Prisma ORM](https://www.prisma.io/docs)
- [Redis Documentation](https://redis.io/documentation)
- [Playwright Documentation](https://playwright.dev/)