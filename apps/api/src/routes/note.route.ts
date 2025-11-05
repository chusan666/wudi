import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import * as noteController from '@/controllers/note.controller.js';

const noteRoute = new Hono();

// Validation schema for note ID parameter
const noteIdSchema = z.object({
  id: z.string().min(1, 'Note ID is required').max(100),
});

/**
 * GET /api/notes/:id
 * 
 * Returns comprehensive note information including:
 * - Note text content
 * - Author summary (username, name, avatar, bio)
 * - Statistics (views, likes, shares, comments)
 * - Media URLs (images/videos with dimensions)
 * - Topics/tags
 * - Publish time
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
 *     "id": "note_123",
 *     "title": "Note Title",
 *     "content": "Note content...",
 *     "slug": "note-slug",
 *     "published": true,
 *     "tags": ["tag1", "tag2"],
 *     "author": {
 *       "id": "user_123",
 *       "username": "username",
 *       "name": "Display Name",
 *       "avatar": "https://...",
 *       "bio": "User bio..."
 *     },
 *     "statistics": {
 *       "viewCount": 1000,
 *       "likeCount": 50,
 *       "shareCount": 10,
 *       "commentCount": 5
 *     },
 *     "media": [
 *       {
 *         "id": "media_123",
 *         "url": "https://...",
 *         "type": "image",
 *         "width": 1920,
 *         "height": 1080,
 *         "order": 0
 *       }
 *     ],
 *     "publishedAt": "2024-01-01T00:00:00.000Z",
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
 * - 400: Invalid note ID format
 * - 404: Note not found
 * - 500: Server error (crawler failure, database error)
 */
noteRoute.get(
  '/:id',
  zValidator('param', noteIdSchema),
  noteController.getNoteById
);

export default noteRoute;
