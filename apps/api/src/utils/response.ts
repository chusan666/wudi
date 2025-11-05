export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    cache?: {
      hit: boolean;
      ttl?: number;
    };
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function successResponse<T>(
  data: T,
  meta?: Partial<ApiResponse<T>['meta']>
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: any,
  meta?: Partial<ApiResponse['meta']>
): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

export function paginationResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  meta?: Partial<ApiResponse<T[]>['meta']>
): ApiResponse<T[]> {
  const totalPages = Math.ceil(total / limit);
  
  return successResponse(data, {
    ...meta,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
}