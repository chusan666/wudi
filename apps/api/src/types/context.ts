export interface RequestContext {
  id: string;
  startTime: number;
  ip?: string;
  userAgent?: string;
}

export interface HonoEnv {
  Variables: {
    requestContext: RequestContext;
  };
}