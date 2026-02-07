// src/features/dashboard/components/dashboard-header.tsx
import { useUser } from '@/lib/auth';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { DashboardStats, DashboardWorkQueueSummary } from '@/types/api';
import { AppPageHeader } from '@/components/layouts';

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

  const parseChange = (value?: string) => {
    if (!value) {
      return null;
    }

    const normalized = value.trim();
    if (
      normalized === '—' ||
      normalized === '-' ||
      normalized.toLowerCase() === 'na'
    ) {
      return null;
    }

    const numeric = Number(
      normalized.replace('%', '').replace('+', '').trim(),
    );

    if (!Number.isFinite(numeric)) {
      return null;
    }

    return numeric;
  };

  const TrendBadge = ({
    change,
    prefersLower,
  }: {
    change?: string;
    prefersLower: boolean;
  }) => {
    const numericChange = parseChange(change);

    if (numericChange === null) {
      return (
        <div className="inline-flex items-center gap-1 text-[11px] text-text-muted">
          <Minus className="h-3 w-3" />
          <span>No trend yet</span>
        </div>
      );
    }

    const isPositiveDelta = numericChange > 0;
    const isNegativeDelta = numericChange < 0;
    const isImproving = prefersLower ? isNegativeDelta : isPositiveDelta;

    const trendColorClass = isImproving
      ? 'text-success'
      : isPositiveDelta || isNegativeDelta
        ? 'text-error'
        : 'text-text-muted';

    return (
      <div className={`inline-flex items-center gap-1 text-[11px] ${trendColorClass}`}>
        {isPositiveDelta && <TrendingUp className="h-3 w-3" />}
        {isNegativeDelta && <TrendingDown className="h-3 w-3" />}
        {!isPositiveDelta && !isNegativeDelta && (
          <Minus className="h-3 w-3" />
        )}
        <span>{change} vs prior period</span>
      </div>
    );
  };

  return (
    <AppPageHeader
      title="What should I do today?"
      description={`Welcome back, ${user?.data?.firstName || 'there'}. Here's your operational snapshot.`}
      actions={(
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
            <TrendBadge prefersLower={true} />
          </button>
          <div className="w-px h-10 bg-border-primary/50"></div>
          <div className="text-center sm:text-right">
            <div className="flex items-center gap-1.5 justify-center sm:justify-end">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-xl sm:text-2xl font-bold text-warning">{highRiskCount}</span>
            </div>
            <div className="text-xs text-text-muted">Churn risk</div>
            <TrendBadge
              change={stats?.churnRiskChange}
              prefersLower={true}
            />
          </div>
          <div className="w-px h-10 bg-border-primary/50"></div>
          <div className="text-center sm:text-right">
            <div className="flex items-center gap-1.5 justify-center sm:justify-end">
              <DollarSign className="w-4 h-4 text-success" />
              <span className="text-xl sm:text-2xl font-bold text-success">{recoveredRevenue}</span>
            </div>
            <div className="text-xs text-text-muted">Recovered</div>
            <TrendBadge
              change={
                stats?.recoveredRevenueChange ??
                stats?.revenueSavedChange
              }
              prefersLower={false}
            />
          </div>
        </div>
      )}
    />
  );
};
