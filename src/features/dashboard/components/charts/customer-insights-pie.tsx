// src/features/dashboard/components/charts/customer-insights-pie.tsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useGetCustomerInsights } from '@/features/dashboard/api/dashboard';

export const CustomerInsightsPie: React.FC = () => {
  const { data: customerInsightsData, isLoading, error } = useGetCustomerInsights();

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-6 bg-slate-700 rounded w-48"></div>
            <div className="h-4 bg-slate-700 rounded w-32"></div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="h-48 w-48 bg-slate-700 rounded-full"></div>
          <div className="ml-6 space-y-3 flex-1">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-12 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !customerInsightsData) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
        <div className="text-center py-8">
          <div className="text-red-400 mb-2">Failed to load customer insights</div>
          <div className="text-slate-500 text-sm">Please try refreshing the page</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Customer Demographics</h2>
          <p className="text-sm text-slate-400">Age distribution analysis</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
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
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="ml-6 space-y-3">
          {customerInsightsData.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-300 font-medium">{item.name}</span>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">${item.revenue}</div>
                <div className="text-xs text-slate-400">{item.value}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};