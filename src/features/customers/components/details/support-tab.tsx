import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line } from 'recharts';
import { useCustomerProfile } from './customer-profile-context';
import { formatDate } from '@/utils/customer-helpers';

const severityTone: Record<string, string> = {
  high: 'bg-error/15 text-error',
  medium: 'bg-warning/15 text-warning',
  low: 'bg-success/15 text-success',
};

export const CustomerSupportTab: React.FC = () => {
  const { support } = useCustomerProfile();

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-surface-secondary/40 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Ticket Volume by Severity</h3>
          {support.ticketVolume.length === 0 ? (
            <div className="p-6 bg-surface-primary/70 border border-border-primary/20 rounded-xl text-sm text-text-muted">
              No ticket volume data yet. Connect your support platform to visualize severity trends.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={support.ticketVolume}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" />
                  <XAxis dataKey="period" stroke="rgb(var(--text-muted))" fontSize={12} />
                  <YAxis stroke="rgb(var(--text-muted))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(var(--surface-primary))',
                      borderRadius: '12px',
                      border: '1px solid rgb(var(--border-primary))',
                      color: 'rgb(var(--text-primary))',
                    }}
                  />
                  <Bar dataKey="high" stackId="tickets" fill="rgb(var(--error))" name="High" />
                  <Bar dataKey="medium" stackId="tickets" fill="rgb(var(--warning))" name="Medium" />
                  <Bar dataKey="low" stackId="tickets" fill="rgb(var(--success))" name="Low" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-surface-secondary/40 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col items-center justify-center gap-4">
          <h3 className="text-lg font-semibold text-text-primary">SLA Success</h3>
          <div className="relative flex items-center justify-center">
            <div className="w-40 h-40 rounded-full bg-surface-primary/90 border border-border-primary/30 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-8 border-success/40 flex items-center justify-center">
                <span className="text-3xl font-bold text-success">
                  {support.slaSuccessRate != null ? `${support.slaSuccessRate.toFixed(0)}%` : 'N/A'}
                </span>
              </div>
            </div>
            <div className="absolute bottom-4 text-xs text-text-secondary/80">Tickets meeting SLA</div>
          </div>
          <p className="text-xs text-text-secondary/70 text-center px-6">
            Monitor SLA adherence by keeping response and resolution times aligned with customer expectations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-surface-primary/90 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Open Tickets</h3>
          {support.openTickets.length === 0 ? (
            <div className="p-6 bg-surface-secondary/40 border border-border-primary/20 rounded-xl text-sm text-text-muted">
              No open tickets right now. Great job keeping the queue clear.
            </div>
          ) : (
            <div className="space-y-3">
              {support.openTickets.map((ticket) => (
                <div key={ticket.id} className="p-4 bg-surface-secondary/40 border border-border-primary/20 rounded-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-text-primary">{ticket.subject}</div>
                      <div className="text-xs text-text-secondary/70">Opened {formatDate(ticket.openedAt)}</div>
                      {ticket.owner && <div className="text-xs text-text-secondary/70 mt-1">Owner: {ticket.owner}</div>}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${severityTone[ticket.severity] ?? 'bg-surface-primary/80 text-text-secondary'}`}>
                      {ticket.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-text-secondary/70">
                    Updated {ticket.lastUpdatedAt ? formatDate(ticket.lastUpdatedAt) : 'Recently'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface-primary/90 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Sentiment Trend</h3>
          {support.sentimentTrend.length === 0 ? (
            <div className="p-6 bg-surface-secondary/40 border border-border-primary/20 rounded-xl text-sm text-text-muted">
              No sentiment data available.
            </div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={support.sentimentTrend}>
                  <XAxis dataKey="date" hide />
                  <YAxis domain={[0, 1]} stroke="rgb(var(--text-muted))" />
                  <Tooltip
                    formatter={(value: number) => [`${(value * 100).toFixed(0)}%`, 'Sentiment']}
                    contentStyle={{
                      backgroundColor: 'rgb(var(--surface-primary))',
                      borderRadius: '12px',
                      border: '1px solid rgb(var(--border-primary))',
                      color: 'rgb(var(--text-primary))',
                    }}
                  />
                  <Line type="monotone" dataKey="score" stroke="rgb(var(--accent-secondary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface-primary/90 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
        <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-4">Escalations Timeline</h3>
        {support.escalations.length === 0 ? (
          <div className="p-6 bg-surface-secondary/40 border border-border-primary/20 rounded-xl text-sm text-text-muted">
            No escalations logged for this customer.
          </div>
        ) : (
          <div className="space-y-4">
            {support.escalations.map((event) => (
              <div key={event.id} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-error/15 text-error flex items-center justify-center text-xs font-semibold uppercase">
                    {event.severity.slice(0, 2)}
                  </div>
                  <div className="flex-1 w-px bg-border-primary/40 grow mt-2"></div>
                </div>
                <div className="p-4 bg-surface-secondary/40 border border-border-primary/20 rounded-xl w-full">
                  <div className="text-sm font-semibold text-text-primary">{event.summary}</div>
                  <div className="text-xs text-text-secondary/70 mt-1">{formatDate(event.date)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
