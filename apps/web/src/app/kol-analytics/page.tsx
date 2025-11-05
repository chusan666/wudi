import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'KOL Analytics | Data Platform',
  description: 'Key Opinion Leader analytics and insights',
};

export default function KOLAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">KOL Analytics</h1>
        <p className="mt-2 text-muted-foreground">
          Key Opinion Leader analytics and insights
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total KOLs</CardTitle>
            <CardDescription>Number of tracked KOLs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">142</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Rate</CardTitle>
            <CardDescription>Average engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">4.2%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Reach</CardTitle>
            <CardDescription>Combined audience</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">2.4M</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>Detailed KOL metrics and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Analytics dashboard features coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
