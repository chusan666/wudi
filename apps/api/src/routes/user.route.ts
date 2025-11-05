import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import * as userController from '@/controllers/user.controller.js';

const userRoute = new Hono();

// Validation schema for user ID parameter
const userIdSchema = z.object({
  id: z.string().min(1, 'User ID is required').max(100),
});

// Validation schema for user notes query parameters
const userNotesQuerySchema = z.object({
  page: z.string().optional().default('1').transform((val) => parseInt(val, 10)),
  pageSize: z.string().optional().default('20').transform((val) => Math.min(parseInt(val, 10), 100)),
  sort: z.enum(['latest', 'popular', 'oldest']).optional().default('latest'),
});

/**
 * GET /api/users/:id
 * 
 * Returns comprehensive user profile information including:
 * - Basic profile (username, name, avatar, bio)
 * - Statistics (followers, following, notes, likes, collects)
 * - Certifications and location info
 * 
 * The endpoint implements:
 * - Redis caching with configurable TTL
 * - Stale-while-revalidate strategy
 * - Automatic fallback to database on crawler failure
 * - Query logging with execution timing
 * 
 * Response format:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "user_123",
 *     "username": "username",
 *     "name": "Display Name",
 *     "avatar": "https://...",
 *     "bio": "User bio...",
 *     "statistics": {
 *       "followerCount": 1000,
 *       "followingCount": 500,
 *       "noteCount": 100,
 *       "likeCount": 5000,
 *       "collectCount": 200
 *     },
 *     "certifications": ["Verified"],
 *     "location": "City, Country",
 *     "ipLocation": "IP Location",
 *     "gender": "female",
 *     "createdAt": "2024-01-01T00:00:00.000Z",
 *     "updatedAt": "2024-01-01T00:00:00.000Z"
 *   },
 *   "meta": {
 *     "requestId": "req_abc123",
 *     "timestamp": "2024-01-01T00:00:00.000Z",
 *     "duration": 150
 *   }
 * }
 * 
 * Error responses:
 * - 400: Invalid user ID format
 * - 404: User not found
 * - 500: Server error (crawler failure, database error)
 */
userRoute.get(
  '/:id',
  zValidator('param', userIdSchema),
  userController.getUserById
);

/**
 * GET /api/users/:id/notes
 * 
 * Returns paginated list of user's published notes with:
 * - Note summaries (title, cover image, stats)
 * - Pagination metadata (total count, current page, has more)
 * - Support for sorting (latest, popular, oldest)
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - pageSize: Items per page (default: 20, max: 100)
 * - sort: Sort order - 'latest', 'popular', or 'oldest' (default: 'latest')
 * 
 * The endpoint implements:
 * - Redis caching per page/sort combination
 * - Automatic user profile fetching if not cached
 * - Query logging with execution timing
 * 
 * Response format:
 * {
 *   "success": true,
 *   "data": {
 *     "notes": [
 *       {
 *         "id": "note_123",
 *         "title": "Note Title",
 *         "slug": "note-slug",
 *         "coverImage": "https://...",
 *         "likeCount": 100,
 *         "viewCount": 1000,
 *         "commentCount": 10,
 *         "tags": ["tag1", "tag2"],
 *         "publishedAt": "2024-01-01T00:00:00.000Z",
 *         "createdAt": "2024-01-01T00:00:00.000Z"
 *       }
 *     ],
 *     "pagination": {
 *       "page": 1,
 *       "pageSize": 20,
 *       "total": 100,
 *       "totalPages": 5,
 *       "hasMore": true,
 *       "nextCursor": "2"
 *     }
 *   },
 *   "meta": {
 *     "requestId": "req_abc123",
 *     "timestamp": "2024-01-01T00:00:00.000Z",
 *     "duration": 150
 *   }
 * }
 * 
 * Error responses:
 * - 400: Invalid parameters (user ID, page, pageSize, sort)
 * - 404: User not found
 * - 500: Server error (database error)
 */
userRoute.get(
  '/:id/notes',
  zValidator('param', userIdSchema),
  zValidator('query', userNotesQuerySchema),
  userController.getUserNotes
);

export default userRoute;
