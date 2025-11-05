"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useKOLProfile } from '@/hooks/use-kol-data'
import { useKOLStore } from '@/store/kol-store'
import { Heart, Share2, ExternalLink } from 'lucide-react'

interface ProfileTabProps {
  kolId: string
}

export function ProfileTab({ kolId }: ProfileTabProps) {
  const { data: profile, isLoading, error } = useKOLProfile(kolId)
  const { addToFavorites, removeFromFavorites, isFavorite } = useKOLStore()

  if (isLoading) return <div>Loading profile...</div>
  if (error) return <div>Error loading profile: {error.message}</div>
  if (!profile) return <div>No profile data found</div>

  const favorite = isFavorite(kolId)

  const toggleFavorite = () => {
    if (favorite) {
      removeFromFavorites(kolId)
    } else {
      addToFavorites(kolId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-gray-500">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-2xl">{profile.name}</CardTitle>
                  {profile.verified && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Verified
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-lg">
                  {profile.platform.charAt(0).toUpperCase() + profile.platform.slice(1)}
                </CardDescription>
                {profile.bio && (
                  <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFavorite}
                className={favorite ? "text-red-600 border-red-600" : ""}
              >
                <Heart className={`w-4 h-4 mr-2 ${favorite ? "fill-current" : ""}`} />
                {favorite ? 'Favorited' : 'Favorite'}
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Profile
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900">
                {profile.followers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Followers</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900">
                {Math.round(profile.followers * 0.05).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Est. Engagement</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900">
                {profile.verified ? 'High' : 'Medium'}
              </div>
              <div className="text-sm text-gray-600">Trust Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Platform</span>
              <span className="text-sm">{profile.platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Verification Status</span>
              <Badge variant={profile.verified ? "default" : "secondary"}>
                {profile.verified ? 'Verified' : 'Not Verified'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Account ID</span>
              <span className="text-sm font-mono">{profile.id}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audience Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Total Followers</span>
              <span className="text-sm">{profile.followers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Growth Rate</span>
              <span className="text-sm text-green-600">+12.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Activity Level</span>
              <span className="text-sm">High</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}