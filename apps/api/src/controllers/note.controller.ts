import type { Context } from 'hono';
import { getLogger } from '@/config/logger.js';
import { successResponse } from '@/utils/response.js';
import * as noteService from '@/services/note.service.js';
import * as noteDataAccess from '@/data-access/note.data-access.js';

export async function getNoteById(c: Context): Promise<Response> {
  const logger = getLogger();
  const startTime = Date.now();
  const noteId = c.req.param('id');
  const requestId = c.get('requestId');

  logger.info({ requestId, noteId }, 'Getting note by ID');

  try {
    const note = await noteService.getNote(noteId);
    const duration = Date.now() - startTime;

    // Log the query
    await noteDataAccess.createQueryLog({
      query: `GET /api/notes/${noteId}`,
      params: { noteId },
      duration,
      userId: undefined, // TODO: Extract from auth when implemented
      ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
    });

    logger.info({ requestId, noteId, duration }, 'Note retrieved successfully');

    return successResponse(c, note, 200, {
      cached: false, // TODO: Track if from cache
      duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log failed query
    await noteDataAccess.createQueryLog({
      query: `GET /api/notes/${noteId}`,
      params: { noteId, error: String(error) },
      duration,
      ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
      userAgent: c.req.header('user-agent'),
    });

    throw error;
  }
}
