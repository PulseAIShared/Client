// src/features/dashboard/components/dashboard-header.tsx
import { useUser } from '@/lib/auth';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const DashboardHeader = () => {

    const user = useUser();
    const navigate = useNavigate();
  return (
    <div className="relative">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-2xl blur-3xl"></div>
      
      <div className="relative bg-surface-secondary/50 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-border-primary/50 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary mb-2">
              Welcome back, {user?.data?.firstName}
            </h1>
            <p className="text-text-secondary text-sm sm:text-base lg:text-lg">
              AI-powered insights for your subscription business
            </p>
          </div>
          
          {/* Mobile: Quick stats in a responsive grid */}
          <div className="lg:hidden grid grid-cols-2 gap-3 mt-3">
            <div className="bg-surface-primary/30 p-3 rounded-lg border border-border-primary/30 text-center">
              <div className="text-lg sm:text-xl font-bold text-success-muted">+12.5%</div>
              <div className="text-xs text-text-muted">vs last month</div>
            </div>
            <div className="bg-surface-primary/30 p-3 rounded-lg border border-border-primary/30 text-center">
              <div className="text-lg sm:text-xl font-bold text-accent-primary">94.2%</div>
              <div className="text-xs text-text-muted">retention rate</div>
            </div>
          </div>
          
          {/* Desktop: Quick stats in sidebar format */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-success-muted">+12.5%</div>
              <div className="text-sm text-text-muted">vs last month</div>
            </div>
            <div className="w-px h-12 bg-border-primary"></div>
            <div className="text-right">
              <div className="text-2xl font-bold text-accent-primary">94.2%</div>
              <div className="text-sm text-text-muted">retention rate</div>
            </div>
          </div>
        </div>
        
        {/* Quick action buttons - responsive layout */}
        <div className="mt-4 sm:mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <button 
              onClick={() => navigate('/app/analytics/run-churn-analysis')} 
              className="w-full px-4 py-2.5 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="hidden sm:inline">Run Churn Analysis</span>
              <span className="sm:hidden">Analyze</span>
            </button>
            <button className="w-full px-4 py-2.5 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-primary/50 transition-colors font-medium text-sm border border-border-primary/50 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">Export Report</span>
              <span className="sm:hidden">Export</span>
            </button>
            <button className="w-full px-4 py-2.5 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-primary/50 transition-colors font-medium text-sm border border-border-primary/50 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8a1 1 0 011-1h3z" />
              </svg>
              <span className="hidden sm:inline">Schedule Campaign</span>
              <span className="sm:hidden">Schedule</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};