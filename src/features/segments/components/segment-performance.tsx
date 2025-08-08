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
            <div key={index} className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg animate-pulse">
              <div className="h-4 bg-surface-secondary/50 rounded-xl mb-3"></div>
              <div className="h-8 bg-surface-secondary/50 rounded-xl mb-4"></div>
              <div className="h-2 bg-surface-secondary/50 rounded-xl"></div>
            </div>
          ))}
        </div>

        <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg animate-pulse">
          <div className="h-6 bg-surface-secondary/50 rounded-xl mb-6 w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-16 bg-surface-secondary/50 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !performanceData) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-error/20 to-error-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="text-error-muted font-medium mb-2">Failed to load segment performance data</div>
          <div className="text-sm text-text-muted mb-4">Please try refreshing the page</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error-muted transition-colors"
          >
            Try Again
          </button>
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
      bgGradient: 'from-surface-primary/80 to-surface-secondary/80',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      title: 'Customers Segmented', 
      value: `${(performanceData.totalCustomersSegmented / 1000).toFixed(1)}K`, 
      change: '+8.3%', 
      changeType: 'positive' as const,
      color: 'text-info',
      bgGradient: 'from-info/20 to-accent-primary/20',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    { 
      title: 'Avg Churn Reduction', 
      value: `${performanceData.avgChurnReduction}%`, 
      change: '+12%', 
      changeType: 'positive' as const,
      color: 'text-success',
      bgGradient: 'from-success/20 to-success-muted/20',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    { 
      title: 'Revenue Impact', 
      value: performanceData.revenueImpact, 
      change: '+23%', 
      changeType: 'positive' as const,
      color: 'text-warning',
      bgGradient: 'from-warning/20 to-warning-muted/20',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
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
      {/* Enhanced Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <div key={index} className={`group relative bg-gradient-to-br ${metric.bgGradient} backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-xl hover:shadow-2xl hover:border-accent-primary/30 transition-all duration-300 transform hover:-translate-y-1`}>
            {/* Enhanced glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-text-secondary text-sm font-medium uppercase tracking-wider">{metric.title}</h3>
                <div className="w-8 h-8 bg-surface-primary/50 rounded-xl flex items-center justify-center text-accent-primary group-hover:scale-110 transition-transform duration-300">
                  {metric.icon}
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className={`text-3xl font-bold ${metric.color} group-hover:scale-105 transition-transform duration-300`}>
                  {metric.value}
                </p>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  metric.changeType === 'positive' 
                    ? 'bg-success/20 text-success border border-success/30' 
                    : 'bg-error/20 text-error border border-error/30'
                }`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={metric.changeType === 'positive' ? "M7 14l3-3m0 0l3 3m-3-3v9" : "M7 10l3 3m0 0l3-3m-3 3V1"} />
                  </svg>
                  {metric.change}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Top Performing Segments */}
      {topPerformingSegments.length > 0 && (
        <div className="bg-surface-primary/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">Top Performing Segment</h2>
              <p className="text-sm sm:text-base text-text-muted">Best performing segment based on churn reduction</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-accent-secondary/20 to-accent-secondary/30 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topPerformingSegments.map((segment, index) => (
              <div key={index} className="group bg-surface-secondary/30 p-6 rounded-2xl border border-border-primary/30 hover:border-accent-secondary/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent-secondary transition-colors">
                    {segment.name}
                  </h3>
                  <div className="px-3 py-1 bg-accent-secondary/20 text-accent-secondary rounded-full text-sm font-medium border border-accent-secondary/30">
                    {segment.impact}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Churn Reduction</span>
                    <span className="font-semibold text-success">{segment.impact}</span>
                  </div>
                  <div className="w-full bg-surface-primary/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-accent-secondary to-accent-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${parseInt(segment.impact.replace('+', '').replace('%', ''))}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Performance Summary */}
      <div className="bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-accent-primary/30 shadow-xl">
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">Segment Performance Summary</h2>
          <p className="text-sm sm:text-base text-text-muted">Key insights and recommendations for your segmentation strategy</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-primary/50 p-6 rounded-2xl border border-border-primary/30 text-center">
            <div className="w-12 h-12 bg-success/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-text-primary mb-2">Strong Performance</h4>
            <p className="text-sm text-text-muted">Your segments are showing positive churn reduction trends</p>
          </div>

          <div className="bg-surface-primary/50 p-6 rounded-2xl border border-border-primary/30 text-center">
            <div className="w-12 h-12 bg-info/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-text-primary mb-2">Growth Opportunity</h4>
            <p className="text-sm text-text-muted">Consider expanding successful segment strategies</p>
          </div>

          <div className="bg-surface-primary/50 p-6 rounded-2xl border border-border-primary/30 text-center">
            <div className="w-12 h-12 bg-warning/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-text-primary mb-2">Optimization Needed</h4>
            <p className="text-sm text-text-muted">Review underperforming segments for improvement</p>
          </div>
        </div>
      </div>
    </div>
  );
};