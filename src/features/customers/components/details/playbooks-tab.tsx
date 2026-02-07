import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomerDetailQuery } from '@/features/customers/api/customers';
import { useCustomerProfile } from './customer-profile-context';
import { Spinner } from '@/components/ui/spinner';
import { ConfidenceBadge } from '@/features/playbooks/components';
import {
  enumLabelMap,
  formatEnumLabel,
  getConfidenceLevelDetail,
} from '@/features/playbooks/utils';
import { formatDateTime } from '@/utils/customer-helpers';
import { getWhyDidntTrigger } from '@/features/playbooks/api/playbooks';
import type { PlaybookRun, TriggerExplanation } from '@/types/playbooks';

const mapRun = (raw: any): PlaybookRun => ({
  id: raw.id ?? raw.Id,
  playbookId: raw.playbookId ?? raw.PlaybookId,
  customerId: raw.customerId ?? raw.CustomerId,
  customerName: raw.customerName ?? raw.CustomerName,
  lifecycleStatus: raw.lifecycleStatus ?? raw.LifecycleStatus,
  outcome: raw.outcome ?? raw.Outcome,
  confidence: raw.confidence ?? raw.Confidence,
  potentialValue: raw.potentialValue ?? raw.PotentialValue,
  reasonShort: raw.reasonShort ?? raw.ReasonShort ?? '',
  decisionSummaryJson: raw.decisionSummaryJson ?? raw.DecisionSummaryJson ?? '{}',
  createdAt: raw.createdAt ?? raw.CreatedAt,
  approvedAt: raw.approvedAt ?? raw.ApprovedAt,
  completedAt: raw.completedAt ?? raw.CompletedAt,
  snoozedUntil: raw.snoozedUntil ?? raw.SnoozedUntil,
});

const lifecycleLabel: Record<number | string, string> = {
  0: 'Pending',
  1: 'Pending Approval',
  2: 'Executing',
  3: 'Terminal',
  Pending: 'Pending',
  PendingApproval: 'Pending Approval',
  Executing: 'Executing',
  Terminal: 'Terminal',
};

const outcomeLabel: Record<number | string, string> = {
  0: 'Succeeded',
  1: 'Partial Success',
  2: 'Failed',
  3: 'Inconclusive',
  4: 'Cancelled',
  5: 'Rejected',
  Succeeded: 'Succeeded',
  PartialSuccess: 'Partial Success',
  Failed: 'Failed',
  Inconclusive: 'Inconclusive',
  Cancelled: 'Cancelled',
  Rejected: 'Rejected',
};

const outcomeTone: Record<string, string> = {
  Succeeded: 'bg-success/10 text-success border-success/30',
  'Partial Success': 'bg-warning/10 text-warning border-warning/30',
  Failed: 'bg-error/10 text-error border-error/30',
  Inconclusive: 'bg-surface-secondary/60 text-text-secondary border-border-primary/30',
  Cancelled: 'bg-surface-secondary/60 text-text-muted border-border-primary/30',
  Rejected: 'bg-error/10 text-error border-error/30',
};

const describeConfidence = (
  confidence: number | string | null | undefined,
) => {
  const label = formatEnumLabel(
    confidence,
    enumLabelMap.confidence,
  );
  const detail = getConfidenceLevelDetail(confidence);
  return detail
    ? `${label} (${detail.threshold})`
    : label;
};

const useCustomerPlaybookRuns = (customerId?: string) => {
  const sections = React.useMemo(() => ({ playbooks: { summary: true, runs: { page: 1, pageSize: 50 } } }), []);
  const query = useCustomerDetailQuery(customerId ?? '', sections, { enabled: !!customerId });
  const runs = React.useMemo(() => {
    const items = query.data?.playbooks?.runs?.items ?? [];
    return items.map((raw: any) => ({
      id: raw.runId ?? raw.RunId,
      playbookId: raw.playbookId ?? raw.PlaybookId,
      customerId: customerId!,
      customerName: '',
      lifecycleStatus: raw.status ?? raw.Status,
      outcome: raw.outcome ?? raw.Outcome,
      confidence: raw.confidence ?? raw.Confidence,
      potentialValue: raw.potentialValue ?? raw.PotentialValue,
      reasonShort: raw.reasonShort ?? raw.ReasonShort ?? '',
      decisionSummaryJson: '{}',
      createdAt: raw.startedAt ?? raw.StartedAt,
      approvedAt: null,
      completedAt: raw.completedAt ?? raw.CompletedAt,
      snoozedUntil: null,
    })) as PlaybookRun[];
  }, [query.data, customerId]);
  return { data: runs, isLoading: query.isLoading, error: query.error as any };
};

const DecisionSummary: React.FC<{ json: string }> = ({ json }) => {
  try {
    const summary = JSON.parse(json);
    if (!summary || typeof summary !== 'object') return null;

    return (
      <div className="mt-3 p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/20 text-sm space-y-2">
        {summary.reason && (
          <div><span className="font-medium text-text-primary">Reason:</span> <span className="text-text-secondary">{summary.reason}</span></div>
        )}
        {summary.signals && Array.isArray(summary.signals) && summary.signals.length > 0 && (
          <div>
            <span className="font-medium text-text-primary">Signals:</span>
            <ul className="list-disc list-inside ml-2 text-text-secondary">
              {summary.signals.map((s: string, i: number) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}
        {summary.actions && Array.isArray(summary.actions) && summary.actions.length > 0 && (
          <div>
            <span className="font-medium text-text-primary">Actions:</span>
            <ul className="list-disc list-inside ml-2 text-text-secondary">
              {summary.actions.map((a: any, i: number) => (
                <li key={i}>{typeof a === 'string' ? a : a.type ?? a.action ?? JSON.stringify(a)}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  } catch {
    return null;
  }
};

const WhyDidntTriggerPanel: React.FC<{ customerId: string }> = ({ customerId }) => {
  const [playbookId, setPlaybookId] = useState('');
  const [result, setResult] = useState<TriggerExplanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!playbookId.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await getWhyDidntTrigger(playbookId.trim(), customerId);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch debug info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-primary/90 border border-border-primary/30 rounded-2xl p-6 space-y-4">
      <h4 className="text-base font-semibold text-text-primary">Why didn't it trigger?</h4>
      <p className="text-sm text-text-muted">Enter a playbook ID to diagnose why it hasn't triggered for this customer.</p>

      <div className="flex gap-3">
        <input
          value={playbookId}
          onChange={(e) => setPlaybookId(e.target.value)}
          placeholder="Playbook ID"
          className="flex-1 px-4 py-2.5 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all text-sm"
        />
        <button
          onClick={handleCheck}
          disabled={loading || !playbookId.trim()}
          className="px-4 py-2.5 bg-accent-primary text-white rounded-xl text-sm font-medium hover:bg-accent-secondary transition-colors disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check'}
        </button>
      </div>

      {error && <div className="text-sm text-error">{error}</div>}

      {result && (
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-text-primary">Verdict:</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
              result.verdict === 'WouldTrigger' ? 'bg-success/10 text-success border-success/30' : 'bg-warning/10 text-warning border-warning/30'
            }`}>
              {result.verdict}
            </span>
          </div>

          {result.signalChecks.length > 0 && (
            <div>
              <span className="font-medium text-text-primary">Signal Checks:</span>
              <ul className="mt-1 space-y-1">
                {result.signalChecks.map((check, i) => (
                  <li key={i} className="flex items-center gap-2 text-text-secondary">
                    <span className={check.isPresent && check.conditionsMatched ? 'text-success' : 'text-error'}>
                      {check.isPresent && check.conditionsMatched ? 'PASS' : 'FAIL'}
                    </span>
                    <span>{check.signalType}</span>
                    {check.details && <span className="text-text-muted">- {check.details}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="font-medium text-text-primary">Confidence:</span>
            <span className={result.confidenceCheck.passed ? 'text-success' : 'text-error'}>
              {result.confidenceCheck.passed ? 'PASS' : 'FAIL'}
            </span>
            <span className="text-text-muted">
              (required: {describeConfidence(result.confidenceCheck.required)}, actual: {describeConfidence(result.confidenceCheck.actual)})
            </span>
          </div>
          <div className="text-xs text-text-muted">
            Confidence reflects connected active data sources, not prediction certainty.
          </div>

          {result.suppressionCheck.isSuppressed && (
            <div className="p-3 bg-warning/5 rounded-lg border border-warning/20">
              <span className="font-medium text-warning">Suppressed: </span>
              <span className="text-text-secondary">{result.suppressionCheck.reason ?? 'Unknown reason'}</span>
              {result.suppressionCheck.details && (
                <div className="text-text-muted mt-1">{result.suppressionCheck.details}</div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="font-medium text-text-primary">Segment Match:</span>
            <span className={result.segmentCheck.isMatch ? 'text-success' : 'text-error'}>
              {result.segmentCheck.isMatch ? 'MATCH' : 'NO MATCH'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export const CustomerPlaybooksTab: React.FC = () => {
  const { customerId } = useCustomerProfile();
  const { data: runs, isLoading, error } = useCustomerPlaybookRuns(customerId) as { data: PlaybookRun[] | undefined; isLoading: boolean; error: Error | null };
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Run History */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Playbook Run History</h3>

        {error && (
          <div className="text-sm text-error mb-4">Failed to load playbook runs for this customer.</div>
        )}

        {!error && (!runs || runs.length === 0) && (
          <div className="bg-surface-secondary/40 border border-border-primary/30 rounded-2xl p-8 text-center">
            <p className="text-text-primary font-semibold mb-2">No playbook runs</p>
            <p className="text-text-muted text-sm">No playbooks have been triggered for this customer yet.</p>
          </div>
        )}

        {runs && runs.length > 0 && (
          <div className="space-y-3">
            {runs.map((run) => {
              const status = lifecycleLabel[run.lifecycleStatus] ?? String(run.lifecycleStatus);
              const outcome = run.outcome != null ? (outcomeLabel[run.outcome] ?? String(run.outcome)) : null;
              const isExpanded = expandedRunId === run.id;

              return (
                <div
                  key={run.id}
                  className="bg-surface-primary/90 border border-border-primary/30 rounded-2xl p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-text-primary">{run.reasonShort || 'Playbook run'}</span>
                        <ConfidenceBadge confidence={run.confidence} />
                      </div>
                      <div className="text-sm text-text-muted mt-1">
                        Created {formatDateTime(run.createdAt)}
                        {run.approvedAt && ` · Approved ${formatDateTime(run.approvedAt)}`}
                        {run.completedAt && ` · Completed ${formatDateTime(run.completedAt)}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-surface-secondary/60 text-text-primary border-border-primary/30">
                        {status}
                      </span>
                      {outcome && (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${outcomeTone[outcome] ?? 'bg-surface-secondary/60 text-text-secondary border-border-primary/30'}`}>
                          {outcome}
                        </span>
                      )}
                      {run.potentialValue != null && (
                        <span className="text-sm text-text-muted">${run.potentialValue.toLocaleString()}</span>
                      )}
                      <button
                        onClick={() => setExpandedRunId(isExpanded ? null : run.id)}
                        className="text-xs text-accent-primary hover:underline font-medium"
                      >
                        {isExpanded ? 'Hide details' : 'Details'}
                      </button>
                      <Link
                        to={`/app/playbooks/${run.playbookId}`}
                        className="text-xs text-accent-primary hover:underline font-medium"
                      >
                        Playbook
                      </Link>
                    </div>
                  </div>

                  {isExpanded && <DecisionSummary json={run.decisionSummaryJson} />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Why Didn't It Trigger */}
      {customerId && <WhyDidntTriggerPanel customerId={customerId} />}
    </div>
  );
};
