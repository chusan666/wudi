# Search API Documentation

## Overview

The Search API provides keyword-driven search functionality for users and notes from Xiaohongshu (Little Red Book). It includes rate limiting, caching, and comprehensive logging.

## Base URL

```
http://localhost:3000
```

## Authentication

Currently, no authentication is required. Rate limiting is applied per IP address and keyword combination.

## Common Response Format

### Success Response

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    },
    "query": "search term",
    "searchTime": 150,
    "cached": false
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {...}
  }
}
```

## Rate Limiting

- **Limit**: 10 requests per minute per IP/keyword combination
- **Headers**: Rate limit information is included in response headers:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Unix timestamp when rate limit window resets

## Endpoints

### Search Users

Search for users by keyword.

**Endpoint**: `GET /api/search/users`

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | Yes | - | Search keyword (minimum 1 character) |
| `page` | integer | No | 1 | Page number (minimum 1) |
| `pageSize` | integer | No | 20 | Number of results per page (1-100) |
| `sort` | string | No | relevance | Sort order: relevance, date, popularity |

#### Example Request

```bash
curl "http://localhost:3000/api/search/users?q=fashion&page=1&pageSize=10&sort=relevance"
```

#### Response Data Structure

```json
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "username": "fashionista",
      "name": "Fashion Lover",
      "avatar": "https://example.com/avatar.jpg",
      "bio": "Fashion blogger and enthusiast",
      "followersCount": 15000,
      "notesCount": 234,
      "verified": true
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 500,
      "totalPages": 50,
      "hasNext": true,
      "hasPrev": false
    },
    "query": "fashion",
    "searchTime": 120,
    "cached": false
  }
}
```

### Search Notes

Search for notes/content by keyword.

**Endpoint**: `GET /api/search/notes`

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | Yes | - | Search keyword (minimum 1 character) |
| `page` | integer | No | 1 | Page number (minimum 1) |
| `pageSize` | integer | No | 20 | Number of results per page (1-100) |
| `sort` | string | No | relevance | Sort order: relevance, date, popularity |
| `topic` | string | No | - | Optional topic filter |

#### Example Request

```bash
curl "http://localhost:3000/api/search/notes?q=skincare&page=1&pageSize=10&sort=relevance&topic=beauty"
```

#### Response Data Structure

```json
{
  "success": true,
  "data": [
    {
      "id": "note_456",
      "title": "My Skincare Routine",
      "slug": "my-skincare-routine",
      "snippet": "...skincare routine that works amazing for my skin type...",
      "author": {
        "id": "author_789",
        "username": "beautyguru",
        "name": "Beauty Guru",
        "avatar": "https://example.com/author.jpg"
      },
      "tags": ["skincare", "beauty", "routine"],
      "stats": {
        "viewCount": 5000,
        "likeCount": 450,
        "shareCount": 89,
        "commentCount": 67
      },
      "publishedAt": "2024-01-15T10:30:00Z",
      "topic": "beauty"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 1000,
      "totalPages": 100,
      "hasNext": true,
      "hasPrev": false
    },
    "query": "skincare",
    "searchTime": 200,
    "cached": false
  }
}
```

## Health Check

### Health Status

Check the health status of the API and its dependencies.

**Endpoint**: `GET /health`

#### Response

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "services": {
      "database": {
        "status": "healthy",
        "responseTime": 5
      },
      "redis": {
        "status": "healthy"
      }
    }
  }
}
```

### Readiness Check

Check if the service is ready to handle requests.

**Endpoint**: `GET /ready`

#### Response

```json
{
  "success": true,
  "data": {
    "status": "ready",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "stats": {
      "users": 1000,
      "notes": 5000
    }
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_QUERY` | Query parameter is missing or invalid |
| `RATE_LIMIT_EXCEEDED` | Rate limit has been exceeded |
| `INTERNAL_ERROR` | Internal server error |
| `NOT_FOUND` | Endpoint not found |
| `HEALTH_CHECK_ERROR` | Health check failed |

## Caching

Search results are cached in Redis for 5 minutes (300 seconds) to improve performance and reduce load on upstream services. Cached responses include `"cached": true` in the metadata.

## Usage Examples

### Using curl

```bash
# Search for users
curl "http://localhost:3000/api/search/users?q=travel&pageSize=5"

# Search for notes with topic filter
curl "http://localhost:3000/api/search/notes?q=food&topic=recipes&page=2"

# Check rate limit headers
curl -I "http://localhost:3000/api/search/users?q=test"
```

### Using JavaScript

```javascript
// Search for users
const searchUsers = async (query, options = {}) => {
  const params = new URLSearchParams({
    q: query,
    page: options.page || 1,
    pageSize: options.pageSize || 20,
    sort: options.sort || 'relevance',
  });

  const response = await fetch(`http://localhost:3000/api/search/users?${params}`);
  const data = await response.json();
  
  console.log('Rate limit remaining:', response.headers.get('X-RateLimit-Remaining'));
  return data;
};

// Search for notes
const searchNotes = async (query, options = {}) => {
  const params = new URLSearchParams({
    q: query,
    page: options.page || 1,
    pageSize: options.pageSize || 20,
    sort: options.sort || 'relevance',
    ...(options.topic && { topic: options.topic }),
  });

  const response = await fetch(`http://localhost:3000/api/search/notes?${params}`);
  return response.json();
};
```

## Development

### Running the API

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test
```

### Environment Variables

See `.env.example` for required environment variables:

- `NODE_ENV`: Environment (development, production, test)
- `PORT`: Server port (default: 3000)
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `LOG_LEVEL`: Logging level (trace, debug, info, warn, error, silent)