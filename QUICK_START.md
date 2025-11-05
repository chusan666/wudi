# Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

Install these if you haven't already:

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install pnpm
npm install -g pnpm
```

## Setup (First Time)

```bash
# 1. Install dependencies
pnpm install

# 2. Start Docker services
docker compose up -d

# 3. Wait for services to be ready (10 seconds)
sleep 10

# 4. Generate Prisma Client
pnpm db:generate

# 5. Run migrations
pnpm db:migrate

# 6. Seed the database
pnpm db:seed
```

## Verify Setup

```bash
# Test database connection
cd apps/api && bun run src/index.ts

# Test Redis connection
cd packages/db && bun run src/test-redis-simple.ts
```

## Daily Development

```bash
# Start services (if stopped)
docker compose up -d

# Open Prisma Studio to browse data
pnpm db:studio

# Run the API
cd apps/api && bun run src/index.ts
```

## Common Commands

```bash
# Database
pnpm db:migrate        # Create and run new migration
pnpm db:generate       # Regenerate Prisma Client
pnpm db:seed           # Reseed database
pnpm db:studio         # Browse data visually

# Docker
docker compose up -d   # Start services
docker compose down    # Stop services
docker compose logs    # View logs
docker compose ps      # Check status
```

## Project Structure

```
packages/db/           → Database package
├── prisma/
│   ├── schema.prisma  → Database schema (edit this!)
│   └── migrations/    → Migration history
└── src/
    ├── index.ts       → Prisma client (import from @repo/db)
    ├── redis.ts       → Redis utilities (import from @repo/db/redis)
    └── seed.ts        → Sample data generator

apps/api/              → Your application
└── src/
    └── index.ts       → API entry point
```

## Next Steps

1. **Read the full docs**: [README.md](./README.md)
2. **Learn the schema**: `packages/db/prisma/schema.prisma`
3. **Explore the data**: `pnpm db:studio` (opens at http://localhost:5555)
4. **Start building**: Import `prisma` from `@repo/db` in your code

## Example: Query Users

```typescript
import { prisma } from '@repo/db';

// Find all users
const users = await prisma.user.findMany();

// Find one user with their notes
const user = await prisma.user.findUnique({
  where: { email: 'alice@example.com' },
  include: { notes: true },
});
```

## Example: Use Cache

```typescript
import { noteCache, TTL } from '@repo/db/redis';

// Cache a note
await noteCache.set('note-123', noteData, { ttl: TTL.LONG });

// Get from cache
const note = await noteCache.get('note-123');

// Delete from cache
await noteCache.delete('note-123');
```

## Troubleshooting

**Problem:** "Cannot connect to database"
```bash
docker compose restart postgres
sleep 5
```

**Problem:** "Prisma Client not found"
```bash
pnpm db:generate
```

**Problem:** "Redis connection failed"
```bash
docker compose restart redis
sleep 5
```

**Problem:** Need to reset everything
```bash
docker compose down -v
docker compose up -d
sleep 10
pnpm db:migrate
pnpm db:seed
```

## Need Help?

- Full documentation: [README.md](./README.md)
- Verification guide: [SETUP_VERIFICATION.md](./SETUP_VERIFICATION.md)
- Contributing guide: [CONTRIBUTING.md](./CONTRIBUTING.md)
