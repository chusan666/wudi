import { Context } from 'hono';

export interface RequestContext {
  requestId: string;
}

export interface HonoContext extends Context {
  get: {
    (key: 'requestId'): string | undefined;
    (key: 'requestContext'): RequestContext | undefined;
  };
  set: {
    (key: 'requestId', value: string): void;
    (key: 'requestContext', value: RequestContext): void;
  };
}