import { userCache, TTL } from '@repo/db/redis';
import { getLogger } from '@/config/logger.js';
import { NotFoundError, CrawlerError } from '@/types/errors.js';
import type { UserDetail, PaginatedUserNotes, UserNoteSummary } from '@/types/user.js';
import * as userDataAccess from '@/data-access/user.data-access.js';
import * as crawlerDataAccess from '@/data-access/crawler.data-access.js';

const USER_CACHE_KEY_PREFIX = 'user:detail:';
const USER_NOTES_CACHE_KEY_PREFIX = 'user:notes:';
const CACHE_STALE_SUFFIX = ':stale';

interface GetUserOptions {
  forceRefresh?: boolean;
  skipCache?: boolean;
}

interface GetUserNotesOptions {
  page?: number;
  pageSize?: number;
  sort?: 'latest' | 'popular' | 'oldest';
  skipCache?: boolean;
}

function transformUserToDetail(user: userDataAccess.UserWithStats): UserDetail {
  const metadata = user.metadata as any || {};
  
  return {
    id: user.id,
    username: user.username,
    name: user.name || undefined,
    avatar: user.avatar || undefined,
    bio: user.bio || undefined,
    statistics: {
      followerCount: user.statistics?.followerCount || 0,
      followingCount: user.statistics?.followingCount || 0,
      noteCount: user.statistics?.noteCount || 0,
      likeCount: user.statistics?.likeCount || 0,
      collectCount: user.statistics?.collectCount || 0,
    },
    certifications: metadata.certifications || undefined,
    location: metadata.location || undefined,
    ipLocation: metadata.ipLocation || undefined,
    gender: metadata.gender || undefined,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

function transformNotesToSummary(notes: userDataAccess.NoteWithStats[]): UserNoteSummary[] {
  return notes.map((note) => {
    // Extract cover image from metadata if available
    const metadata = note.metadata as any || {};
    const coverImage = metadata.coverImage || undefined;

    return {
      id: note.id,
      title: note.title,
      slug: note.slug,
      coverImage,
      likeCount: note.statistics?.likeCount || 0,
      viewCount: note.statistics?.viewCount || 0,
      commentCount: note.statistics?.commentCount || 0,
      tags: note.tags,
      publishedAt: note.publishedAt?.toISOString(),
      createdAt: note.createdAt.toISOString(),
    };
  });
}

async function fetchAndPersistUser(userId: string): Promise<UserDetail> {
  const logger = getLogger();
  
  // Crawl the user profile
  logger.info({ userId }, 'Fetching user from crawler');
  const crawledData = await crawlerDataAccess.crawlUserProfile(userId);

  // Persist to database
  logger.info({ userId }, 'Persisting user to database');
  const user = await userDataAccess.upsertUser(crawledData);

  // Transform to API response format
  const userDetail = transformUserToDetail(user);

  // Cache the result
  logger.info({ userId }, 'Caching user detail');
  await userCache.set(USER_CACHE_KEY_PREFIX + userId, userDetail, { ttl: TTL.LONG });

  return userDetail;
}

export async function getUserProfile(
  userId: string,
  options: GetUserOptions = {}
): Promise<UserDetail> {
  const logger = getLogger();
  const cacheKey = USER_CACHE_KEY_PREFIX + userId;
  const staleCacheKey = cacheKey + CACHE_STALE_SUFFIX;

  // Skip cache if requested
  if (options.skipCache || options.forceRefresh) {
    logger.info({ userId, options }, 'Skipping cache');
    return fetchAndPersistUser(userId);
  }

  // Try to get from cache
  logger.debug({ userId }, 'Checking cache');
  const cached = await userCache.get<UserDetail>(cacheKey);

  if (cached) {
    logger.info({ userId }, 'Cache hit');
    return cached;
  }

  logger.info({ userId }, 'Cache miss');

  // Check for stale cache (stale-while-revalidate)
  const staleCache = await userCache.get<UserDetail>(staleCacheKey);

  if (staleCache) {
    logger.info({ userId }, 'Serving stale cache, triggering background refresh');
    
    // Return stale data immediately
    // Trigger background refresh (don't await)
    fetchAndPersistUser(userId)
      .then((fresh) => {
        logger.info({ userId }, 'Background refresh completed');
        // Update stale cache for next time
        userCache.set(staleCacheKey, fresh, { ttl: TTL.SHORT });
      })
      .catch((error) => {
        logger.error({ userId, error }, 'Background refresh failed');
      });

    return staleCache;
  }

  // No cache at all, fetch fresh
  try {
    const userDetail = await fetchAndPersistUser(userId);
    
    // Also set stale cache for stale-while-revalidate
    await userCache.set(staleCacheKey, userDetail, { ttl: TTL.LONG + TTL.MEDIUM });
    
    return userDetail;
  } catch (error) {
    // If crawler fails, try to get from database
    logger.warn({ userId, error }, 'Crawler failed, attempting database fallback');
    
    const dbUser = await userDataAccess.findUserById(userId);
    if (dbUser) {
      logger.info({ userId }, 'Serving from database fallback');
      const userDetail = transformUserToDetail(dbUser);
      
      // Cache the database result with shorter TTL
      await userCache.set(cacheKey, userDetail, { ttl: TTL.MEDIUM });
      
      return userDetail;
    }

    // User doesn't exist in database either
    throw new NotFoundError('User', userId);
  }
}

export async function getUserNotes(
  userId: string,
  options: GetUserNotesOptions = {}
): Promise<PaginatedUserNotes> {
  const logger = getLogger();
  const { page = 1, pageSize = 20, sort = 'latest', skipCache = false } = options;
  
  const cacheKey = `${USER_NOTES_CACHE_KEY_PREFIX}${userId}:${page}:${pageSize}:${sort}`;

  // Try to get from cache
  if (!skipCache) {
    logger.debug({ userId, page, pageSize, sort }, 'Checking cache for user notes');
    const cached = await userCache.get<PaginatedUserNotes>(cacheKey);

    if (cached) {
      logger.info({ userId, page }, 'Cache hit for user notes');
      return cached;
    }
  }

  logger.info({ userId, page, pageSize, sort }, 'Cache miss, fetching user notes');

  // First, ensure user exists (this will crawl and cache if needed)
  await getUserProfile(userId, { skipCache: false });

  // Get notes from database
  const { notes, total } = await userDataAccess.findUserNotes(userId, {
    page,
    pageSize,
    sort,
  });

  // If we have no notes in DB, try to crawl them
  if (notes.length === 0 && page === 1) {
    try {
      logger.info({ userId }, 'No notes in DB, attempting to crawl user notes');
      const crawledNotes = await crawlerDataAccess.crawlUserNotes(userId, undefined, pageSize);
      
      // The crawled notes would need to be persisted individually
      // For now, we'll just return what we have from DB
      logger.info({ userId, crawledCount: crawledNotes.notes.length }, 'User notes crawled');
    } catch (error) {
      logger.warn({ userId, error }, 'Failed to crawl user notes');
    }
  }

  const totalPages = Math.ceil(total / pageSize);
  const hasMore = page < totalPages;

  const result: PaginatedUserNotes = {
    notes: transformNotesToSummary(notes),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasMore,
      nextCursor: hasMore ? `${page + 1}` : undefined,
    },
  };

  // Cache the result
  await userCache.set(cacheKey, result, { ttl: TTL.MEDIUM });

  return result;
}

export async function invalidateUserCache(userId: string): Promise<void> {
  const cacheKey = USER_CACHE_KEY_PREFIX + userId;
  const staleCacheKey = cacheKey + CACHE_STALE_SUFFIX;
  
  // Also invalidate all notes cache for this user (pattern match)
  const notesPattern = `${USER_NOTES_CACHE_KEY_PREFIX}${userId}:*`;
  
  await Promise.all([
    userCache.delete(cacheKey),
    userCache.delete(staleCacheKey),
    // Note: Redis pattern deletion would need a scan operation
    // For simplicity, we'll just delete the first page cache
    userCache.delete(`${USER_NOTES_CACHE_KEY_PREFIX}${userId}:1:20:latest`),
  ]);
  
  getLogger().info({ userId }, 'User cache invalidated');
}
