import React from 'react';
import { useGetInsightsData } from '@/features/insights/api/insights';
import { formatCurrency } from '@/types/api';

export const RecoveryKpis: React.FC = () => {
  const { data, isLoading, error } = useGetInsightsData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg animate-pulse h-28" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const k = data.recoveryAnalytics.kpis;
  const cards = [
    { label: 'Missed Payments', value: k.missedPaymentsCount.toLocaleString(), sub: formatCurrency(k.missedAmount) },
    { label: 'Recovered Revenue', value: formatCurrency(k.recoveredAmount), sub: `${k.recoveryRate}% rate` },
    { label: 'Recovery Rate', value: `${k.recoveryRate}%`, sub: `${k.missedPaymentsCount} cases` },
    { label: 'Avg Days to Recover', value: k.averageDaysToRecover.toFixed(1), sub: 'days' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((c) => (
        <div key={c.label} className="bg-surface-primary/80 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-xl">
          <div className="text-sm text-text-muted mb-1">{c.label}</div>
          <div className="text-2xl font-bold text-text-primary">{c.value}</div>
          <div className="text-xs text-text-muted mt-1">{c.sub}</div>
        </div>
      ))}
    </div>
  );
};