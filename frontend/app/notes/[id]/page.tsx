'use client';

import { useParams } from 'next/navigation';
import { useParseVideo } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Image as ImageIcon, User, Clock, Eye } from 'lucide-react';
import Link from 'next/link';
import { EngagementChart } from '@/components/charts/engagement-chart';

export default function NoteDetailPage() {
  const params = useParams();
  const noteId = params.id as string;
  
  // For demo purposes, we'll simulate a note URL
  const demoUrl = `https://xiaohongshu.com/explore/${noteId}`;
  const { data: result, isLoading, error } = useParseVideo(demoUrl);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !result?.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl font-bold mb-4">Note Not Found</h2>
              <p className="text-muted-foreground mb-6">
                {result?.error || 'Unable to load note details'}
              </p>
              <Link href="/">
                <Button>Return Home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const noteData = result.data;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Media Gallery */}
          <Card>
            <CardContent className="p-6">
              {noteData.video_url ? (
                <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                  <video
                    className="w-full h-full rounded-lg"
                    controls
                    poster={noteData.images?.[0]?.url}
                  >
                    <source src={noteData.video_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : noteData.images && noteData.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {noteData.images.map((image: any, index: number) => (
                    <div key={index} className="aspect-square relative">
                      <img
                        src={image.url}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Note Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{noteData.title || 'Untitled'}</CardTitle>
                  <Badge variant="secondary">{result.platform}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {noteData.desc || 'No description available'}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{noteData.user?.nickname || 'Anonymous'}</span>
                  </div>
                  {noteData.video?.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{Math.floor(noteData.video.duration / 60)}:{(noteData.video.duration % 60).toString().padStart(2, '0')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {Math.floor(Math.random() * 10000)}
                    </div>
                    <div className="text-sm text-muted-foreground">Likes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {Math.floor(Math.random() * 1000)}
                    </div>
                    <div className="text-sm text-muted-foreground">Comments</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {Math.floor(Math.random() * 5000)}
                    </div>
                    <div className="text-sm text-muted-foreground">Shares</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs for additional information */}
        <Tabs defaultValue="engagement" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="share">Share</TabsTrigger>
          </TabsList>
          
          <TabsContent value="engagement" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <EngagementChart />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="details" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Technical Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Media Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span>{noteData.type || 'Unknown'}</span>
                      </div>
                      {noteData.video && (
                        <>
                          <div className="flex justify-between">
                            <span>Width:</span>
                            <span>{noteData.video.width}px</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Height:</span>
                            <span>{noteData.video.height}px</span>
                      </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">User Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>User ID:</span>
                        <span>{noteData.user?.user_id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform:</span>
                        <span>{result.platform}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="share" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Share this Note</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Share this note with others on social media or messaging platforms.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline">Copy Link</Button>
                    <Button variant="outline">Share on WeChat</Button>
                    <Button variant="outline">Share on Weibo</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}