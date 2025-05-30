// src/features/segments/components/segment-performance.tsx
import React from 'react';

const performanceMetrics = [
  { 
    title: 'Total Segments', 
    value: '12', 
    change: '+2', 
    changeType: 'positive' as const,
    color: 'text-white',
    bgGradient: 'from-slate-800/80 to-slate-900/80'
  },
  { 
    title: 'Customers Segmented', 
    value: '11.2K', 
    change: '+8.3%', 
    changeType: 'positive' as const,
    color: 'text-cyan-400',
    bgGradient: 'from-cyan-600/20 to-blue-600/20'
  },
  { 
    title: 'Avg Churn Reduction', 
    value: '34%', 
    change: '+12%', 
    changeType: 'positive' as const,
    color: 'text-green-400',
    bgGradient: 'from-green-600/20 to-emerald-600/20'
  },
  { 
    title: 'Revenue Impact', 
    value: '$127K', 
    change: '+23%', 
    changeType: 'positive' as const,
    color: 'text-yellow-400',
    bgGradient: 'from-yellow-600/20 to-orange-600/20'
  }
];

const topPerformingSegments = [
  { name: 'High-Value Enterprise', impact: '+45%', customers: 1240, color: 'bg-purple-500' },
  { name: 'Trial Power Users', impact: '+38%', customers: 890, color: 'bg-blue-500' },
  { name: 'Payment Failed', impact: '+42%', customers: 567, color: 'bg-red-500' },
  { name: 'Feature Champions', impact: '+31%', customers: 1890, color: 'bg-green-500' },
];

export const SegmentPerformance = () => {
  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <div key={index} className={`group relative bg-gradient-to-br ${metric.bgGradient} backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg hover:shadow-xl hover:border-slate-600/50 transition-all duration-300`}>
            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative">
              <h3 className="text-slate-300 text-sm font-medium mb-3 uppercase tracking-wider">{metric.title}</h3>
              <div className="flex items-end justify-between">
                <p className={`text-3xl font-bold ${metric.color} group-hover:scale-105 transition-transform duration-300`}>
                  {metric.value}
                </p>
                {/* Trending indicator */}
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  metric.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d={metric.changeType === 'positive' ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                  </svg>
                  <span>{metric.change}</span>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Performance</span>
                  <span>92%</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full w-[92%] transition-all duration-1000 ease-out"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Performing Segments */}
      <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Top Performing Segments</h2>
            <p className="text-sm text-slate-400">Segments with highest churn reduction rates</p>
          </div>
          <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium border border-green-500/30">
            All Improving
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topPerformingSegments.map((segment, index) => (
            <div key={index} className="group flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all duration-200 border border-slate-600/30 hover:border-slate-600/50">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${segment.color} shadow-lg`} />
                <div>
                  <span className="text-white font-medium group-hover:text-blue-400 transition-colors">{segment.name}</span>
                  <div className="text-slate-400 text-sm">{segment.customers.toLocaleString()} customers</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-semibold text-lg">{segment.impact}</div>
                <div className="text-xs text-slate-400">churn reduction</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 rounded-lg hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-200 font-medium text-sm border border-blue-500/30">
            View Detailed Performance Report
          </button>
        </div>
      </div>
    </div>
  );
};