import { z } from 'zod';

// Search query parameters
export const SearchQuerySchema = z.object({
  q: z.string().min(1, 'Query parameter is required'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['relevance', 'date', 'popularity']).default('relevance'),
});

export const NoteSearchQuerySchema = SearchQuerySchema.extend({
  topic: z.string().optional(),
});

// User search result
export const UserSearchResultSchema = z.object({
  id: z.string(),
  username: z.string(),
  name: z.string().nullable(),
  avatar: z.string().nullable(),
  bio: z.string().nullable(),
  followersCount: z.number().default(0),
  notesCount: z.number().default(0),
  verified: z.boolean().default(false),
});

// Note search result
export const NoteSearchResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  snippet: z.string(),
  author: z.object({
    id: z.string(),
    username: z.string(),
    name: z.string().nullable(),
    avatar: z.string().nullable(),
  }),
  tags: z.array(z.string()),
  stats: z.object({
    viewCount: z.number().default(0),
    likeCount: z.number().default(0),
    shareCount: z.number().default(0),
    commentCount: z.number().default(0),
  }),
  publishedAt: z.date().nullable(),
  topic: z.string().optional(),
});

// Pagination metadata
export const PaginationMetaSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

// Search response
export const SearchResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.any()),
  meta: z.object({
    pagination: PaginationMetaSchema,
    query: z.string(),
    searchTime: z.number(),
    cached: z.boolean(),
  }),
});

// Rate limit info
export const RateLimitInfoSchema = z.object({
  limit: z.number(),
  remaining: z.number(),
  reset: z.number(),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type NoteSearchQuery = z.infer<typeof NoteSearchQuerySchema>;
export type UserSearchResult = z.infer<typeof UserSearchResultSchema>;
export type NoteSearchResult = z.infer<typeof NoteSearchResultSchema>;
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
export type RateLimitInfo = z.infer<typeof RateLimitInfoSchema>;