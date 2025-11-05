'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { useCommentAnalyticsStore } from '@/store/comment-analytics-store';
import { 
  Comment, 
  generateAnalytics, 
  exportToCSV, 
  exportToJSON, 
  downloadFile 
} from '@/lib/comment-analytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, Filter, TrendingUp, MessageSquare, Heart } from 'lucide-react';

// Mock API function - replace with actual API call
async function fetchComments(noteId: string, filters: any): Promise<Comment[]> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate mock data based on filters
  const mockComments: Comment[] = [
    {
      id: '1',
      content: 'This is an amazing note! I really love the content and the way it\'s presented.',
      likes: 15,
      replies: 3,
      createdAt: '2024-01-15T10:30:00Z',
      author: 'user1',
      hasReplies: true
    },
    {
      id: '2',
      content: 'Great work! Very helpful and informative.',
      likes: 8,
      replies: 1,
      createdAt: '2024-01-15T14:20:00Z',
      author: 'user2',
      hasReplies: true
    },
    {
      id: '3',
      content: 'Not sure I agree with this approach. Could be better.',
      likes: 2,
      replies: 2,
      createdAt: '2024-01-16T09:15:00Z',
      author: 'user3',
      hasReplies: true
    },
    {
      id: '4',
      content: 'Excellent! This is exactly what I was looking for.',
      likes: 25,
      replies: 5,
      createdAt: '2024-01-16T16:45:00Z',
      author: 'user4',
      hasReplies: true
    },
    {
      id: '5',
      content: 'Thanks for sharing this. Very useful!',
      likes: 5,
      replies: 0,
      createdAt: '2024-01-17T11:30:00Z',
      author: 'user5',
      hasReplies: false
    }
  ];

  // Apply filters
  const filteredComments = mockComments.filter(comment => {
    if (filters.minLikes > 0 && comment.likes < filters.minLikes) return false;
    if (filters.hasReplies && !comment.hasReplies) return false;
    if (filters.keyword && !comment.content.toLowerCase().includes(filters.keyword.toLowerCase())) return false;
    if (filters.timeRange.from && new Date(comment.createdAt) < filters.timeRange.from) return false;
    if (filters.timeRange.to && new Date(comment.createdAt) > filters.timeRange.to) return false;
    return true;
  });

  return filteredComments;
}

export default function CommentAnalyticsPage() {
  const params = useParams();
  const noteId = params.id as string;
  
  const { filters, setFilters, exportFormat, setExportFormat } = useCommentAnalyticsStore();
  
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', noteId, filters],
    queryFn: () => fetchComments(noteId, filters),
    enabled: !!noteId,
  });

  const analytics = useMemo(() => generateAnalytics(comments), [comments]);

  const handleExport = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `comments-${noteId}-${timestamp}`;
    
    if (exportFormat === 'csv') {
      const csvContent = exportToCSV(analytics, comments);
      downloadFile(csvContent, `${filename}.csv`, 'text/csv');
    } else {
      const jsonContent = exportToJSON(analytics, comments);
      downloadFile(jsonContent, `${filename}.json`, 'application/json');
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ [key]: value });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Comment Analytics</h1>
            <p className="mt-2 text-muted-foreground">
              Analyze comments for note {noteId}
            </p>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comment Analytics</h1>
          <p className="mt-2 text-muted-foreground">
            Analyze comments for note {noteId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={exportFormat} onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}>
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </Select>
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export {exportFormat.toUpperCase()}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalComments}</div>
            <p className="text-xs text-muted-foreground">
              Across all time periods
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalLikes}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {analytics.averageLikes.toFixed(1)} per comment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Replies</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalReplies}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {analytics.averageReplies.toFixed(1)} per comment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sentiment Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.sentimentAnalysis.score > 0 ? '+' : ''}{analytics.sentimentAnalysis.score.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.sentimentAnalysis.score > 0.1 ? 'Mostly Positive' : 
               analytics.sentimentAnalysis.score < -0.1 ? 'Mostly Negative' : 'Neutral'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>
            Apply filters to narrow down the comment data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Likes</label>
              <Input
                type="number"
                min="0"
                value={filters.minLikes}
                onChange={(e) => handleFilterChange('minLikes', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Has Replies</label>
              <Select value={filters.hasReplies.toString()} onChange={(e) => handleFilterChange('hasReplies', e.target.value === 'true')}>
                <option value="false">All Comments</option>
                <option value="true">Only with Replies</option>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Keyword</label>
              <Input
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                placeholder="Search in content..."
              />
            </div>
            
            <DateRangePicker
              value={filters.timeRange}
              onChange={(range) => handleFilterChange('timeRange', range)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Like Distribution</CardTitle>
            <CardDescription>
              How likes are distributed across comments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.likeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sentiment Analysis</CardTitle>
            <CardDescription>
              Overall sentiment breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Positive', value: analytics.sentimentAnalysis.positive },
                    { name: 'Neutral', value: analytics.sentimentAnalysis.neutral },
                    { name: 'Negative', value: analytics.sentimentAnalysis.negative }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.sentimentAnalysis && [
                    <Cell key={`cell-positive`} fill="#00C49F" />,
                    <Cell key={`cell-neutral`} fill="#FFBB28" />,
                    <Cell key={`cell-negative`} fill="#FF8042" />
                  ]}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>
              Comment activity over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.activityTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Word Frequency</CardTitle>
            <CardDescription>
              Most common words in comments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {analytics.wordFrequencies.slice(0, 10).map((word, index) => (
                <div key={word.word} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{index + 1}</Badge>
                    <span className="font-medium">{word.word}</span>
                  </div>
                  <Badge variant="outline">{word.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}