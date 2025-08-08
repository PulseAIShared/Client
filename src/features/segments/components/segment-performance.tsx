// src/features/segments/components/segment-performance.tsx
import React from 'react';
import { useGetSegmentPerformance } from '@/features/segments/api/segments';

export const SegmentPerformance: React.FC = () => {
  const { data: performanceData, isLoading, error } = useGetSegmentPerformance();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-surface-primary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg animate-pulse">
              <div className="h-4 bg-surface-secondary rounded mb-3"></div>
              <div className="h-8 bg-surface-secondary rounded mb-4"></div>
              <div className="h-2 bg-surface-secondary rounded"></div>
            </div>
          ))}
        </div>

        <div className="bg-surface-primary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg animate-pulse">
          <div className="h-6 bg-surface-secondary rounded mb-6 w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-16 bg-surface-secondary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !performanceData) {
    return (
      <div className="bg-surface-primary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg">
        <div className="text-center py-8">
          <div className="text-error mb-2">Failed to load segment performance data</div>
          <div className="text-text-muted text-sm">Please try refreshing the page</div>
        </div>
      </div>
    );
  }

  const performanceMetrics = [
    { 
      title: 'Total Segments', 
      value: performanceData.totalSegments.toString(), 
      change: '+2', 
      changeType: 'positive' as const,
      color: 'text-text-primary',
      bgGradient: 'from-surface-primary/80 to-surface-secondary/80'
    },
    { 
      title: 'Customers Segmented', 
      value: `${(performanceData.totalCustomersSegmented / 1000).toFixed(1)}K`, 
      change: '+8.3%', 
      changeType: 'positive' as const,
      color: 'text-info',
      bgGradient: 'from-info/20 to-accent-primary/20'
    },
    { 
      title: 'Avg Churn Reduction', 
      value: `${performanceData.avgChurnReduction}%`, 
      change: '+12%', 
      changeType: 'positive' as const,
      color: 'text-success',
      bgGradient: 'from-success/20 to-success-muted/20'
    },
    { 
      title: 'Revenue Impact', 
      value: performanceData.revenueImpact, 
      change: '+23%', 
      changeType: 'positive' as const,
      color: 'text-warning',
      bgGradient: 'from-warning/20 to-warning-muted/20'
    }
  ];

  const topPerformingSegments = performanceData.topPerformingSegment.name !== "No segments available" 
    ? [{ 
        name: performanceData.topPerformingSegment.name, 
        impact: `+${performanceData.topPerformingSegment.churnReduction}%`, 
        customers: 0, // API doesn't provide customer count for top segment
        color: 'bg-accent-secondary' 
      }]
    : [];

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <div key={index} className={`group relative bg-gradient-to-br ${metric.bgGradient} backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg hover:shadow-xl hover:border-border-primary/60 transition-all duration-300`}>
            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative">
              <h3 className="text-text-secondary text-sm font-medium mb-3 uppercase tracking-wider">{metric.title}</h3>
              <div className="flex items-end justify-between">
                <p className={`text-3xl font-bold ${metric.color} group-hover:scale-105 transition-transform duration-300`}>
                  {metric.value}
                </p>
                {/* Trending indicator */}
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  metric.changeType === 'positive' ? 'text-success' : 'text-error'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d={metric.changeType === 'positive' ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                  </svg>
                  <span>{metric.change}</span>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-text-muted mb-1">
                  <span>Performance</span>
                  <span>92%</span>
                </div>
                <div className="w-full bg-surface-secondary/50 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-accent-primary to-accent-secondary h-1.5 rounded-full w-[92%] transition-all duration-1000 ease-out"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Performing Segments */}
      <div className="bg-surface-primary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-1">Top Performing Segments</h2>
            <p className="text-sm text-text-muted">Segments with highest churn reduction rates</p>
          </div>
          <div className="bg-success/20 text-success px-3 py-1 rounded-full text-sm font-medium border border-success/30">
            All Improving
          </div>
        </div>
        
        {topPerformingSegments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topPerformingSegments.map((segment, index) => (
              <div key={index} className="group flex items-center justify-between p-4 bg-surface-secondary/30 rounded-lg hover:bg-surface-secondary/50 transition-all duration-200 border border-border-primary/30 hover:border-border-primary/50">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${segment.color} shadow-lg`} />
                  <div>
                    <span className="text-text-primary font-medium group-hover:text-accent-primary transition-colors">{segment.name}</span>
                    {segment.customers > 0 && (
                      <div className="text-text-muted text-sm">{segment.customers.toLocaleString()} customers</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-success font-semibold text-lg">{segment.impact}</div>
                  <div className="text-xs text-text-muted">churn reduction</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-text-muted mb-2">No segments available</div>
            <div className="text-sm text-text-muted">Create segments to see performance data</div>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-border-primary/50">
          <button className="w-full px-4 py-2 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 text-accent-primary rounded-lg hover:from-accent-primary/30 hover:to-accent-secondary/30 transition-all duration-200 font-medium text-sm border border-accent-primary/30">
            View Detailed Performance Report
          </button>
        </div>
      </div>
    </div>
  );
};