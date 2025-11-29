import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CustomerTrendPoint } from '@/types/api';

interface CustomerTrendChartProps {
  data?: CustomerTrendPoint[];
  isLoading?: boolean;
  error?: Error | null;
}

export const CustomerTrendChart: React.FC<CustomerTrendChartProps> = ({ data, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="h-full bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg animate-pulse" />
    );
  }

  if (error || !data) {
    return (
      <div className="h-full bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg flex items-center justify-center">
        <p className="text-text-muted text-sm">No customer trend data</p>
      </div>
    );
  }

  const latest = data[data.length - 1];

  return (
    <div className="h-full bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success-muted animate-pulse" />
            <h3 className="text-lg font-semibold text-text-primary">Customer & churn trend</h3>
          </div>
          <p className="text-text-muted text-sm">Volume vs churned across the selected range</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-text-muted">Latest period</div>
          <div className="text-xl font-semibold text-text-primary">
            {latest ? `${latest.period}` : '—'}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" opacity={0.3} />
            <XAxis dataKey="period" stroke="rgb(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="rgb(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgb(var(--surface-primary))', border: '1px solid rgb(var(--border-primary))', borderRadius: 12 }}
              labelStyle={{ color: 'rgb(var(--text-primary))' }}
            />
            <Legend />
            <Area type="monotone" dataKey="customers" name="Customers" stroke="rgb(var(--accent-primary))" fill="rgb(var(--accent-primary))" fillOpacity={0.12} strokeWidth={3} />
            <Area type="monotone" dataKey="churned" name="Churned" stroke="rgb(var(--error))" fill="rgb(var(--error))" fillOpacity={0.08} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
