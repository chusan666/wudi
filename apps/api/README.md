# Note Comments API

A high-performance RESTful API for managing and retrieving comments for notes with nested replies, advanced caching, and comprehensive resilience features.

## Features

### Core Functionality
- **Nested Comments**: Support for multi-level comment replies
- **Pagination**: Efficient pagination through large comment threads
- **Filtering**: Filter comments by likes, replies presence, and more
- **Analytics**: Built-in sentiment analysis and fetch metadata
- **Type-safe**: Full TypeScript support with Zod validation

### Performance & Resilience
- **Redis Caching**: Advanced caching with stale-while-revalidate pattern
- **Background Refresh**: Automatic cache refresh via job queues
- **Rate Limiting**: Multi-tier rate limiting with IP and user-based controls
- **Circuit Breakers**: Fault tolerance with automatic recovery
- **Connection Pooling**: Optimized database and Redis connections
- **Observability**: OpenTelemetry metrics and distributed tracing
- **Graceful Shutdown**: Safe service termination with resource cleanup

## API Endpoints

### GET /api/notes/:id/comments

Retrieves comments for a specific note with nested replies and pagination support.

#### Parameters

##### Path Parameters
- `id` (string, required): The ID of the note

##### Query Parameters
- `page` (number, optional): Page number for pagination (default: 1)
- `pageSize` (number, optional): Number of comments per page (default: 20, max: 100)
- `order` (string, optional): Sort order by creation time (default: "desc", options: "asc", "desc")
- `minLikes` (number, optional): Filter comments with minimum number of likes
- `hasReplies` (boolean, optional): Filter comments that have replies (true) or don't have replies (false)
- `refresh` (boolean, optional): Force refresh from external source (default: false)

#### Response

```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "comment-123",
        "content": "This is a comment",
        "authorName": "John Doe",
        "authorAvatar": "https://example.com/avatar.jpg",
        "likeCount": 5,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "sentiment": "positive",
        "replies": [
          {
            "id": "reply-456",
            "content": "This is a reply",
            "authorName": "Jane Smith",
            "authorAvatar": null,
            "likeCount": 2,
            "createdAt": "2024-01-15T11:00:00Z",
            "updatedAt": "2024-01-15T11:00:00Z",
            "sentiment": "neutral",
            "replies": []
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 150,
      "totalPages": 8
    },
    "metadata": {
      "fetchedAt": "2024-01-15T12:00:00Z",
      "noteId": "note-123",
      "cacheHit": false
    }
  },
  "meta": {
    "timestamp": "2024-01-15T12:00:00Z",
    "requestId": "req-abc123"
  }
}
```

#### Response Fields

##### Comments Array
- `id`: Unique identifier for the comment
- `content`: The comment text content
- `authorName`: Name of the comment author
- `authorAvatar`: URL to author's avatar (optional)
- `likeCount`: Number of likes the comment has received
- `createdAt`: ISO timestamp when comment was created
- `updatedAt`: ISO timestamp when comment was last updated
- `sentiment`: Sentiment analysis result (positive, negative, neutral) (optional)
- `replies`: Array of nested replies (recursive structure)

##### Pagination Object
- `page`: Current page number
- `pageSize`: Number of comments per page
- `total`: Total number of comments
- `totalPages`: Total number of pages

##### Metadata Object
- `fetchedAt`: ISO timestamp when data was fetched
- `noteId`: ID of the note
- `cacheHit`: Whether data was served from cache

## Usage Examples

### Basic Usage

```bash
# Get all comments for a note
curl "http://localhost:3000/api/notes/note-123/comments"
```

### Pagination

```bash
# Get page 2 with 10 comments per page
curl "http://localhost:3000/api/notes/note-123/comments?page=2&pageSize=10"
```

### Filtering

```bash
# Get comments with at least 5 likes
curl "http://localhost:3000/api/notes/note-123/comments?minLikes=5"

# Get only comments that have replies
curl "http://localhost:3000/api/notes/note-123/comments?hasReplies=true"

# Sort by oldest first
curl "http://localhost:3000/api/notes/note-123/comments?order=asc"
```

### Cache Control

```bash
# Force refresh from external source
curl "http://localhost:3000/api/notes/note-123/comments?refresh=true"
```

### Combined Parameters

```bash
# Get page 1, 5 comments per page, with 3+ likes, that have replies, sorted by newest
curl "http://localhost:3000/api/notes/note-123/comments?page=1&pageSize=5&minLikes=3&hasReplies=true&order=desc"
```

## Error Handling

The API returns standardized error responses:

```json
{
  "success": false,
  "error": {
    "message": "Note with id invalid-id not found",
    "code": "NOT_FOUND"
  },
  "meta": {
    "timestamp": "2024-01-15T12:00:00Z",
    "requestId": "req-abc123"
  }
}
```

### Common Error Codes

- `NOT_FOUND` (404): Note not found
- `VALIDATION_ERROR` (400): Invalid query parameters
- `INTERNAL_ERROR` (500): Server error

## Caching

The API implements intelligent caching:

- **Cache TTL**: 5 minutes by default (configurable via `COMMENTS_CACHE_TTL` env var)
- **Cache Hit**: When data is served from cache, `metadata.cacheHit` will be `true`
- **Force Refresh**: Use `?refresh=true` to bypass cache and fetch fresh data
- **Background Refresh**: Data is automatically refreshed when stale

## Rate Limiting

Currently no rate limiting is implemented, but it's recommended to add rate limiting for production use.

## Development

### Setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Generate Prisma client
pnpm --filter api prisma generate

# Run database migrations
pnpm --filter api prisma migrate dev

# Start development server
pnpm dev
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test --coverage

# Run specific test file
pnpm test comment.service.test.ts
```

### Environment Variables

```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/db
LOG_LEVEL=info
COMMENTS_CACHE_TTL=300
COMMENTS_REFRESH_INTERVAL=3600
```

## Architecture

The API follows a layered architecture:

- **Routes**: Define HTTP endpoints and route to controllers
- **Controllers**: Handle HTTP request/response and validation
- **Services**: Implement business logic and orchestration
- **Data Access**: Handle database operations and external integrations
- **Middleware**: Cross-cutting concerns (logging, error handling, etc.)

## Database Schema

### Comments Table

```sql
CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  note_id TEXT NOT NULL,
  parent_id TEXT,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  like_count INTEGER DEFAULT 0,
  sentiment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_fetched_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id)
);
```

## Performance & Monitoring

### Health Check

```bash
curl http://localhost:3000/health
```

Returns comprehensive health status including:
- Database connectivity
- Redis connectivity  
- Queue status
- Circuit breaker states
- Memory usage

### Metrics

```bash
curl http://localhost:3000/metrics
```

Prometheus-compatible metrics endpoint with:
- HTTP request metrics
- Cache performance
- Database query performance
- Queue statistics

### Performance Testing

```bash
# Run performance benchmarks
node scripts/performance-test.js

# Run k6 load tests
k6 run scripts/k6-test.js
```

### Rate Limiting

All endpoints are rate-limited by default:
- **Standard**: 100 requests per 15 minutes per IP
- **Crawler endpoints**: 10 requests per 15 minutes

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Window reset time

### Caching

The API uses Redis for intelligent caching:
- **TTL**: 5 minutes for fresh data
- **Stale-While-Revalidate**: 10 minutes additional for background refresh
- **Cache Invalidation**: Tag-based invalidation for consistency

## Configuration

See `.env.example` for all configuration options. Key performance settings:

```bash
# Redis
REDIS_URL=redis://localhost:6379

# Cache TTL (seconds)
COMMENTS_CACHE_TTL=300
CACHE_STALE_WHILE_REVALIDATE_TTL=600

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Circuit Breakers
CIRCUIT_BREAKER_TIMEOUT=30000
CIRCUIT_BREAKER_ERROR_THRESHOLD=5

# Database Pooling
PRISMA_CONNECTION_POOL_SIZE=10
PRISMA_QUERY_TIMEOUT=30000
```

## Documentation

- **[Performance Guide](docs/PERFORMANCE.md)**: Comprehensive performance and resilience documentation
- **[Grafana Dashboard](docs/grafana-dashboard.json)**: Pre-built monitoring dashboard

## Future Enhancements

- Real-time comment updates via WebSockets
- Advanced sentiment analysis with ML models
- Comment moderation and spam detection
- User authentication and authorization
- Comment editing and deletion
- Rich media support in comments
- Advanced analytics and reporting