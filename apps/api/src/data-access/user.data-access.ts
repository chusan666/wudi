import { prisma } from '@repo/db';
import type { User, UserStatistics as PrismaUserStatistics, Note, NoteStatistics as PrismaNoteStatistics } from '@prisma/client';
import type { CrawledUserData } from '@/types/user.js';

export type UserWithStats = User & {
  statistics: PrismaUserStatistics | null;
};

export type NoteWithStats = Note & {
  statistics: PrismaNoteStatistics | null;
};

export async function findUserById(userId: string): Promise<UserWithStats | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      statistics: true,
    },
  });
}

export async function upsertUser(crawledData: CrawledUserData): Promise<UserWithStats> {
  const user = await prisma.user.upsert({
    where: { id: crawledData.userId },
    update: {
      username: crawledData.username,
      name: crawledData.name,
      avatar: crawledData.avatar,
      bio: crawledData.bio,
      metadata: {
        certifications: crawledData.certifications,
        location: crawledData.location,
        ipLocation: crawledData.ipLocation,
        gender: crawledData.gender,
      },
      updatedAt: new Date(),
    },
    create: {
      id: crawledData.userId,
      email: `${crawledData.username}@xiaohongshu.com`,
      username: crawledData.username,
      name: crawledData.name,
      avatar: crawledData.avatar,
      bio: crawledData.bio,
      metadata: {
        certifications: crawledData.certifications,
        location: crawledData.location,
        ipLocation: crawledData.ipLocation,
        gender: crawledData.gender,
      },
    },
    include: {
      statistics: true,
    },
  });

  // Upsert statistics
  await prisma.userStatistics.upsert({
    where: { userId: crawledData.userId },
    update: {
      followerCount: crawledData.followerCount,
      followingCount: crawledData.followingCount,
      noteCount: crawledData.noteCount,
      likeCount: crawledData.likeCount,
      collectCount: crawledData.collectCount,
      updatedAt: new Date(),
    },
    create: {
      userId: crawledData.userId,
      followerCount: crawledData.followerCount,
      followingCount: crawledData.followingCount,
      noteCount: crawledData.noteCount,
      likeCount: crawledData.likeCount,
      collectCount: crawledData.collectCount,
    },
  });

  // Fetch and return the complete user with statistics
  const updatedUser = await findUserById(crawledData.userId);
  if (!updatedUser) {
    throw new Error('Failed to fetch updated user');
  }

  return updatedUser;
}

export interface FindUserNotesOptions {
  page?: number;
  pageSize?: number;
  sort?: 'latest' | 'popular' | 'oldest';
}

export async function findUserNotes(
  userId: string,
  options: FindUserNotesOptions = {}
): Promise<{ notes: NoteWithStats[]; total: number }> {
  const { page = 1, pageSize = 20, sort = 'latest' } = options;
  const skip = (page - 1) * pageSize;

  // Determine sort order
  let orderBy: any;
  switch (sort) {
    case 'popular':
      orderBy = { statistics: { likeCount: 'desc' } };
      break;
    case 'oldest':
      orderBy = { publishedAt: 'asc' };
      break;
    case 'latest':
    default:
      orderBy = { publishedAt: 'desc' };
      break;
  }

  const [notes, total] = await Promise.all([
    prisma.note.findMany({
      where: {
        authorId: userId,
        published: true,
      },
      include: {
        statistics: true,
      },
      orderBy,
      skip,
      take: pageSize,
    }),
    prisma.note.count({
      where: {
        authorId: userId,
        published: true,
      },
    }),
  ]);

  return { notes, total };
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
      params: data.params as any,
      duration: data.duration,
      userId: data.userId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      timestamp: new Date(),
    },
  });
}
