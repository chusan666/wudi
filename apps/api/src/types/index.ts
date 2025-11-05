export interface PaginationParams {
  page?: number;
  pageSize?: number;
  order?: 'asc' | 'desc';
}

export interface CommentsFilterParams {
  minLikes?: number;
  hasReplies?: boolean;
}

export interface CommentsQueryParams extends PaginationParams, CommentsFilterParams {
  refresh?: boolean;
}

export interface CommentResponse {
  id: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  sentiment?: string;
  replies: CommentResponse[];
}

export interface CommentsResponse {
  success: boolean;
  data: {
    comments: CommentResponse[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
    metadata: {
      fetchedAt: string;
      noteId: string;
      cacheHit: boolean;
    };
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}