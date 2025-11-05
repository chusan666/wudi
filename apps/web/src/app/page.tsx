import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Welcome to Data Platform</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          A modern Next.js 15 application with React 19, TypeScript, TailwindCSS, shadcn/ui, TanStack Query, and Zustand
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Search</CardTitle>
            <CardDescription>
              Search through notes, users, and analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/search">
              <Button className="w-full">Go to Search</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>
              View and manage your notes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/notes">
              <Button className="w-full">View Notes</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Manage user profiles and details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/users">
              <Button className="w-full">View Users</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>KOL Analytics</CardTitle>
            <CardDescription>
              Key Opinion Leader analytics and insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/kol-analytics">
              <Button className="w-full">View Analytics</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comment Analysis</CardTitle>
            <CardDescription>
              Analyze and review comments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/comments">
              <Button className="w-full">View Comments</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
