'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function UserStatsChart() {
  // Mock data for user statistics
  const data = [
    { metric: 'Posts', value: 156, color: '#8884d8' },
    { metric: 'Followers', value: 12500, color: '#82ca9d' },
    { metric: 'Total Likes', value: 45600, color: '#ffc658' },
    { metric: 'Comments', value: 12300, color: '#ff7c7c' },
    { metric: 'Shares', value: 8900, color: '#8dd1e1' },
  ];

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="metric" />
          <YAxis />
          <Tooltip 
            formatter={(value: any) => [
              value.toLocaleString(), 
              'Count'
            ]}
          />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}