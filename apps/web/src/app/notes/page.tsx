'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';

async function fetchNotes() {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    { id: '1', title: 'Sample Note 1', content: 'This is a sample note', createdAt: '2024-01-15' },
    { id: '2', title: 'Sample Note 2', content: 'Another sample note', createdAt: '2024-01-16' },
    { id: '3', title: 'Sample Note 3', content: 'Yet another note', createdAt: '2024-01-17' },
  ];
}

export default function NotesPage() {
  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: fetchNotes,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage your notes
          </p>
        </div>
        <Button>Create Note</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Notes</CardTitle>
          <CardDescription>A list of all your notes</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes?.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell className="font-medium">{note.title}</TableCell>
                    <TableCell>{note.content}</TableCell>
                    <TableCell>{note.createdAt}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
