# Xiaohongshu API Service

A production-ready Hono-based API service for aggregating Xiaohongshu note data with intelligent caching and crawler integration.

## Features

- ✅ **Layered Architecture** - Clean separation of routes, controllers, services, and data access
- ✅ **Note Detail API** - Comprehensive endpoint with author, statistics, media, and tags
- ✅ **User Profile API** - User detail endpoint with statistics and certifications
- ✅ **User Notes API** - Paginated user notes with sorting options
- ✅ **Redis Caching** - Intelligent caching with stale-while-revalidate strategy
- ✅ **Playwright Crawler** - Automated data fetching from Xiaohongshu
- ✅ **Database Persistence** - PostgreSQL storage via Prisma ORM
- ✅ **Query Logging** - Automatic logging of all API requests
- ✅ **Error Handling** - Standardized error responses with proper status codes
- ✅ **Request Tracking** - Unique request IDs for debugging
- ✅ **Structured Logging** - Pino logger with pretty output in development
- ✅ **Type Safety** - Full TypeScript with strict mode
- ✅ **Health Checks** - Database and Redis connectivity monitoring

## Architecture

```
Request Flow:
Client → Route (Validation) → Controller → Service → Data Access → Response

Caching Strategy:
Cache Hit → Return immediately
Cache Miss → Check stale cache → Fetch fresh → Update cache
Crawler Failure → Database fallback
```

### Directory Structure

```
src/
├── config/              # Environment and logger configuration
│   ├── env.ts
│   └── logger.ts
├── middleware/          # Request processing middleware
│   ├── request-id.ts
│   └── logger.ts
├── routes/              # Route definitions
│   ├── health.route.ts
│   ├── note.route.ts
│   └── user.route.ts
├── controllers/         # Request handlers
│   ├── note.controller.ts
│   └── user.controller.ts
├── services/            # Business logic
│   ├── note.service.ts
│   └── user.service.ts
├── data-access/         # Data layer
│   ├── note.data-access.ts
│   ├── user.data-access.ts
│   └── crawler.data-access.ts
├── utils/               # Helper functions
│   └── response.ts
├── types/               # TypeScript types
│   ├── api.ts
│   ├── errors.ts
│   ├── note.ts
│   └── user.ts
├── app.ts               # Hono app configuration
└── index.ts             # Server entry point
```

## Quick Start

### Prerequisites

- Bun v1.0+
- PostgreSQL (via Docker)
- Redis (via Docker)

### Installation

```bash
# From project root
pnpm install

# Generate Prisma client
pnpm db:generate

# Start dependencies
pnpm docker:up

# Run migrations
cd packages/db
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appdb?schema=public" bun run prisma migrate deploy

# Seed database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appdb?schema=public" \
REDIS_URL="redis://localhost:6379" \
NODE_ENV="development" \
pnpm db:seed
```

### Development

```bash
# Start API server
cd apps/api
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appdb?schema=public" \
REDIS_URL="redis://localhost:6379" \
NODE_ENV="development" \
PORT="3000" \
bun run --hot src/index.ts
```

Server runs at http://localhost:3000

## API Endpoints

### Health Check
```bash
GET /health
```

Returns service health status including database and Redis connectivity.

### Get Note Detail
```bash
GET /api/notes/:id
```

Returns comprehensive note information:
- Text content
- Author details (username, name, avatar, bio)
- Statistics (views, likes, shares, comments)
- Media URLs with dimensions
- Tags/topics
- Publish timestamp

**Example:**
```bash
curl http://localhost:3000/api/notes/cmhlhzn020004g8dkwqyb0307
```

### Get User Profile
```bash
GET /api/users/:id
```

Returns comprehensive user profile:
- Basic profile (username, name, avatar, bio)
- Statistics (followers, following, notes, likes, collects)
- Certifications and location info

**Example:**
```bash
curl http://localhost:3000/api/users/cmhlhzmw30000g8dkku9kgbrt
```

### Get User Notes
```bash
GET /api/users/:id/notes?page=1&pageSize=20&sort=latest
```

Returns paginated list of user's notes with:
- Note summaries (title, cover, stats)
- Pagination metadata (total, pages, next cursor)
- Sorting options (latest, popular, oldest)

**Example:**
```bash
curl "http://localhost:3000/api/users/cmhlhzmw30000g8dkku9kgbrt/notes?page=1&pageSize=20&sort=latest"
```

**Response Format:**
See [API Documentation](./API_DOCUMENTATION.md) for detailed response schemas.

## Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/appdb?schema=public

# Redis
REDIS_URL=redis://localhost:6379

# Caching (optional)
CACHE_TTL_SHORT=300
CACHE_TTL_MEDIUM=1800
CACHE_TTL_LONG=3600
```

## Caching

The API implements an intelligent multi-layer caching strategy:

1. **Redis Cache** (Primary) - 1 hour TTL
2. **Stale Cache** - 1.5 hours TTL for stale-while-revalidate
3. **Database Fallback** - When crawler fails

### Cache Flow

```
Request → Check Redis
  ├─ Hit → Return cached data
  ├─ Miss
  │   ├─ Check Stale Cache
  │   │   ├─ Hit → Return stale + background refresh
  │   │   └─ Miss → Fetch fresh
  │   └─ Crawler
  │       ├─ Success → Persist to DB → Update cache
  │       └─ Failure → Database fallback → Cache with shorter TTL
```

## Testing

```bash
# Run tests
bun test

# Test specific endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/notes/{note-id}
curl http://localhost:3000/api/users/{user-id}
curl "http://localhost:3000/api/users/{user-id}/notes?page=1&pageSize=20&sort=latest"
```

## Query Logging

All API requests are logged to the `query_logs` table with:
- Query path
- Parameters
- Execution duration
- User information (if authenticated)
- IP address and user agent
- Timestamp

## Error Handling

Standardized error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-11-05T12:00:00.000Z"
  }
}
```

Status codes:
- `400` - Validation error
- `404` - Resource not found
- `500` - Server error

## Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Main Project README](../../README.md)
- [Contributing Guidelines](../../CONTRIBUTING.md)

## License

ISC
