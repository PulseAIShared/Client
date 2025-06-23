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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg animate-pulse">
            <div className="h-4 bg-surface-primary rounded mb-3 w-3/4"></div>
            <div className="h-8 bg-surface-primary rounded mb-2"></div>
            <div className="h-2 bg-surface-primary rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="col-span-full bg-error/20 border border-error/50 p-4 rounded-lg text-error-muted text-center">
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div key={index} className={`group relative bg-gradient-to-br ${stat.bgGradient} backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg hover:shadow-xl hover:border-border-primary/70 transition-all duration-300`}>
          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative">
            <h3 className="text-text-secondary text-sm font-medium mb-3 uppercase tracking-wider">{stat.title}</h3>
            <div className="flex items-end justify-between">
              <p className={`text-3xl font-bold ${stat.color} group-hover:scale-105 transition-transform duration-300`}>
                {stat.value}
              </p>
              {/* Trending indicator */}
              <div className="flex items-center gap-1 text-success-muted text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>+5.2%</span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-text-muted mb-1">
                <span>Progress</span>
                <span>87%</span>
              </div>
              <div className="w-full bg-surface-primary/50 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-accent-primary to-accent-secondary h-1.5 rounded-full w-[87%] transition-all duration-1000 ease-out"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};