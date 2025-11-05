import { prisma } from '@/data-access/prisma';
import { CommentCrawler, RawComment } from '@/data-access/crawler';
import { logger } from '@/config/logger';
import { env } from '@/config/env';
import { CommentsQueryParams, CommentResponse } from '@/types';
import { NotFoundError } from '@/utils/errors';
import { differenceInSeconds, addSeconds } from 'date-fns';
import { cacheService } from '@/data-access/cache';
import { crawlerCircuitBreaker } from '@/middleware/circuit-breaker';
import { queueService, QUEUES, QueueJobData, QueueJobResult } from './queue.service';

export class CommentService {
  private crawler: CommentCrawler;

  constructor() {
    this.crawler = new CommentCrawler();
  }

  async getCommentsByNoteId(
    noteId: string,
    queryParams: CommentsQueryParams
  ): Promise<{
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
  }> {
    const {
      page = 1,
      pageSize = 20,
      order = 'desc',
      minLikes,
      hasReplies,
      refresh = false,
    } = queryParams;

    // Create cache key based on query parameters
    const cacheKey = `comments:${noteId}:${JSON.stringify({
      page,
      pageSize,
      order,
      minLikes,
      hasReplies,
    })}`;

    // Check if note exists
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new NotFoundError(`Note with id ${noteId} not found`);
    }

    // Use cache with background refresh
    const fetcher = async () => {
      // Check if we need to refresh data
      const shouldRefresh = refresh || await this.shouldRefreshComments(noteId);
      
      if (shouldRefresh) {
        logger.info({
          noteId,
          reason: refresh ? 'forced_refresh' : 'stale_data',
          message: 'Refreshing comments from external source',
        });

        await this.refreshCommentsFromSource(noteId);
      }

      // Build where clause for filters
      const whereClause: any = {
        noteId,
        parentId: null, // Only top-level comments
      };

      if (minLikes !== undefined) {
        whereClause.likeCount = { gte: minLikes };
      }

      if (hasReplies !== undefined) {
        if (hasReplies) {
          whereClause.replies = { some: {} };
        } else {
          whereClause.replies = { none: {} };
        }
      }

      // Get total count for pagination
      const total = await prisma.comment.count({ where: whereClause });

      // Get paginated top-level comments
      const comments = await prisma.comment.findMany({
        where: whereClause,
        orderBy: { createdAt: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          replies: {
            orderBy: { createdAt: 'asc' },
            include: {
              replies: {
                orderBy: { createdAt: 'asc' },
              },
            },
          },
        },
      });

      // Serialize comments with nested replies
      const serializedComments = await this.serializeCommentsWithReplies(comments);

      return {
        comments: serializedComments,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
        metadata: {
          fetchedAt: new Date().toISOString(),
          noteId,
          cacheHit: false,
        },
      };
    };

    // Get data from cache with background refresh
    const cacheResult = await cacheService.get(cacheKey);
    let cacheHit = cacheResult.hit;

    let result;
    if (cacheResult.data && !refresh) {
      result = cacheResult.data;
      
      // Schedule background refresh if data is stale
      if (cacheResult.stale) {
        this.scheduleBackgroundRefresh(noteId, cacheKey);
      }
    } else {
      result = await fetcher();
      await cacheService.set(cacheKey, result, {
        ttl: env.COMMENTS_CACHE_TTL,
        staleWhileRevalidate: env.CACHE_STALE_WHILE_REVALIDATE_TTL,
        tags: [`note:${noteId}`, 'comments'],
      });
    }

    return {
      comments: result.comments,
      pagination: result.pagination,
      metadata: {
        fetchedAt: result.metadata.fetchedAt,
        noteId: result.metadata.noteId,
        cacheHit,
      },
    };
  }

  private async shouldRefreshComments(noteId: string): Promise<boolean> {
    const latestComment = await prisma.comment.findFirst({
      where: { noteId },
      orderBy: { lastFetchedAt: 'desc' },
    });

    if (!latestComment) {
      return true; // No comments exist, need to fetch
    }

    const now = new Date();
    const lastFetched = latestComment.lastFetchedAt;
    const secondsSinceFetch = differenceInSeconds(now, lastFetched);

    return secondsSinceFetch > env.COMMENTS_CACHE_TTL;
  }

  private async refreshCommentsFromSource(noteId: string): Promise<void> {
    try {
      // Use circuit breaker for crawler operations
      const crawlerResponse = await crawlerCircuitBreaker.execute(async () => {
        return this.crawler.fetchComments(noteId);
      });
      
      if (crawlerResponse.comments.length === 0) {
        logger.info({
          noteId,
          message: 'No comments found from external source',
        });
        return;
      }

      // Process and save comments
      await this.saveRawComments(noteId, crawlerResponse.comments);

      logger.info({
        noteId,
        commentCount: crawlerResponse.comments.length,
        message: 'Successfully refreshed comments from external source',
      });
    } catch (error) {
      logger.error({
        noteId,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to refresh comments from external source',
      });
      throw error;
    }
  }

  private async saveRawComments(noteId: string, rawComments: RawComment[]): Promise<void> {
    // Process comments in a transaction to ensure data consistency
    await prisma.$transaction(async (tx: any) => {
      // Create a map for quick lookup of existing comments
      const existingComments = await tx.comment.findMany({
        where: { noteId },
        select: { id: true },
      });
      
      const existingIds = new Set<string>(existingComments.map((c: any) => c.id));

      // Group comments by parent-child relationships
      const topLevelComments: RawComment[] = [];
      const replyMap = new Map<string, RawComment[]>();

      for (const comment of rawComments) {
        if (!comment.parentId) {
          topLevelComments.push(comment);
        } else {
          if (!replyMap.has(comment.parentId)) {
            replyMap.set(comment.parentId, []);
          }
          replyMap.get(comment.parentId)!.push(comment);
        }
      }

      // Save top-level comments first
      for (const comment of topLevelComments) {
        await this.saveComment(tx, noteId, comment, null, existingIds);
      }

      // Save replies
      for (const [parentId, replies] of replyMap) {
        for (const reply of replies) {
          await this.saveComment(tx, noteId, reply, parentId, existingIds);
        }
      }
    });
  }

  private async saveComment(
    tx: any,
    noteId: string,
    comment: RawComment,
    parentId: string | null,
    existingIds: Set<string>
  ): Promise<void> {
    const now = new Date();
    
    // Analyze sentiment if not provided
    const sentiment = comment.sentiment || await this.crawler.analyzeSentiment(comment.content);

    const data = {
      id: comment.id,
      noteId,
      parentId,
      content: comment.content,
      authorName: comment.authorName,
      authorAvatar: comment.authorAvatar,
      likeCount: comment.likeCount,
      sentiment,
      lastFetchedAt: now,
      createdAt: comment.createdAt ? new Date(comment.createdAt) : now,
      updatedAt: now,
    };

    if (existingIds.has(comment.id)) {
      // Update existing comment
      await tx.comment.update({
        where: { id: comment.id },
        data,
      });
    } else {
      // Create new comment
      await tx.comment.create({
        data,
      });
    }
  }

  private async serializeCommentsWithReplies(comments: any[]): Promise<CommentResponse[]> {
    const serialized: CommentResponse[] = [];

    for (const comment of comments) {
      const serializedComment: CommentResponse = {
        id: comment.id,
        content: comment.content,
        authorName: comment.authorName,
        authorAvatar: comment.authorAvatar,
        likeCount: comment.likeCount,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        sentiment: comment.sentiment,
        replies: [],
      };

      // Serialize nested replies
      if (comment.replies && comment.replies.length > 0) {
        serializedComment.replies = await this.serializeNestedReplies(comment.replies);
      }

      serialized.push(serializedComment);
    }

    return serialized;
  }

  private async serializeNestedReplies(replies: any[]): Promise<CommentResponse[]> {
    const serialized: CommentResponse[] = [];

    for (const reply of replies) {
      const serializedReply: CommentResponse = {
        id: reply.id,
        content: reply.content,
        authorName: reply.authorName,
        authorAvatar: reply.authorAvatar,
        likeCount: reply.likeCount,
        createdAt: reply.createdAt.toISOString(),
        updatedAt: reply.updatedAt.toISOString(),
        sentiment: reply.sentiment,
        replies: [],
      };

      // Recursively serialize nested replies
      if (reply.replies && reply.replies.length > 0) {
        serializedReply.replies = await this.serializeNestedReplies(reply.replies);
      }

      serialized.push(serializedReply);
    }

    return serialized;
  }

  /**
   * Schedule background refresh for comments
   */
  private async scheduleBackgroundRefresh(noteId: string, cacheKey: string): Promise<void> {
    try {
      const jobData: QueueJobData = {
        type: 'refresh-comments',
        payload: {
          noteId,
          cacheKey,
        },
        timestamp: Date.now(),
      };

      await queueService.addJob(QUEUES.CACHE_REFRESH, jobData);
      
      logger.debug({
        noteId,
        cacheKey,
        message: 'Background refresh scheduled',
      });
    } catch (error) {
      logger.error({
        noteId,
        cacheKey,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to schedule background refresh',
      });
    }
  }

  /**
   * Process background refresh jobs
   */
  async processBackgroundRefreshJob(jobData: QueueJobData): Promise<QueueJobResult> {
    const startTime = Date.now();
    
    try {
      const { noteId, cacheKey } = jobData.payload;
      
      logger.info({
        noteId,
        cacheKey,
        jobId: jobData.timestamp,
        message: 'Processing background refresh job',
      });

      // Refresh comments
      await this.refreshCommentsFromSource(noteId);
      
      // Invalidate related cache entries
      await cacheService.invalidateByTag(`note:${noteId}`);
      
      logger.info({
        noteId,
        cacheKey,
        duration: Date.now() - startTime,
        message: 'Background refresh job completed',
      });

      return {
        success: true,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        jobData,
        duration: Date.now() - startTime,
        message: 'Background refresh job failed',
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      };
    }
  }
}