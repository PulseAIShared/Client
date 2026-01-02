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
      hint: 'Active customers in Pulse',
      color: 'text-text-primary',
      bgGradient: 'from-surface-primary to-surface-secondary',
      trend: stats.totalUsersChange,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    { 
      title: 'MRR', 
      value: stats.monthlyRecurringRevenue ?? '—',
      hint: 'Total monthly recurring revenue',
      color: 'text-accent-primary',
      bgGradient: 'from-accent-primary/10 to-accent-secondary/10',
      trend: stats.monthlyRecurringRevenueChange,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    { 
      title: 'Revenue Saved', 
      value: stats.revenueSaved ?? stats.recoveredRevenue,
      hint: 'Recovered + prevented churn',
      color: 'text-success-muted',
      bgGradient: 'from-success-bg/30 to-success/20',
      trend: stats.revenueSavedChange ?? stats.recoveredRevenueChange,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    { 
      title: 'Avg. LTV', 
      value: stats.avgLTV,
      hint: 'Average lifetime value',
      color: 'text-warning-muted',
      bgGradient: 'from-warning-bg/30 to-warning/20',
      trend: stats.avgLtvChange,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    { 
      title: 'Churn Risk', 
      value: stats.churnRisk,
      hint: 'Blended risk across customers',
      color: 'text-info-muted',
      bgGradient: 'from-info-bg/30 to-accent-primary/20',
      trend: stats.churnRiskChange,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18" />
        </svg>
      )
    },
    { 
      title: 'Activation Rate', 
      value: stats.activationRate ?? '—',
      hint: 'Users meeting healthy usage',
      color: 'text-success-muted',
      bgGradient: 'from-success-bg/20 to-accent-primary/10',
      trend: stats.activationRateChange,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="group relative bg-surface-primary/90 backdrop-blur-lg p-4 sm:p-5 rounded-xl border border-border-primary/40 shadow-md hover:shadow-lg hover:border-border-secondary/60 transition-all duration-200"
        >
          
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-text-secondary text-[11px] sm:text-xs font-medium uppercase tracking-wide">{stat.title}</h3>
              <div className="text-accent-primary/60 group-hover:text-accent-primary transition-colors duration-200">
                {stat.icon}
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-1">
              <p className={`text-xl sm:text-2xl font-semibold ${stat.color}`}>
                {stat.value}
              </p>
              {stat.trend && stat.trend !== '—' && (
                <div className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full border ${
                  stat.trend.startsWith('-')
                    ? 'text-error-muted bg-error-bg/20 border-error/10'
                    : 'text-success-muted bg-success-bg/20 border-success/10'
                }`}>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {stat.trend.startsWith('-') ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    )}
                  </svg>
                  <span className="truncate max-w-[60px]">
                    {stat.trend}
                  </span>
                </div>
              )}
            </div>
            
            <p className="text-[11px] sm:text-xs text-text-muted leading-relaxed">
              {stat.hint}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
