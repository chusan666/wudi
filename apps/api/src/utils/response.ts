export interface ResponseMeta {
  timestamp: string;
  requestId: string;
}

export const successResponse = <T>(data: T, meta: ResponseMeta) => ({
  success: true,
  data,
  meta,
});

export const errorResponse = (error: { message: string; code?: string }, meta: ResponseMeta) => ({
  success: false,
  error,
  meta,
});

export const createResponseMeta = (requestId: string): ResponseMeta => ({
  timestamp: new Date().toISOString(),
  requestId,
});