export interface Comment {
  id: string;
  content: string;
  likes: number;
  replies: number;
  createdAt: string;
  author: string;
  hasReplies: boolean;
}

export interface WordFrequency {
  word: string;
  count: number;
}

export interface SentimentAnalysis {
  positive: number;
  neutral: number;
  negative: number;
  score: number;
}

export interface CommentAnalytics {
  totalComments: number;
  totalLikes: number;
  averageLikes: number;
  totalReplies: number;
  averageReplies: number;
  wordFrequencies: WordFrequency[];
  sentimentAnalysis: SentimentAnalysis;
  likeDistribution: { range: string; count: number }[];
  activityTimeline: { date: string; count: number }[];
}

// Text analytics utilities
export function analyzeWordFrequency(comments: Comment[]): WordFrequency[] {
  const wordMap = new Map<string, number>();
  
  comments.forEach(comment => {
    const words = comment.content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2); // Filter out very short words
    
    words.forEach(word => {
      wordMap.set(word, (wordMap.get(word) || 0) + 1);
    });
  });
  
  return Array.from(wordMap.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20); // Top 20 words
}

export function analyzeSentiment(comments: Comment[]): SentimentAnalysis {
  // Placeholder sentiment analysis - in real implementation, this would use
  // a proper NLP library or API
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'wonderful', 'fantastic'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disgusting', 'poor'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  comments.forEach(comment => {
    const words = comment.content.toLowerCase().split(/\s+/);
    const hasPositive = words.some(word => positiveWords.includes(word));
    const hasNegative = words.some(word => negativeWords.includes(word));
    
    if (hasPositive && !hasNegative) positiveCount++;
    else if (hasNegative && !hasPositive) negativeCount++;
  });
  
  const neutralCount = comments.length - positiveCount - negativeCount;
  const total = comments.length || 1;
  
  const score = (positiveCount - negativeCount) / total;
  
  return {
    positive: positiveCount / total,
    neutral: neutralCount / total,
    negative: negativeCount / total,
    score
  };
}

export function analyzeLikeDistribution(comments: Comment[]): { range: string; count: number }[] {
  const ranges = [
    { min: 0, max: 0, label: '0' },
    { min: 1, max: 5, label: '1-5' },
    { min: 6, max: 10, label: '6-10' },
    { min: 11, max: 25, label: '11-25' },
    { min: 26, max: 50, label: '26-50' },
    { min: 51, max: Infinity, label: '50+' }
  ];
  
  return ranges.map(range => ({
    range: range.label,
    count: comments.filter(comment => 
      comment.likes >= range.min && comment.likes <= range.max
    ).length
  }));
}

export function analyzeActivityTimeline(comments: Comment[]): { date: string; count: number }[] {
  const dateMap = new Map<string, number>();
  
  comments.forEach(comment => {
    const date = comment.createdAt.split('T')[0]; // Extract date part
    dateMap.set(date, (dateMap.get(date) || 0) + 1);
  });
  
  return Array.from(dateMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function generateAnalytics(comments: Comment[]): CommentAnalytics {
  const totalComments = comments.length;
  const totalLikes = comments.reduce((sum, comment) => sum + comment.likes, 0);
  const totalReplies = comments.reduce((sum, comment) => sum + comment.replies, 0);
  
  return {
    totalComments,
    totalLikes,
    averageLikes: totalComments > 0 ? totalLikes / totalComments : 0,
    totalReplies,
    averageReplies: totalComments > 0 ? totalReplies / totalComments : 0,
    wordFrequencies: analyzeWordFrequency(comments),
    sentimentAnalysis: analyzeSentiment(comments),
    likeDistribution: analyzeLikeDistribution(comments),
    activityTimeline: analyzeActivityTimeline(comments)
  };
}

// Export utilities
export function exportToCSV(analytics: CommentAnalytics, comments: Comment[]): string {
  const headers = ['ID', 'Content', 'Likes', 'Replies', 'Author', 'Created At'];
  const rows = comments.map(comment => [
    comment.id,
    `"${comment.content.replace(/"/g, '""')}"`, // Escape quotes in CSV
    comment.likes.toString(),
    comment.replies.toString(),
    comment.author,
    comment.createdAt
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

export function exportToJSON(analytics: CommentAnalytics, comments: Comment[]): string {
  return JSON.stringify({
    analytics,
    comments,
    exportedAt: new Date().toISOString()
  }, null, 2);
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}