import { cn } from '@/utils/cn';

type HealthStatus = 'Healthy' | 'Watch' | 'AtRisk' | 'Critical';

type HealthIndicatorProps = {
  healthStatus: string;
  className?: string;
};

const colorByStatus: Record<HealthStatus, string> = {
  Healthy: 'bg-success',
  Watch: 'bg-warning',
  AtRisk: 'bg-orange-500',
  Critical: 'bg-error',
};

export const HealthIndicator = ({
  healthStatus,
  className,
}: HealthIndicatorProps) => {
  const normalized = (healthStatus || 'Healthy') as HealthStatus;

  return (
    <span
      className={cn(
        'inline-flex h-2.5 w-2.5 rounded-full shadow-sm',
        colorByStatus[normalized] ?? colorByStatus.Healthy,
        className,
      )}
      title={`Health: ${normalized}`}
      aria-label={`Health ${normalized}`}
    />
  );
};

