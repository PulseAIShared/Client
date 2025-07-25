// src/features/dashboard/components/cards/stat-card.tsx
import React from 'react';
import { DashboardStats } from '@/types/api';

interface StatCardProps {
  stats?: DashboardStats;
  isLoading?: boolean;
  error?: Error | null;
}

export const StatCard: React.FC<StatCardProps> = ({ stats, isLoading, error }) => {

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-surface-secondary/50 backdrop-blur-lg p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl border border-border-primary/50 shadow-lg animate-pulse">
            <div className="h-3 sm:h-4 bg-surface-primary rounded mb-2 sm:mb-3 w-3/4"></div>
            <div className="h-6 sm:h-8 bg-surface-primary rounded mb-1 sm:mb-2"></div>
            <div className="h-1.5 sm:h-2 bg-surface-primary rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="col-span-full bg-error/20 border border-error/50 p-3 sm:p-4 rounded-lg text-error-muted text-center text-sm sm:text-base">
          Failed to load dashboard statistics
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers,
      color: 'text-text-primary',
      bgGradient: 'from-surface-secondary/80 to-surface-primary/80'
    },
    { 
      title: 'Churn Risk', 
      value: stats.churnRisk,
      color: 'text-info-muted',
      bgGradient: 'from-info-bg/20 to-accent-primary/20'
    },
    { 
      title: 'Recovered Revenue', 
      value: stats.recoveredRevenue,
      color: 'text-success-muted',
      bgGradient: 'from-success-bg/20 to-success/20'
    },
    { 
      title: 'Avg. LTV', 
      value: stats.avgLTV,
      color: 'text-warning-muted',
      bgGradient: 'from-warning-bg/20 to-warning/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {statCards.map((stat, index) => (
        <div key={index} className={`group relative bg-gradient-to-br ${stat.bgGradient} backdrop-blur-lg p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl border border-border-primary/50 shadow-lg hover:shadow-xl hover:border-border-primary/70 transition-all duration-300`}>
          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative">
            <h3 className="text-text-secondary text-xs sm:text-sm font-medium mb-2 sm:mb-3 uppercase tracking-wider">{stat.title}</h3>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${stat.color} group-hover:scale-105 transition-transform duration-300`}>
                {stat.value}
              </p>
              {/* Trending indicator - now visible on all screen sizes */}
              <div className="flex items-center gap-1 text-success-muted text-xs sm:text-sm font-medium bg-success-bg/20 px-2 py-1 rounded-full border border-success/30">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>+5.2%</span>
              </div>
            </div>
            
            {/* Additional context instead of progress bar */}
            <p className="text-xs text-text-muted">
              {stat.title === 'Total Users' ? 'Active customers in system' :
               stat.title === 'Churn Risk' ? 'Customers at risk this month' :
               stat.title === 'Recovered Revenue' ? 'Revenue saved this quarter' :
               'Average customer lifetime value'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};