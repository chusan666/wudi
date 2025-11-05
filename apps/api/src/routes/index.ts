import { Hono } from 'hono';
import { noteRoutes } from './note.routes';
import { commentRoutes } from './comment.routes';

export const routes = new Hono()
  .route('/', noteRoutes)
  .route('/', commentRoutes);