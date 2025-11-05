import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { ApiResponse } from '@monorepo/shared';
import { getEnv, isDevelopment } from '@monorepo/shared';

const app = new Hono();

app.use('*', cors());

app.get('/', (c) => {
  const response: ApiResponse<string> = {
    success: true,
    data: 'API is running',
    message: 'Welcome to the Bun + Hono API',
  };
  return c.json(response);
});

app.get('/health', (c) => {
  const response: ApiResponse<{ status: string; timestamp: string }> = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  };
  return c.json(response);
});

const port = parseInt(getEnv('API_PORT', '3001'), 10);

console.log(`Server is running on http://localhost:${port}`);
console.log(`Environment: ${isDevelopment() ? 'development' : 'production'}`);

const server: {
  port: number;
  fetch: typeof app.fetch;
} = {
  port,
  fetch: app.fetch.bind(app),
};

export default server;
