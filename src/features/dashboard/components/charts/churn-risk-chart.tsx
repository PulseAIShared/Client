// src/features/dashboard/components/charts/churn-risk-chart.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { ChurnRiskData } from '@/types/api';

interface ChurnRiskChartProps {
  data?: ChurnRiskData[];
  currentRisk?: string;
  isLoading?: boolean;
  error?: Error | null;
}

export const ChurnRiskChart: React.FC<ChurnRiskChartProps> = ({ data: churnRiskData, currentRisk, isLoading, error }) => {

  if (isLoading) {
    return (
      <div className="h-full bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg animate-pulse flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-3">
            <div className="h-6 bg-surface-secondary rounded w-48"></div>
            <div className="h-4 bg-surface-secondary rounded w-32"></div>
          </div>
          <div className="text-right space-y-3">
            <div className="h-8 bg-surface-secondary rounded w-16"></div>
            <div className="h-4 bg-surface-secondary rounded w-24"></div>
          </div>
        </div>
        <div className="flex-1 bg-surface-secondary rounded mb-4"></div>
        <div className="h-4 bg-surface-secondary rounded"></div>
      </div>
    );
  }

  if (error || !churnRiskData) {
    return (
      <div className="h-full bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-error/20 to-error-muted/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <div className="text-error-muted font-medium mb-1">Failed to load churn risk data</div>
            <div className="text-text-muted text-sm">Please try refreshing the page</div>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error-muted transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const latestPoint = churnRiskData[churnRiskData.length - 1];
  const displayRisk = currentRisk ?? (latestPoint ? `${latestPoint.risk.toFixed(1)}%` : '—');

  return (
    <div className="h-full bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col group">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full animate-pulse"></div>
            <h2 className="text-xl font-semibold text-text-primary">Churn Risk Predictor</h2>
          </div>
          <p className="text-sm text-text-muted">AI-powered risk analysis over time</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-accent-primary group-hover:scale-105 transition-transform duration-300">{displayRisk}</div>
          <div className="text-sm text-text-muted">Current risk level</div>
        </div>
      </div>
      
      {/* Enhanced Chart - Takes remaining space */}
      <div className="flex-1 min-h-0 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={churnRiskData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" opacity={0.3} />
            <XAxis 
              dataKey="week" 
              stroke="rgb(var(--text-muted))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="rgb(var(--text-muted))"
              fontSize={12}
              domain={['auto', 'auto']}
              tickFormatter={(value) => `${value}%`}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgb(var(--surface-primary))', border: '1px solid rgb(var(--border-primary))', borderRadius: 12 }}
              labelStyle={{ color: 'rgb(var(--text-primary))' }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Risk']}
            />
            <Line 
              type="monotone" 
              dataKey="risk" 
              stroke="rgb(var(--accent-primary))" 
              strokeWidth={3}
              dot={{ fill: 'rgb(var(--accent-primary))', strokeWidth: 2, r: 4, stroke: 'rgb(var(--surface-primary))' }}
              activeDot={{ r: 6, stroke: 'rgb(var(--accent-primary))', strokeWidth: 2, fill: 'rgb(var(--accent-primary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Enhanced Insights - Footer */}
      <div className="flex items-center justify-between text-sm mt-auto pt-4 border-t border-border-primary/30">
        <div className="flex items-center gap-2 text-success-muted bg-success-bg/20 px-3 py-1 rounded-full">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Trend improving</span>
        </div>
        <div className="text-text-muted flex items-center gap-2">
          <div className="w-2 h-2 bg-success-muted rounded-full animate-pulse"></div>
          <span>Last updated: 2 mins ago</span>
        </div>
      </div>
    </div>
  );
};
