'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Play, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface UserNotesListProps {
  userId: string;
  page: number;
  onPageChange: (page: number) => void;
}

export function UserNotesList({ userId, page, onPageChange }: UserNotesListProps) {
  const [loading, setLoading] = useState(false);
  
  // Mock notes data - in real app, this would come from API with pagination
  const mockNotes = Array.from({ length: 12 }, (_, i) => ({
    id: `note-${i + 1}`,
    title: `Note Title ${i + 1}`,
    description: `This is a sample description for note ${i + 1}`,
    type: i % 3 === 0 ? 'video' : 'image',
    thumbnail: `https://picsum.photos/300/300?random=${i}`,
    likes: Math.floor(Math.random() * 10000),
    comments: Math.floor(Math.random() * 1000),
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));

  const notesPerPage = 6;
  const totalPages = Math.ceil(mockNotes.length / notesPerPage);
  const startIndex = (page - 1) * notesPerPage;
  const paginatedNotes = mockNotes.slice(startIndex, startIndex + notesPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setLoading(true);
      setTimeout(() => {
        onPageChange(newPage);
        setLoading(false);
      }, 500);
    }
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-0">
              <Skeleton className="h-48 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {paginatedNotes.map((note) => (
          <Link key={note.id} href={`/notes/${note.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-0">
                {/* Thumbnail */}
                <div className="relative h-48 bg-muted">
                  <img
                    src={note.thumbnail}
                    alt={note.title}
                    className="w-full h-full object-cover"
                  />
                  {note.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-gray-800 ml-1" />
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      {note.type === 'video' ? 'Video' : 'Image'}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">{note.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {note.description}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span>{note.likes.toLocaleString()} likes</span>
                      <span>{note.comments.toLocaleString()} comments</span>
                    </div>
                    <span>
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}