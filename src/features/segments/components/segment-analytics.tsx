// src/features/segments/components/segment-analytics.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useGetInsightsData } from '@/features/insights/api/insights';

export const SegmentAnalytics = () => {
  const { data, isLoading, error } = useGetInsightsData();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-80 bg-surface-primary/80 rounded-2xl border border-border-primary/30 animate-pulse" />
        <div className="h-80 bg-surface-primary/80 rounded-2xl border border-border-primary/30 animate-pulse" />
        <div className="h-80 bg-surface-primary/80 rounded-2xl border border-border-primary/30 animate-pulse" />
      </div>
    );
  }
  if (error || !data) return null;

  const { churnTrendsBySegment, revenueBySegment, segmentDistribution, campaignPerformanceBySegment } = data.segmentAnalytics;

  const isEmpty =
    !churnTrendsBySegment?.length &&
    !revenueBySegment?.length &&
    !segmentDistribution?.length &&
    !campaignPerformanceBySegment?.length;

  if (isEmpty) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 text-center">
        <div className="text-lg font-semibold text-text-primary mb-2">No segment analytics yet</div>
        <div className="text-sm text-text-muted mb-4">Create your first segment to unlock segment-level analytics.</div>
        <a href="/app/segments" className="px-4 py-2 rounded-lg border border-border-primary/30 hover:bg-surface-secondary/50 inline-block">Create Segment</a>
      </div>
    );
  }

  const lineKeys = Object.keys(churnTrendsBySegment[0] || {}).filter((k) => k !== 'month');

  return (
    <div className="space-y-8">
      {/* Churn Trends by Segment */}
      <div className="bg-surface-primary/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">Churn Trends by Segment</h2>
            <p className="text-sm sm:text-base text-text-muted">6-month churn rate evolution across customer segments</p>
          </div>
        </div>

        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={churnTrendsBySegment}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" opacity={0.3} />
              <XAxis dataKey="month" stroke="rgb(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="rgb(var(--text-muted))" fontSize={12} tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)', borderRadius: '12px', color: 'var(--text-primary)' }} />
              {lineKeys.map((k, idx) => (
                <Line key={k} type="monotone" dataKey={k} strokeWidth={3} name={k} dot={{ r: 2 }} stroke={["#8b5cf6","#06b6d4","#f59e0b","#10b981","#ef4444"][idx % 5]} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue by Segment */}
      <div className="bg-surface-primary/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">Revenue by Segment</h2>
            <p className="text-sm sm:text-base text-text-muted">Monthly revenue breakdown across customer segments</p>
          </div>
        </div>

        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueBySegment}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" opacity={0.3} />
              <XAxis dataKey="segment" stroke="rgb(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="rgb(var(--text-muted))" fontSize={12} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)', borderRadius: '12px', color: 'var(--text-primary)' }} formatter={(value: any) => [`$${(value as number).toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="url(#revenueGradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {revenueBySegment.map((item: any) => (
            <div key={item.segment} className="text-center p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/30">
              <div className="text-lg sm:text-xl font-bold text-accent-primary">${(Number(item.revenue || 0) / 1000).toFixed(0)}k</div>
              <div className="text-sm text-text-muted">{item.segment}</div>
              <div className="text-xs text-text-muted">{Number(item.customers || 0).toLocaleString()} customers</div>
            </div>
          ))}
        </div>
      </div>

      {/* Segment Distribution and Playbook Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface-primary/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">Segment Distribution</h2>
              <p className="text-sm sm:text-base text-text-muted">Customer distribution across segments</p>
            </div>
          </div>

          <div className="h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={segmentDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={5} dataKey="value">
                  {segmentDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)', borderRadius: '12px', color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {segmentDistribution.map((item: any) => (
              <div key={item.name} className="flex items-center gap-3 p-3 bg-surface-secondary/30 rounded-xl border border-border-primary/30">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <div>
                  <div className="font-medium text-text-primary">{item.name}</div>
                  <div className="text-sm text-text-muted">{Number(item.customers || 0).toLocaleString()} customers</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-primary/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">Playbook Performance</h2>
              <p className="text-sm sm:text-base text-text-muted">Recovery playbook success rates by segment</p>
            </div>
          </div>

          <div className="space-y-4">
            {campaignPerformanceBySegment.map((item: any) => {
              const successRate = (item.success_rate ?? item.successRate ?? 0) as number;
              const revenueRecovered = (item.revenue_recovered ?? item.revenueRecovered ?? 0) as number;
              return (
                <div key={item.segment} className="p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/30 hover:border-accent-primary/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-text-primary">{item.segment}</h3>
                    <span className="text-sm text-accent-primary font-medium">{successRate}% success</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-text-muted">
                    <span>{item.campaigns} playbooks</span>
                    <span className="font-medium text-success">${Number(revenueRecovered).toLocaleString()} recovered</span>
                  </div>
                  <div className="mt-2 w-full bg-surface-primary/50 rounded-full h-2">
                    <div className="bg-gradient-to-r from-accent-primary to-accent-secondary h-2 rounded-full transition-all duration-500" style={{ width: `${successRate}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
