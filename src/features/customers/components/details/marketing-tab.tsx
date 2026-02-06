import React from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useCustomerProfile } from './customer-profile-context';

const formatPercent = (value?: number | null) => {
  if (value == null || Number.isNaN(value)) {
    return 'N/A';
  }
  return `${value.toFixed(1)}%`;
};

export const CustomerMarketingTab: React.FC = () => {
  const { marketing } = useCustomerProfile();

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-surface-secondary/40 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Engagement Attribution</h3>
          {marketing.attribution.length === 0 ? (
            <div className="p-6 bg-surface-primary/70 border border-border-primary/20 rounded-xl text-sm text-text-muted">
              No attribution records found. Connect marketing automation tools to visualize attribution.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-xs uppercase tracking-wide text-text-secondary/70">
                  <tr>
                    <th className="text-left py-3 pr-4">Channel</th>
                    <th className="text-left py-3 pr-4">Influence</th>
                    <th className="text-left py-3">Revenue Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-primary/20">
                  {marketing.attribution.map((entry) => (
                    <tr key={entry.id}>
                      <td className="py-3 pr-4 text-text-primary">{entry.channel}</td>
                      <td className="py-3 pr-4 text-text-secondary">{entry.percent}%</td>
                      <td className="py-3 text-text-secondary">{entry.revenue != null ? `$${entry.revenue.toLocaleString()}` : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-surface-secondary/40 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">Email Engagement</h3>
          <div className="space-y-3">
            <div className="p-4 bg-surface-primary/90 border border-border-primary/20 rounded-xl">
              <div className="text-xs uppercase font-semibold tracking-wide text-text-muted">Open Rate</div>
              <div className="text-2xl font-bold text-text-primary mt-1">
                {formatPercent(marketing.emailStats.openRate)}
              </div>
            </div>
            <div className="p-4 bg-surface-primary/90 border border-border-primary/20 rounded-xl">
              <div className="text-xs uppercase font-semibold tracking-wide text-text-muted">Click Rate</div>
              <div className="text-2xl font-bold text-text-primary mt-1">
                {formatPercent(marketing.emailStats.clickRate)}
              </div>
            </div>
            <div className="p-4 bg-surface-primary/90 border border-border-primary/20 rounded-xl">
              <div className="text-xs uppercase font-semibold tracking-wide text-text-muted">Unsubscribe Risk</div>
              <div className="text-2xl font-bold text-text-primary mt-1">
                {formatPercent(marketing.emailStats.unsubRate)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1 bg-surface-primary/90 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">Lifecycle Stage Funnel</h3>
          {marketing.lifecycleFunnel.length === 0 ? (
            <div className="p-6 bg-surface-secondary/40 border border-border-primary/20 rounded-xl text-sm text-text-muted">
              No lifecycle stages configured.
            </div>
          ) : (
            <div className="space-y-3">
              {marketing.lifecycleFunnel.map((stage) => (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between text-sm text-text-secondary/80">
                    <span>{stage.stage}</span>
                    <span className="font-semibold text-text-primary">{stage.count}</span>
                  </div>
                  <div className="mt-2 h-2 bg-border-primary/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-secondary"
                      style={{ width: `${Math.min(100, (stage.conversion ?? 0) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-surface-primary/90 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Recent Nurture Sequences</h3>
              <p className="text-xs text-text-secondary/80">Monitor nurture journey status and touchpoints.</p>
            </div>
          </div>
          {marketing.nurtureSequences.length === 0 ? (
            <div className="p-6 bg-surface-secondary/40 border border-border-primary/20 rounded-xl text-sm text-text-muted">
              No nurture sequences have been triggered for this customer.
            </div>
          ) : (
            <div className="space-y-3">
              {marketing.nurtureSequences.map((sequence) => (
                <div key={sequence.id} className="p-4 bg-surface-secondary/40 border border-border-primary/20 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-text-primary">{sequence.name}</div>
                    <div className="text-xs text-text-secondary/70">Last touch {sequence.lastSent ?? 'N/A'}</div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold border border-border-primary/30 text-text-secondary">
                    {sequence.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface-primary/90 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
        <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-4">Engagement Performance</h3>
        {marketing.campaigns.length === 0 ? (
          <div className="p-6 bg-surface-secondary/40 border border-border-primary/20 rounded-xl text-sm text-text-muted">
            No engagement activity tracked for this customer.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-text-secondary/70">
                <tr>
                  <th className="text-left py-3 pr-4">Action</th>
                  <th className="text-left py-3 pr-4">Channel</th>
                  <th className="text-left py-3 pr-4">Status</th>
                  <th className="text-left py-3">Revenue Influence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary/20">
                {marketing.campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="py-3 pr-4 text-text-primary">{campaign.name}</td>
                    <td className="py-3 pr-4 text-text-secondary">{campaign.channel ?? 'N/A'}</td>
                    <td className="py-3 pr-4 text-text-secondary">{campaign.status ?? 'Unknown'}</td>
                    <td className="py-3 text-text-secondary">{campaign.influencedRevenue != null ? `$${campaign.influencedRevenue.toLocaleString()}` : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
