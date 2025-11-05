import type { Context } from 'hono';
import { getLogger } from '@/config/logger.js';
import { successResponse } from '@/utils/response.js';
import * as userService from '@/services/user.service.js';
import * as userDataAccess from '@/data-access/user.data-access.js';

export async function getUserById(c: Context): Promise<Response> {
  const logger = getLogger();
  const startTime = Date.now();
  const userId = c.req.param('id');
  const requestId = c.get('requestId');

  logger.info({ requestId, userId }, 'Getting user by ID');

  try {
    const user = await userService.getUserProfile(userId);
    const duration = Date.now() - startTime;

    // Log the query
    await userDataAccess.createQueryLog({
      query: `GET /api/users/${userId}`,
      params: { userId },
      duration,
      userId: undefined, // TODO: Extract from auth when implemented
      ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
    });

    logger.info({ requestId, userId, duration }, 'User retrieved successfully');

    return successResponse(c, user, 200, {
      cached: false, // TODO: Track if from cache
      duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log failed query
    await userDataAccess.createQueryLog({
      query: `GET /api/users/${userId}`,
      params: { userId, error: String(error) },
      duration,
      ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
    });

    throw error;
  }
}

export async function getUserNotes(c: Context): Promise<Response> {
  const logger = getLogger();
  const startTime = Date.now();
  const userId = c.req.param('id');
  const requestId = c.get('requestId');

  // Parse query parameters
  const page = parseInt(c.req.query('page') || '1', 10);
  const pageSize = Math.min(parseInt(c.req.query('pageSize') || '20', 10), 100); // Max 100
  const sort = (c.req.query('sort') || 'latest') as 'latest' | 'popular' | 'oldest';

  logger.info({ requestId, userId, page, pageSize, sort }, 'Getting user notes');

  try {
    const result = await userService.getUserNotes(userId, {
      page,
      pageSize,
      sort,
    });
    const duration = Date.now() - startTime;

    // Log the query
    await userDataAccess.createQueryLog({
      query: `GET /api/users/${userId}/notes`,
      params: { userId, page, pageSize, sort },
      duration,
      userId: undefined, // TODO: Extract from auth when implemented
      ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
    });

    logger.info(
      { requestId, userId, page, noteCount: result.notes.length, duration },
      'User notes retrieved successfully'
    );

    return successResponse(c, result, 200, {
      cached: false, // TODO: Track if from cache
      duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log failed query
    await userDataAccess.createQueryLog({
      query: `GET /api/users/${userId}/notes`,
      params: { userId, page, pageSize, sort, error: String(error) },
      duration,
      ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
    });

    throw error;
  }
}
