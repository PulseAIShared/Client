import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ImpactTrendInterval, ImpactTrendPoint } from '@/types/api';

type RecoveryRateChartProps = {
  points: ImpactTrendPoint[];
  interval: ImpactTrendInterval;
  hasSufficientData: boolean;
  isLoading?: boolean;
};

const toPercent = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  if (value >= 0 && value <= 1) {
    return value * 100;
  }

  return value;
};

const formatPercent = (value: number): string => `${toPercent(value).toFixed(1)}%`;

const formatDateLabel = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const RecoveryRateChart: React.FC<RecoveryRateChartProps> = ({
  points,
  interval,
  hasSufficientData,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="h-[340px] rounded-2xl border border-border-primary/30 bg-surface-primary/80 p-5 shadow-lg">
        <div className="h-full animate-pulse rounded-xl bg-surface-secondary/50" />
      </div>
    );
  }

  if (!hasSufficientData || points.length === 0) {
    return (
      <div className="h-[340px] rounded-2xl border border-border-primary/30 bg-surface-primary/80 p-5 shadow-lg">
        <h3 className="text-base font-semibold text-text-primary">Recovery Rate Trend</h3>
        <p className="mt-1 text-sm text-text-muted">
          Recovery rate will appear after playbook recovery activity starts.
        </p>
      </div>
    );
  }

  const chartData = points.map((point) => ({
    label: formatDateLabel(point.bucketStart),
    recoveryRate: toPercent(point.recoveryRate),
  }));

  return (
    <div className="h-[340px] rounded-2xl border border-border-primary/30 bg-surface-primary/80 p-5 shadow-lg">
      <h3 className="text-base font-semibold text-text-primary">Recovery Rate Trend</h3>
      <p className="mt-1 text-sm text-text-muted">
        Recovery rate trajectory by {interval === 'weekly' ? 'week' : 'day'}.
      </p>
      <div className="mt-4 h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" opacity={0.25} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="rgb(var(--text-muted))" />
            <YAxis
              tickLine={false}
              axisLine={false}
              stroke="rgb(var(--text-muted))"
              domain={[0, 100]}
              tickFormatter={(value) => `${Number(value).toFixed(0)}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgb(var(--surface-primary))',
                border: '1px solid rgb(var(--border-primary))',
                borderRadius: 12,
              }}
              formatter={(value: number) => [formatPercent(value), 'Recovery rate']}
            />
            <Line
              type="monotone"
              dataKey="recoveryRate"
              stroke="rgb(var(--accent-primary))"
              strokeWidth={3}
              dot={{ r: 3, fill: 'rgb(var(--accent-primary))' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

