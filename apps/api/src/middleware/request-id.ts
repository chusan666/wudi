import type { MiddlewareHandler } from 'hono';

let requestCounter = 0;

export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const counter = (++requestCounter).toString(36).padStart(4, '0');
  const random = Math.random().toString(36).substring(2, 6);
  return `req_${timestamp}${counter}${random}`;
}

export const requestIdMiddleware: MiddlewareHandler = async (c, next) => {
  const requestId = c.req.header('x-request-id') || generateRequestId();
  c.set('requestId', requestId);
  c.header('x-request-id', requestId);
  await next();
};
