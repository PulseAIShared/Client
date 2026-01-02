// src/features/dashboard/components/dashboard-header.tsx
import { useUser } from '@/lib/auth';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Send, UserPlus } from 'lucide-react';
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
    <div className="bg-surface-primary/80 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-border-primary/30 shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
            Welcome back, {user?.data?.firstName || 'there'}
          </h1>
          <p className="text-text-muted text-sm sm:text-base max-w-xl">
            Your AI-powered insights are ready. Discover patterns, predict churn, and grow your subscription business.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-center sm:text-right">
            <div className="text-xl sm:text-2xl font-bold text-accent-primary">{retention}</div>
            <div className="text-xs text-text-muted">Activation rate</div>
          </div>
          <div className="w-px h-10 bg-border-primary/50"></div>
          <div className="text-center sm:text-right">
            <div className="text-xl sm:text-2xl font-bold text-info-muted">{churn}</div>
            <div className="text-xs text-text-muted">Churn risk</div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border-primary/20">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/app/analytics/run-churn-analysis')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-primary hover:bg-accent-secondary text-white rounded-lg transition-colors font-medium text-sm"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Run Churn Analysis</span>
            <span className="sm:hidden">Analyze</span>
          </button>
          <button
            onClick={() => navigate('/app/campaigns')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-secondary transition-colors font-medium text-sm border border-border-primary/50"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Schedule Campaign</span>
            <span className="sm:hidden">Campaign</span>
          </button>
          <button
            onClick={() => navigate('/app/customers')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-secondary transition-colors font-medium text-sm border border-border-primary/50"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Customers</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
