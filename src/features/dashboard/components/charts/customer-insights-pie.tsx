// src/features/dashboard/components/charts/customer-insights-pie.tsx

import { CustomerInsight } from '@/types/api';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';


interface CustomerInsightsPieProps {
  data: CustomerInsight[];
}

export const CustomerInsightsPie: React.FC<CustomerInsightsPieProps> = ({ data }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-600/30 shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-6">Customer Insights</h2>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="ml-6 space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-300 font-medium">{item.name}</span>
              </div>
              <span className="text-white font-semibold">${item.revenue}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};