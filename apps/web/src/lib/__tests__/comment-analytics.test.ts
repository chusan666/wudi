import { describe, it, expect } from 'vitest';
import { 
  Comment, 
  generateAnalytics, 
  analyzeWordFrequency, 
  analyzeSentiment, 
  analyzeLikeDistribution,
  analyzeActivityTimeline,
  exportToCSV,
  exportToJSON
} from '@/lib/comment-analytics';

const mockComments: Comment[] = [
  {
    id: '1',
    content: 'This is a great and amazing note!',
    likes: 10,
    replies: 2,
    createdAt: '2024-01-15T10:30:00Z',
    author: 'user1',
    hasReplies: true
  },
  {
    id: '2',
    content: 'I love this content, it\'s wonderful',
    likes: 5,
    replies: 1,
    createdAt: '2024-01-15T14:20:00Z',
    author: 'user2',
    hasReplies: true
  },
  {
    id: '3',
    content: 'This is terrible and awful',
    likes: 1,
    replies: 0,
    createdAt: '2024-01-16T09:15:00Z',
    author: 'user3',
    hasReplies: false
  }
];

describe('Comment Analytics', () => {
  describe('generateAnalytics', () => {
    it('should generate complete analytics for comments', () => {
      const analytics = generateAnalytics(mockComments);
      
      expect(analytics.totalComments).toBe(3);
      expect(analytics.totalLikes).toBe(16);
      expect(analytics.averageLikes).toBeCloseTo(5.33, 1);
      expect(analytics.totalReplies).toBe(3);
      expect(analytics.averageReplies).toBe(1);
      
      expect(analytics.wordFrequencies).toBeDefined();
      expect(analytics.sentimentAnalysis).toBeDefined();
      expect(analytics.likeDistribution).toBeDefined();
      expect(analytics.activityTimeline).toBeDefined();
    });

    it('should handle empty comments array', () => {
      const analytics = generateAnalytics([]);
      
      expect(analytics.totalComments).toBe(0);
      expect(analytics.totalLikes).toBe(0);
      expect(analytics.averageLikes).toBe(0);
      expect(analytics.totalReplies).toBe(0);
      expect(analytics.averageReplies).toBe(0);
    });
  });

  describe('analyzeWordFrequency', () => {
    it('should count word frequencies correctly', () => {
      const frequencies = analyzeWordFrequency(mockComments);
      
      expect(frequencies.length).toBeGreaterThan(0);
      expect(frequencies[0].count).toBeGreaterThanOrEqual(frequencies[1]?.count || 0);
      
      // Should find common words
      const thisWord = frequencies.find(f => f.word === 'this');
      expect(thisWord).toBeDefined();
      expect(thisWord!.count).toBe(3); // "this" appears in all 3 comments
    });

    it('should filter out very short words', () => {
      const commentWithShortWords: Comment = {
        ...mockComments[0],
        content: 'I am a big fan of it so be do'
      };
      
      const frequencies = analyzeWordFrequency([commentWithShortWords]);
      const hasShortWords = frequencies.some(f => f.word.length <= 2);
      expect(hasShortWords).toBe(false);
    });
  });

  describe('analyzeSentiment', () => {
    it('should analyze sentiment correctly', () => {
      const sentiment = analyzeSentiment(mockComments);
      
      expect(sentiment.positive).toBeGreaterThan(0);
      expect(sentiment.negative).toBeGreaterThan(0);
      expect(sentiment.neutral).toBeGreaterThanOrEqual(0);
      expect(sentiment.score).toBeDefined();
      
      // Should have more positive than negative based on mock data
      expect(sentiment.positive).toBeGreaterThan(sentiment.negative);
    });

    it('should handle neutral comments', () => {
      const neutralComments: Comment[] = [
        {
          id: '1',
          content: 'This is a regular comment',
          likes: 0,
          replies: 0,
          createdAt: '2024-01-15T10:30:00Z',
          author: 'user1',
          hasReplies: false
        }
      ];
      
      const sentiment = analyzeSentiment(neutralComments);
      expect(sentiment.neutral).toBe(1);
      expect(sentiment.positive).toBe(0);
      expect(sentiment.negative).toBe(0);
    });
  });

  describe('analyzeLikeDistribution', () => {
    it('should categorize likes into ranges correctly', () => {
      const distribution = analyzeLikeDistribution(mockComments);
      
      expect(distribution).toHaveLength(6);
      expect(distribution[0].range).toBe('0');
      expect(distribution[0].count).toBe(0); // No comments with 0 likes
      
      expect(distribution[1].range).toBe('1-5');
      expect(distribution[1].count).toBe(2); // Two comments with 1-5 likes
      
      expect(distribution[2].range).toBe('6-10');
      expect(distribution[2].count).toBe(1); // One comment with 6-10 likes
    });
  });

  describe('analyzeActivityTimeline', () => {
    it('should group comments by date', () => {
      const timeline = analyzeActivityTimeline(mockComments);
      
      expect(timeline).toHaveLength(2); // Two different dates
      expect(timeline[0].date).toBe('2024-01-15');
      expect(timeline[0].count).toBe(2); // Two comments on first date
      expect(timeline[1].date).toBe('2024-01-16');
      expect(timeline[1].count).toBe(1); // One comment on second date
    });

    it('should be sorted by date', () => {
      const timeline = analyzeActivityTimeline(mockComments);
      
      for (let i = 1; i < timeline.length; i++) {
        expect(timeline[i].date >= timeline[i - 1].date).toBe(true);
      }
    });
  });

  describe('Export utilities', () => {
    it('should export to CSV format', () => {
      const analytics = generateAnalytics(mockComments);
      const csv = exportToCSV(analytics, mockComments);
      
      expect(csv).toContain('ID,Content,Likes,Replies,Author,Created At');
      expect(csv).toContain('1,"This is a great and amazing note!",10,2,user1,2024-01-15T10:30:00Z');
      expect(csv.split('\n')).toHaveLength(4); // Header + 3 data rows
    });

    it('should escape quotes in CSV content', () => {
      const commentWithQuote: Comment = {
        ...mockComments[0],
        content: 'This has "quotes" in it'
      };
      
      const analytics = generateAnalytics([commentWithQuote]);
      const csv = exportToCSV(analytics, [commentWithQuote]);
      
      expect(csv).toContain('""quotes""'); // Double quotes should be escaped
    });

    it('should export to JSON format', () => {
      const analytics = generateAnalytics(mockComments);
      const json = exportToJSON(analytics, mockComments);
      
      const parsed = JSON.parse(json);
      expect(parsed.analytics).toBeDefined();
      expect(parsed.comments).toHaveLength(3);
      expect(parsed.exportedAt).toBeDefined();
    });
  });
});