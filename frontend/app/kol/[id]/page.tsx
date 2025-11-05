"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ProfileTab } from '@/components/kol-tabs/profile-tab'
import { PricingTab } from '@/components/kol-tabs/pricing-tab'
import { AudienceTab } from '@/components/kol-tabs/audience-tab'
import { PerformanceTab } from '@/components/kol-tabs/performance-tab'
import { ConversionTab } from '@/components/kol-tabs/conversion-tab'
import { MarketingIndexTab } from '@/components/kol-tabs/marketing-index-tab'
import { useKOLStore } from '@/store/kol-store'
import { usePrefetchKOLData } from '@/hooks/use-kol-data'
import { Download, ArrowLeft, Settings } from 'lucide-react'

export default function KOLDashboard() {
  const params = useParams()
  const kolId = params.id as string
  const { activeTab, setActiveTab, setCurrentKOL } = useKOLStore()
  const prefetchKOLData = usePrefetchKOLData(kolId)

  useEffect(() => {
    if (kolId) {
      setCurrentKOL(kolId)
      // Prefetch all data when component mounts
      prefetchKOLData()
    }
  }, [kolId, setCurrentKOL, prefetchKOLData])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const response = await fetch(`/api/kol/${kolId}/export?format=${format}`)
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `kol-${kolId}-dashboard.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-semibold">KOL Analytics Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="conversion">Conversion</TabsTrigger>
            <TabsTrigger value="marketing-index">Marketing Index</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <ProfileTab kolId={kolId} />
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <PricingTab kolId={kolId} />
          </TabsContent>

          <TabsContent value="audience" className="space-y-6">
            <AudienceTab kolId={kolId} />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceTab kolId={kolId} />
          </TabsContent>

          <TabsContent value="conversion" className="space-y-6">
            <ConversionTab kolId={kolId} />
          </TabsContent>

          <TabsContent value="marketing-index" className="space-y-6">
            <MarketingIndexTab kolId={kolId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}