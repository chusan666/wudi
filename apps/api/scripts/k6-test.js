import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
export let errorRate = new Rate('errors');

// Test configuration
export let options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up to 10 users
    { duration: '1m', target: 10 },   // Stay at 10 users
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '1m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'],     // Error rate under 10%
    errors: ['rate<0.1'],              // Custom error rate under 10%
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3000';

export default function () {
  // Test health endpoint
  let healthResponse = http.get(`${BASE_URL}/health`);
  let healthOk = check(healthResponse, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 100ms': (r) => r.timings.duration < 100,
  });
  
  errorRate.add(!healthOk);

  // Test comments endpoint (cache hit scenario)
  let commentsResponse = http.get(`${BASE_URL}/api/notes/test-note-123/comments`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  let commentsOk = check(commentsResponse, {
    'comments status is 200': (r) => r.status === 200,
    'comments response time < 500ms': (r) => r.timings.duration < 500,
    'comments has valid JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    },
  });
  
  errorRate.add(!commentsOk);

  // Test rate limiting by sending rapid requests
  let rateLimitResponse = http.get(`${BASE_URL}/api/notes/rate-limit-test/comments`);
  let rateLimitOk = check(rateLimitResponse, {
    'rate limit handled correctly': (r) => r.status === 200 || r.status === 429,
  });
  
  errorRate.add(!rateLimitOk);

  sleep(1);
}

export function handleSummary(data) {
  return {
    'performance-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}