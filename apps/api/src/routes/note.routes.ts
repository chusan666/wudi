import { Hono } from 'hono';
import { NoteController } from '@/controllers/note.controller';

const noteController = new NoteController();

export const noteRoutes = new Hono()
  .get('/notes/:id', noteController.getNoteById.bind(noteController))
  .post('/notes', noteController.createNote.bind(noteController));