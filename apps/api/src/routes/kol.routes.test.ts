import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import kolRoutes from '@routes/kol.routes';
import { KolService } from '@services/kol.service';
import { KolController } from '@controllers/kol.controller';
import { prisma } from '@data-access/prisma';
import { redisClient } from '@data-access/redis';

// Mock dependencies
vi.mock('@services/kol.service');
vi.mock('@data-access/prisma');
vi.mock('@data-access/redis');

describe('KOL Routes', () => {
  let app: Hono;
  let mockKolService: any;
  let mockKolController: any;

  beforeAll(async () => {
    // Initialize environment and logger for tests
    process.env.NODE_ENV = 'test';
    
    // Set up mocks
    mockKolService = {
      getProfile: vi.fn(),
      getPricing: vi.fn(),
      getAudience: vi.fn(),
      getPerformance: vi.fn(),
      getConversion: vi.fn(),
      getMarketingIndex: vi.fn(),
      invalidateKolCache: vi.fn(),
    };

    mockKolController = new KolController();
    mockKolController.kolService = mockKolService;

    // Create test app
    app = new Hono();
    app.route('/api/kol', kolRoutes);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/kol/:id/profile', () => {
    it('should return KOL profile successfully', async () => {
      const mockProfile = {
        profile: {
          id: 'kol-123',
          username: 'testuser',
          followerCount: 10000,
        },
        recentCampaigns: [],
        certifications: {},
        categories: [],
      };

      mockKolService.getProfile.mockResolvedValue(mockProfile);

      const response = await app.request('/api/kol/kol-123/profile');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockProfile);
      expect(mockKolService.getProfile).toHaveBeenCalledWith('kol-123', false);
    });

    it('should handle force refresh parameter', async () => {
      const mockProfile = {
        profile: {
          id: 'kol-123',
          username: 'testuser',
        },
        recentCampaigns: [],
        certifications: {},
        categories: [],
      };

      mockKolService.getProfile.mockResolvedValue(mockProfile);

      const response = await app.request('/api/kol/kol-123/profile?refresh=true');
      
      expect(response.status).toBe(200);
      expect(mockKolService.getProfile).toHaveBeenCalledWith('kol-123', true);
    });

    it('should return 400 for missing KOL ID', async () => {
      const response = await app.request('/api/kol//profile');
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle KOL not found', async () => {
      const error = new Error('KOL not found');
      error.name = 'NotFoundError';
      
      mockKolService.getProfile.mockRejectedValue(error);

      const response = await app.request('/api/kol/invalid-id/profile');
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('GET /api/kol/:id/pricing', () => {
    it('should return KOL pricing successfully', async () => {
      const mockPricing = {
        currentPricing: [],
        pricingHistory: [],
        cooperationHistory: [],
      };

      mockKolService.getPricing.mockResolvedValue(mockPricing);

      const response = await app.request('/api/kol/kol-123/pricing');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockPricing);
      expect(mockKolService.getPricing).toHaveBeenCalledWith('kol-123');
    });
  });

  describe('GET /api/kol/:id/performance', () => {
    it('should return KOL performance with query parameters', async () => {
      const mockPerformance = {
        metrics: [],
        summary: {
          overallEngagementRate: 0.05,
          topPerformingContentType: 'video',
        },
      };

      mockKolService.getPerformance.mockResolvedValue(mockPerformance);

      const response = await app.request('/api/kol/kol-123/performance?contentType=video&period=30d');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockKolService.getPerformance).toHaveBeenCalledWith('kol-123', 'video', '30d');
    });

    it('should validate query parameters', async () => {
      const response = await app.request('/api/kol/kol-123/performance?contentType=123');
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/kol/:id/refresh-cache', () => {
    it('should refresh cache successfully', async () => {
      mockKolService.invalidateKolCache.mockResolvedValue(undefined);

      const response = await app.request('/api/kol/kol-123/refresh-cache', {
        method: 'POST',
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toBe('Cache invalidated successfully');
      expect(mockKolService.invalidateKolCache).toHaveBeenCalledWith('kol-123');
    });
  });
});