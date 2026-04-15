'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { date: 'Mar 1', value: 95000 },
  { date: 'Mar 8', value: 98500 },
  { date: 'Mar 15', value: 102000 },
  { date: 'Mar 22', value: 105500 },
  { date: 'Mar 29', value: 110000 },
  { date: 'Apr 5', value: 125000 },
];

export default function PortfolioChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
        <YAxis stroke="rgba(255,255,255,0.5)" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
          }}
          labelStyle={{ color: '#fff' }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="url(#colorGradient)"
          strokeWidth={2}
          dot={{ fill: 'rgba(128, 90, 213, 0.6)', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="rgba(128, 90, 213, 0.8)" />
            <stop offset="95%" stopColor="rgba(128, 90, 213, 0.1)" />
          </linearGradient>
        </defs>
      </LineChart>
    </ResponsiveContainer>
  );
}
