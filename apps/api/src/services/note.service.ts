import { noteCache, TTL } from '@repo/db/redis';
import { getLogger } from '@/config/logger.js';
import { NotFoundError, CrawlerError } from '@/types/errors.js';
import type { NoteDetail } from '@/types/note.js';
import * as noteDataAccess from '@/data-access/note.data-access.js';
import * as crawlerDataAccess from '@/data-access/crawler.data-access.js';

const CACHE_KEY_PREFIX = 'note:detail:';
const CACHE_STALE_SUFFIX = ':stale';

interface GetNoteOptions {
  forceRefresh?: boolean;
  skipCache?: boolean;
}

function transformNoteToDetail(note: noteDataAccess.NoteWithRelations): NoteDetail {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    slug: note.slug,
    published: note.published,
    tags: note.tags,
    author: {
      id: note.author.id,
      username: note.author.username,
      name: note.author.name || undefined,
      avatar: note.author.avatar || undefined,
      bio: note.author.bio || undefined,
    },
    statistics: {
      viewCount: note.statistics?.viewCount || 0,
      likeCount: note.statistics?.likeCount || 0,
      shareCount: note.statistics?.shareCount || 0,
      commentCount: note.statistics?.commentCount || 0,
    },
    media: note.media.map((m) => ({
      id: m.id,
      url: m.url,
      type: m.type,
      mimeType: m.mimeType || undefined,
      size: m.size || undefined,
      width: m.width || undefined,
      height: m.height || undefined,
      alt: m.alt || undefined,
      order: m.order,
    })),
    publishedAt: note.publishedAt?.toISOString(),
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

async function fetchAndPersistNote(noteId: string): Promise<NoteDetail> {
  const logger = getLogger();
  
  // Crawl the note
  logger.info({ noteId }, 'Fetching note from crawler');
  const crawledData = await crawlerDataAccess.crawlNote(noteId);

  // Persist to database
  logger.info({ noteId }, 'Persisting note to database');
  const note = await noteDataAccess.upsertNote(crawledData);

  // Transform to API response format
  const noteDetail = transformNoteToDetail(note);

  // Cache the result
  logger.info({ noteId }, 'Caching note detail');
  await noteCache.set(CACHE_KEY_PREFIX + noteId, noteDetail, { ttl: TTL.LONG });

  return noteDetail;
}

export async function getNote(
  noteId: string,
  options: GetNoteOptions = {}
): Promise<NoteDetail> {
  const logger = getLogger();
  const cacheKey = CACHE_KEY_PREFIX + noteId;
  const staleCacheKey = cacheKey + CACHE_STALE_SUFFIX;

  // Skip cache if requested
  if (options.skipCache || options.forceRefresh) {
    logger.info({ noteId, options }, 'Skipping cache');
    return fetchAndPersistNote(noteId);
  }

  // Try to get from cache
  logger.debug({ noteId }, 'Checking cache');
  const cached = await noteCache.get<NoteDetail>(cacheKey);

  if (cached) {
    logger.info({ noteId }, 'Cache hit');
    return cached;
  }

  logger.info({ noteId }, 'Cache miss');

  // Check for stale cache (stale-while-revalidate)
  const staleCache = await noteCache.get<NoteDetail>(staleCacheKey);

  if (staleCache) {
    logger.info({ noteId }, 'Serving stale cache, triggering background refresh');
    
    // Return stale data immediately
    // Trigger background refresh (don't await)
    fetchAndPersistNote(noteId)
      .then((fresh) => {
        logger.info({ noteId }, 'Background refresh completed');
        // Update stale cache for next time
        noteCache.set(staleCacheKey, fresh, { ttl: TTL.SHORT });
      })
      .catch((error) => {
        logger.error({ noteId, error }, 'Background refresh failed');
      });

    return staleCache;
  }

  // No cache at all, fetch fresh
  try {
    const noteDetail = await fetchAndPersistNote(noteId);
    
    // Also set stale cache for stale-while-revalidate
    await noteCache.set(staleCacheKey, noteDetail, { ttl: TTL.LONG + TTL.MEDIUM });
    
    return noteDetail;
  } catch (error) {
    // If crawler fails, try to get from database
    logger.warn({ noteId, error }, 'Crawler failed, attempting database fallback');
    
    const dbNote = await noteDataAccess.findNoteById(noteId);
    if (dbNote) {
      logger.info({ noteId }, 'Serving from database fallback');
      const noteDetail = transformNoteToDetail(dbNote);
      
      // Cache the database result with shorter TTL
      await noteCache.set(cacheKey, noteDetail, { ttl: TTL.MEDIUM });
      
      return noteDetail;
    }

    // Note doesn't exist in database either
    throw new NotFoundError('Note', noteId);
  }
}

export async function invalidateNoteCache(noteId: string): Promise<void> {
  const cacheKey = CACHE_KEY_PREFIX + noteId;
  const staleCacheKey = cacheKey + CACHE_STALE_SUFFIX;
  
  await Promise.all([
    noteCache.delete(cacheKey),
    noteCache.delete(staleCacheKey),
  ]);
  
  getLogger().info({ noteId }, 'Note cache invalidated');
}
