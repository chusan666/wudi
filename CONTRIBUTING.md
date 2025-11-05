# Contributing Guide

## Database Development Workflow

### Adding a New Model

1. **Update the Schema**

Edit `packages/db/prisma/schema.prisma`:

```prisma
model NewModel {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([name])
  @@map("new_models")
}
```

2. **Create a Migration**

```bash
cd packages/db
pnpm prisma migrate dev --name add_new_model
```

3. **Generate Client**

```bash
pnpm prisma generate
```

4. **Update Seed Script**

Add sample data in `packages/db/src/seed.ts`:

```typescript
await prisma.newModel.create({
  data: {
    name: 'Sample Record',
  },
});
```

### Adding Indexes

Always add indexes for:
- Foreign key fields
- Fields used in WHERE clauses
- Fields used in ORDER BY
- Unique constraints

```prisma
model Note {
  // ...existing fields
  
  @@index([authorId])
  @@index([published])
  @@index([createdAt])
}
```

### Working with Migrations

**Creating a migration:**
```bash
pnpm --filter @repo/db prisma migrate dev --name descriptive_name
```

**Applying migrations (production):**
```bash
pnpm --filter @repo/db prisma migrate deploy
```

**Reset database (development only):**
```bash
pnpm --filter @repo/db prisma migrate reset
```

## Redis Cache Patterns

### Creating a Namespaced Cache

```typescript
import { CacheHelper } from '@repo/db/redis';

export const productCache = new CacheHelper('product');

// Usage
await productCache.set('product-123', productData, { ttl: TTL.LONG });
const product = await productCache.get('product-123');
```

### Cache Invalidation Strategies

**1. Time-based (TTL):**
```typescript
await cache.set('key', data, { ttl: TTL.MEDIUM }); // 30 minutes
```

**2. Event-based:**
```typescript
// After updating a note
await prisma.note.update({ ... });
await noteCache.delete(`note-${noteId}`);
```

**3. Pattern-based:**
```typescript
// Clear all user-related caches
await userCache.deletePattern('user:*');
```

### Cache Warming

Pre-populate frequently accessed data:

```typescript
async function warmCache() {
  const popularNotes = await prisma.note.findMany({
    where: { published: true },
    orderBy: { viewCount: 'desc' },
    take: 100,
  });

  for (const note of popularNotes) {
    await noteCache.set(`note-${note.id}`, note, { ttl: TTL.LONG });
  }
}
```

## Best Practices

### Prisma Client Usage

**✅ Good:**
```typescript
import { prisma } from '@repo/db';

const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    notes: {
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    },
  },
});
```

**❌ Bad:**
```typescript
// Don't create new PrismaClient instances
const prisma = new PrismaClient(); // Use imported instance instead
```

### Query Optimization

**Use select to limit fields:**
```typescript
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
  },
});
```

**Batch operations:**
```typescript
// Instead of multiple creates
await prisma.note.createMany({
  data: notes,
});

// Instead of multiple updates
await prisma.note.updateMany({
  where: { authorId: userId },
  data: { published: true },
});
```

### Transaction Handling

```typescript
await prisma.$transaction(async (tx) => {
  const note = await tx.note.create({
    data: { ...noteData },
  });

  await tx.noteStatistics.create({
    data: {
      noteId: note.id,
      viewCount: 0,
    },
  });
});
```

### Error Handling

```typescript
import { Prisma } from '@prisma/client';

try {
  await prisma.user.create({ data: userData });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      // Unique constraint violation
      throw new Error('Email already exists');
    }
  }
  throw error;
}
```

## Testing

### Database Testing

Create test utilities in `packages/db/src/test-utils.ts`:

```typescript
export async function cleanDatabase() {
  await prisma.comment.deleteMany();
  await prisma.note.deleteMany();
  await prisma.user.deleteMany();
}

export async function createTestUser(overrides = {}) {
  return await prisma.user.create({
    data: {
      email: 'test@example.com',
      username: 'testuser',
      ...overrides,
    },
  });
}
```

### Cache Testing

```typescript
import { cache } from '@repo/db/redis';

beforeEach(async () => {
  await cache.deletePattern('*');
});

test('cache operations', async () => {
  await cache.set('test', { value: 123 });
  const result = await cache.get('test');
  expect(result).toEqual({ value: 123 });
});
```

## Code Review Guidelines

When reviewing database-related changes, check for:

1. **Schema Changes**
   - [ ] Migration includes all necessary indexes
   - [ ] Foreign keys have proper cascade behavior
   - [ ] Field types are appropriate for data
   - [ ] @@map names follow snake_case convention

2. **Query Performance**
   - [ ] Queries use indexes effectively
   - [ ] N+1 queries are avoided (use include/select)
   - [ ] Pagination is implemented for large result sets

3. **Cache Strategy**
   - [ ] Appropriate TTL for data volatility
   - [ ] Cache invalidation is handled
   - [ ] Namespaced keys are used

4. **Error Handling**
   - [ ] Database errors are caught and logged
   - [ ] User-friendly error messages
   - [ ] Transactions are used where needed

## Deployment Checklist

Before deploying database changes:

1. **Backup Production Database**
   ```bash
   pg_dump -U postgres -d appdb > backup.sql
   ```

2. **Test Migration Locally**
   ```bash
   pnpm db:migrate
   ```

3. **Review Migration SQL**
   ```bash
   cat packages/db/prisma/migrations/*/migration.sql
   ```

4. **Deploy Migration**
   ```bash
   pnpm db:migrate:deploy
   ```

5. **Verify Schema**
   ```bash
   pnpm db:studio
   ```

6. **Monitor Application**
   - Check error logs
   - Monitor query performance
   - Verify cache hit rates

## Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/docs/)
- [ioredis GitHub](https://github.com/redis/ioredis)

## Getting Help

If you encounter issues:

1. Check the [SETUP_VERIFICATION.md](./SETUP_VERIFICATION.md) guide
2. Review existing migrations in `packages/db/prisma/migrations/`
3. Check Docker logs: `docker compose logs postgres` or `redis`
4. Open an issue with detailed error messages and steps to reproduce
