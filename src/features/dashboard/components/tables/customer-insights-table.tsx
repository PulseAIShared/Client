// src/features/dashboard/components/tables/customer-insights-table.tsx
import React from 'react';
import { useGetCustomerInsights } from '@/features/dashboard/api/dashboard';

export const CustomerInsightsTable: React.FC = () => {
  const { data: insights, isLoading, error } = useGetCustomerInsights();

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-6 bg-slate-700 rounded w-40"></div>
            <div className="h-4 bg-slate-700 rounded w-32"></div>
          </div>
          <div className="h-6 bg-slate-700 rounded w-24"></div>
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 bg-slate-700 rounded"></div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <div className="h-10 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
        <div className="text-center py-8">
          <div className="text-red-400 mb-2">Failed to load revenue analysis</div>
          <div className="text-slate-500 text-sm">Please try refreshing the page</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Revenue Analysis</h2>
          <p className="text-sm text-slate-400">Performance by customer segment</p>
        </div>
        <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium border border-green-500/30">
          +8.3% Growth
        </div>
      </div>
      
      <div className="space-y-4">
        {insights.map((item, index) => (
          <div key={index} className="group flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all duration-200 border border-slate-600/30 hover:border-slate-600/50">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full shadow-lg"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-white font-medium group-hover:text-blue-400 transition-colors">{item.name}</span>
              <span className="text-slate-400 text-sm">({item.value}%)</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex-1 bg-slate-600/50 rounded-full h-2 w-20">
                <div 
                  className="h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ 
                    width: `${(item.value / 35) * 100}%`,
                    backgroundColor: item.color 
                  }}
                />
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">${item.revenue}</div>
                <div className="text-xs text-slate-400">avg LTV</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 rounded-lg hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-200 font-medium text-sm border border-blue-500/30">
          View Detailed Analytics
        </button>
      </div>
    </div>
  );
};