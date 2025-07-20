// src/features/dashboard/components/charts/customer-insights-pie.tsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CustomerInsight } from '@/types/api';

interface CustomerInsightsPieProps {
  data?: CustomerInsight[];
  isLoading?: boolean;
  error?: Error | null;
}

export const CustomerInsightsPie: React.FC<CustomerInsightsPieProps> = ({ data: customerInsightsData, isLoading, error }) => {

  if (isLoading) {
    return (
      <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-6 bg-surface-primary rounded w-48"></div>
            <div className="h-4 bg-surface-primary rounded w-32"></div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="h-48 w-full bg-surface-primary rounded-xl"></div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-12 bg-surface-primary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !customerInsightsData) {
    return (
      <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg">
        <div className="text-center py-8">
          <div className="text-error-muted mb-2">Failed to load customer insights</div>
          <div className="text-text-muted text-sm">Please try refreshing the page</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-1">Customer Demographics</h2>
          <p className="text-sm text-text-muted">Age distribution analysis</p>
        </div>
      </div>
      
      {/* Mobile Layout - Stacked */}
      <div className="md:hidden space-y-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={customerInsightsData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {customerInsightsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(var(--surface-secondary))', 
                  border: '1px solid rgb(var(--border-primary))',
                  borderRadius: '8px',
                  color: 'rgb(var(--text-primary))'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-3">
          {customerInsightsData.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-surface-primary/30 rounded-lg border border-border-primary/30">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-text-secondary font-medium">{item.name}</span>
              </div>
              <div className="text-right">
                <div className="text-text-primary font-semibold">${item.revenue}</div>
                <div className="text-xs text-text-muted">{item.value}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Layout - Side by Side */}
      <div className="hidden md:flex items-center justify-between">
        <div className="flex-1">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={customerInsightsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {customerInsightsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgb(var(--surface-secondary))', 
                    border: '1px solid rgb(var(--border-primary))',
                    borderRadius: '8px',
                    color: 'rgb(var(--text-primary))'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="ml-6 space-y-3 min-w-[200px]">
          {customerInsightsData.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-text-secondary font-medium">{item.name}</span>
              </div>
              <div className="text-right">
                <div className="text-text-primary font-semibold">${item.revenue}</div>
                <div className="text-xs text-text-muted">{item.value}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};