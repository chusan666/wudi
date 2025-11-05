import { cache, noteCache, connectRedis, disconnectRedis, redis, TTL } from './redis';

async function testRedisConnection() {
  console.log('🧪 Testing Redis connection and operations...\n');

  try {
    const isConnected = await connectRedis();
    if (!isConnected) {
      throw new Error('Redis connection failed');
    }

    console.log('Testing basic operations...');
    await cache.set('test:string', 'Hello, Redis!', { ttl: TTL.SHORT });
    const stringValue = await cache.get<string>('test:string');
    console.log('✅ String operation:', stringValue);

    await cache.set('test:object', { name: 'John Doe', age: 30 }, { ttl: TTL.SHORT });
    const objectValue = await cache.get<{ name: string; age: number }>('test:object');
    console.log('✅ Object operation:', objectValue);

    const exists = await cache.exists('test:string');
    console.log('✅ Exists check:', exists);

    const ttl = await cache.ttl('test:string');
    console.log('✅ TTL check:', ttl, 'seconds');

    await cache.increment('test:counter', 5);
    const counterValue = await cache.get<string>('test:counter');
    console.log('✅ Increment operation:', counterValue);

    await cache.decrement('test:counter', 2);
    const decrementedValue = await cache.get<string>('test:counter');
    console.log('✅ Decrement operation:', decrementedValue);

    console.log('\nTesting namespaced cache helpers...');
    await noteCache.set('note-1', { title: 'Test Note', content: 'This is a test' }, { ttl: TTL.MEDIUM });
    const note = await noteCache.get<{ title: string; content: string }>('note-1');
    console.log('✅ Note cache:', note);

    console.log('\nTesting pattern deletion...');
    await cache.set('test:item:1', 'value1', { ttl: TTL.SHORT });
    await cache.set('test:item:2', 'value2', { ttl: TTL.SHORT });
    await cache.set('test:item:3', 'value3', { ttl: TTL.SHORT });
    const deletedCount = await cache.deletePattern('item:*');
    console.log('✅ Pattern deletion:', deletedCount, 'keys deleted');

    console.log('\nTesting raw Redis commands...');
    await redis.lpush('test:list', 'item1', 'item2', 'item3');
    const listLength = await redis.llen('test:list');
    console.log('✅ List operations:', listLength, 'items in list');

    await redis.hset('test:hash', 'field1', 'value1', 'field2', 'value2');
    const hashValue = await redis.hget('test:hash', 'field1');
    console.log('✅ Hash operations:', hashValue);

    await redis.sadd('test:set', 'member1', 'member2', 'member3');
    const setMembers = await redis.smembers('test:set');
    console.log('✅ Set operations:', setMembers);

    console.log('\nCleaning up test data...');
    await cache.delete('test:string');
    await cache.delete('test:object');
    await cache.delete('test:counter');
    await noteCache.delete('note-1');
    await redis.del('test:list', 'test:hash', 'test:set');
    console.log('✅ Test data cleaned up');

    console.log('\n✅ All Redis tests passed successfully!');
  } catch (error) {
    console.error('❌ Redis test failed:', error);
    throw error;
  } finally {
    await disconnectRedis();
  }
}

testRedisConnection().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
