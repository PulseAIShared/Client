import React from 'react';
import { useGetRecoveryInsights } from '@/features/insights/api/recovery-insights';
import { formatCurrency } from '@/types/api';

export const RecoveryKpis: React.FC = () => {
  const { data, isLoading, error } = useGetRecoveryInsights();

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

  const k = data.kpis;
  const looksEmpty = k.missedPaymentsCount === 0 && k.missedAmount === 0 && k.recoveredAmount === 0;
  if (looksEmpty) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 text-center">
        <div className="text-lg font-semibold text-text-primary mb-2">No recovery data yet</div>
        <div className="text-sm text-text-muted mb-4">Connect your billing provider to track missed and recovered revenue.</div>
        <button className="px-4 py-2 rounded-lg border border-border-primary/30 hover:bg-surface-secondary/50">Connect Billing</button>
      </div>
    );
  }

  const cards = [
    { 
      label: 'Missed Payments', 
      value: k.missedPaymentsCount.toLocaleString(), 
      sub: formatCurrency(k.missedAmount),
      icon: (
        <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: 'from-error/20 to-error/5',
      borderColor: 'border-error/30'
    },
    { 
      label: 'Recovered Revenue', 
      value: formatCurrency(k.recoveredAmount), 
      sub: `${k.recoveryRate}% rate`,
      icon: (
        <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      color: 'from-success/20 to-success/5',
      borderColor: 'border-success/30'
    },
    { 
      label: 'Recovery Rate', 
      value: `${k.recoveryRate}%`, 
      sub: `${k.missedPaymentsCount} cases`,
      icon: (
        <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'from-accent-primary/20 to-accent-secondary/5',
      borderColor: 'border-accent-primary/30'
    },
    { 
      label: 'Avg Days to Recover', 
      value: k.averageDaysToRecover.toFixed(1), 
      sub: 'days',
      icon: (
        <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-warning/20 to-warning/5',
      borderColor: 'border-warning/30'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((c) => (
        <div key={c.label} className={`group relative bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border ${c.borderColor} shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
          {/* Gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${c.color} rounded-2xl opacity-50`} />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-text-secondary">{c.label}</div>
              <div className="p-2 rounded-xl bg-surface-secondary/30 group-hover:bg-surface-secondary/50 transition-colors">
                {c.icon}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-3xl font-bold text-text-primary group-hover:scale-105 transition-transform duration-200">
                {c.value}
              </div>
              <div className="text-sm text-text-muted">
                {c.sub}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};