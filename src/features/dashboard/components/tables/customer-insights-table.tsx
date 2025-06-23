// src/features/dashboard/components/tables/customer-insights-table.tsx
import React from 'react';
import { CustomerInsight } from '@/types/api';

interface CustomerInsightsTableProps {
  data?: CustomerInsight[];
  isLoading?: boolean;
  error?: Error | null;
}

export const CustomerInsightsTable: React.FC<CustomerInsightsTableProps> = ({ data: insights, isLoading, error }) => {

  if (isLoading) {
    return (
      <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-6 bg-surface-primary rounded w-40"></div>
            <div className="h-4 bg-surface-primary rounded w-32"></div>
          </div>
          <div className="h-6 bg-surface-primary rounded w-24"></div>
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 bg-surface-primary rounded"></div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border-primary/50">
          <div className="h-10 bg-surface-primary rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg">
        <div className="text-center py-8">
          <div className="text-error-muted mb-2">Failed to load revenue analysis</div>
          <div className="text-text-muted text-sm">Please try refreshing the page</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-1">Revenue Analysis</h2>
          <p className="text-sm text-text-muted">Performance by customer segment</p>
        </div>
        <div className="bg-success/20 text-success-muted px-3 py-1 rounded-full text-sm font-medium border border-success/30">
          +8.3% Growth
        </div>
      </div>
      
      <div className="space-y-4">
        {insights.map((item, index) => (
          <div key={index} className="group flex items-center justify-between p-4 bg-surface-primary/30 rounded-lg hover:bg-surface-primary/50 transition-all duration-200 border border-border-primary/30 hover:border-border-primary/50">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full shadow-lg"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-text-primary font-medium group-hover:text-accent-primary transition-colors">{item.name}</span>
              <span className="text-text-muted text-sm">({item.value}%)</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex-1 bg-border-primary/50 rounded-full h-2 w-20">
                <div 
                  className="h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ 
                    width: `${(item.value / 35) * 100}%`,
                    backgroundColor: item.color 
                  }}
                />
              </div>
              <div className="text-right">
                <div className="text-text-primary font-semibold">${item.revenue}</div>
                <div className="text-xs text-text-muted">avg LTV</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border-primary/50">
        <button className="w-full px-4 py-2 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 text-accent-primary rounded-lg hover:from-accent-primary/30 hover:to-accent-secondary/30 transition-all duration-200 font-medium text-sm border border-accent-primary/30">
          View Detailed Analytics
        </button>
      </div>
    </div>
  );
};