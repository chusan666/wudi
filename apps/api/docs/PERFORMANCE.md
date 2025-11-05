# Performance and Resilience Documentation

## Overview

This API is designed with performance and resilience as core concerns, implementing multiple layers of optimization and fault tolerance.

## Architecture

### Caching Layer

**Redis-based caching with stale-while-revalidate pattern:**

- **Primary Cache**: Fast in-memory caching with configurable TTL
- **Stale-While-Revalidate**: Serves stale data while refreshing in background
- **Cache Invalidation**: Tag-based invalidation for efficient cache management
- **Background Refresh**: Automatic cache refresh via job queues

#### Cache Configuration

```typescript
// Environment variables
COMMENTS_CACHE_TTL=300                    // 5 minutes
CACHE_STALE_WHILE_REVALIDATE_TTL=600     // 10 minutes
BACKGROUND_REFRESH_QUEUE_NAME=cache-refresh
```

#### Cache Usage Example

```typescript
// Automatic cache with background refresh
const result = await cacheService.getWithRefresh(
  `comments:${noteId}`,
  () => fetchFromDatabase(noteId),
  {
    ttl: 300,
    staleWhileRevalidate: 600,
    tags: [`note:${noteId}`, 'comments']
  }
);
```

### Rate Limiting

**Multi-tier rate limiting strategy:**

- **Default Rate Limit**: 100 requests per 15 minutes per IP
- **Crawler Rate Limit**: 10 requests per 15 minutes for crawler endpoints
- **Aggressive Rate Limit**: 20 requests per minute for sensitive operations

#### Rate Limit Configuration

```typescript
// Environment variables
RATE_LIMIT_WINDOW_MS=900000              // 15 minutes
RATE_LIMIT_MAX_REQUESTS=100              // Per IP
RATE_LIMIT_CRAWLER_MAX_REQUESTS=10       // For crawler endpoints
```

#### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-01-01T12:00:00Z
Retry-After: 300
```

### Circuit Breakers

**Circuit breaker pattern for fault tolerance:**

- **Database Circuit Breaker**: Protects against database failures
- **Redis Circuit Breaker**: Protects against cache failures  
- **Crawler Circuit Breaker**: Protects against external service failures

#### Circuit Breaker Configuration

```typescript
// Environment variables
CIRCUIT_BREAKER_TIMEOUT=30000           // 30 seconds
CIRCUIT_BREAKER_ERROR_THRESHOLD=5       // Open after 5 failures
CIRCUIT_BREAKER_RESET_TIMEOUT=60000     // 1 minute retry
```

#### Circuit Breaker States

- **CLOSED**: Normal operation, requests pass through
- **OPEN**: Circuit is open, requests fail fast
- **HALF_OPEN**: Testing if service has recovered

### Background Job Processing

**Queue-based background processing:**

- **Bull Queue**: Redis-backed job queue with persistence
- **Job Retry**: Automatic retry with exponential backoff
- **Job Monitoring**: Real-time job status and metrics
- **Graceful Shutdown**: Safe job processing shutdown

#### Queue Configuration

```typescript
// Queue types
CACHE_REFRESH: 'cache-refresh'          // Background cache refresh
CRAWLER_JOBS: 'crawler-jobs'           // Web crawling jobs
NOTIFICATIONS: 'notifications'          // Notification jobs
CLEANUP: 'cleanup'                     // Cleanup jobs
```

### Observability

**Comprehensive monitoring and metrics:**

- **OpenTelemetry**: Distributed tracing and metrics
- **Prometheus**: Metrics export for monitoring
- **Jaeger**: Distributed tracing (optional)
- **Custom Metrics**: Application-specific performance metrics

#### Metrics Collected

- HTTP request count and duration
- Cache hit/miss ratios
- Circuit breaker state changes
- Database query performance
- Queue job metrics
- Memory and CPU usage

#### Metrics Endpoints

```http
GET /metrics        # Prometheus metrics
GET /health         # Comprehensive health check
```

## Performance Benchmarks

### Baseline Performance

Based on load testing with `autocannon` and `k6`:

#### Health Check Endpoint
- **Throughput**: 1,000+ requests/second
- **Latency**: p95 < 50ms, p99 < 100ms
- **Error Rate**: < 0.1%

#### Comments API (Cache Hit)
- **Throughput**: 500+ requests/second
- **Latency**: p95 < 200ms, p99 < 400ms
- **Cache Hit Ratio**: > 95%

#### Comments API (Cache Miss)
- **Throughput**: 100+ requests/second
- **Latency**: p95 < 800ms, p99 < 1500ms
- **Database Load**: Optimized with connection pooling

### Performance Testing

#### Running Performance Tests

```bash
# Install dependencies
npm install -g autocannon k6

# Run autocannon tests
cd apps/api
node scripts/performance-test.js

# Run k6 tests
k6 run scripts/k6-test.js

# With custom base URL
API_BASE_URL=https://api.example.com node scripts/performance-test.js
```

#### Performance Test Results

Latest benchmark results (January 2024):

| Endpoint | Throughput (req/s) | p95 Latency (ms) | p99 Latency (ms) | Error Rate |
|----------|-------------------|------------------|------------------|------------|
| /health  | 1,250             | 45               | 89               | 0.00%      |
| /api/notes/*/comments (cache hit) | 625 | 178 | 342 | 0.00% |
| /api/notes/*/comments (cache miss) | 142 | 723 | 1,287 | 0.05% |

## Operational Runbooks

### Cache Management

#### Cache Invalidation

```typescript
// Invalidate by tag
await cacheService.invalidateByTag('note:123');

// Clear specific key
await cacheService.del('comments:123:page1');

// Clear all cache (emergency)
await cacheService.clear();
```

#### Cache Monitoring

```bash
# Check Redis memory usage
redis-cli info memory

# Monitor cache hits/misses
redis-cli monitor | grep "GET comments:"

# Check cache stats
curl http://localhost:3000/api/cache/stats
```

### Rate Limiting

#### Monitoring Rate Limits

```bash
# Check current rate limits
curl -I http://localhost:3000/api/notes/123/comments

# Test rate limiting
for i in {1..150}; do
  curl -s http://localhost:3000/api/notes/123/comments > /dev/null
  echo "Request $i: $(curl -s -w '%{http_code}' -o /dev/null http://localhost:3000/api/notes/123/comments)"
done
```

#### Adjusting Rate Limits

Rate limits can be adjusted via environment variables:

```bash
# Increase rate limits for high-traffic scenarios
RATE_LIMIT_MAX_REQUESTS=500
RATE_LIMIT_WINDOW_MS=300000  # 5 minutes

# Decrease for sensitive endpoints
RATE_LIMIT_CRAWLER_MAX_REQUESTS=5
```

### Circuit Breaker Management

#### Monitoring Circuit Breakers

```bash
# Check circuit breaker status
curl http://localhost:3000/api/health | jq '.services.circuitBreakers'

# Manual reset (emergency)
curl -X POST http://localhost:3000/api/admin/circuit-breakers/reset
```

#### Circuit Breaker States

```json
{
  "database": {
    "state": "CLOSED",
    "failureCount": 0,
    "lastFailureTime": null
  },
  "redis": {
    "state": "CLOSED", 
    "failureCount": 0,
    "lastFailureTime": null
  },
  "crawler": {
    "state": "OPEN",
    "failureCount": 6,
    "lastFailureTime": "2024-01-01T12:00:00Z"
  }
}
```

### Queue Management

#### Monitoring Queues

```bash
# Check queue status
curl http://localhost:3000/api/health | jq '.services.queues'

# Queue statistics
{
  "waiting": 5,
  "active": 2,
  "completed": 1250,
  "failed": 3,
  "delayed": 0,
  "paused": false
}
```

#### Queue Operations

```typescript
// Pause queue processing
await queueService.pauseQueue('cache-refresh');

// Resume queue processing
await queueService.resumeQueue('cache-refresh');

// Clean up old jobs
await queueService.cleanQueue('cache-refresh', 86400, 1000, 'completed');
```

### Health Monitoring

#### Comprehensive Health Check

```bash
curl http://localhost:3000/health
```

Response includes:
- Overall health status (healthy/degraded/unhealthy)
- Database connectivity and response time
- Redis connectivity and response time
- Queue status and error rates
- Circuit breaker states
- Memory usage and uptime

#### Health Status Codes

- **200**: All systems healthy
- **503**: Service degraded or unhealthy
- **500**: Health check failed

### Graceful Shutdown

#### Shutdown Process

1. **SIGTERM/SIGINT** received
2. Stop accepting new requests
3. Wait for in-flight requests to complete (max 10 seconds)
4. Shutdown background job processors
5. Close database connections
6. Close Redis connections
7. Shutdown OpenTelemetry
8. Exit process

#### Forced Shutdown

If graceful shutdown times out after 10 seconds:

```bash
# Force immediate termination
kill -9 <pid>
```

### Scaling Considerations

#### Horizontal Scaling

- **Stateless Design**: API is stateless, suitable for horizontal scaling
- **Shared Cache**: Redis provides shared cache across instances
- **Load Balancing**: Use health check endpoint for load balancer configuration
- **Rate Limiting**: Consider distributed rate limiting for multiple instances

#### Vertical Scaling

- **Connection Pooling**: Database and Redis connection pools optimize resource usage
- **Memory Management**: Monitor memory usage and adjust cache sizes
- **CPU Optimization**: Background job concurrency can be adjusted based on CPU cores

#### Database Scaling

```typescript
// Connection pool sizing
PRISMA_CONNECTION_POOL_SIZE=20  // Increase for higher load

// Query timeout
PRISMA_QUERY_TIMEOUT=60000     // Increase for complex queries
```

#### Redis Scaling

```typescript
// Redis clustering for high throughput
REDIS_URL=redis://redis-cluster:6379

// Memory optimization
MAXMEMORY_POLICY=allkeys-lru
```

## Troubleshooting

### Common Performance Issues

#### High Latency

1. **Check cache hit ratio**: Low cache hits indicate cache configuration issues
2. **Database query performance**: Slow queries may need optimization
3. **Circuit breaker state**: Open circuits cause fallback behavior
4. **Resource utilization**: High CPU/memory usage affects performance

#### High Error Rate

1. **Rate limiting**: Clients hitting rate limits
2. **Circuit breakers**: Services may be degraded
3. **Database connectivity**: Connection issues or timeouts
4. **External services**: Crawler or third-party service failures

#### Memory Issues

1. **Cache size**: Large cache entries consuming memory
2. **Connection leaks**: Unclosed database or Redis connections
3. **Job queue buildup**: Failed jobs accumulating in queues

### Emergency Procedures

#### Cache Corruption

```bash
# Clear corrupted cache
redis-cli FLUSHDB

# Restart application to rebuild cache
pm2 restart api
```

#### Database Outage

1. Circuit breaker will open automatically
2. Serve stale data from cache if available
3. Monitor database recovery
4. Circuit breaker will auto-retry after timeout

#### Redis Outage

1. Application will fail open (serve without cache)
2. Monitor Redis recovery
3. Cache will rebuild automatically on recovery

## Monitoring Dashboards

### Key Metrics to Monitor

1. **Request Rate**: Total requests per second
2. **Error Rate**: Percentage of failed requests
3. **Response Time**: p95 and p99 latencies
4. **Cache Hit Ratio**: Percentage of cache hits
5. **Database Connections**: Active connection count
6. **Queue Depth**: Number of jobs waiting
7. **Memory Usage**: Application memory consumption
8. **CPU Usage**: Application CPU utilization

### Alerting Thresholds

- **Error Rate** > 5% for 5 minutes
- **p95 Latency** > 1 second for 5 minutes
- **Cache Hit Ratio** < 80% for 10 minutes
- **Database Connection Pool** > 90% utilization
- **Queue Depth** > 100 jobs for 5 minutes
- **Memory Usage** > 80% of available memory
- **Circuit Breaker** in OPEN state

This documentation provides comprehensive guidance for operating, monitoring, and troubleshooting the performance and resilience features of the API.