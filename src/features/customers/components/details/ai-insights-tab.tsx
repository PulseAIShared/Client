import React from 'react';
import { Button } from '@/components/ui/button';
import { useCustomerProfile } from './customer-profile-context';
import { useCustomerAiInsightsStore } from '@/features/customers/state/customer-ai-insights-store';

export const CustomerAiInsightsTab: React.FC = () => {
  const { aiInsights, customerId } = useCustomerProfile();
  const aiStatus = useCustomerAiInsightsStore((state) => state.status);
  const setAiStatus = useCustomerAiInsightsStore((state) => state.setStatus);
  const markRecommendation = useCustomerAiInsightsStore((state) => state.markRecommendation);
  const recommendations = useCustomerAiInsightsStore((state) => state.recommendations);

  const handleManualRerun = async () => {
    setAiStatus('refreshing');
    try {
      await refetch();
      setAiStatus('fresh');
    } catch {
      setAiStatus('stale');
    }
  };

  const summarySections = aiInsights.summaryMarkdown
    ? aiInsights.summaryMarkdown.split(/\n\s*\n/)
    : ['No AI summary generated yet.'];

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <div className="bg-surface-secondary/40 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">AI Generated Summary</h3>
            <p className="text-xs text-text-secondary/80">
              Automated insight refreshed the last time churn prediction ran.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                aiStatus === 'stale'
                  ? 'bg-warning/15 text-warning border-warning/40'
                  : aiStatus === 'refreshing'
                  ? 'bg-accent-primary/10 text-accent-primary border-accent-primary/40'
                  : 'bg-success/10 text-success border-success/40'
              }`}
            >
              {aiStatus === 'stale' && 'Signature changed - auto refresh pending'}
              {aiStatus === 'refreshing' && 'Refreshing...'}
              {aiStatus === 'fresh' && 'Fresh insights'}
              {aiStatus === 'idle' && 'Awaiting first run'}
            </span>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {summarySections.map((section, index) => (
            <p key={`${customerId}-summary-${index}`} className="text-sm leading-relaxed text-text-secondary">
              {section.trim()}
            </p>
          ))}
        </div>
        <div className="mt-4 text-xs text-text-secondary/70">
          Last run: {aiInsights.lastRun ?? 'No history recorded'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-surface-primary/90 border border-border-primary/30 rounded-2xl p-6 shadow-lg">
          <div className="text-xs uppercase font-semibold tracking-wide text-text-muted">Baseline Score</div>
          <div className="text-3xl font-bold text-text-primary mt-2">
            {aiInsights.baselineScore != null ? aiInsights.baselineScore.toFixed(1) : 'N/A'}
          </div>
        </div>
        <div className="bg-surface-primary/90 border border-border-primary/30 rounded-2xl p-6 shadow-lg">
          <div className="text-xs uppercase font-semibold tracking-wide text-text-muted">AI Score</div>
          <div className="text-3xl font-bold text-accent-primary mt-2">
            {aiInsights.aiScore != null ? aiInsights.aiScore.toFixed(1) : 'N/A'}
          </div>
        </div>
        <div className="bg-surface-primary/90 border border-border-primary/30 rounded-2xl p-6 shadow-lg">
          <div className="text-xs uppercase font-semibold tracking-wide text-text-muted">AI Level</div>
          <div className="text-3xl font-bold text-text-primary mt-2">{aiInsights.aiLevel ?? 'Unknown'}</div>
        </div>
      </div>

      <div className="bg-surface-primary/90 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Prioritized Recommendations</h3>
        {recommendations.length === 0 ? (
          <div className="p-6 bg-surface-secondary/40 border border-border-primary/20 rounded-xl text-sm text-text-muted">
            No AI recommendations populated yet. Rerun churn analysis after syncing recent activity.
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 p-4 bg-surface-secondary/40 border border-border-primary/20 rounded-xl cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4"
                  checked={Boolean(item.completed)}
                  onChange={(event) => markRecommendation(item.id, event.target.checked)}
                />
                <div>
                  <div className="text-sm font-semibold text-text-primary">{item.label}</div>
                  <div className="text-xs text-text-secondary/70 mt-1">
                    Priority: {item.priority ?? 'unspecified'}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="bg-surface-primary/90 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Scoring Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-surface-secondary/40 border border-border-primary/20 rounded-xl">
            <div className="text-xs uppercase tracking-wide text-text-muted font-semibold">Baseline Signature</div>
            <div className="text-sm text-text-secondary mt-2">{aiInsights.signature ?? 'Not available'}</div>
          </div>
          <div className="p-4 bg-surface-secondary/40 border border-border-primary/20 rounded-xl">
            <div className="text-xs uppercase tracking-wide text-text-muted font-semibold">Delta</div>
            <div className="text-2xl font-bold text-text-primary mt-2">
              {aiInsights.aiScore != null && aiInsights.baselineScore != null
                ? (aiInsights.aiScore - aiInsights.baselineScore).toFixed(1)
                : 'N/A'}
            </div>
          </div>
          <div className="p-4 bg-surface-secondary/40 border border-border-primary/20 rounded-xl">
            <div className="text-xs uppercase tracking-wide text-text-muted font-semibold">Refresh Status</div>
            <div className="text-sm text-text-secondary mt-2">
              {aiStatus === 'stale'
                ? 'Awaiting refresh due to data drift'
                : aiStatus === 'refreshing'
                ? 'In progress'
                : 'Aligned with latest sync'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
