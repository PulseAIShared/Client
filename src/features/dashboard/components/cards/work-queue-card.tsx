import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetDashboardData } from '@/features/dashboard/api/dashboard';
import { useGetInsightsData } from '@/features/insights/api/insights';

type WorkQueueItem = {
  id: string;
  type: 'highRiskCustomer' | 'missedPayment';
  title: string;
  subtitle: string;
  priority: number; // higher = more urgent
  link: string;
  actionLabel: string;
};

export const WorkQueueCard: React.FC = () => {
  const navigate = useNavigate();
  const { data: dashboard, isLoading: isLoadingDashboard } = useGetDashboardData();
  const { data: insights, isLoading: isLoadingInsights } = useGetInsightsData();

  const items: WorkQueueItem[] = useMemo(() => {
    const queue: WorkQueueItem[] = [];

    // High-risk customers from dashboard
    const highRisk = dashboard?.atRiskCustomers?.slice(0, 5) || [];
    for (const c of highRisk) {
      queue.push({
        id: `hr_${c.name}`,
        type: 'highRiskCustomer',
        title: c.name,
        subtitle: `Risk score ${c.score}% · Last activity ${c.daysSince} days ago`,
        priority: Math.max(1, c.score || 0),
        link: '/app/customers',
        actionLabel: 'View customer',
      });
    }

    // Missed payments from insights
    const missed = insights?.recoveryAnalytics?.tables?.missedPayments?.slice(0, 5) || [];
    for (const m of missed) {
      queue.push({
        id: `mp_${m.id}`,
        type: 'missedPayment',
        title: `${m.customer}`,
        subtitle: `Missed $${m.amount.toLocaleString()} · ${m.attempts} attempts · ${m.status}`,
        priority: 60 + (m.attempts || 0),
        link: '/app/recovery',
        actionLabel: 'Open recovery',
      });
    }

    return queue.sort((a, b) => b.priority - a.priority).slice(0, 8);
  }, [dashboard, insights]);

  return (
    <div className="bg-surface-primary/80 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-border-primary/30 shadow-lg h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Work Queue</h3>
          <p className="text-sm text-text-muted">Prioritized actions for today</p>
        </div>
        <Link to="/app/notifications" className="text-sm text-accent-primary hover:underline">View all</Link>
      </div>

      {(isLoadingDashboard || isLoadingInsights) && (
        <div className="space-y-3 flex-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-surface-secondary/40 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!isLoadingDashboard && !isLoadingInsights && items.length === 0 && (
        <div className="text-sm text-text-muted">No urgent items. You're all caught up! 🎉</div>
      )}

      {!isLoadingDashboard && !isLoadingInsights && items.length > 0 && (
        <div className="flex-1 overflow-y-auto pr-1">
          <ul className="divide-y divide-border-primary/30">
            {items.map((item) => (
              <li key={item.id} className="py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium text-text-primary truncate">{item.title}</div>
                  <div className="text-xs text-text-muted truncate">{item.subtitle}</div>
                </div>
                <button
                  onClick={() => navigate(item.link)}
                  className="px-3.5 py-2 bg-accent-primary/15 text-accent-primary rounded-lg text-xs hover:bg-accent-primary/25 whitespace-nowrap"
                >
                  {item.actionLabel}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};


