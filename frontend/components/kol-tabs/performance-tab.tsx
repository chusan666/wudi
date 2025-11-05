"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TimeSeriesChart, MetricCard } from '@/components/charts'
import { useKOLPerformance, useKOLPerformanceTimeline } from '@/hooks/use-kol-data'
import { TrendingUp, Eye, Heart, MessageCircle, Share } from 'lucide-react'

interface PerformanceTabProps {
  kolId: string
}

export function PerformanceTab({ kolId }: PerformanceTabProps) {
  const { data: performance, isLoading, error } = useKOLPerformance(kolId)
  const { data: performanceTimeline } = useKOLPerformanceTimeline(kolId)

  if (isLoading) return <div>Loading performance data...</div>
  if (error) return <div>Error loading performance: {error.message}</div>
  if (!performance) return <div>No performance data found</div>

  // Transform timeline data for charts
  const engagementData = performanceTimeline?.map(item => ({
    name: new Date(item.month).toLocaleDateString('en-US', { month: 'short' }),
    engagement: item.engagementRate,
    likes: item.avgLikes,
    comments: item.avgComments,
    shares: item.avgShares,
  })) || []

  const reachData = performanceTimeline?.map(item => ({
    name: new Date(item.month).toLocaleDateString('en-US', { month: 'short' }),
    reach: item.reach,
    impressions: item.impressions,
    videoViews: item.videoViews,
  })) || []

  return (
    <div className="space-y-6">
      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Engagement Rate"
          value={`${performance.engagementRate.toFixed(2)}%`}
          change={12.5}
          changeType="increase"
          description="Above industry average"
        />
        
        <MetricCard
          title="Average Likes"
          value={performance.avgLikes.toLocaleString()}
          change={8.2}
          changeType="increase"
          description="Per post average"
        />
        
        <MetricCard
          title="Monthly Reach"
          value={(performance.reach / 1000000).toFixed(1)}M
          change={15.3}
          changeType="increase"
          description="Unique users reached"
        />
        
        <MetricCard
          title="Video Views"
          value={(performance.videoViews / 1000000).toFixed(1)}M
          change={22.1}
          changeType="increase"
          description="Total video views"
        />
      </div>

      {/* Performance Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeSeriesChart
          data={engagementData}
          title="Engagement Trends"
          description="Monthly engagement metrics over time"
          type="line"
        />
        
        <TimeSeriesChart
          data={reachData}
          title="Reach & Impressions"
          description="Monthly reach and impressions trends"
          type="area"
        />
      </div>

      {/* Detailed Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Engagement Breakdown</CardTitle>
            <CardDescription>
              Detailed engagement metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="font-medium">Average Likes</span>
              </div>
              <span className="font-bold">{performance.avgLikes.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Average Comments</span>
              </div>
              <span className="font-bold">{performance.avgComments.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Share className="w-5 h-5 text-green-500" />
                <span className="font-medium">Average Shares</span>
              </div>
              <span className="font-bold">{performance.avgShares.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <span className="font-medium">Engagement Rate</span>
              </div>
              <span className="font-bold">{performance.engagementRate.toFixed(2)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reach & Visibility</CardTitle>
            <CardDescription>
              Audience reach and content visibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Eye className="w-5 h-5 text-indigo-500" />
                <span className="font-medium">Monthly Reach</span>
              </div>
              <span className="font-bold">{performance.reach.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <span className="font-medium">Impressions</span>
              </div>
              <span className="font-bold">{performance.impressions.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Eye className="w-5 h-5 text-pink-500" />
                <span className="font-medium">Video Views</span>
              </div>
              <span className="font-bold">{performance.videoViews.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-teal-500" />
                <span className="font-medium">Monthly Growth</span>
              </div>
              <span className="font-bold text-green-600">+{performance.monthlyGrowth.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>
            AI-powered insights based on performance data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Strong Performance</h4>
              <p className="text-sm text-green-700">
                Engagement rate 45% above industry average. Consistent growth in video content performance.
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Content Strategy</h4>
              <p className="text-sm text-blue-700">
                Video content generates 3x more engagement than static posts. Consider increasing video frequency.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Optimization Opportunity</h4>
              <p className="text-sm text-purple-700">
                Best posting times: Tuesday-Thursday, 6-8 PM. Current timing could be optimized for better reach.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}