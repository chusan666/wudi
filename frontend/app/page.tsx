import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold">KOL Analytics Dashboard</h1>
            <Button asChild>
              <Link href="/kol/demo">View Demo Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Comprehensive Influencer Analytics
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get detailed insights into influencer performance, audience demographics, 
            pricing trends, and marketing effectiveness with our advanced analytics platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Profile Analytics</CardTitle>
              <CardDescription>
                Detailed influencer profiles with verification status and follower metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Comprehensive profile information including engagement rates, 
                growth trends, and audience quality assessments.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing Intelligence</CardTitle>
              <CardDescription>
                Real-time pricing data and historical trends for sponsored content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Track pricing across different content types, compare with market rates, 
                and get ROI recommendations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audience Insights</CardTitle>
              <CardDescription>
                Deep demographic analysis and audience behavior patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Understand audience composition, interests, geographic distribution, 
                and engagement patterns.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Real-time performance tracking with engagement analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Monitor likes, comments, shares, reach, and video performance 
                with detailed trend analysis.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversion Tracking</CardTitle>
              <CardDescription>
                End-to-end conversion funnels and ROI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Track click-through rates, conversion funnels, cost per acquisition, 
                and return on ad spend.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Marketing Index</CardTitle>
              <CardDescription>
                Comprehensive marketing effectiveness scoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Overall marketing scores with brand safety, trend alignment, 
                and competitive positioning analysis.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Ready to get started?</CardTitle>
              <CardDescription>
                Explore our demo dashboard to see the full capabilities of our analytics platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center space-x-4">
                <Button asChild size="lg">
                  <Link href="/kol/demo">View Demo</Link>
                </Button>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}