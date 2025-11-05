#!/usr/bin/env node

const autocannon = require('autocannon');

async function runPerformanceTests() {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
  
  const tests = [
    {
      name: 'Health Check',
      path: '/health',
      connections: 10,
      duration: 10,
    },
    {
      name: 'Get Comments (Cache Hit)',
      path: '/api/notes/test-note-123/comments',
      connections: 20,
      duration: 30,
    },
    {
      name: 'Get Comments (Cache Miss)',
      path: '/api/notes/new-note-456/comments',
      connections: 20,
      duration: 30,
    },
  ];

  console.log('🚀 Starting Performance Tests\n');

  for (const test of tests) {
    console.log(`📊 Running ${test.name}...`);
    
    const result = await autocannon({
      url: `${baseUrl}${test.path}`,
      connections: test.connections,
      duration: test.duration,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`\n📈 Results for ${test.name}:`);
    console.log(`  Requests/sec: ${result.requests.average}`);
    console.log(`  Latency (avg): ${result.latency.average}ms`);
    console.log(`  Latency (p95): ${result.latency.p95}ms`);
    console.log(`  Latency (p99): ${result.latency.p99}ms`);
    console.log(`  Throughput: ${result.throughput.average}bytes/sec`);
    console.log(`  Errors: ${result.errors}`);
    console.log(`  Timeouts: ${result.timeouts}`);
    console.log(`  2xx responses: ${result['2xx']}`);
    console.log(`  4xx responses: ${result['4xx']}`);
    console.log(`  5xx responses: ${result['5xx']}`);
    
    // Performance benchmarks
    console.log(`\n🎯 Performance Analysis:`);
    if (result.requests.average > 100) {
      console.log(`  ✅ High throughput: ${result.requests.average} req/sec`);
    } else {
      console.log(`  ⚠️  Low throughput: ${result.requests.average} req/sec`);
    }
    
    if (result.latency.p95 < 500) {
      console.log(`  ✅ Good latency: p95 ${result.latency.p95}ms`);
    } else {
      console.log(`  ⚠️  High latency: p95 ${result.latency.p95}ms`);
    }
    
    if (result.errors === 0) {
      console.log(`  ✅ No errors`);
    } else {
      console.log(`  ❌ ${result.errors} errors detected`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runPerformanceTests().catch(console.error);
}

module.exports = { runPerformanceTests };