import React from 'react';
import { Link } from 'react-router-dom';
import { WorkQueueItem } from '@/types/playbooks';
import { formatCurrency } from '@/utils/format-currency';
import { formatDateTime } from '@/utils/customer-helpers';

type QueueItemDetailProps = {
  item: WorkQueueItem;
};

const formatPercent = (value?: number | null) => {
  if (value == null || Number.isNaN(value)) {
    return '\u2014';
  }
  return `${Math.round(value)}%`;
};

export const QueueItemDetail: React.FC<QueueItemDetailProps> = ({ item }) => {
  const currencyCode = item.currencyCode ?? 'USD';

  return (
    <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/30 p-4 md:p-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted mb-1">Customer Since</p>
          <p className="text-sm font-medium text-text-primary">
            {item.customerSince ? formatDateTime(item.customerSince) : '\u2014'}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted mb-1">MRR</p>
          <p className="text-sm font-medium text-text-primary">
            {formatCurrency(item.customerMonthlyRecurringRevenue, currencyCode)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted mb-1">Plan</p>
          <p className="text-sm font-medium text-text-primary">{item.customerPlanTier ?? '\u2014'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted mb-1">Churn Risk</p>
          <p className="text-sm font-medium text-text-primary">{formatPercent(item.churnRiskScore)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted mb-1">Last Payment</p>
          <p className="text-sm font-medium text-text-primary">
            {item.lastPaymentAt ? formatDateTime(item.lastPaymentAt) : '\u2014'}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted mb-1">Payments (30d)</p>
          <p className="text-sm font-medium text-text-primary">
            {item.successfulPaymentsLast30d ?? 0} success / {item.failedPaymentsLast30d ?? 0} failed
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted mb-1">Last Active</p>
          <p className="text-sm font-medium text-text-primary">
            {item.lastActiveAt ? formatDateTime(item.lastActiveAt) : '\u2014'}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted mb-1">Engagement</p>
          <p className="text-sm font-medium text-text-primary">
            {formatPercent(item.engagementScore)} {item.engagementTrend ? `(${item.engagementTrend})` : ''}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <Link
          to={`/app/customers/${item.customerId}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold text-accent-primary hover:underline"
        >
          View full profile
        </Link>
      </div>
    </div>
  );
};
