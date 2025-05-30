// src/features/dashboard/components/cards/stat-card.tsx
import React from 'react';

export interface StatCardProps {
  title: string;
  value: string;
  color?: string;
  bgGradient?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  color = 'text-white', 
  bgGradient = 'from-slate-800/80 to-slate-900/80' 
}) => (
  <div className={`group relative bg-gradient-to-br ${bgGradient} backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg hover:shadow-xl hover:border-slate-600/50 transition-all duration-300`}>
    {/* Subtle glow effect on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    
    <div className="relative">
      <h3 className="text-slate-300 text-sm font-medium mb-3 uppercase tracking-wider">{title}</h3>
      <div className="flex items-end justify-between">
        <p className={`text-3xl font-bold ${color} group-hover:scale-105 transition-transform duration-300`}>
          {value}
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
);