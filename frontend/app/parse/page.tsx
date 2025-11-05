'use client';

import { useState } from 'react';
import { useParseVideo, usePlatforms } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Image as ImageIcon, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ParsePage() {
  const [url, setUrl] = useState('');
  const [shouldParse, setShouldParse] = useState(false);
  
  const { data: platforms } = usePlatforms();
  const { data: result, isLoading, error } = useParseVideo(shouldParse ? url : '');

  const handleParse = () => {
    if (url.trim()) {
      setShouldParse(true);
    }
  };

  const handleReset = () => {
    setUrl('');
    setShouldParse(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Parse Social Media Content</h1>
          <p className="text-muted-foreground">
            Enter a social media URL to extract detailed information
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enter URL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xiaohongshu.com/explore/..."
                className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button onClick={handleParse} disabled={!url.trim() || isLoading}>
                {isLoading ? 'Parsing...' : 'Parse'}
              </Button>
              {shouldParse && (
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              )}
            </div>
            
            {platforms && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Supported platforms:</p>
                <div className="flex flex-wrap gap-2">
                  {platforms.platforms.map((platform) => (
                    <Badge key={platform.key} variant="secondary">
                      {platform.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading && (
          <Card>
            <CardHeader>
              <CardTitle>Parsing Content...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card>
            <CardContent className="py-8 text-center">
              <h3 className="text-lg font-semibold mb-2 text-destructive">Error</h3>
              <p className="text-muted-foreground">
                Failed to parse the URL. Please check the URL and try again.
              </p>
            </CardContent>
          </Card>
        )}

        {result && !isLoading && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Parse Results</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? 'Success' : 'Failed'}
                  </Badge>
                  <Badge variant="outline">{result.platform}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {result.success && result.data ? (
                <div className="space-y-6">
                  {/* Media Preview */}
                  {result.data.video_url && (
                    <div>
                      <h4 className="font-medium mb-2">Video Preview</h4>
                      <div className="aspect-video bg-black rounded-lg">
                        <video
                          className="w-full h-full rounded-lg"
                          controls
                          poster={result.data.images?.[0]?.url}
                        >
                          <source src={result.data.video_url} type="video/mp4" />
                        </video>
                      </div>
                    </div>
                  )}

                  {result.data.images && result.data.images.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Images</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {result.data.images.map((image: any, index: number) => (
                          <div key={index} className="aspect-square relative">
                            <img
                              src={image.url}
                              alt={`Image ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Content Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Content Details</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Title:</span>
                          <p className="font-medium">{result.data.title || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Description:</span>
                          <p className="font-medium">{result.data.desc || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <p className="font-medium">{result.data.type || 'N/A'}</p>
                        </div>
                        {result.data.video && (
                          <div>
                            <span className="text-muted-foreground">Video Info:</span>
                            <p className="font-medium">
                              {result.data.video.width}x{result.data.video.height}, 
                              {Math.floor(result.data.video.duration / 60)}:{(result.data.video.duration % 60).toString().padStart(2, '0')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">User Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Nickname:</span>
                          <p className="font-medium">{result.data.user?.nickname || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">User ID:</span>
                          <p className="font-medium">{result.data.user?.user_id || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    {result.data.user?.user_id && (
                      <Link href={`/users/${result.data.user.user_id}`}>
                        <Button variant="outline" size="sm">
                          View User Profile
                        </Button>
                      </Link>
                    )}
                    {result.data.note_id && (
                      <Link href={`/notes/${result.data.note_id}`}>
                        <Button variant="outline" size="sm">
                          View Note Details
                        </Button>
                      </Link>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Original
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {result.error || 'No data available'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}