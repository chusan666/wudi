import { cache, connectRedis, disconnectRedis } from './redis';

async function testRedis() {
  console.log('Testing Redis connection...');
  
  try {
    const isConnected = await connectRedis();
    console.log('Redis connected:', isConnected);
    
    await cache.set('test', 'Hello Redis!', { ttl: 60 });
    const value = await cache.get('test');
    console.log('Retrieved value:', value);
    
    await cache.delete('test');
    console.log('✅ All tests passed!');
    
    await disconnectRedis();
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testRedis();
