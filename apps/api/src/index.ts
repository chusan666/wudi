import { prisma, connectDatabase, healthCheck } from '@repo/db';
import { cache, connectRedis } from '@repo/db/redis';

async function main() {
  console.log('🚀 Starting API server...\n');

  await connectDatabase();
  await connectRedis();

  const dbHealth = await healthCheck();
  console.log('Database health:', dbHealth);

  await cache.set('api:startup', { timestamp: new Date(), version: '1.0.0' }, { ttl: 300 });
  const startupInfo = await cache.get('api:startup');
  console.log('Cached startup info:', startupInfo);

  const userCount = await prisma.user.count();
  const noteCount = await prisma.note.count();
  console.log(`\n📊 Database stats: ${userCount} users, ${noteCount} notes\n`);

  console.log('✅ API server is ready!');
}

main().catch((error) => {
  console.error('❌ Failed to start API server:', error);
  process.exit(1);
});
