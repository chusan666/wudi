import { Context } from 'hono';
import { NoteService } from '@/services/note.service';
import { successResponse, createResponseMeta } from '@/utils/response';
import { ValidationError } from '@/utils/errors';

// Extend Hono types for this controller
declare module 'hono' {
  interface ContextVariableMap {
    requestId: string;
    requestContext: { requestId: string };
  }
}

export class NoteController {
  private noteService: NoteService;

  constructor() {
    this.noteService = new NoteService();
  }

  async getNoteById(c: Context) {
    const noteId = c.req.param('id');
    const requestId = c.get('requestContext')?.requestId || 'unknown';

    if (!noteId) {
      throw new ValidationError('Note ID is required');
    }

    const note = await this.noteService.getNoteById(noteId);

    return c.json(successResponse(note, createResponseMeta(requestId)), 200);
  }

  async createNote(c: Context) {
    const requestId = c.get('requestContext')?.requestId || 'unknown';
    const body = await c.req.json();

    // Basic validation
    if (!body.title || typeof body.title !== 'string') {
      throw new ValidationError('Title is required and must be a string');
    }

    if (body.content && typeof body.content !== 'string') {
      throw new ValidationError('Content must be a string');
    }

    const note = await this.noteService.createNote({
      title: body.title,
      content: body.content,
    });

    return c.json(successResponse(note, createResponseMeta(requestId)), 201);
  }
}