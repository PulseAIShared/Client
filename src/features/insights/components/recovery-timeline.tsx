import React from 'react';
import { useGetRecoveryInsights } from '@/features/insights/api/recovery-insights';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export const RecoveryTimeline: React.FC = () => {
  const { data, isLoading, error } = useGetRecoveryInsights();

  if (isLoading) {
    return <div className="h-80 bg-surface-primary/80 rounded-2xl border border-border-primary/30 animate-pulse" />;
  }

  if (error || !data) return null;

  const points = data.timeline;
  if (!points || points.length === 0) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 text-center">
        <div className="text-lg font-semibold text-text-primary mb-2">No recovery timeline data</div>
        <div className="text-sm text-text-muted">Once revenue data is flowing, we’ll visualize recovered vs missed revenue here.</div>
      </div>
    );
  }

  return (
    <div className="bg-surface-primary/80 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-text-primary mb-1">Recovery Timeline</h3>
          <p className="text-sm text-text-muted">Track recovery performance over time</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span className="text-sm text-text-muted">Recovered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-error"></div>
            <span className="text-sm text-text-muted">Missed</span>
          </div>
        </div>
      </div>
      
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-surface-secondary/30 rounded-xl">
          <div className="text-lg font-bold text-success">${points.reduce((sum: number, p: any) => sum + p.recoveredAmount, 0).toLocaleString()}</div>
          <div className="text-xs text-text-muted">Total Recovered</div>
        </div>
        <div className="text-center p-3 bg-surface-secondary/30 rounded-xl">
          <div className="text-lg font-bold text-error">${points.reduce((sum: number, p: any) => sum + p.missedAmount, 0).toLocaleString()}</div>
          <div className="text-xs text-text-muted">Total Missed</div>
        </div>
        <div className="text-center p-3 bg-surface-secondary/30 rounded-xl">
          <div className="text-lg font-bold text-accent-primary">
            {((points.reduce((sum: number, p: any) => sum + p.recoveredAmount, 0) / points.reduce((sum: number, p: any) => sum + p.missedAmount, 1)) * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-text-muted">Recovery Rate</div>
        </div>
      </div>

      <div className="h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="recoveredGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(var(--success))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="rgb(var(--success))" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="missedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(var(--error))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="rgb(var(--error))" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" opacity={0.2} />
            <XAxis 
              dataKey="month" 
              stroke="rgb(var(--text-muted))" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tick={{ fill: 'rgb(var(--text-muted))' }}
            />
            <YAxis 
              stroke="rgb(var(--text-muted))" 
              fontSize={12} 
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} 
              tickLine={false} 
              axisLine={false}
              tick={{ fill: 'rgb(var(--text-muted))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--surface-primary))', 
                border: '1px solid hsl(var(--border-primary))', 
                borderRadius: 12, 
                color: 'hsl(var(--text-primary))',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number, name: string) => [
                `$${value.toLocaleString()}`,
                name === 'missedAmount' ? 'Missed' : 'Recovered'
              ]}
              labelStyle={{ color: 'hsl(var(--text-secondary))' }}
            />
            <Area 
              type="monotone" 
              dataKey="missedAmount" 
              stroke="rgb(var(--error))" 
              strokeWidth={2}
              fill="url(#missedGradient)" 
              name="missedAmount"
            />
            <Area 
              type="monotone" 
              dataKey="recoveredAmount" 
              stroke="rgb(var(--success))" 
              strokeWidth={2}
              fill="url(#recoveredGradient)" 
              name="recoveredAmount"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};