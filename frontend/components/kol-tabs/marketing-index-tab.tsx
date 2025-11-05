"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TimeSeriesChart, MetricCard } from '@/components/charts'
import { useKOLMarketingIndex, useKOLMarketingIndexHistory } from '@/hooks/use-kol-data'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Award, Shield, Target, Star, Zap } from 'lucide-react'

interface MarketingIndexTabProps {
  kolId: string
}

export function MarketingIndexTab({ kolId }: MarketingIndexTabProps) {
  const { data: marketingIndex, isLoading, error } = useKOLMarketingIndex(kolId)
  const { data: indexHistory } = useKOLMarketingIndexHistory(kolId)

  if (isLoading) return <div>Loading marketing index data...</div>
  if (error) return <div>Error loading marketing index: {error.message}</div>
  if (!marketingIndex) return <div>No marketing index data found</div>

  // Transform history data for charts
  const indexHistoryData = indexHistory?.map(item => ({
    name: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
    overall: item.overallScore,
    reach: item.reachScore,
    engagement: item.engagementScore,
    conversion: item.conversionScore,
    contentQuality: item.contentQualityScore,
  })) || []

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getGrade = (score: number) => {
    if (score >= 90) return 'A+'
    if (score >= 85) return 'A'
    if (score >= 80) return 'A-'
    if (score >= 75) return 'B+'
    if (score >= 70) return 'B'
    if (score >= 65) return 'B-'
    if (score >= 60) return 'C+'
    if (score >= 55) return 'C'
    return 'C-'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Very Good'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Average'
    return 'Below Average'
  }

  return (
    <div className="space-y-6">
      {/* Overall Marketing Index */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Marketing Index</CardTitle>
              <CardDescription>
                Comprehensive marketing performance score
              </CardDescription>
            </div>
            <div className="text-center">
              <div className={`text-5xl font-bold ${getScoreColor(marketingIndex.overallScore).split(' ')[0]}`}>
                {marketingIndex.overallScore}
              </div>
              <Badge className={`mt-2 ${getScoreColor(marketingIndex.overallScore)}`}>
                {getGrade(marketingIndex.overallScore)} - {getScoreLabel(marketingIndex.overallScore)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title="Brand Safety"
              value={`${marketingIndex.brandSafetyScore}/100`}
              change={5.2}
              changeType="increase"
              description="Low risk profile"
            />
            <MetricCard
              title="Trend Alignment"
              value={`${marketingIndex.trendAlignmentScore}/100`}
              change={12.8}
              changeType="increase"
              description="Highly relevant content"
            />
            <MetricCard
              title="Content Quality"
              value={`${marketingIndex.contentQualityScore}/100`}
              change={8.5}
              changeType="increase"
              description="Professional production"
            />
          </div>
        </CardContent>
      </Card>

      {/* Component Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reach Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketingIndex.reachScore}/100</div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${marketingIndex.reachScore}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Extensive audience reach and visibility
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketingIndex.engagementScore}/100</div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${marketingIndex.engagementScore}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              High audience interaction and engagement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketingIndex.conversionScore}/100</div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${marketingIndex.conversionScore}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Strong conversion and sales performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Quality</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketingIndex.contentQualityScore}/100</div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${marketingIndex.contentQualityScore}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Professional content quality and aesthetics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brand Safety</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketingIndex.brandSafetyScore}/100</div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${marketingIndex.brandSafetyScore}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Safe for brand partnerships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trend Alignment</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketingIndex.trendAlignmentScore}/100</div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${marketingIndex.trendAlignmentScore}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Aligned with current market trends
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Historical Performance */}
      {indexHistoryData.length > 0 && (
        <TimeSeriesChart
          data={indexHistoryData}
          title="Marketing Index Trends"
          description="Historical performance of marketing index components"
          type="line"
          dataKey="overall"
        />
      )}

      {/* Marketing Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Marketing Insights</CardTitle>
          <CardDescription>
            Strategic recommendations based on marketing index analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Strengths</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Exceptional engagement rates</li>
                <li>• Strong brand safety profile</li>
                <li>• High-quality content production</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Opportunities</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Expand reach to new demographics</li>
                <li>• Leverage trend alignment</li>
                <li>• Optimize content scheduling</li>
              </ul>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Recommendations</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Focus on conversion optimization</li>
                <li>• Increase posting frequency</li>
                <li>• Collaborate with complementary creators</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competitive Positioning */}
      <Card>
        <CardHeader>
          <CardTitle>Competitive Positioning</CardTitle>
          <CardDescription>
            How this KOL compares to industry benchmarks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Industry Average</span>
              <Badge variant="outline">65/100</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Top Quartile</span>
              <Badge variant="outline">80/100</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="font-medium text-green-900">Current Score</span>
              <Badge className="bg-green-100 text-green-800">
                {marketingIndex.overallScore}/100
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}