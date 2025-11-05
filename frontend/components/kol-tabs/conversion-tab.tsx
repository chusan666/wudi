"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConversionFunnel, MetricCard } from '@/components/charts'
import { useKOLConversion, useKOLConversionFunnel } from '@/hooks/use-kol-data'
import { DollarSign, Target, TrendingUp, Users } from 'lucide-react'

interface ConversionTabProps {
  kolId: string
}

export function ConversionTab({ kolId }: ConversionTabProps) {
  const { data: conversion, isLoading, error } = useKOLConversion(kolId)
  const { data: funnelData } = useKOLConversionFunnel(kolId)

  if (isLoading) return <div>Loading conversion data...</div>
  if (error) return <div>Error loading conversion: {error.message}</div>
  if (!conversion) return <div>No conversion data found</div>

  // Transform funnel data for visualization
  const funnelChartData = funnelData?.map((stage: any) => ({
    name: stage.stage,
    value: stage.count,
    conversionRate: stage.conversionRate,
  })) || [
    { name: 'Impressions', value: 1000000, conversionRate: 100 },
    { name: 'Clicks', value: 45000, conversionRate: 4.5 },
    { name: 'Landing Page', value: 12000, conversionRate: 26.7 },
    { name: 'Add to Cart', value: 3400, conversionRate: 28.3 },
    { name: 'Purchase', value: 890, conversionRate: 26.2 },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Key Conversion Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Click-Through Rate"
          value={`${conversion.clickThroughRate.toFixed(2)}%`}
          change={8.5}
          changeType="increase"
          description="Industry average: 2.5%"
        />
        
        <MetricCard
          title="Conversion Rate"
          value={`${conversion.conversionRate.toFixed(2)}%`}
          change={12.3}
          changeType="increase"
          description="From click to purchase"
        />
        
        <MetricCard
          title="Cost Per Click"
          value={formatCurrency(conversion.costPerClick)}
          change={-5.2}
          changeType="increase"
          description="Lower is better"
        />
        
        <MetricCard
          title="ROAS"
          value={`${conversion.returnOnAdSpend.toFixed(1)}x`}
          change={18.7}
          changeType="increase"
          description="Return on ad spend"
        />
      </div>

      {/* Conversion Funnel */}
      <ConversionFunnel
        data={funnelChartData}
        title="Conversion Funnel"
        description="Customer journey from impression to purchase"
      />

      {/* Detailed Conversion Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cost Analysis</CardTitle>
            <CardDescription>
              Detailed cost breakdown and efficiency metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className="font-medium">Cost Per Click</span>
              </div>
              <span className="font-bold">{formatCurrency(conversion.costPerClick)}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="font-medium">Cost Per Conversion</span>
              </div>
              <span className="font-bold">{formatCurrency(conversion.costPerConversion)}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <span className="font-medium">Revenue Generated</span>
              </div>
              <span className="font-bold text-green-600">
                {formatCurrency(conversion.revenueGenerated)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-orange-500" />
                <span className="font-medium">Return on Ad Spend</span>
              </div>
              <span className="font-bold text-green-600">
                {conversion.returnOnAdSpend.toFixed(1)}x
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Efficiency</CardTitle>
            <CardDescription>
              Performance metrics and benchmarks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Click-Through Rate</span>
                <span className="font-medium">{conversion.clickThroughRate.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${Math.min(conversion.clickThroughRate * 10, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Conversion Rate</span>
                <span className="font-medium">{conversion.conversionRate.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${Math.min(conversion.conversionRate * 20, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Funnel Efficiency</span>
                <span className="font-medium">Excellent</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Insights</CardTitle>
          <CardDescription>
            Data-driven insights to optimize conversion performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">High Converting Content</h4>
              <p className="text-sm text-green-700">
                Product review videos convert 45% better than standard posts. Focus on authentic product demonstrations.
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Audience Quality</h4>
              <p className="text-sm text-blue-700">
                Highly engaged audience with 78% purchase intent. Excellent for direct response campaigns.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Optimization Tips</h4>
              <p className="text-sm text-purple-700">
                Add clear CTAs in first 3 seconds. Use swipe-up links for mobile optimization.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Performance</CardTitle>
          <CardDescription>
            Revenue generation and return on investment analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-3xl font-bold text-green-800 mb-2">
                {formatCurrency(conversion.revenueGenerated)}
              </div>
              <div className="text-sm text-green-600">Total Revenue Generated</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-3xl font-bold text-blue-800 mb-2">
                {conversion.returnOnAdSpend.toFixed(1)}x
              </div>
              <div className="text-sm text-blue-600">Return on Ad Spend</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-3xl font-bold text-purple-800 mb-2">
                {formatCurrency(conversion.revenueGenerated / 12)}
              </div>
              <div className="text-sm text-purple-600">Monthly Average Revenue</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}