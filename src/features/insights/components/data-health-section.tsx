import React from 'react';
import { useDataHealthInsights } from '@/features/insights/api/split-insights';
import { InsightsQueryFilters } from '@/types/insights';
import { InsightsEmptyState, InsightsErrorState, InsightsLoadingState } from './insights-state';

const STATUS_CLASSES: Record<string, string> = {
  connected: 'border-success/30 bg-success/10 text-success',
  healthy: 'border-success/30 bg-success/10 text-success',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  syncing: 'border-info/30 bg-info/10 text-info',
  error: 'border-error/30 bg-error/10 text-error',
  disconnected: 'border-border-primary/40 bg-surface-secondary/40 text-text-muted',
};

const formatDateTime = (value: string | null) => {
  if (!value) {
    return 'Not available';
  }

  return new Date(value).toLocaleString();
};

type DataHealthSectionProps = {
  filters?: InsightsQueryFilters;
};

export const DataHealthSection: React.FC<DataHealthSectionProps> = ({ filters }) => {
  const { data, isLoading, error } = useDataHealthInsights(filters);

  if (isLoading) {
    return <InsightsLoadingState cardCount={3} blockHeights={[220, 260, 260]} />;
  }

  if (error || !data) {
    return (
      <InsightsErrorState
        title="Unable to load data health"
        description="There was an error loading integration completeness and field coverage diagnostics."
      />
    );
  }

  const hasAnyData = data.scope.customersInScope > 0 || data.integrations.length > 0;

  if (!hasAnyData) {
    return (
      <InsightsEmptyState
        title="No customers in this scope"
        description="Adjust filters or ingest customer data to evaluate integration completeness and field coverage."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.keyChecks.map((check) => (
          <div key={check.key} className="rounded-2xl border border-border-primary/30 bg-surface-primary/90 p-5 shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-text-primary">{check.label}</h3>
              <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${STATUS_CLASSES[check.status] ?? STATUS_CLASSES.disconnected}`}>
                {check.status}
              </span>
            </div>
            <p className="mt-3 text-sm text-text-secondary">{check.detail}</p>
            <div className="mt-3 text-xs text-text-muted space-y-1">
              <div>Last update: {formatDateTime(check.lastUpdatedAt)}</div>
              {check.dailyEventRate !== null && (
                <div>Events/day (7d): {check.dailyEventRate.toFixed(1)}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border-primary/30 bg-surface-primary/90 p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Integration Completeness</h3>
        {data.integrations.length === 0 ? (
          <InsightsEmptyState
            compact
            title="No integrations configured"
            description="Connect payment, product events, and CRM integrations to unlock full Insights diagnostics."
          />
        ) : (
          <div className="space-y-3">
            {data.integrations.map((integration, index) => (
              <div
                key={`${integration.provider}-${integration.category}-${index}`}
                className="grid grid-cols-1 gap-3 rounded-xl border border-border-primary/25 bg-surface-secondary/25 p-3 md:grid-cols-[minmax(140px,1fr)_120px_120px_1fr]"
              >
                <div>
                  <div className="text-sm font-semibold text-text-primary">{integration.provider}</div>
                  <div className="text-xs text-text-muted uppercase tracking-wide">{integration.category}</div>
                </div>
                <div>
                  <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${STATUS_CLASSES[integration.status] ?? STATUS_CLASSES.disconnected}`}>
                    {integration.status}
                  </span>
                </div>
                <div className="text-xs text-text-muted">
                  <div>Records: {integration.syncedRecordCount.toLocaleString()}</div>
                  <div>Errors (30d): {integration.recentErrorCount.toLocaleString()}</div>
                </div>
                <div className="text-xs text-text-muted">
                  <div>Last sync: {formatDateTime(integration.lastSyncedAt)}</div>
                  <div className="truncate">Last error: {integration.lastError ?? 'None'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border-primary/30 bg-surface-primary/90 p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Coverage Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {data.coverage.map((metric) => (
            <div key={metric.key} className="rounded-xl border border-border-primary/25 bg-surface-secondary/25 p-4">
              <div className="text-xs uppercase tracking-wide text-text-muted">{metric.label}</div>
              <div className="mt-2 text-2xl font-semibold text-text-primary">{metric.coveragePercent.toFixed(1)}%</div>
              <div className="mt-2 text-xs text-text-muted">
                {metric.coveredCustomers.toLocaleString()} covered / {metric.missingCustomers.toLocaleString()} missing
              </div>
              <p className="mt-2 text-xs text-text-muted">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border-primary/30 bg-surface-primary/90 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Top Missing Fields</h3>
          {data.topMissingFields.length === 0 ? (
            <InsightsEmptyState
              compact
              title="No major data gaps"
              description="The current scope has healthy field coverage."
            />
          ) : (
            <div className="space-y-3">
              {data.topMissingFields.map((field) => (
                <div key={field.fieldKey} className="rounded-xl border border-border-primary/25 bg-surface-secondary/25 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-text-primary">{field.fieldLabel}</div>
                    <div className="text-xs font-medium text-error">
                      {field.missingPercent.toFixed(1)}% missing
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-text-muted">
                    {field.missingCustomers.toLocaleString()} customers missing
                  </div>
                  <p className="mt-2 text-xs text-text-secondary">{field.impact}</p>
                  <p className="mt-1 text-xs text-text-muted">Action: {field.suggestedAction}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border-primary/30 bg-surface-primary/90 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Recommendations</h3>
          {data.recommendations.length === 0 ? (
            <InsightsEmptyState
              compact
              title="No recommendations"
              description="Data health recommendations will appear when diagnostics detect coverage or integration gaps."
            />
          ) : (
            <ul className="space-y-2">
              {data.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="text-accent-primary mt-0.5">-</span>
                  {recommendation}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 rounded-xl border border-border-primary/25 bg-surface-secondary/20 p-3 text-xs text-text-muted">
            Scope: {data.scope.customersInScope.toLocaleString()} customers | {new Date(data.scope.fromUtc).toLocaleDateString()} - {new Date(data.scope.toUtc).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};
