# Search API

A keyword-driven search API for Xiaohongshu (Little Red Book) users and notes, built with Hono, TypeScript, Prisma, and Redis.

## Features

- 🔍 **User Search**: Search for users by keyword with pagination and sorting
- 📝 **Note Search**: Search for notes/content with optional topic filtering
- 🚦 **Rate Limiting**: Per IP/keyword rate limiting to prevent abuse
- 💾 **Caching**: Redis-based caching with configurable TTL
- 📊 **Logging**: Comprehensive search query logging
- 🏥 **Health Checks**: Database and Redis health monitoring
- 📖 **API Documentation**: Full OpenAPI/Swagger documentation
- 🧪 **Testing**: Unit and integration tests with Vitest

## Tech Stack

- **Runtime**: Bun
- **Framework**: Hono (lightweight web framework)
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Validation**: Zod
- **Logging**: Pino
- **Testing**: Vitest
- **Language**: TypeScript

## Quick Start

### Prerequisites

- Node.js 18+
- Bun
- Docker & Docker Compose
- PostgreSQL
- Redis

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start services with Docker**
   ```bash
   pnpm docker:up
   ```

5. **Run database migrations**
   ```bash
   pnpm db:migrate
   ```

6. **Seed the database (optional)**
   ```bash
   pnpm db:seed
   ```

7. **Start the API server**
   ```bash
   pnpm api:dev
   ```

The API will be available at `http://localhost:3000`.

## API Endpoints

### Search Users
```
GET /api/search/users?q=keyword&page=1&pageSize=20&sort=relevance
```

### Search Notes
```
GET /api/search/notes?q=keyword&page=1&pageSize=20&sort=relevance&topic=optional
```

### Health Check
```
GET /health
GET /ready
```

## API Documentation

See [API_DOCS.md](./API_DOCS.md) for detailed API documentation including:

- Request/response formats
- Parameter descriptions
- Error codes
- Usage examples
- Rate limiting details

## Development

### Scripts

```bash
# Development
pnpm api:dev              # Start development server
pnpm api:test             # Run tests
pnpm api:test:watch       # Run tests in watch mode

# Database
pnpm db:migrate           # Run migrations
pnpm db:studio            # Open Prisma Studio
pnpm db:seed              # Seed database

# Docker
pnpm docker:up            # Start services
pnpm docker:down          # Stop services
pnpm docker:logs          # View logs
```

### Project Structure

```
apps/api/src/
├── config/           # Configuration (env, logger)
├── controllers/      # Request handlers
├── data-access/      # Data layer (crawler, database)
├── middleware/       # Express middleware
├── routes/          # Route definitions
├── services/        # Business logic
├── types/           # TypeScript types
├── utils/           # Helper functions
├── app.ts           # Main application
└── index.ts         # Entry point
```

### Testing

```bash
# Run all tests
pnpm api:test

# Run tests in watch mode
pnpm api:test:watch

# Run with coverage
pnpm api:test --coverage
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection | - |
| `REDIS_URL` | Redis connection | - |
| `LOG_LEVEL` | Logging level | `info` |

### Search Configuration

- **Cache TTL**: 5 minutes (300 seconds)
- **Rate Limit**: 10 requests per minute per IP/keyword
- **Max Page Size**: 100 results per page
- **Default Page Size**: 20 results per page

## Architecture

The API follows a layered architecture pattern:

1. **Routes**: Define HTTP endpoints and route to controllers
2. **Controllers**: Handle HTTP requests/responses and validation
3. **Services**: Implement business logic and orchestrate data access
4. **Data Access**: Handle database and external service interactions
5. **Middleware**: Cross-cutting concerns (logging, rate limiting, etc.)

## Caching Strategy

- **Cache Key Format**: `search:{type}:{query}:{page}:{pageSize}:{sort}[:{topic}]`
- **TTL**: 5 minutes for search results
- **Cache Invalidation**: Time-based expiration
- **Fallback**: Serve fresh data if cache fails

## Rate Limiting

- **Strategy**: Sliding window per IP/keyword combination
- **Storage**: Redis sorted sets
- **Limits**: 10 requests per minute
- **Headers**: Rate limit info included in responses
- **Fail Safe**: Allow requests if rate limiter fails

## Logging

- **Structured Logging**: JSON format with Pino
- **Request Tracking**: Unique request IDs
- **Search Analytics**: All searches logged to database
- **Development**: Pretty-printed logs
- **Production**: JSON logs for log aggregation

## Error Handling

- **Global Handler**: Centralized error handling
- **Standardized Format**: Consistent error response structure
- **Error Codes**: Machine-readable error codes
- **Development Details**: Stack traces in development mode

## Monitoring

### Health Checks

- **Database Health**: Connection and query performance
- **Redis Health**: Connection and basic operations
- **Application Health**: Overall service status

### Metrics

- Search query volume and performance
- Cache hit/miss ratios
- Rate limit statistics
- Error rates and types

## Deployment

### Docker

```bash
# Build image
docker build -t search-api .

# Run container
docker run -p 3000:3000 --env-file .env search-api
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.