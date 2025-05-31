// src/features/dashboard/components/tables/at-risk-customers-table.tsx
import React from 'react';
import { useGetAtRiskCustomers } from '@/features/dashboard/api/dashboard';

const ChurnScoreBar: React.FC<{ score: number }> = ({ score }) => (
  <div className="flex items-center gap-3">
    <div className="flex-1 bg-slate-700/50 rounded-full h-2 overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
        style={{ width: `${score}%` }}
      />
    </div>
    <span className="text-sm font-semibold text-slate-300 min-w-[2rem]">{score}</span>
  </div>
);

export const AtRiskCustomersTable: React.FC = () => {
  const { data: customers, isLoading, error } = useGetAtRiskCustomers();

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-6 bg-slate-700 rounded w-48"></div>
            <div className="h-4 bg-slate-700 rounded w-32"></div>
          </div>
          <div className="h-6 bg-slate-700 rounded w-20"></div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 px-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-4 bg-slate-700 rounded"></div>
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-16 bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !customers) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
        <div className="text-center py-8">
          <div className="text-red-400 mb-2">Failed to load at-risk customers</div>
          <div className="text-slate-500 text-sm">Please try refreshing the page</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">At-Risk Customers</h2>
          <p className="text-sm text-slate-400">Customers requiring immediate attention</p>
        </div>
        <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-medium border border-red-500/30">
          {customers.length} High Risk
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-xs font-medium text-slate-400 uppercase tracking-wider mb-4 px-3">
          <span>Customer</span>
          <span>Days Inactive</span>
          <span>Risk Score</span>
        </div>
        {customers.map((customer, index) => (
          <div key={index} className="group grid grid-cols-3 gap-4 items-center p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all duration-200 border border-slate-600/30 hover:border-slate-600/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-xs">
                {customer.name.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="font-medium text-white group-hover:text-blue-400 transition-colors">{customer.name}</span>
            </div>
            <div className="text-slate-300 text-center font-medium">{customer.daysSince}</div>
            <div className="flex items-center">
              <ChurnScoreBar score={customer.score} />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <button className="w-full px-4 py-2 bg-gradient-to-r from-red-600/20 to-orange-600/20 text-red-400 rounded-lg hover:from-red-600/30 hover:to-orange-600/30 transition-all duration-200 font-medium text-sm border border-red-500/30">
          Send Recovery Campaign to All
        </button>
      </div>
    </div>
  );
};