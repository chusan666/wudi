'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function EngagementChart() {
  // Mock data for engagement over time
  const data = [
    { date: '2024-01', likes: 4000, comments: 240, shares: 240 },
    { date: '2024-02', likes: 3000, comments: 139, shares: 221 },
    { date: '2024-03', likes: 2000, comments: 980, shares: 229 },
    { date: '2024-04', likes: 2780, comments: 390, shares: 200 },
    { date: '2024-05', likes: 1890, comments: 480, shares: 218 },
    { date: '2024-06', likes: 2390, comments: 380, shares: 250 },
    { date: '2024-07', likes: 3490, comments: 430, shares: 210 },
  ];

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="likes" 
            stroke="#8884d8" 
            strokeWidth={2}
            name="Likes"
          />
          <Line 
            type="monotone" 
            dataKey="comments" 
            stroke="#82ca9d" 
            strokeWidth={2}
            name="Comments"
          />
          <Line 
            type="monotone" 
            dataKey="shares" 
            stroke="#ffc658" 
            strokeWidth={2}
            name="Shares"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}