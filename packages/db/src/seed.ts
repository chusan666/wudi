import { prisma } from './index';

async function main() {
  console.log('🌱 Starting database seeding...');

  console.log('Creating users...');
  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      username: 'alice',
      name: 'Alice Johnson',
      bio: 'Full-stack developer and tech enthusiast',
      avatar: 'https://i.pravatar.cc/150?u=alice',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      username: 'bob',
      name: 'Bob Smith',
      bio: 'Backend engineer specializing in distributed systems',
      avatar: 'https://i.pravatar.cc/150?u=bob',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'charlie@example.com',
      username: 'charlie',
      name: 'Charlie Brown',
      bio: 'Frontend developer and UI/UX designer',
      avatar: 'https://i.pravatar.cc/150?u=charlie',
    },
  });

  console.log('Creating notes...');
  const note1 = await prisma.note.create({
    data: {
      title: 'Getting Started with Prisma',
      content: 'Prisma is a next-generation ORM that makes database access easy. It provides type-safe database queries and automatic migrations.',
      slug: 'getting-started-with-prisma',
      published: true,
      authorId: user1.id,
      tags: ['prisma', 'database', 'orm', 'typescript'],
      publishedAt: new Date(),
      metadata: {
        readTime: 5,
        difficulty: 'beginner',
      },
    },
  });

  const note2 = await prisma.note.create({
    data: {
      title: 'Redis Caching Strategies',
      content: 'Redis is an in-memory data structure store used as a database, cache, and message broker. Learn about effective caching strategies.',
      slug: 'redis-caching-strategies',
      published: true,
      authorId: user2.id,
      tags: ['redis', 'caching', 'performance', 'backend'],
      publishedAt: new Date(),
      metadata: {
        readTime: 8,
        difficulty: 'intermediate',
      },
    },
  });

  const note3 = await prisma.note.create({
    data: {
      title: 'Building REST APIs with Node.js',
      content: 'A comprehensive guide to building RESTful APIs using Node.js, Express, and modern best practices.',
      slug: 'building-rest-apis-with-nodejs',
      published: true,
      authorId: user1.id,
      tags: ['nodejs', 'api', 'express', 'backend'],
      publishedAt: new Date(),
      metadata: {
        readTime: 12,
        difficulty: 'intermediate',
      },
    },
  });

  const note4 = await prisma.note.create({
    data: {
      title: 'Draft: Microservices Architecture',
      content: 'This is a draft article about microservices architecture patterns and best practices.',
      slug: 'microservices-architecture-draft',
      published: false,
      authorId: user2.id,
      tags: ['microservices', 'architecture', 'distributed-systems'],
      metadata: {
        readTime: 15,
        difficulty: 'advanced',
      },
    },
  });

  console.log('Creating note statistics...');
  await prisma.noteStatistics.createMany({
    data: [
      {
        noteId: note1.id,
        viewCount: 1250,
        likeCount: 87,
        shareCount: 23,
        commentCount: 12,
      },
      {
        noteId: note2.id,
        viewCount: 890,
        likeCount: 65,
        shareCount: 15,
        commentCount: 8,
      },
      {
        noteId: note3.id,
        viewCount: 2100,
        likeCount: 156,
        shareCount: 42,
        commentCount: 24,
      },
      {
        noteId: note4.id,
        viewCount: 45,
        likeCount: 3,
        shareCount: 0,
        commentCount: 1,
      },
    ],
  });

  console.log('Creating note media...');
  await prisma.noteMedia.createMany({
    data: [
      {
        noteId: note1.id,
        url: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c',
        type: 'image',
        mimeType: 'image/jpeg',
        size: 2048576,
        width: 1920,
        height: 1080,
        alt: 'Prisma logo',
        order: 1,
      },
      {
        noteId: note2.id,
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31',
        type: 'image',
        mimeType: 'image/jpeg',
        size: 1856432,
        width: 1920,
        height: 1080,
        alt: 'Redis server visualization',
        order: 1,
      },
      {
        noteId: note3.id,
        url: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479',
        type: 'image',
        mimeType: 'image/jpeg',
        size: 1920341,
        width: 1920,
        height: 1080,
        alt: 'Node.js development',
        order: 1,
      },
    ],
  });

  console.log('Creating comments...');
  const comment1 = await prisma.comment.create({
    data: {
      content: 'Great article! Very helpful for beginners.',
      noteId: note1.id,
      authorId: user2.id,
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      content: 'Thanks for sharing this. The examples are clear and concise.',
      noteId: note1.id,
      authorId: user3.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Glad you found it helpful! Let me know if you have questions.',
      noteId: note1.id,
      authorId: user1.id,
      parentId: comment1.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Excellent caching strategies! I implemented the cache-aside pattern and saw 40% performance improvement.',
      noteId: note2.id,
      authorId: user1.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'This is the most comprehensive REST API guide I\'ve read. Thank you!',
      noteId: note3.id,
      authorId: user3.id,
    },
  });

  console.log('Creating crawler jobs...');
  await prisma.crawlerJob.createMany({
    data: [
      {
        url: 'https://example.com/page1',
        status: 'completed',
        priority: 1,
        attempts: 1,
        result: {
          title: 'Example Page 1',
          description: 'Sample crawled content',
          links: ['https://example.com/page2'],
        },
        scheduledAt: new Date(Date.now() - 3600000),
        startedAt: new Date(Date.now() - 3550000),
        completedAt: new Date(Date.now() - 3540000),
      },
      {
        url: 'https://example.com/page2',
        status: 'pending',
        priority: 2,
        attempts: 0,
        metadata: {
          source: 'automated',
          category: 'technology',
        },
      },
      {
        url: 'https://example.com/page3',
        status: 'failed',
        priority: 3,
        attempts: 3,
        error: 'Connection timeout after 30 seconds',
        scheduledAt: new Date(Date.now() - 7200000),
        startedAt: new Date(Date.now() - 7190000),
        completedAt: new Date(Date.now() - 7180000),
      },
      {
        url: 'https://example.com/page4',
        status: 'running',
        priority: 1,
        attempts: 1,
        scheduledAt: new Date(Date.now() - 600000),
        startedAt: new Date(Date.now() - 300000),
      },
    ],
  });

  console.log('Creating query logs...');
  await prisma.queryLog.createMany({
    data: [
      {
        query: 'SELECT * FROM notes WHERE published = true',
        params: { published: true },
        duration: 45,
        userId: user1.id,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        query: 'SELECT * FROM users WHERE email = ?',
        params: { email: 'alice@example.com' },
        duration: 12,
        userId: user1.id,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        timestamp: new Date(Date.now() - 3000000),
      },
      {
        query: 'SELECT * FROM notes WHERE authorId = ? ORDER BY createdAt DESC',
        params: { authorId: user2.id },
        duration: 67,
        userId: user2.id,
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        timestamp: new Date(Date.now() - 1800000),
      },
      {
        query: 'UPDATE note_statistics SET viewCount = viewCount + 1 WHERE noteId = ?',
        params: { noteId: note1.id },
        duration: 23,
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
        timestamp: new Date(Date.now() - 900000),
      },
      {
        query: 'SELECT * FROM comments WHERE noteId = ? ORDER BY createdAt ASC',
        params: { noteId: note1.id },
        duration: 38,
        userId: user3.id,
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
        timestamp: new Date(Date.now() - 600000),
      },
    ],
  });

  console.log('✅ Database seeding completed successfully!');
  console.log(`
  Summary:
  - ${3} users created
  - ${4} notes created
  - ${4} note statistics created
  - ${3} note media created
  - ${5} comments created
  - ${4} crawler jobs created
  - ${5} query logs created
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
