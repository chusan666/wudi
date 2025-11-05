'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Calendar, Award, Grid3x3, Heart, MessageCircle, Share2 } from 'lucide-react';
import Link from 'next/link';
import { UserStatsChart } from '@/components/charts/user-stats-chart';
import { UserNotesList } from '@/components/user/user-notes-list';

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const [page, setPage] = useState(1);

  // Mock user data - in real app, this would come from API
  const userData = {
    user_id: userId,
    nickname: 'Sample User',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
    bio: 'Content creator sharing lifestyle and beauty tips',
    followers: 12500,
    following: 890,
    posts: 156,
    verified: true,
    join_date: '2022-03-15',
    certifications: ['Beauty Blogger', 'Lifestyle Expert'],
    stats: {
      total_likes: 45600,
      total_comments: 12300,
      total_shares: 8900,
      engagement_rate: 8.5,
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/20 flex items-center justify-center">
                  <img
                    src={userData.avatar}
                    alt={userData.nickname}
                    className="w-28 h-28 rounded-full object-cover"
                  />
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl font-bold">{userData.nickname}</h1>
                  {userData.verified && (
                    <Badge variant="default" className="bg-blue-500">
                      <Award className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                <p className="text-muted-foreground mb-6 max-w-2xl">
                  {userData.bio}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{userData.followers.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{userData.following.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{userData.posts}</div>
                    <div className="text-sm text-muted-foreground">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{userData.stats.engagement_rate}%</div>
                    <div className="text-sm text-muted-foreground">Engagement</div>
                  </div>
                </div>

                {/* Certifications */}
                <div className="flex flex-wrap gap-2">
                  {userData.certifications.map((cert) => (
                    <Badge key={cert} variant="secondary">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-6">
            <UserNotesList userId={userId} page={page} onPageChange={setPage} />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <UserStatsChart />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>Total Likes</span>
                      </div>
                      <span className="font-semibold">{userData.stats.total_likes.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                        <span>Total Comments</span>
                      </div>
                      <span className="font-semibold">{userData.stats.total_comments.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-green-500" />
                        <span>Total Shares</span>
                      </div>
                      <span className="font-semibold">{userData.stats.total_shares.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="about" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>About {userData.nickname}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Profile Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">User ID:</span>
                        <span>{userData.user_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Joined:</span>
                        <span>{userData.join_date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span>Active</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Achievements</h4>
                    <div className="space-y-2">
                      <Badge variant="outline" className="mr-2">Top Creator</Badge>
                      <Badge variant="outline" className="mr-2">100K+ Views</Badge>
                      <Badge variant="outline" className="mr-2">Trending Content</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: 'Posted new note', time: '2 hours ago', type: 'post' },
                    { action: 'Gained 100 new followers', time: '1 day ago', type: 'follower' },
                    { action: 'Received 500 likes', time: '2 days ago', type: 'like' },
                    { action: 'Posted new video', time: '3 days ago', type: 'video' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>{activity.action}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}