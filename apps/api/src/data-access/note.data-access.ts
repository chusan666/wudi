import { prisma } from '@repo/db';
import type { Note, User, NoteStatistics as PrismaNoteStatistics, NoteMedia as PrismaNoteMedia } from '@prisma/client';
import type { CrawledNoteData } from '@/types/note.js';

export type NoteWithRelations = Note & {
  author: User;
  statistics: PrismaNoteStatistics | null;
  media: PrismaNoteMedia[];
};

export async function findNoteById(noteId: string): Promise<NoteWithRelations | null> {
  return prisma.note.findUnique({
    where: { id: noteId },
    include: {
      author: true,
      statistics: true,
      media: {
        orderBy: { order: 'asc' },
      },
    },
  });
}

export async function upsertNote(crawledData: CrawledNoteData): Promise<NoteWithRelations> {
  const { noteId, authorId, authorUsername, authorName, authorAvatar, ...noteData } = crawledData;

  // First, ensure user exists (upsert)
  const user = await prisma.user.upsert({
    where: { id: authorId },
    update: {
      username: authorUsername,
      name: authorName,
      avatar: authorAvatar,
    },
    create: {
      id: authorId,
      email: `${authorUsername}@xiaohongshu.com`,
      username: authorUsername,
      name: authorName,
      avatar: authorAvatar,
    },
  });

  // Generate slug from title
  const slug = noteData.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100) + `-${noteId.substring(0, 8)}`;

  // Upsert note with statistics and media
  const note = await prisma.note.upsert({
    where: { id: noteId },
    update: {
      title: noteData.title,
      content: noteData.content,
      tags: noteData.tags,
      publishedAt: noteData.publishedAt,
      published: true,
      updatedAt: new Date(),
    },
    create: {
      id: noteId,
      title: noteData.title,
      content: noteData.content,
      slug,
      published: true,
      authorId: user.id,
      tags: noteData.tags,
      publishedAt: noteData.publishedAt || new Date(),
    },
    include: {
      author: true,
      statistics: true,
      media: {
        orderBy: { order: 'asc' },
      },
    },
  });

  // Upsert statistics
  await prisma.noteStatistics.upsert({
    where: { noteId },
    update: {
      viewCount: noteData.viewCount,
      likeCount: noteData.likeCount,
      shareCount: noteData.shareCount,
      commentCount: noteData.commentCount,
      updatedAt: new Date(),
    },
    create: {
      noteId,
      viewCount: noteData.viewCount,
      likeCount: noteData.likeCount,
      shareCount: noteData.shareCount,
      commentCount: noteData.commentCount,
    },
  });

  // Delete existing media and recreate (simpler than complex upsert logic)
  await prisma.noteMedia.deleteMany({
    where: { noteId },
  });

  if (noteData.mediaUrls.length > 0) {
    await prisma.noteMedia.createMany({
      data: noteData.mediaUrls.map((media, index) => ({
        noteId,
        url: media.url,
        type: media.type,
        width: media.width,
        height: media.height,
        order: index,
      })),
    });
  }

  // Fetch and return the complete note with all relations
  const updatedNote = await findNoteById(noteId);
  if (!updatedNote) {
    throw new Error('Failed to fetch updated note');
  }

  return updatedNote;
}

export async function createQueryLog(data: {
  query: string;
  params?: Record<string, unknown>;
  duration: number;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  await prisma.queryLog.create({
    data: {
      query: data.query,
      params: data.params || null,
      duration: data.duration,
      userId: data.userId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      timestamp: new Date(),
    },
  });
}
