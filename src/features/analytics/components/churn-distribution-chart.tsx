import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ImpactChurnDistributionBucket } from '@/types/api';

type ChurnDistributionChartProps = {
  buckets: ImpactChurnDistributionBucket[];
  isLoading?: boolean;
};

export const ChurnDistributionChart: React.FC<ChurnDistributionChartProps> = ({
  buckets,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="h-[320px] rounded-2xl border border-border-primary/30 bg-surface-primary/80 p-5 shadow-lg">
        <div className="h-full animate-pulse rounded-xl bg-surface-secondary/50" />
      </div>
    );
  }

  const totalCustomers = buckets.reduce(
    (sum, bucket) => sum + bucket.customerCount,
    0,
  );

  if (!buckets.length || totalCustomers === 0) {
    return (
      <div className="h-[320px] rounded-2xl border border-border-primary/30 bg-surface-primary/80 p-5 shadow-lg">
        <h3 className="text-base font-semibold text-text-primary">Churn Risk Distribution</h3>
        <p className="mt-1 text-sm text-text-muted">
          No customers in scope for this distribution.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[320px] rounded-2xl border border-border-primary/30 bg-surface-primary/80 p-5 shadow-lg">
      <h3 className="text-base font-semibold text-text-primary">Churn Risk Distribution</h3>
      <p className="mt-1 text-sm text-text-muted">
        Customer counts by churn-risk bucket for the selected scope.
      </p>
      <div className="mt-4 h-[230px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={buckets} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" opacity={0.25} />
            <XAxis dataKey="bucket" tickLine={false} axisLine={false} stroke="rgb(var(--text-muted))" />
            <YAxis tickLine={false} axisLine={false} stroke="rgb(var(--text-muted))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgb(var(--surface-primary))',
                border: '1px solid rgb(var(--border-primary))',
                borderRadius: 12,
              }}
              formatter={(value: number) => [value, 'Customers']}
            />
            <Bar dataKey="customerCount" name="Customers" radius={[8, 8, 0, 0]} fill="rgb(var(--accent-primary))" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

