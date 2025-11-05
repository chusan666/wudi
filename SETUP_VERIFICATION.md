# Setup Verification Guide

This document provides step-by-step verification that the database cache stack is properly configured.

## ✅ Verification Checklist

### 1. Docker Services Status

Check that both PostgreSQL and Redis containers are running:

```bash
docker compose ps
```

**Expected output:**
- `dev-postgres` status: Up (healthy)
- `dev-redis` status: Up (healthy)

### 2. Database Tables

Verify all tables were created:

```bash
docker exec dev-postgres psql -U postgres -d appdb -c "\dt"
```

**Expected tables:**
- _prisma_migrations
- comments
- crawler_jobs
- note_media
- note_statistics
- notes
- query_logs
- users

### 3. Database Indexes

Verify indexes exist for performance:

```bash
docker exec dev-postgres psql -U postgres -d appdb -c "SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;"
```

**Expected:** 34 indexes covering all major query patterns

### 4. Seed Data

Check that sample data was inserted:

```bash
docker exec dev-postgres psql -U postgres -d appdb -c "SELECT count(*) FROM users; SELECT count(*) FROM notes; SELECT count(*) FROM comments;"
```

**Expected counts:**
- users: 3
- notes: 4
- comments: 5

### 5. Prisma Client

Verify Prisma Client is generated:

```bash
cd packages/db
pnpm prisma generate
```

**Expected:** Client generated successfully to node_modules

### 6. Database Connection Test

Test the Prisma client connection:

```bash
cd apps/api
bun run src/index.ts
```

**Expected output:**
```
✅ Database connected successfully
✅ Redis connected successfully
📊 Database stats: 3 users, 4 notes
✅ API server is ready!
```

### 7. Redis Connection Test

Test Redis operations:

```bash
cd packages/db
bun run src/test-redis-simple.ts
```

**Expected output:**
```
✅ Redis connected successfully
✅ Redis health check passed
✅ All tests passed!
```

### 8. Migration Files

Verify migration was created:

```bash
ls -la packages/db/prisma/migrations/
```

**Expected:** Directory with timestamp (e.g., `20251105034402_init`) containing migration.sql

## 🧪 Advanced Tests

### Type Safety Test

Create a test file to verify type-safe imports:

```typescript
import { prisma, User, Note } from '@repo/db';

async function test() {
  const users: User[] = await prisma.user.findMany();
  const notes: Note[] = await prisma.note.findMany({
    include: {
      author: true,
      statistics: true,
    },
  });
}
```

**Expected:** No TypeScript errors, full autocomplete

### Redis Cache Test

Test different cache operations:

```typescript
import { cache, noteCache, userCache, TTL } from '@repo/db/redis';

await noteCache.set('note-123', { title: 'Test' }, { ttl: TTL.LONG });
const note = await noteCache.get('note-123');
await noteCache.delete('note-123');
```

**Expected:** All operations succeed without errors

## 🔍 Troubleshooting

### Issue: Cannot connect to database

**Solution:**
1. Check Docker services: `docker compose ps`
2. Restart services: `docker compose restart`
3. Verify DATABASE_URL in .env files

### Issue: Prisma Client not found

**Solution:**
```bash
cd packages/db
pnpm prisma generate
```

### Issue: Redis connection timeout

**Solution:**
1. Check Redis container: `docker compose logs redis`
2. Test connection: `docker exec dev-redis redis-cli ping`
3. Verify REDIS_URL in .env files

### Issue: Migration fails

**Solution:**
1. Reset database: `docker compose down -v && docker compose up -d`
2. Wait for healthy status: `docker compose ps`
3. Run migration again: `pnpm db:migrate`

## 📊 Performance Verification

### Check Query Performance

```sql
-- Connect to database
docker exec -it dev-postgres psql -U postgres -d appdb

-- Check indexes are being used
EXPLAIN ANALYZE SELECT * FROM notes WHERE published = true;
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'alice@example.com';
```

**Expected:** Should show "Index Scan" in query plan

### Monitor Redis Memory

```bash
docker exec dev-redis redis-cli info memory
```

### Check Connection Pool

```bash
docker exec dev-postgres psql -U postgres -d appdb -c "SELECT count(*) FROM pg_stat_activity;"
```

## 🎯 Acceptance Criteria Verification

- ✅ **Migrations succeed**: `pnpm db:migrate` completes without errors
- ✅ **All tables created**: 7 main tables + migrations table exist
- ✅ **Indexes created**: 34 indexes for optimal query performance
- ✅ **Type-safe client**: Prisma Client consumable from apps/api with full TypeScript support
- ✅ **Redis utilities**: CacheHelper classes expose get/set/delete operations
- ✅ **Seed data**: Sample records populate all tables
- ✅ **Documentation**: README.md contains complete setup instructions
- ✅ **Docker services**: Postgres and Redis run locally with health checks
- ✅ **Smoke tests**: Both database and Redis connection tests pass

## 📝 Next Steps

After verification:

1. Open Prisma Studio to explore data:
   ```bash
   pnpm db:studio
   ```

2. Create your first API endpoint using the database

3. Implement caching layer using Redis utilities

4. Add your own models to the schema and create migrations

5. Customize seed data for your use case
