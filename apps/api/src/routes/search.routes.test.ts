import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { searchRoutes } from '@routes/search.routes';
import { requestContextMiddleware } from '@middleware/request-context';

describe('Search Routes Integration Tests', () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    app.use('*', requestContextMiddleware);
    app.route('/api/search', searchRoutes);
  });

  describe('GET /api/search/users', () => {
    it('should return 400 for missing query parameter', async () => {
      const response = await app.request('/api/search/users');
      
      expect(response.status).toBe(400);
      const json = await response.json() as any;
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('INVALID_QUERY');
    });

    it('should return 400 for empty query parameter', async () => {
      const response = await app.request('/api/search/users?q=');
      
      expect(response.status).toBe(400);
      const json = await response.json() as any;
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('INVALID_QUERY');
    });

    it('should handle valid search request', async () => {
      const response = await app.request('/api/search/users?q=test&page=1&pageSize=10');
      
      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
      expect(json.meta.pagination).toBeDefined();
      expect(json.meta.query).toBe('test');
    });

    it('should validate pagination parameters', async () => {
      const response = await app.request('/api/search/users?q=test&page=0&pageSize=150');
      
      // Should use default values for invalid parameters
      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.meta.pagination.page).toBe(1); // default
      expect(json.meta.pagination.pageSize).toBe(20); // default, not 150 (exceeds max)
    });
  });

  describe('GET /api/search/notes', () => {
    it('should return 400 for missing query parameter', async () => {
      const response = await app.request('/api/search/notes');
      
      expect(response.status).toBe(400);
      const json = await response.json() as any;
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('INVALID_QUERY');
    });

    it('should handle optional topic parameter', async () => {
      const response = await app.request('/api/search/notes?q=test&topic=technology');
      
      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data).toBeDefined();
    });

    it('should validate sort parameter', async () => {
      const response = await app.request('/api/search/notes?q=test&sort=invalid');
      
      // Should use default sort for invalid parameter
      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
    });
  });
});