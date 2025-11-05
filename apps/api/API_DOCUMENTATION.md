# API Documentation

## Base URL
```
http://localhost:3000
```

## Endpoints

### Health Check

#### GET /health

Check the health status of the API and its dependencies.

**Response**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": {
      "healthy": true,
      "userCount": 3,
      "noteCount": 4
    },
    "redis": {
      "healthy": true
    },
    "timestamp": "2024-11-05T12:00:00.000Z"
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-11-05T12:00:00.000Z"
  }
}
```

**Status Codes**
- `200` - Service is healthy
- `503` - Service is unhealthy

---

### Get Note Detail

#### GET /api/notes/:id

Returns comprehensive note information including text content, author details, statistics, media, topics, and publish time.

**Features:**
- Redis caching with configurable TTL
- Stale-while-revalidate strategy for optimal performance
- Automatic fallback to database on crawler failure
- Query logging with execution timing
- Automatic data normalization and persistence

**Path Parameters**

| Parameter | Type   | Required | Description           |
|-----------|--------|----------|-----------------------|
| id        | string | Yes      | The unique note ID    |

**Request Example**
```bash
curl http://localhost:3000/api/notes/note_123
```

**Response Example**
```json
{
  "success": true,
  "data": {
    "id": "note_123",
    "title": "Beautiful Sunset Photography Tips",
    "content": "Here are my top 10 tips for capturing stunning sunset photos...",
    "slug": "beautiful-sunset-photography-tips-note_123",
    "published": true,
    "tags": ["photography", "sunset", "tips", "nature"],
    "author": {
      "id": "user_456",
      "username": "photo_enthusiast",
      "name": "Jane Doe",
      "avatar": "https://example.com/avatars/user_456.jpg",
      "bio": "Professional photographer | Travel lover"
    },
    "statistics": {
      "viewCount": 15234,
      "likeCount": 892,
      "shareCount": 145,
      "commentCount": 67
    },
    "media": [
      {
        "id": "media_789",
        "url": "https://example.com/images/sunset1.jpg",
        "type": "image",
        "mimeType": "image/jpeg",
        "width": 1920,
        "height": 1080,
        "order": 0
      },
      {
        "id": "media_790",
        "url": "https://example.com/images/sunset2.jpg",
        "type": "image",
        "mimeType": "image/jpeg",
        "width": 1920,
        "height": 1080,
        "order": 1
      }
    ],
    "publishedAt": "2024-01-15T08:30:00.000Z",
    "createdAt": "2024-01-15T08:25:00.000Z",
    "updatedAt": "2024-01-15T08:30:00.000Z"
  },
  "meta": {
    "requestId": "req_xyz789",
    "timestamp": "2024-11-05T12:00:00.000Z",
    "duration": 150
  }
}
```

**Status Codes**
- `200` - Success
- `400` - Invalid note ID format
- `404` - Note not found
- `500` - Internal server error (crawler failure, database error, etc.)

**Error Response Example**
```json
{
  "success": false,
  "error": {
    "message": "Note with identifier 'invalid_id' not found",
    "code": "NOT_FOUND"
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-11-05T12:00:00.000Z"
  }
}
```

---

## Caching Strategy

The Note Detail API implements an intelligent caching strategy:

### Cache Layers
1. **Redis Cache** (Primary) - TTL: 1 hour
2. **Stale Cache** - TTL: 1.5 hours
3. **Database Fallback** - When crawler fails

### Cache Flow

```
Request → Check Cache
    ├─ Cache Hit → Return cached data
    ├─ Cache Miss
    │   ├─ Check Stale Cache
    │   │   ├─ Stale Hit → Return stale data + trigger background refresh
    │   │   └─ Stale Miss → Fetch fresh data
    │   └─ Crawler Fetch → Persist to DB → Update Cache
    └─ Crawler Failure → Database Fallback
```

### Cache TTLs
- **SHORT**: 5 minutes (300s)
- **MEDIUM**: 30 minutes (1800s)
- **LONG**: 1 hour (3600s)
- **VERY_LONG**: 24 hours (86400s)

---

## Query Logging

Every API request is logged to the `query_logs` table with:

- **query**: The API endpoint called
- **params**: Request parameters (note ID, etc.)
- **duration**: Execution time in milliseconds
- **userId**: User ID (if authenticated)
- **ipAddress**: Client IP address
- **userAgent**: Client user agent
- **timestamp**: Request timestamp

---

## Data Flow

```
Client Request
    ↓
Route Validation (Zod)
    ↓
Controller
    ↓
Service Layer
    ├─ Check Cache
    ├─ Crawler (if needed)
    ├─ Data Normalization
    ├─ Database Persistence
    └─ Cache Update
    ↓
Response Formatting
    ↓
Client Response + Query Logging
```

---

## Error Handling

The API uses standardized error responses with appropriate HTTP status codes:

### Error Types

- **ValidationError** (400): Invalid input data
- **NotFoundError** (404): Resource not found
- **CrawlerError** (500): Web crawling failure
- **AppError** (500): General application error

All errors include:
- Clear error message
- Error code
- Request ID for debugging
- Timestamp

---

## Rate Limiting

The crawler implements rate limiting to respect Xiaohongshu's servers:

- **Concurrent Requests**: Maximum 2 concurrent crawls
- **Request Delays**: Configurable delays between requests
- **Circuit Breaker**: Automatic failure handling

---

## Development

### Running the API

```bash
# Start dependencies
pnpm docker:up

# Run migrations
pnpm db:migrate:deploy

# Seed database
pnpm db:seed

# Start API server
pnpm dev
```

### Testing

```bash
# Run all tests
pnpm test

# Test specific endpoint
curl http://localhost:3000/health
curl http://localhost:3000/api/notes/{note-id}
```

### Environment Variables

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/appdb?schema=public
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
CACHE_TTL_SHORT=300
CACHE_TTL_MEDIUM=1800
CACHE_TTL_LONG=3600
```

---

## OpenAPI Schema

For OpenAPI/Swagger documentation, see [openapi.yaml](./openapi.yaml) (to be generated).

---

## Support

For issues or questions, please refer to:
- [Main README](../../README.md)
- [Contributing Guidelines](../../CONTRIBUTING.md)
- [Quick Start Guide](../../QUICK_START.md)
