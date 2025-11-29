// src/features/dashboard/components/dashboard-header.tsx
import { useUser } from '@/lib/auth';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardStats } from '@/types/api';

type Props = {
  stats?: DashboardStats;
};

export const DashboardHeader: React.FC<Props> = ({ stats }) => {
  const user = useUser();
  const navigate = useNavigate();

  const retention = stats?.activationRate ?? '0%';
  const churn = stats?.churnRisk ?? '0%';

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 via-accent-secondary/5 to-accent-primary/5 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
      
      <div className="relative bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
          <div className="flex-1 space-y-3">

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary mb-2">
              Welcome back, {user?.data?.firstName || 'there'}! 
            </h1>
            <p className="text-text-secondary text-base sm:text-lg lg:text-xl max-w-2xl">
              Your AI-powered insights are ready. Discover patterns, predict churn, and grow your subscription business.
            </p>
          </div>
          
          {/* Quick Stats from live data */}
          <div className="lg:hidden grid grid-cols-2 gap-4">
            <div className="bg-surface-secondary/60 p-4 rounded-xl border border-border-primary/30 text-center">
              <div className="text-xl sm:text-2xl font-bold text-accent-primary">{retention}</div>
              <div className="text-xs text-text-muted">Activation rate</div>
            </div>
            <div className="bg-surface-secondary/60 p-4 rounded-xl border border-border-primary/30 text-center">
              <div className="text-xl sm:text-2xl font-bold text-info-muted">{churn}</div>
              <div className="text-xs text-text-muted">Churn risk</div>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-6">
            <div className="text-right">
              <div className="text-3xl font-bold text-accent-primary">{retention}</div>
              <div className="text-sm text-text-muted">Activation rate</div>
            </div>
            <div className="w-px h-12 bg-border-primary/50"></div>
            <div className="text-right">
              <div className="text-3xl font-bold text-info-muted">{churn}</div>
              <div className="text-sm text-text-muted">Churn risk</div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 sm:mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <button 
              onClick={() => navigate('/app/analytics/run-churn-analysis')} 
              className="group relative w-full px-4 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent-secondary to-accent-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <svg className="relative w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="relative hidden sm:inline">Run Churn Analysis</span>
              <span className="relative sm:hidden">Analyze</span>
            </button>
            <button 
              onClick={() => navigate('/app/campaigns')}
              className="group w-full px-4 py-3 bg-surface-secondary/50 text-text-primary rounded-xl hover:bg-surface-primary/50 transition-all duration-200 font-medium text-sm border border-border-primary/50 flex items-center justify-center gap-2 hover:shadow-md hover:border-border-secondary"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8a1 1 0 011-1h3z" />
              </svg>
              <span className="hidden sm:inline">Schedule Campaign</span>
              <span className="sm:hidden">Schedule</span>
            </button>
            <button 
              onClick={() => navigate('/app/customers')}
              className="group w-full px-4 py-3 bg-surface-secondary/50 text-text-primary rounded-xl hover:bg-surface-primary/50 transition-all duration-200 font-medium text-sm border border-border-primary/50 flex items-center justify-center gap-2 hover:shadow-md hover:border-border-secondary"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Add Customers</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
