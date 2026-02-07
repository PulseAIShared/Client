import { ConfidenceEligibilityDistribution } from '@/types/playbooks';

type ImpactPreviewProps = {
  estimatedEligibleCustomers?: number | null;
  estimatedRunsPerDay?: number | null;
  confidenceDistribution?: ConfidenceEligibilityDistribution | null;
  warnings?: string[];
  explanation?: string | null;
};

const metricValueClass =
  'text-lg font-semibold text-text-primary';

const metricLabelClass =
  'text-xs uppercase tracking-wide text-text-muted';

export const ImpactPreview = ({
  estimatedEligibleCustomers,
  estimatedRunsPerDay,
  confidenceDistribution,
  warnings = [],
  explanation,
}: ImpactPreviewProps) => {
  const hasMetrics =
    estimatedEligibleCustomers !== null &&
    estimatedEligibleCustomers !== undefined;

  return (
    <div className="rounded-2xl border border-border-primary/30 bg-surface-secondary/30 p-5 space-y-4">
      <h3 className="text-sm font-semibold text-text-primary">
        Estimated impact
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border-primary/30 bg-surface-primary/60 px-4 py-3">
          <p className={metricLabelClass}>
            Eligible customers
          </p>
          <p className={metricValueClass}>
            {hasMetrics
              ? estimatedEligibleCustomers
              : 'N/A'}
          </p>
        </div>
        <div className="rounded-xl border border-border-primary/30 bg-surface-primary/60 px-4 py-3">
          <p className={metricLabelClass}>Estimated runs/day</p>
          <p className={metricValueClass}>
            {estimatedRunsPerDay !== null &&
            estimatedRunsPerDay !== undefined
              ? estimatedRunsPerDay
              : 'N/A'}
          </p>
        </div>
      </div>

      {confidenceDistribution && (
        <p className="text-xs text-text-muted">
          Minimal: {confidenceDistribution.minimal}{' '}
          {'\u00B7'} Good: {confidenceDistribution.good}{' '}
          {'\u00B7'} High: {confidenceDistribution.high}{' '}
          {'\u00B7'} Excellent:{' '}
          {confidenceDistribution.excellent}
        </p>
      )}

      {explanation && (
        <p className="text-xs text-text-muted">
          {explanation}
        </p>
      )}

      {warnings.map((warning) => (
        <p key={warning} className="text-xs text-warning">
          {warning}
        </p>
      ))}
    </div>
  );
};

