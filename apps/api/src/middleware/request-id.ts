import { Context, Next } from 'hono';
import { v4 as uuidv4 } from 'uuid';

export const requestIdMiddleware = async (c: Context, next: Next) => {
  const requestId = c.get('requestId') || uuidv4();
  c.set('requestId', requestId);
  c.set('requestContext', { requestId });
  await next();
};