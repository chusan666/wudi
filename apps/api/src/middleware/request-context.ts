import { Context, Next } from 'hono';
import { nanoid } from 'nanoid';
import type { RequestContext } from '@types/context';

export async function requestContextMiddleware(c: Context, next: Next) {
  const requestContext: RequestContext = {
    id: nanoid(),
    startTime: Date.now(),
    ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
    userAgent: c.req.header('user-agent'),
  };

  c.set('requestContext', requestContext);
  
  await next();
}