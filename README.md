# Database Cache Stack

A monorepo setup with Prisma ORM for PostgreSQL and Redis for caching, built with Bun runtime.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Database Schema](#database-schema)
- [Usage](#usage)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Development](#development)

## 🎯 Overview

This project provides a complete database and caching infrastructure with:

- **Prisma ORM** configured for PostgreSQL with Bun runtime support
- **Redis** for caching with connection pooling and namespaced helpers
- **Type-safe** database access with auto-generated TypeScript types
- **Docker Compose** setup for local Postgres and Redis instances
- **Seed data** for development and testing

## 🛠️ Tech Stack

- **Runtime**: Bun
- **ORM**: Prisma
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Package Manager**: pnpm
- **Language**: TypeScript

## ✅ Prerequisites

Make sure you have the following installed:

- [Bun](https://bun.sh/) (v1.0.0 or higher)
- [pnpm](https://pnpm.io/) (v8.0.0 or higher)
- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)

## 🚀 Getting Started

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd <repository-name>

# Install dependencies
pnpm install
```

### 2. Start Database Services

Start PostgreSQL and Redis using Docker Compose:

```bash
docker-compose up -d
```

Verify services are running:

```bash
docker-compose ps
```

You should see both `dev-postgres` and `dev-redis` containers running.

### 3. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

The default configuration connects to the Docker containers:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appdb?schema=public"
REDIS_URL="redis://localhost:6379"
NODE_ENV="development"
```

### 4. Generate Prisma Client

Generate the Prisma Client for your schema:

```bash
pnpm db:generate
```

### 5. Run Migrations

Create the database schema:

```bash
pnpm db:migrate
```

This will:
- Create all tables with proper indexes
- Set up foreign key relationships
- Generate migration files in `packages/db/prisma/migrations/`

### 6. Seed the Database

Populate the database with sample data:

```bash
pnpm db:seed
```

This creates:
- 3 sample users
- 4 notes (3 published, 1 draft)
- Note statistics and media
- Comments with nested replies
- Crawler jobs in various states
- Query logs

### 7. Verify Setup

#### Test Database Connection

```bash
cd apps/api
bun run src/index.ts
```

You should see:
```
✅ Database connected successfully
✅ Redis connected successfully
📊 Database stats: 3 users, 4 notes
```

#### Test Redis Operations

```bash
cd packages/db
bun run src/test-redis.ts
```

This runs a comprehensive test suite for Redis operations including:
- Basic get/set operations
- TTL management
- Increment/decrement
- Namespaced caches
- Pattern deletion
- Raw Redis commands

## 📊 Database Schema

### Models

#### User
User accounts with authentication and profile information.

```typescript
{
  id: string
  email: string (unique)
  username: string (unique)
  name?: string
  avatar?: string
  bio?: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Note
Content items that can be published or kept as drafts.

```typescript
{
  id: string
  title: string
  content: string
  slug: string (unique)
  published: boolean
  authorId: string
  tags: string[]
  metadata?: Json
  publishedAt?: DateTime
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### NoteStatistics
Engagement metrics for notes.

```typescript
{
  id: string
  noteId: string (unique)
  viewCount: number
  likeCount: number
  shareCount: number
  commentCount: number
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### NoteMedia
Media attachments for notes.

```typescript
{
  id: string
  noteId: string
  url: string
  type: string
  mimeType?: string
  size?: number
  width?: number
  height?: number
  alt?: string
  order: number
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Comment
User comments on notes with support for nested replies.

```typescript
{
  id: string
  content: string
  noteId: string
  authorId: string
  parentId?: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### CrawlerJob
Background job tracking for web crawling tasks.

```typescript
{
  id: string
  url: string
  status: string
  priority: number
  attempts: number
  maxAttempts: number
  error?: string
  result?: Json
  metadata?: Json
  scheduledAt: DateTime
  startedAt?: DateTime
  completedAt?: DateTime
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### QueryLog
Audit log for database queries and API usage.

```typescript
{
  id: string
  query: string
  params?: Json
  duration: number
  userId?: string
  ipAddress?: string
  userAgent?: string
  timestamp: DateTime
  createdAt: DateTime
}
```

## 💻 Usage

### Prisma Client

```typescript
import { prisma, db } from '@repo/db';

// Query users
const users = await prisma.user.findMany();

// Create a note with relations
const note = await prisma.note.create({
  data: {
    title: 'Hello World',
    content: 'My first note',
    slug: 'hello-world',
    published: true,
    author: {
      connect: { id: userId }
    },
    tags: ['hello', 'world']
  },
  include: {
    author: true,
    statistics: true
  }
});

// Use helper functions
import { connectDatabase, healthCheck } from '@repo/db';

await connectDatabase();
const health = await healthCheck();
```

### Redis Cache

```typescript
import { cache, noteCache, TTL } from '@repo/db/redis';

// Basic operations
await cache.set('key', { data: 'value' }, { ttl: TTL.MEDIUM });
const value = await cache.get('key');
await cache.delete('key');

// Namespaced cache
await noteCache.set('note-1', noteData, { ttl: TTL.LONG });
const note = await noteCache.get('note-1');

// Advanced operations
await cache.increment('counter', 5);
await cache.expire('key', 3600);
const exists = await cache.exists('key');
const ttl = await cache.ttl('key');

// Pattern deletion
await cache.deletePattern('note:*');

// Custom namespace
import { CacheHelper } from '@repo/db/redis';
const myCache = new CacheHelper('custom-namespace');
```

### TTL Constants

```typescript
import { TTL } from '@repo/db/redis';

TTL.SHORT      // 300 seconds (5 minutes)
TTL.MEDIUM     // 1800 seconds (30 minutes)
TTL.LONG       // 3600 seconds (1 hour)
TTL.VERY_LONG  // 86400 seconds (24 hours)
```

## 📝 Scripts

### Root Level

```bash
pnpm db:migrate          # Run database migrations
pnpm db:migrate:deploy   # Deploy migrations (production)
pnpm db:seed             # Seed the database
pnpm db:studio           # Open Prisma Studio
pnpm db:generate         # Generate Prisma Client
```

### Package Level (packages/db)

```bash
cd packages/db
pnpm prisma:generate     # Generate Prisma Client
pnpm prisma:migrate      # Run migrations
pnpm prisma:studio       # Open Prisma Studio
pnpm seed                # Run seed script
```

### Docker Services

```bash
docker-compose up -d              # Start services
docker-compose down               # Stop services
docker-compose down -v            # Stop and remove volumes
docker-compose logs postgres      # View Postgres logs
docker-compose logs redis         # View Redis logs
docker-compose ps                 # Check service status
```

## 📁 Project Structure

```
.
├── apps/
│   └── api/                      # Backend API application
│       ├── src/
│       │   └── index.ts          # API entry point
│       └── package.json
├── packages/
│   └── db/                       # Database package
│       ├── prisma/
│       │   ├── schema.prisma     # Prisma schema definition
│       │   └── migrations/       # Migration history
│       ├── src/
│       │   ├── index.ts          # Prisma client export
│       │   ├── redis.ts          # Redis client utilities
│       │   ├── seed.ts           # Database seed script
│       │   └── test-redis.ts     # Redis smoke test
│       ├── package.json
│       └── tsconfig.json
├── docker-compose.yml            # Docker services definition
├── pnpm-workspace.yaml           # pnpm workspace config
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🔧 Development

### Access Prisma Studio

Prisma Studio provides a visual interface to view and edit your data:

```bash
pnpm db:studio
```

Opens at http://localhost:5555

### Access PostgreSQL

Connect directly to the database:

```bash
docker exec -it dev-postgres psql -U postgres -d appdb
```

### Access Redis CLI

Connect to Redis:

```bash
docker exec -it dev-redis redis-cli
```

### Reset Database

To completely reset your database:

```bash
# Stop services
docker-compose down -v

# Start fresh
docker-compose up -d

# Wait for services to be ready
sleep 5

# Recreate schema
pnpm db:migrate

# Reseed data
pnpm db:seed
```

### Create a New Migration

After modifying the schema:

```bash
pnpm db:migrate
# Enter a descriptive name when prompted
```

### Health Checks

Both services include health checks:

```bash
# Check if services are healthy
docker-compose ps

# Both should show "healthy" status
```

## 🧪 Testing

### Database Connection Test

```bash
cd apps/api
bun run src/index.ts
```

### Redis Connection Test

```bash
cd packages/db
bun run src/test-redis.ts
```

## 📦 Production Deployment

For production:

1. Update `DATABASE_URL` and `REDIS_URL` in your production environment
2. Run migrations:
   ```bash
   pnpm db:migrate:deploy
   ```
3. Generate Prisma Client:
   ```bash
   pnpm db:generate
   ```

## 🤝 Contributing

1. Make changes to the schema in `packages/db/prisma/schema.prisma`
2. Create a migration: `pnpm db:migrate`
3. Update seed data in `packages/db/src/seed.ts` if needed
4. Test your changes locally
5. Commit migration files along with your changes

## 📄 License

MIT
