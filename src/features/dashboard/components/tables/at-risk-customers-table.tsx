// src/features/dashboard/components/tables/at-risk-customers-table.tsx

import { AtRiskCustomer } from '@/types/api';
import React from 'react';


interface AtRiskCustomersTableProps {
  customers: AtRiskCustomer[];
}

const ChurnScoreBar: React.FC<{ score: number }> = ({ score }) => (
  <div className="flex items-center gap-3">
    <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
        style={{ width: `${score}%` }}
      />
    </div>
    <span className="text-sm font-semibold text-slate-300 min-w-[2rem]">{score}</span>
  </div>
);

export const AtRiskCustomersTable: React.FC<AtRiskCustomersTableProps> = ({ customers }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-600/30 shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-6">At-Risk Customers</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">
          <span>Customer</span>
          <span>Days Since Last Payment</span>
          <span>Churn Score</span>
        </div>
        {customers.map((customer, index) => (
          <div key={index} className="grid grid-cols-3 gap-4 items-center p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
            <div className="font-medium text-white">{customer.name}</div>
            <div className="text-slate-300 text-center">{customer.daysSince}</div>
            <div className="flex items-center">
              <ChurnScoreBar score={customer.score} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};