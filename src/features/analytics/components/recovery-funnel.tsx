import React from 'react';
import { ImpactRecoveryFunnelResponse } from '@/types/api';

type RecoveryFunnelProps = {
  funnel?: ImpactRecoveryFunnelResponse;
  isLoading?: boolean;
};

const formatCurrency = (value: number): string => new Intl.NumberFormat(
  'en-US',
  {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  },
).format(Number.isFinite(value) ? value : 0);

const stageWidth = (value: number, total: number): number => {
  if (total <= 0 || value <= 0) {
    return 0;
  }

  return Math.min(100, Math.max((value / total) * 100, 6));
};

export const RecoveryFunnel: React.FC<RecoveryFunnelProps> = ({
  funnel,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="mt-5 rounded-xl border border-border-primary/30 bg-surface-secondary/30 p-4">
        <div className="h-24 animate-pulse rounded-lg bg-surface-secondary/50" />
      </div>
    );
  }

  if (!funnel || !funnel.hasData || funnel.totalAtRisk <= 0) {
    return (
      <div className="mt-5 rounded-xl border border-border-primary/30 bg-surface-secondary/30 p-4">
        <div className="text-sm font-medium text-text-primary">Recovery funnel</div>
        <p className="mt-1 text-sm text-text-muted">
          No funnel data is available for this period.
        </p>
      </div>
    );
  }

  const totalAtRisk = Math.max(funnel.totalAtRisk, 0);
  const actioned = Math.min(Math.max(funnel.actioned, 0), totalAtRisk);
  const recovered = Math.min(Math.max(funnel.recovered, 0), totalAtRisk);
  const lost = Math.min(Math.max(funnel.lost, 0), totalAtRisk);

  const stages = [
    {
      key: 'at-risk',
      label: 'At risk',
      value: totalAtRisk,
      customers: funnel.atRiskCustomers,
      color: 'bg-error/70',
    },
    {
      key: 'actioned',
      label: 'Actioned',
      value: actioned,
      customers: funnel.actionedCustomers,
      color: 'bg-accent-primary/70',
    },
    {
      key: 'recovered',
      label: 'Recovered',
      value: recovered,
      customers: funnel.recoveredCustomers,
      color: 'bg-success/70',
    },
    {
      key: 'lost',
      label: 'Lost',
      value: lost,
      customers: Math.max(funnel.atRiskCustomers - funnel.recoveredCustomers, 0),
      color: 'bg-text-muted/40',
    },
  ];

  return (
    <div className="mt-5 rounded-xl border border-border-primary/30 bg-surface-secondary/30 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-text-primary">Recovery funnel</div>
        <div className="text-xs text-text-muted">{'At risk -> actioned -> recovered -> lost'}</div>
      </div>
      <div className="space-y-3">
        {stages.map((stage) => (
          <div key={stage.key} className="rounded-lg border border-border-primary/30 bg-surface-primary/70 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-medium text-text-primary">{stage.label}</span>
              <span className="text-text-secondary">
                {formatCurrency(stage.value)} - {stage.customers} customers
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-surface-secondary/70">
              <div
                className={`h-2 rounded-full transition-all ${stage.color}`}
                style={{ width: `${stageWidth(stage.value, totalAtRisk)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


