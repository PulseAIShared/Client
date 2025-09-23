import React, { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CustomerDetailData } from '@/types/api';

interface CustomerAnalyticsTabProps {
  customer: CustomerDetailData;
  canEditCustomers: boolean;
}

const formatPercent = (value?: number | null) => {
  if (value == null || Number.isNaN(value)) {
    return 'N/A';
  }
  return `${value.toFixed(1)}%`;
};

export const CustomerAnalyticsTab: React.FC<CustomerAnalyticsTabProps> = ({ customer }: CustomerAnalyticsTabProps) => {
  const engagementTrends = customer.analytics?.engagementTrends ?? [];
  const churnRiskTrend = customer.analytics?.churnRiskTrend ?? [];
  const keyMetrics = customer.analytics?.keyMetrics;

  const summaryMetrics = useMemo(() => {
    return [
      {
        id: 'login-frequency',
        label: 'Monthly Login Frequency',
        value: keyMetrics?.loginFrequencyPerMonth != null ? `${keyMetrics.loginFrequencyPerMonth.toFixed(1)}x` : customer.weeklyLoginFrequency != null ? `${customer.weeklyLoginFrequency}x / week` : 'N/A',
      },
      {
        id: 'feature-usage',
        label: 'Feature Usage',
        value: keyMetrics?.featureUsagePercent != null ? formatPercent(keyMetrics.featureUsagePercent) : formatPercent(customer.featureUsagePercentage),
      },
      {
        id: 'support-last-30',
        label: 'Support Tickets (30d)',
        value: keyMetrics?.supportTicketsLast30Days != null ? keyMetrics.supportTicketsLast30Days : customer.supportTicketCount ?? 'N/A',
      },
      {
        id: 'activity-status',
        label: 'Activity Status',
        value: customer.activityStatus ?? (customer.hasRecentActivity ? 'Active' : 'Inactive'),
      },
      {
        id: 'overall-health',
        label: 'Overall Health',
        value: customer.quickMetrics?.overallHealthScore ?? 'N/A',
      },
      {
        id: 'data-freshness',
        label: 'Data Freshness',
        value: customer.dataSources?.quality?.dataFreshnessDisplay ?? customer.quickMetrics?.dataFreshnessStatus ?? 'N/A',
      },
    ];
  }, [customer, keyMetrics]);

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <div className="bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl">
        <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-6 sm:mb-8">6-Month Engagement Trends</h3>
        {engagementTrends.length === 0 ? (
          <div className="p-4 sm:p-6 bg-surface-secondary/40 border border-border-primary/30 rounded-2xl text-text-muted">
            No engagement data yet. Connect engagement and product usage sources to unlock this view.
          </div>
        ) : (
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={engagementTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" />
                <XAxis dataKey="month" stroke="rgb(var(--text-muted))" fontSize={12} />
                <YAxis stroke="rgb(var(--text-muted))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(var(--surface-primary))',
                    border: '1px solid rgb(var(--border-primary))',
                    borderRadius: '12px',
                    color: 'rgb(var(--text-primary))',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stroke="rgb(var(--accent-primary))"
                  fill="rgb(var(--accent-primary))"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl">
        <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-6 sm:mb-8">Churn Risk Trend</h3>
        {churnRiskTrend.length === 0 ? (
          <div className="p-4 sm:p-6 bg-surface-secondary/40 border border-border-primary/30 rounded-2xl text-text-muted">
            No churn risk trend available yet. Run additional churn analyses to populate historical predictions.
          </div>
        ) : (
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={churnRiskTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" />
                <XAxis dataKey="month" stroke="rgb(var(--text-muted))" fontSize={12} />
                <YAxis stroke="rgb(var(--text-muted))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(var(--surface-primary))',
                    border: '1px solid rgb(var(--border-primary))',
                    borderRadius: '12px',
                    color: 'rgb(var(--text-primary))',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="riskScore"
                  stroke="rgb(var(--error))"
                  strokeWidth={3}
                  dot={{ fill: 'rgb(var(--error))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'rgb(var(--error))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl">
        <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-6">Key Engagement Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {summaryMetrics.map((metric) => (
            <div key={metric.id} className="p-4 sm:p-6 bg-surface-secondary/40 border border-border-primary/30 rounded-2xl shadow-lg">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">{metric.label}</span>
              <div className="text-2xl sm:text-3xl font-bold text-text-primary mt-3">{metric.value ?? 'N/A'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


