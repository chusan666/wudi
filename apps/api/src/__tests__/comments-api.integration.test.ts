import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import app from '@/index';
import { testPrisma } from './setup';

// Mock the prisma import to use test client
vi.mock('@/data-access/prisma', () => ({
  prisma: testPrisma,
}));

// Extend Hono types for tests
declare module 'hono' {
  interface ContextVariableMap {
    requestId: string;
    requestContext: { requestId: string };
  }
}

describe('Comments API Integration Tests', () => {
  let testNote: any;

  beforeAll(async () => {
    // Initialize test environment
  });

  beforeEach(async () => {
    // Clean up database
    await testPrisma.comment.deleteMany();
    await testPrisma.note.deleteMany();

    // Create test note
    testNote = await testPrisma.note.create({
      data: {
        title: 'Test Note',
        content: 'This is a test note for integration testing',
      },
    });
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  describe('GET /api/notes/:id/comments', () => {
    it('should return comments with correct structure', async () => {
      const res = await app.request(`/notes/${testNote.id}/comments`);

      expect(res.status).toBe(200);
      const body = await res.json();

      // Verify response structure
      expect(body).toHaveProperty('success', true);
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');

      // Verify data structure
      expect(body.data).toHaveProperty('comments');
      expect(body.data).toHaveProperty('pagination');
      expect(body.data).toHaveProperty('metadata');

      // Verify pagination structure
      expect(body.data.pagination).toHaveProperty('page');
      expect(body.data.pagination).toHaveProperty('pageSize');
      expect(body.data.pagination).toHaveProperty('total');
      expect(body.data.pagination).toHaveProperty('totalPages');

      // Verify metadata structure
      expect(body.data.metadata).toHaveProperty('fetchedAt');
      expect(body.data.metadata).toHaveProperty('noteId');
      expect(body.data.metadata).toHaveProperty('cacheHit');

      // Verify meta structure
      expect(body.meta).toHaveProperty('timestamp');
      expect(body.meta).toHaveProperty('requestId');
    });

    it('should handle nested comments correctly', async () => {
      // Create nested comment structure
      await createNestedCommentStructure(testNote.id);

      const res = await app.request(`/notes/${testNote.id}/comments`);

      expect(res.status).toBe(200);
      const body = await res.json();

      expect(body.data.comments).toHaveLength(1);
      const topLevelComment = body.data.comments[0];

      // Verify comment structure
      expect(topLevelComment).toHaveProperty('id');
      expect(topLevelComment).toHaveProperty('content');
      expect(topLevelComment).toHaveProperty('authorName');
      expect(topLevelComment).toHaveProperty('authorAvatar');
      expect(topLevelComment).toHaveProperty('likeCount');
      expect(topLevelComment).toHaveProperty('createdAt');
      expect(topLevelComment).toHaveProperty('updatedAt');
      expect(topLevelComment).toHaveProperty('sentiment');
      expect(topLevelComment).toHaveProperty('replies');

      // Verify nested structure
      expect(topLevelComment.replies).toHaveLength(2);
      const reply1 = topLevelComment.replies.find((r: any) => r.content.includes('Reply 1'));
      expect(reply1.replies).toHaveLength(1);
      expect(reply1.replies[0].content).toContain('Nested Reply');
    });

    it('should handle pagination edge cases', async () => {
      // Create exactly 10 comments
      await createTestComments(testNote.id, 10);

      // Test page size larger than total
      const res1 = await app.request(`/notes/${testNote.id}/comments?pageSize=20`);
      const body1 = await res1.json();
      expect(body1.data.comments).toHaveLength(10);
      expect(body1.data.pagination.totalPages).toBe(1);

      // Test page beyond available
      const res2 = await app.request(`/notes/${testNote.id}/comments?page=2&pageSize=10`);
      const body2 = await res2.json();
      expect(body2.data.comments).toHaveLength(0);
      expect(body2.data.pagination.page).toBe(2);
      expect(body2.data.pagination.totalPages).toBe(1);
    });

    it('should handle cache vs refresh behavior', async () => {
      // Create initial comments
      await createTestComments(testNote.id, 3);

      // First request - should be cache miss
      const res1 = await app.request(`/notes/${testNote.id}/comments`);
      const body1 = await res1.json();
      expect(body1.data.metadata.cacheHit).toBe(false);

      // Second request - should be cache hit
      const res2 = await app.request(`/notes/${testNote.id}/comments`);
      const body2 = await res2.json();
      expect(body2.data.metadata.cacheHit).toBe(true);

      // Force refresh - should be cache miss
      const res3 = await app.request(`/notes/${testNote.id}/comments?refresh=true`);
      const body3 = await res3.json();
      expect(body3.data.metadata.cacheHit).toBe(false);
    });

    it('should handle all query parameters simultaneously', async () => {
      await createTestCommentsWithReplies(testNote.id);

      const res = await app.request(
        `/notes/${testNote.id}/comments?page=1&pageSize=5&order=asc&minLikes=2&hasReplies=true&refresh=false`
      );

      expect(res.status).toBe(200);
      const body = await res.json();

      // Verify all comments have replies
      body.data.comments.forEach((comment: any) => {
        expect(comment.replies.length).toBeGreaterThan(0);
      });

      // Verify all comments have minimum likes
      body.data.comments.forEach((comment: any) => {
        expect(comment.likeCount).toBeGreaterThanOrEqual(2);
      });

      // Verify pagination
      expect(body.data.pagination.page).toBe(1);
      expect(body.data.pagination.pageSize).toBe(5);
    });

    it('should return 404 for non-existent note', async () => {
      const res = await app.request('/notes/non-existent-id/comments');

      expect(res.status).toBe(404);
      const body = await res.json();

      expect(body.success).toBe(false);
      expect(body.error.code).toBe('NOT_FOUND');
      expect(body.error.message).toContain('not found');
    });

    it('should validate all query parameters', async () => {
      const invalidParams = [
        { page: '0', expectedStatus: 400 },
        { pageSize: '101', expectedStatus: 400 },
        { order: 'invalid', expectedStatus: 400 },
        { minLikes: '-1', expectedStatus: 400 },
        { hasReplies: 'maybe', expectedStatus: 400 },
        { refresh: 'maybe', expectedStatus: 400 },
      ];

      for (const param of invalidParams) {
        const res = await app.request(`/notes/${testNote.id}/comments?${Object.entries(param)[0].join('=')}`);
        expect(res.status).toBe(param.expectedStatus);
      }
    });
  });

  // Helper functions
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
      });
    }

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
          likeCount: 3,
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
    const reply1 = await testPrisma.comment.create({
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

    await testPrisma.comment.create({
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
    await testPrisma.comment.create({
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