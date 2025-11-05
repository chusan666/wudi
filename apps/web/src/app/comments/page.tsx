'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/store/ui-store';

export default function CommentsPage() {
  const { filters, setFilters, resetFilters } = useUIStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Comment Analysis</h1>
        <p className="mt-2 text-muted-foreground">
          Analyze and review comments
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters (Demo: Zustand State)</CardTitle>
          <CardDescription>
            This demonstrates Zustand state management. Filters are stored in global state.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search comments..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="flex-1"
            />
            <Button onClick={resetFilters} variant="outline">
              Reset
            </Button>
          </div>
          {filters.search && (
            <p className="text-sm text-muted-foreground">
              Current search filter: <span className="font-semibold">{filters.search}</span>
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
          <CardDescription>Recent comments will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Comment analysis features coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
