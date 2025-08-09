import React from 'react';
import { useGetInsightsData } from '@/features/insights/api/insights';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export const RecoveryTimeline: React.FC = () => {
  const { data, isLoading, error } = useGetInsightsData();

  if (isLoading) {
    return <div className="h-80 bg-surface-primary/80 rounded-2xl border border-border-primary/30 animate-pulse" />;
  }

  if (error || !data) return null;

  const points = data.recoveryAnalytics.timeline;

  return (
    <div className="bg-surface-primary/80 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-xl">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Recovery Timeline</h3>
        <p className="text-sm text-text-muted">Recovered revenue vs missed payments</p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" opacity={0.3} />
            <XAxis dataKey="month" stroke="rgb(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="rgb(var(--text-muted))" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)', borderRadius: 12, color: 'var(--text-primary)' }} />
            <Area type="monotone" dataKey="missedAmount" stroke="rgb(var(--error))" fillOpacity={0.1} fill="rgb(var(--error))" name="Missed" />
            <Area type="monotone" dataKey="recoveredAmount" stroke="rgb(var(--success))" fillOpacity={0.1} fill="rgb(var(--success))" name="Recovered" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};