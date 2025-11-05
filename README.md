# Xiaohongshu API

A complete monorepo for Xiaohongshu note data aggregation with Hono API, Playwright crawler, Prisma ORM, and Redis caching.

## 📋 Overview

This project provides a comprehensive API and data infrastructure with:

- **Hono API** - Lightweight, fast HTTP framework with layered architecture
- **Playwright Crawler** - Robust web crawling with anti-detection features
- **Prisma ORM** - Type-safe PostgreSQL database access
- **Redis Cache** - High-performance caching with TTL and namespacing
- **Docker Compose** - Local development environment
- **TypeScript** - Full type safety across the stack

## 🛠️ Tech Stack

- **Runtime**: Bun (v1.3+)
- **Framework**: Hono
- **Crawler**: Playwright with Chromium
- **ORM**: Prisma
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Package Manager**: pnpm (workspaces)
- **Language**: TypeScript (strict mode)
- **Testing**: Vitest with Bun

## ✅ Prerequisites

- [Bun](https://bun.sh/) (v1.0.0+)
- [pnpm](https://pnpm.io/) (v8.0.0+)
- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) (v18.0.0+)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
pnpm install:browsers
```

### 2. Start Services

```bash
pnpm docker:up
```

This starts PostgreSQL and Redis containers.

### 3. Configure Environment

```bash
cp .env.example .env
```

Default configuration:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appdb?schema=public"
REDIS_URL="redis://localhost:6379"
NODE_ENV="development"
```

### 4. Setup Database

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 5. Start Development Server

```bash
pnpm dev
```

API runs at http://localhost:3000

## 📁 Project Structure

```
.
├── apps/
│   └── api/                      # Hono API service
│       ├── src/
│       │   ├── routes/           # Route definitions
│       │   ├── controllers/      # Request handlers
│       │   ├── services/         # Business logic
│       │   ├── data-access/      # Data layer
│       │   ├── middleware/       # Cross-cutting concerns
│       │   ├── config/           # Configuration
│       │   ├── utils/            # Utilities
│       │   └── types/            # TypeScript types
│       └── package.json
├── packages/
│   ├── db/                       # Database package
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # Database schema
│   │   │   └── migrations/       # Migration history
│   │   └── src/
│   │       ├── index.ts          # Prisma client
│   │       ├── redis.ts          # Redis helpers
│   │       └── seed.ts           # Seed data
│   └── crawler/                  # Crawler package
│       ├── src/
│       │   ├── crawler/          # Crawler services
│       │   ├── browser/          # Browser management
│       │   ├── session/          # Session handling
│       │   ├── scheduler/        # Request scheduling
│       │   └── utils/            # Anti-detection, retry, etc.
│       └── examples/
├── docker-compose.yml
├── pnpm-workspace.yaml
└── package.json
```

## 🎯 Features

### API (@apps/api)
- Layered architecture (routes → controllers → services → data-access)
- Standardized JSON responses
- Global error handling
- Request ID tracking
- Structured logging with Pino
- Health checks

### Crawler (@xiaohongshu/crawler)
- 🎭 Playwright browser automation
- 🎨 Fingerprint rotation (User-Agent, viewport, device profiles)
- 🔄 Request scheduling with priority queuing
- ⚡ Rate limiting with configurable delays
- 🔁 Exponential backoff and circuit breaker
- 🛡️ Anti-detection techniques
- 🔐 Session and cookie management
- 📊 Structured logging and metrics
- 🌐 Proxy support

### Database (@repo/db)
- Type-safe Prisma client
- Comprehensive schema (Users, Notes, Statistics, Media, Comments)
- Redis caching with TTL strategies
- Migration management
- Seed scripts for testing

## 📊 Database Schema

### Core Models

**User** - User accounts and profiles
- id, email, username, name, avatar, bio
- timestamps

**Note** - Content items with publishing workflow
- id, title, content, slug, published
- authorId, tags, metadata
- publishedAt, timestamps

**NoteStatistics** - Engagement metrics
- noteId, viewCount, likeCount, shareCount, commentCount

**NoteMedia** - Media attachments
- noteId, url, type, mimeType, size, dimensions, alt, order

**Comment** - User comments with nested replies
- noteId, authorId, parentId, content

**CrawlerJob** - Background crawling tasks
- url, status, priority, attempts, error, result

**QueryLog** - API usage audit log
- query, params, duration, userId, ipAddress, userAgent

## 💻 API Usage

### Prisma Client

```typescript
import { prisma } from '@repo/db';

// Query with relations
const note = await prisma.note.findUnique({
  where: { id: noteId },
  include: {
    author: true,
    statistics: true,
    media: true
  }
});
```

### Redis Cache

```typescript
import { cache, noteCache, TTL } from '@repo/db/redis';

// Basic operations
await cache.set('key', data, { ttl: TTL.MEDIUM });
const value = await cache.get('key');

// Namespaced cache
await noteCache.set(noteId, noteData, { ttl: TTL.LONG });
const cached = await noteCache.get(noteId);
```

### Crawler

```typescript
import { XiaohongshuCrawler } from '@xiaohongshu/crawler';

const crawler = new XiaohongshuCrawler();
await crawler.initialize();

const result = await crawler.crawlNote(noteId);
console.log(result.data);
```

## 📝 Scripts

### Development
```bash
pnpm dev                  # Start API dev server
pnpm build                # Build all packages
pnpm test                 # Run all tests
```

### Database
```bash
pnpm db:generate          # Generate Prisma client
pnpm db:migrate           # Run migrations
pnpm db:seed              # Seed database
pnpm db:studio            # Open Prisma Studio (localhost:5555)
pnpm db:push              # Push schema changes (dev only)
```

### Docker
```bash
pnpm docker:up            # Start services
pnpm docker:down          # Stop services
pnpm docker:restart       # Restart services
pnpm docker:logs          # View logs
pnpm docker:clean         # Stop and remove volumes
```

### Setup
```bash
pnpm install:browsers     # Install Playwright browsers
```

## 🔧 Development

### Access Services

**Prisma Studio**: http://localhost:5555
```bash
pnpm db:studio
```

**PostgreSQL CLI**:
```bash
docker exec -it dev-postgres psql -U postgres -d appdb
```

**Redis CLI**:
```bash
docker exec -it dev-redis redis-cli
```

### Create Migration

After modifying `packages/db/prisma/schema.prisma`:
```bash
pnpm db:migrate
```

### Reset Database

```bash
pnpm docker:clean
pnpm docker:up
sleep 5
pnpm db:migrate
pnpm db:seed
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Test specific package
cd packages/crawler
bun test

# Test database connection
pnpm test:db

# Test Redis
pnpm test:redis
```

## 📚 Documentation

See individual package READMEs:
- [API Documentation](apps/api/README.md)
- [Crawler Documentation](packages/crawler/README.md)
- [Database Documentation](packages/db/README.md)

For detailed setup verification, see [QUICK_START.md](QUICK_START.md)

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## 📄 License

ISC
