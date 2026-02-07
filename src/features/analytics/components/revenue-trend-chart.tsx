import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ImpactTrendInterval, ImpactTrendPoint } from '@/types/api';

type RevenueTrendChartProps = {
  points: ImpactTrendPoint[];
  interval: ImpactTrendInterval;
  hasSufficientData: boolean;
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

const formatDateLabel = (value: string, interval: ImpactTrendInterval): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return interval === 'weekly'
    ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
    : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({
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
        <h3 className="text-base font-semibold text-text-primary">Revenue Recovery Over Time</h3>
        <p className="mt-1 text-sm text-text-muted">
          Not enough activity in this period to render a trend.
        </p>
      </div>
    );
  }

  const chartData = points.map((point) => ({
    label: formatDateLabel(point.bucketStart, interval),
    revenueAtRisk: point.revenueAtRisk,
    revenueRecovered: point.revenueRecovered,
  }));

  return (
    <div className="h-[340px] rounded-2xl border border-border-primary/30 bg-surface-primary/80 p-5 shadow-lg">
      <h3 className="text-base font-semibold text-text-primary">Revenue Recovery Over Time</h3>
      <p className="mt-1 text-sm text-text-muted">
        At-risk vs recovered revenue by {interval === 'weekly' ? 'week' : 'day'}.
      </p>
      <div className="mt-4 h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" opacity={0.25} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="rgb(var(--text-muted))" />
            <YAxis
              tickLine={false}
              axisLine={false}
              stroke="rgb(var(--text-muted))"
              tickFormatter={(value) => formatCurrency(Number(value))}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgb(var(--surface-primary))',
                border: '1px solid rgb(var(--border-primary))',
                borderRadius: 12,
              }}
              formatter={(value: number, name) => [formatCurrency(value), name === 'revenueAtRisk' ? 'At risk' : 'Recovered']}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenueAtRisk"
              name="At risk"
              stroke="rgb(var(--error))"
              fill="rgb(var(--error))"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="revenueRecovered"
              name="Recovered"
              stroke="rgb(var(--success))"
              fill="rgb(var(--success))"
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

