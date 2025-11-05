export interface UserStatistics {
  followerCount: number;
  followingCount: number;
  noteCount: number;
  likeCount: number;
  collectCount: number;
}

export interface UserDetail {
  id: string;
  username: string;
  name?: string;
  avatar?: string;
  bio?: string;
  statistics: UserStatistics;
  certifications?: string[];
  location?: string;
  ipLocation?: string;
  gender?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserNoteSummary {
  id: string;
  title: string;
  slug: string;
  coverImage?: string;
  likeCount: number;
  viewCount: number;
  commentCount: number;
  tags: string[];
  publishedAt?: string;
  createdAt: string;
}

export interface PaginatedUserNotes {
  notes: UserNoteSummary[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
    nextCursor?: string;
  };
}

export interface CrawledUserData {
  userId: string;
  username: string;
  name?: string;
  avatar?: string;
  bio?: string;
  followerCount: number;
  followingCount: number;
  noteCount: number;
  likeCount: number;
  collectCount: number;
  certifications?: string[];
  location?: string;
  ipLocation?: string;
  gender?: string;
}

export interface CrawledUserNote {
  noteId: string;
  title: string;
  coverImage?: string;
  likeCount: number;
  viewCount: number;
  commentCount: number;
  tags: string[];
  publishedAt?: Date;
}

export interface CrawledUserNotesData {
  userId: string;
  notes: CrawledUserNote[];
  cursor?: string;
  hasMore: boolean;
  total?: number;
}
