// src/features/dashboard/components/tables/customer-insights-table.tsx

import { CustomerInsight } from '@/types/api';
import React from 'react';


interface CustomerInsightsTableProps {
  insights: CustomerInsight[];
}

export const CustomerInsightsTable: React.FC<CustomerInsightsTableProps> = ({ insights }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-600/30 shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-6">Customer Insights</h2>
      <div className="space-y-4">
        {insights.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-white font-medium">{item.name}</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex-1 bg-slate-600 rounded-full h-2 w-20">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(item.value / 35) * 100}%`,
                    backgroundColor: item.color 
                  }}
                />
              </div>
              <span className="text-white font-semibold min-w-[3rem] text-right">${item.revenue}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};