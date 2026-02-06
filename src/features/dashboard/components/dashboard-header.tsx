// src/features/dashboard/components/dashboard-header.tsx
import { useUser } from '@/lib/auth';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, AlertTriangle, DollarSign } from 'lucide-react';
import { DashboardStats, DashboardWorkQueueSummary } from '@/types/api';

type Props = {
  stats?: DashboardStats;
  workQueueSummary?: DashboardWorkQueueSummary;
};

export const DashboardHeader: React.FC<Props> = ({ stats, workQueueSummary }) => {
  const user = useUser();
  const navigate = useNavigate();

  const pendingApprovals = workQueueSummary?.pendingApprovals ?? 0;
  const highRiskCount = stats?.churnRisk ?? '0%';
  const recoveredRevenue = stats?.recoveredRevenue ?? '$0';

  return (
    <div className="bg-surface-primary/80 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-border-primary/30 shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
            What should I do today?
          </h1>
          <p className="text-text-muted text-sm sm:text-base max-w-xl">
            Welcome back, {user?.data?.firstName || 'there'}. Here's your operational snapshot.
          </p>
        </div>

        {/* Action-first Quick Stats */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => navigate('/app/work-queue')}
            className="text-center sm:text-right group cursor-pointer"
          >
            <div className="flex items-center gap-1.5 justify-center sm:justify-end">
              <ClipboardCheck className="w-4 h-4 text-accent-primary" />
              <span className="text-xl sm:text-2xl font-bold text-accent-primary group-hover:text-accent-secondary transition-colors">
                {pendingApprovals}
              </span>
            </div>
            <div className="text-xs text-text-muted">Pending approvals</div>
          </button>
          <div className="w-px h-10 bg-border-primary/50"></div>
          <div className="text-center sm:text-right">
            <div className="flex items-center gap-1.5 justify-center sm:justify-end">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-xl sm:text-2xl font-bold text-warning">{highRiskCount}</span>
            </div>
            <div className="text-xs text-text-muted">Churn risk</div>
          </div>
          <div className="w-px h-10 bg-border-primary/50"></div>
          <div className="text-center sm:text-right">
            <div className="flex items-center gap-1.5 justify-center sm:justify-end">
              <DollarSign className="w-4 h-4 text-success" />
              <span className="text-xl sm:text-2xl font-bold text-success">{recoveredRevenue}</span>
            </div>
            <div className="text-xs text-text-muted">Recovered</div>
          </div>
        </div>
      </div>
    </div>
  );
};
