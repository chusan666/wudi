import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import { CommentService } from '../comment.service';
import { NoteService } from '../note.service';
import { prisma } from '@/data-access/prisma';
import { env } from '@/config/env';
import { testPrisma } from '../../__tests__/setup';

// Mock the prisma import to use test client
vi.mock('@/data-access/prisma', () => ({
  prisma: testPrisma,
}));

describe('CommentService', () => {
  let commentService: CommentService;
  let noteService: NoteService;
  let testNote: any;

  beforeAll(async () => {
    // Initialize test environment
    commentService = new CommentService();
    noteService = new NoteService();
  });

  beforeEach(async () => {
    // Clean up database
    await prisma.comment.deleteMany();
    await prisma.note.deleteMany();

    // Create test note
    testNote = await noteService.createNote({
      title: 'Test Note',
      content: 'This is a test note for comments',
    });
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  describe('getCommentsByNoteId', () => {
    it('should return empty comments for note with no comments', async () => {
      const result = await commentService.getCommentsByNoteId(testNote.id, {});

      expect(result.comments).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.metadata.noteId).toBe(testNote.id);
      expect(result.metadata.cacheHit).toBe(false); // Should refresh when no comments exist
    });

    it('should handle pagination correctly', async () => {
      // Create test comments
      await createTestComments(testNote.id, 25);

      // Test first page
      const firstPage = await commentService.getCommentsByNoteId(testNote.id, {
        page: 1,
        pageSize: 10,
      });

      expect(firstPage.comments).toHaveLength(10);
      expect(firstPage.pagination.page).toBe(1);
      expect(firstPage.pagination.pageSize).toBe(10);
      expect(firstPage.pagination.total).toBe(25);
      expect(firstPage.pagination.totalPages).toBe(3);

      // Test second page
      const secondPage = await commentService.getCommentsByNoteId(testNote.id, {
        page: 2,
        pageSize: 10,
      });

      expect(secondPage.comments).toHaveLength(10);
      expect(secondPage.pagination.page).toBe(2);

      // Test last page
      const lastPage = await commentService.getCommentsByNoteId(testNote.id, {
        page: 3,
        pageSize: 10,
      });

      expect(lastPage.comments).toHaveLength(5);
      expect(lastPage.pagination.page).toBe(3);
    });

    it('should filter comments by minimum likes', async () => {
      await createTestCommentsWithVaryingLikes(testNote.id);

      const result = await commentService.getCommentsByNoteId(testNote.id, {
        minLikes: 5,
      });

      expect(result.comments).toHaveLength(3); // Only comments with 5+ likes
      result.comments.forEach(comment => {
        expect(comment.likeCount).toBeGreaterThanOrEqual(5);
      });
    });

    it('should filter comments by replies presence', async () => {
      await createTestCommentsWithReplies(testNote.id);

      // Test with hasReplies: true
      const withReplies = await commentService.getCommentsByNoteId(testNote.id, {
        hasReplies: true,
      });

      expect(withReplies.comments).toHaveLength(2); // Comments that have replies
      withReplies.comments.forEach(comment => {
        expect(comment.replies.length).toBeGreaterThan(0);
      });

      // Test with hasReplies: false
      const withoutReplies = await commentService.getCommentsByNoteId(testNote.id, {
        hasReplies: false,
      });

      expect(withoutReplies.comments).toHaveLength(1); // Comments without replies
      withoutReplies.comments.forEach(comment => {
        expect(comment.replies.length).toBe(0);
      });
    });

    it('should serialize nested replies correctly', async () => {
      await createNestedCommentStructure(testNote.id);

      const result = await commentService.getCommentsByNoteId(testNote.id, {});

      expect(result.comments).toHaveLength(1);
      const topLevelComment = result.comments[0];
      expect(topLevelComment.replies).toHaveLength(2);

      // Check first level replies
      const reply1 = topLevelComment.replies.find(r => r.content.includes('Reply 1'));
      const reply2 = topLevelComment.replies.find(r => r.content.includes('Reply 2'));

      expect(reply1).toBeDefined();
      expect(reply2).toBeDefined();
      expect(reply1!.replies).toHaveLength(1); // Reply 1 has a nested reply
      expect(reply2!.replies).toHaveLength(0); // Reply 2 has no nested replies

      // Check nested reply
      const nestedReply = reply1!.replies[0];
      expect(nestedReply.content).toContain('Nested Reply');
      expect(nestedReply.replies).toHaveLength(0);
    });

    it('should handle cache refresh behavior', async () => {
      // Create initial comments
      await createTestComments(testNote.id, 5);

      // First call should refresh (cache miss)
      const firstCall = await commentService.getCommentsByNoteId(testNote.id, {});
      expect(firstCall.metadata.cacheHit).toBe(false);

      // Second call should use cache (within TTL)
      const secondCall = await commentService.getCommentsByNoteId(testNote.id, {});
      expect(secondCall.metadata.cacheHit).toBe(true);

      // Force refresh should bypass cache
      const forceRefresh = await commentService.getCommentsByNoteId(testNote.id, {
        refresh: true,
      });
      expect(forceRefresh.metadata.cacheHit).toBe(false);
    });

    it('should throw NotFoundError for non-existent note', async () => {
      await expect(
        commentService.getCommentsByNoteId('non-existent-id', {})
      ).rejects.toThrow('Note with id non-existent-id not found');
    });
  });

  // Helper functions for creating test data
  async function createTestComments(noteId: string, count: number) {
    const comments = [];
    for (let i = 0; i < count; i++) {
      comments.push({
        id: `comment-${i}`,
        noteId,
        content: `Test comment ${i}`,
        authorName: `Author ${i}`,
        likeCount: i,
        lastFetchedAt: new Date(),
        createdAt: new Date(Date.now() - i * 1000), // Stagger creation times
      });
    }

    await prisma.comment.createMany({
      data: comments,
    });
  }

  async function createTestCommentsWithVaryingLikes(noteId: string) {
    const comments = [
      {
        id: 'comment-low-1',
        noteId,
        content: 'Low likes comment 1',
        authorName: 'Author 1',
        likeCount: 2,
        lastFetchedAt: new Date(),
      },
      {
        id: 'comment-low-2',
        noteId,
        content: 'Low likes comment 2',
        authorName: 'Author 2',
        likeCount: 3,
        lastFetchedAt: new Date(),
      },
      {
        id: 'comment-medium-1',
        noteId,
        content: 'Medium likes comment 1',
        authorName: 'Author 3',
        likeCount: 5,
        lastFetchedAt: new Date(),
      },
      {
        id: 'comment-medium-2',
        noteId,
        content: 'Medium likes comment 2',
        authorName: 'Author 4',
        likeCount: 8,
        lastFetchedAt: new Date(),
      },
      {
        id: 'comment-high-1',
        noteId,
        content: 'High likes comment 1',
        authorName: 'Author 5',
        likeCount: 15,
        lastFetchedAt: new Date(),
      },
    ];

    await prisma.comment.createMany({
      data: comments,
    });
  }

  async function createTestCommentsWithReplies(noteId: string) {
    // Create parent comments
    const parent1 = await prisma.comment.create({
      data: {
        id: 'parent-1',
        noteId,
        content: 'Parent comment with replies',
        authorName: 'Parent Author 1',
        likeCount: 10,
        lastFetchedAt: new Date(),
      },
    });

    const parent2 = await prisma.comment.create({
      data: {
        id: 'parent-2',
        noteId,
        content: 'Another parent with replies',
        authorName: 'Parent Author 2',
        likeCount: 5,
        lastFetchedAt: new Date(),
      },
    });

    const parent3 = await prisma.comment.create({
      data: {
        id: 'parent-3',
        noteId,
        content: 'Parent without replies',
        authorName: 'Parent Author 3',
        likeCount: 3,
        lastFetchedAt: new Date(),
      },
    });

    // Create replies
    await prisma.comment.createMany({
      data: [
        {
          id: 'reply-1',
          noteId,
          parentId: parent1.id,
          content: 'Reply to parent 1',
          authorName: 'Reply Author 1',
          likeCount: 2,
          lastFetchedAt: new Date(),
        },
        {
          id: 'reply-2',
          noteId,
          parentId: parent1.id,
          content: 'Another reply to parent 1',
          authorName: 'Reply Author 2',
          likeCount: 1,
          lastFetchedAt: new Date(),
        },
        {
          id: 'reply-3',
          noteId,
          parentId: parent2.id,
          content: 'Reply to parent 2',
          authorName: 'Reply Author 3',
          likeCount: 4,
          lastFetchedAt: new Date(),
        },
      ],
    });
  }

  async function createNestedCommentStructure(noteId: string) {
    // Create top-level comment
    const parent = await prisma.comment.create({
      data: {
        id: 'nested-parent',
        noteId,
        content: 'Top level comment',
        authorName: 'Parent Author',
        likeCount: 10,
        lastFetchedAt: new Date(),
      },
    });

    // Create first-level replies
    const reply1 = await prisma.comment.create({
      data: {
        id: 'reply-1',
        noteId,
        parentId: parent.id,
        content: 'Reply 1 to parent',
        authorName: 'Reply Author 1',
        likeCount: 3,
        lastFetchedAt: new Date(),
      },
    });

    await prisma.comment.create({
      data: {
        id: 'reply-2',
        noteId,
        parentId: parent.id,
        content: 'Reply 2 to parent',
        authorName: 'Reply Author 2',
        likeCount: 2,
        lastFetchedAt: new Date(),
      },
    });

    // Create nested reply
    await prisma.comment.create({
      data: {
        id: 'nested-reply-1',
        noteId,
        parentId: reply1.id,
        content: 'Nested Reply to Reply 1',
        authorName: 'Nested Author',
        likeCount: 1,
        lastFetchedAt: new Date(),
      },
    });
  }
});