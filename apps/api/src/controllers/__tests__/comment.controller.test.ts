import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import { CommentController } from '../comment.controller';
import { Hono } from 'hono';
import { NoteService } from '@/services/note.service';
import { testPrisma } from '../../__tests__/setup';

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

describe('CommentController', () => {
  let commentController: CommentController;
  let noteService: NoteService;
  let app: Hono;
  let testNote: any;

  beforeAll(async () => {
    commentController = new CommentController();
    noteService = new NoteService();
    
    // Create test app with the controller
    app = new Hono();
    app.get('/notes/:id/comments', commentController.getCommentsByNoteId.bind(commentController));
    
    // Mock request context
    app.use('*', async (c, next) => {
      c.set('requestContext', { requestId: 'test-request-id' });
      await next();
    });
  });

  beforeEach(async () => {
    // Clean up database
    await testPrisma.comment.deleteMany();
    await testPrisma.note.deleteMany();

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
    it('should return 200 with empty comments for note with no comments', async () => {
      const res = await app.request(`/notes/${testNote.id}/comments`);

      expect(res.status).toBe(200);
      const body = await res.json();
      
      expect(body.success).toBe(true);
      expect(body.data.comments).toEqual([]);
      expect(body.data.pagination.total).toBe(0);
      expect(body.data.metadata.noteId).toBe(testNote.id);
      expect(body.meta.requestId).toBe('test-request-id');
    });

    it('should handle pagination parameters correctly', async () => {
      // Create test comments
      await createTestComments(testNote.id, 15);

      const res = await app.request(`/notes/${testNote.id}/comments?page=2&pageSize=5`);

      expect(res.status).toBe(200);
      const body = await res.json();
      
      expect(body.data.comments).toHaveLength(5);
      expect(body.data.pagination.page).toBe(2);
      expect(body.data.pagination.pageSize).toBe(5);
      expect(body.data.pagination.total).toBe(15);
      expect(body.data.pagination.totalPages).toBe(3);
    });

    it('should validate pagination parameters', async () => {
      // Test invalid page
      const res1 = await app.request(`/notes/${testNote.id}/comments?page=0`);
      expect(res1.status).toBe(400);
      
      // Test invalid pageSize
      const res2 = await app.request(`/notes/${testNote.id}/comments?pageSize=101`);
      expect(res2.status).toBe(400);
      
      // Test invalid order
      const res3 = await app.request(`/notes/${testNote.id}/comments?order=invalid`);
      expect(res3.status).toBe(400);
    });

    it('should handle filter parameters correctly', async () => {
      await createTestCommentsWithVaryingLikes(testNote.id);

      const res = await app.request(`/notes/${testNote.id}/comments?minLikes=5`);

      expect(res.status).toBe(200);
      const body = await res.json();
      
      expect(body.data.comments).toHaveLength(3);
      body.data.comments.forEach((comment: any) => {
        expect(comment.likeCount).toBeGreaterThanOrEqual(5);
      });
    });

    it('should validate filter parameters', async () => {
      // Test invalid minLikes
      const res1 = await app.request(`/notes/${testNote.id}/comments?minLikes=-1`);
      expect(res1.status).toBe(400);
      
      // Test invalid hasReplies
      const res2 = await app.request(`/notes/${testNote.id}/comments?hasReplies=maybe`);
      expect(res2.status).toBe(400);
      
      // Test invalid refresh
      const res3 = await app.request(`/notes/${testNote.id}/comments?refresh=maybe`);
      expect(res3.status).toBe(400);
    });

    it('should return 404 for non-existent note', async () => {
      const res = await app.request('/notes/non-existent-id/comments');

      expect(res.status).toBe(404);
      const body = await res.json();
      
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('NOT_FOUND');
    });

    it('should handle refresh parameter correctly', async () => {
      // Create initial comments
      await createTestComments(testNote.id, 3);

      // First call should refresh
      const res1 = await app.request(`/notes/${testNote.id}/comments`);
      expect(res1.status).toBe(200);
      const body1 = await res1.json();
      expect(body1.data.metadata.cacheHit).toBe(false);

      // Second call should use cache
      const res2 = await app.request(`/notes/${testNote.id}/comments`);
      expect(res2.status).toBe(200);
      const body2 = await res2.json();
      expect(body2.data.metadata.cacheHit).toBe(true);

      // Force refresh should bypass cache
      const res3 = await app.request(`/notes/${testNote.id}/comments?refresh=true`);
      expect(res3.status).toBe(200);
      const body3 = await res3.json();
      expect(body3.data.metadata.cacheHit).toBe(false);
    });

    it('should serialize nested replies correctly', async () => {
      await createNestedCommentStructure(testNote.id);

      const res = await app.request(`/notes/${testNote.id}/comments`);

      expect(res.status).toBe(200);
      const body = await res.json();
      
      expect(body.data.comments).toHaveLength(1);
      const topLevelComment = body.data.comments[0];
      expect(topLevelComment.replies).toHaveLength(2);

      // Check nested structure
      const reply1 = topLevelComment.replies.find((r: any) => r.content.includes('Reply 1'));
      expect(reply1).toBeDefined();
      expect(reply1.replies).toHaveLength(1);
      expect(reply1.replies[0].content).toContain('Nested Reply');
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

    await testPrisma.comment.createMany({
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

    await testPrisma.comment.createMany({
      data: comments,
    });
  }

  async function createNestedCommentStructure(noteId: string) {
    // Create top-level comment
    const parent = await testPrisma.comment.create({
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