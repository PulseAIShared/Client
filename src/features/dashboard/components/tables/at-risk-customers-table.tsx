// src/features/dashboard/components/tables/at-risk-customers-table.tsx
import React from 'react';
import { AtRiskCustomer } from '@/types/api';

const ChurnScoreBar: React.FC<{ score: number }> = ({ score }) => (
  <div className="flex items-center gap-3">
    <div className="flex-1 bg-surface-primary/50 rounded-full h-2 overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full transition-all duration-500"
        style={{ width: `${score}%` }}
      />
    </div>
    <span className="text-sm font-semibold text-text-secondary min-w-[2rem]">{score}</span>
  </div>
);

interface AtRiskCustomersTableProps {
  data?: AtRiskCustomer[];
  isLoading?: boolean;
  error?: Error | null;
}

export const AtRiskCustomersTable: React.FC<AtRiskCustomersTableProps> = ({ data: customers, isLoading, error }) => {

  if (isLoading) {
    return (
      <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-6 bg-surface-primary rounded w-48"></div>
            <div className="h-4 bg-surface-primary rounded w-32"></div>
          </div>
          <div className="h-6 bg-surface-primary rounded w-20"></div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 px-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-4 bg-surface-primary rounded"></div>
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-16 bg-surface-primary rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !customers) {
    return (
      <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg">
        <div className="text-center py-8">
          <div className="text-error-muted mb-2">Failed to load at-risk customers</div>
          <div className="text-text-muted text-sm">Please try refreshing the page</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-1">At-Risk Customers</h2>
          <p className="text-sm text-text-muted">Customers requiring immediate attention</p>
        </div>
        <div className="bg-error/20 text-error-muted px-3 py-1 rounded-full text-sm font-medium border border-error/30">
          {customers.length} High Risk
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-xs font-medium text-text-muted uppercase tracking-wider mb-4 px-3">
          <span>Customer</span>
          <span>Days Inactive</span>
          <span>Risk Score</span>
        </div>
        {customers.map((customer, index) => (
          <div key={index} className="group grid grid-cols-3 gap-4 items-center p-3 bg-surface-primary/30 rounded-lg hover:bg-surface-primary/50 transition-all duration-200 border border-border-primary/30 hover:border-border-primary/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full flex items-center justify-center text-white font-medium text-xs">
                {customer.name.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="font-medium text-text-primary group-hover:text-accent-primary transition-colors">{customer.name}</span>
            </div>
            <div className="text-text-secondary text-center font-medium">{customer.daysSince}</div>
            <div className="flex items-center">
              <ChurnScoreBar score={customer.score} />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border-primary/50">
        <button className="w-full px-4 py-2 bg-gradient-to-r from-error-bg/20 to-warning-bg/20 text-error-muted rounded-lg hover:from-error-bg/30 hover:to-warning-bg/30 transition-all duration-200 font-medium text-sm border border-error/30">
          Send Recovery Campaign to All
        </button>
      </div>
    </div>
  );
};