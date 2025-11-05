"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TimeSeriesChart } from '@/components/charts'
import { useKOLPricing, useKOLPricingHistory } from '@/hooks/use-kol-data'
import { Download, TrendingUp } from 'lucide-react'
import { useState } from 'react'

interface PricingTabProps {
  kolId: string
}

export function PricingTab({ kolId }: PricingTabProps) {
  const { data: pricing, isLoading, error } = useKOLPricing(kolId)
  const { data: pricingHistory } = useKOLPricingHistory(kolId)
  const [selectedCurrency, setSelectedCurrency] = useState('USD')

  if (isLoading) return <div>Loading pricing data...</div>
  if (error) return <div>Error loading pricing: {error.message}</div>
  if (!pricing) return <div>No pricing data found</div>

  const formatCurrency = (amount: number, currency: string = pricing.currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const pricingHistoryData = pricingHistory?.map(item => ({
    name: new Date(item.lastUpdated).toLocaleDateString(),
    postPrice: item.postPrice,
    videoPrice: item.videoPrice,
    storyPrice: item.storyPrice,
  })) || []

  return (
    <div className="space-y-6">
      {/* Current Pricing */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Pricing</CardTitle>
              <CardDescription>
                Last updated: {new Date(pricing.lastUpdated).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                Compare
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Sponsored Post</div>
              <div className="text-2xl font-bold">
                {formatCurrency(pricing.postPrice)}
              </div>
              <Badge variant="secondary" className="mt-2">
                Most Popular
              </Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Video Content</div>
              <div className="text-2xl font-bold">
                {formatCurrency(pricing.videoPrice)}
              </div>
              <Badge variant="outline" className="mt-2">
                Premium
              </Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Story/Reel</div>
              <div className="text-2xl font-bold">
                {formatCurrency(pricing.storyPrice)}
              </div>
              <Badge variant="outline" className="mt-2">
                Short Form
              </Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Livestream</div>
              <div className="text-2xl font-bold">
                {formatCurrency(pricing.livestreamPrice)}
              </div>
              <Badge variant="outline" className="mt-2">
                Live Event
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing History */}
      {pricingHistoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pricing Trends</CardTitle>
            <CardDescription>
              Historical pricing data over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TimeSeriesChart
              data={pricingHistoryData}
              title=""
              type="line"
              dataKey="postPrice"
            />
          </CardContent>
        </Card>
      )}

      {/* Pricing Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Price Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Price per 1k Followers</span>
              <span className="text-sm font-bold">
                {formatCurrency(pricing.postPrice / 10)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Market Position</span>
              <Badge variant="default">Competitive</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Price Trend (3mo)</span>
              <span className="text-sm text-green-600">+8.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">ROI Score</span>
              <span className="text-sm font-bold">8.2/10</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900">Best Value</div>
              <div className="text-sm text-blue-700">Story posts offer highest engagement per dollar</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-sm font-medium text-green-900">Optimal Timing</div>
              <div className="text-sm text-green-700">Book 2-3 weeks in advance for best rates</div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="text-sm font-medium text-yellow-900">Market Insight</div>
              <div className="text-sm text-yellow-700">Pricing 15% below market average</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}