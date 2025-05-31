// src/features/dashboard/components/cards/stat-card.tsx
import React from 'react';
import { useGetDashboardStats } from '@/features/dashboard/api/dashboard';

export const StatCard: React.FC = () => {
  const { data: stats, isLoading, error } = useGetDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg animate-pulse">
            <div className="h-4 bg-slate-700 rounded mb-3 w-3/4"></div>
            <div className="h-8 bg-slate-700 rounded mb-2"></div>
            <div className="h-2 bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="col-span-full bg-red-500/20 border border-red-500/50 p-4 rounded-lg text-red-400 text-center">
          Failed to load dashboard statistics
        </div>
      </div>
    );
  }

  const statCards = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers,
      color: 'text-white',
      bgGradient: 'from-slate-800/80 to-slate-900/80'
    },
    { 
      title: 'Churn Risk', 
      value: stats.churnRisk,
      color: 'text-cyan-400',
      bgGradient: 'from-cyan-600/20 to-blue-600/20'
    },
    { 
      title: 'Recovered Revenue', 
      value: stats.recoveredRevenue,
      color: 'text-green-400',
      bgGradient: 'from-green-600/20 to-emerald-600/20'
    },
    { 
      title: 'Avg. LTV', 
      value: stats.avgLTV,
      color: 'text-yellow-400',
      bgGradient: 'from-yellow-600/20 to-orange-600/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div key={index} className={`group relative bg-gradient-to-br ${stat.bgGradient} backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg hover:shadow-xl hover:border-slate-600/50 transition-all duration-300`}>
          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative">
            <h3 className="text-slate-300 text-sm font-medium mb-3 uppercase tracking-wider">{stat.title}</h3>
            <div className="flex items-end justify-between">
              <p className={`text-3xl font-bold ${stat.color} group-hover:scale-105 transition-transform duration-300`}>
                {stat.value}
              </p>
              {/* Trending indicator */}
              <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>+5.2%</span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Progress</span>
                <span>87%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full w-[87%] transition-all duration-1000 ease-out"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};