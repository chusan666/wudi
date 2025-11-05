"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DemographicChart } from '@/components/charts'
import { useKOLAudience } from '@/hooks/use-kol-data'
import { Users, MapPin, Target } from 'lucide-react'

interface AudienceTabProps {
  kolId: string
}

export function AudienceTab({ kolId }: AudienceTabProps) {
  const { data: audience, isLoading, error } = useKOLAudience(kolId)

  if (isLoading) return <div>Loading audience data...</div>
  if (error) return <div>Error loading audience: {error.message}</div>
  if (!audience) return <div>No audience data found</div>

  // Transform age data for chart
  const ageData = Object.entries(audience.ageGroups).map(([age, percentage]) => ({
    name: age,
    value: percentage,
  }))

  // Transform gender data for chart
  const genderData = Object.entries(audience.gender).map(([gender, percentage]) => ({
    name: gender.charAt(0).toUpperCase() + gender.slice(1),
    value: percentage,
  }))

  // Transform location data for chart
  const locationData = Object.entries(audience.locations)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([location, percentage]) => ({
      name: location,
      value: percentage,
    }))

  return (
    <div className="space-y-6">
      {/* Audience Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4M</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Location</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">United States</div>
            <p className="text-xs text-muted-foreground">
              35% of audience
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.8%</div>
            <p className="text-xs text-muted-foreground">
              Above average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Demographics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DemographicChart
          data={ageData}
          title="Age Distribution"
          description="Audience age breakdown"
          type="bar"
        />
        
        <DemographicChart
          data={genderData}
          title="Gender Distribution"
          description="Audience gender breakdown"
          type="pie"
        />
      </div>

      {/* Geographic Distribution */}
      <DemographicChart
        data={locationData}
        title="Geographic Distribution"
        description="Top 10 audience locations"
        type="bar"
      />

      {/* Interests and Languages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Interests</CardTitle>
            <CardDescription>
              Audience interests based on engagement patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {audience.interests.slice(0, 10).map((interest, index) => (
                <div
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {interest}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Languages</CardTitle>
            <CardDescription>
              Primary languages spoken by audience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {audience.languages.map((language, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{language}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${100 - index * 15}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {100 - index * 15}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audience Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Audience Insights</CardTitle>
          <CardDescription>
            Key insights about the audience demographics and behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Primary Demographic</h4>
              <p className="text-sm text-blue-700">
                Females aged 25-34, interested in lifestyle and fashion content
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Growth Opportunity</h4>
              <p className="text-sm text-green-700">
                Strong potential in 18-24 age group with targeted content
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Market Alignment</h4>
              <p className="text-sm text-purple-700">
                Perfect match for beauty, fashion, and lifestyle brands
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}