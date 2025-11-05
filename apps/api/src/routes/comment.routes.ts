import { Hono } from 'hono';
import { CommentController } from '@/controllers/comment.controller';

const commentController = new CommentController();

export const commentRoutes = new Hono()
  .get('/notes/:id/comments', commentController.getCommentsByNoteId.bind(commentController));