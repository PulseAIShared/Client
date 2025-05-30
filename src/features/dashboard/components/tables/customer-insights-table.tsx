import { CustomerInsight } from '@/types/api';
import React from 'react';

interface CustomerInsightsTableProps {
  insights: CustomerInsight[];
}

export const CustomerInsightsTable: React.FC<CustomerInsightsTableProps> = ({ insights }) => {
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