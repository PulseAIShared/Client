// src/features/dashboard/components/charts/churn-risk-chart.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChurnRiskData } from '@/types/api';

interface ChurnRiskChartProps {
  data?: ChurnRiskData[];
  isLoading?: boolean;
  error?: Error | null;
}

export const ChurnRiskChart: React.FC<ChurnRiskChartProps> = ({ data: churnRiskData, isLoading, error }) => {

  if (isLoading) {
    return (
      <div className="lg:col-span-2 bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-6 bg-surface-primary rounded w-48"></div>
            <div className="h-4 bg-surface-primary rounded w-32"></div>
          </div>
          <div className="text-right space-y-2">
            <div className="h-8 bg-surface-primary rounded w-16"></div>
            <div className="h-4 bg-surface-primary rounded w-24"></div>
          </div>
        </div>
        <div className="h-64 bg-surface-primary rounded mb-4"></div>
        <div className="h-4 bg-surface-primary rounded"></div>
      </div>
    );
  }

  if (error || !churnRiskData) {
    return (
      <div className="lg:col-span-2 bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg">
        <div className="text-center py-8">
          <div className="text-error-muted mb-2">Failed to load churn risk data</div>
          <div className="text-text-muted text-sm">Please try refreshing the page</div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-1">Churn Risk Predictor</h2>
          <p className="text-sm text-text-muted">AI-powered risk analysis</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-accent-primary">8.2%</div>
          <div className="text-sm text-text-muted">Current risk</div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={churnRiskData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" />
            <XAxis 
              dataKey="week" 
              stroke="rgb(var(--text-muted))"
              fontSize={12}
            />
            <YAxis 
              stroke="rgb(var(--text-muted))"
              fontSize={12}
              domain={[2, 12]}
              tickFormatter={(value) => `${value}%`}
            />
            <Line 
              type="monotone" 
              dataKey="risk" 
              stroke="rgb(var(--accent-primary))" 
              strokeWidth={3}
              dot={{ fill: 'rgb(var(--accent-primary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'rgb(var(--accent-primary))', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-success-muted">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Trend improving</span>
        </div>
        <div className="text-text-muted">
          Last updated: 2 mins ago
        </div>
      </div>
    </div>
  );
};