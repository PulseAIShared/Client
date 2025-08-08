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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-surface-primary/80 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-border-primary/30 shadow-lg animate-pulse">
            <div className="h-4 sm:h-5 bg-surface-secondary rounded mb-3 sm:mb-4 w-3/4"></div>
            <div className="h-8 sm:h-10 bg-surface-secondary rounded mb-2 sm:mb-3"></div>
            <div className="h-3 sm:h-4 bg-surface-secondary rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        <div className="col-span-full bg-gradient-to-r from-error-bg/50 to-error/20 border border-error/30 p-6 rounded-2xl text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <svg className="w-6 h-6 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-error-muted font-medium">Failed to load dashboard statistics</span>
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

  const statCards = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers,
      color: 'text-text-primary',
      bgGradient: 'from-surface-primary to-surface-secondary',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    { 
      title: 'Churn Risk', 
      value: stats.churnRisk,
      color: 'text-info-muted',
      bgGradient: 'from-info-bg/30 to-accent-primary/20',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      title: 'Recovered Revenue', 
      value: stats.recoveredRevenue,
      color: 'text-success-muted',
      bgGradient: 'from-success-bg/30 to-success/20',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    { 
      title: 'Avg. LTV', 
      value: stats.avgLTV,
      color: 'text-warning-muted',
      bgGradient: 'from-warning-bg/30 to-warning/20',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
      {statCards.map((stat, index) => (
        <div key={index} className={`group relative bg-gradient-to-br ${stat.bgGradient} backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-2xl hover:border-border-secondary/50 transition-all duration-300 transform hover:-translate-y-1`}>
          {/* Enhanced glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-text-secondary text-xs sm:text-sm font-medium uppercase tracking-wider">{stat.title}</h3>
              <div className="text-accent-primary/60 group-hover:text-accent-primary transition-colors duration-300">
                {stat.icon}
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <p className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${stat.color} group-hover:scale-105 transition-transform duration-300`}>
                {stat.value}
              </p>
              {/* Enhanced trending indicator */}
              <div className="flex items-center gap-1 text-success-muted text-xs sm:text-sm font-medium bg-success-bg/30 px-2 py-1 rounded-full border border-success/20 group-hover:bg-success-bg/50 transition-colors duration-300">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>+5.2%</span>
              </div>
            </div>
            
            {/* Enhanced context description */}
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              {stat.title === 'Total Users' ? 'Active customers in your system' :
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