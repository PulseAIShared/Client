import React, { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ContentLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import {
  useActivatePlaybook,
  useDeletePlaybook,
  useGetPlaybook,
  usePausePlaybook,
} from '@/features/playbooks/api/playbooks';
import {
  PlaybookCategoryBadge,
  PlaybookStatusBadge,
} from '@/features/playbooks/components';
import { enumLabelMap, formatEnumLabel } from '@/features/playbooks/utils';
import { formatDateTime } from '@/utils/customer-helpers';
import { ActionType, PlaybookAction, TriggerType } from '@/types/playbooks';

type TriggerConditions = {
  signalType?: string;
  minAmount?: number;
  minMrr?: number;
  minDaysOverdue?: number;
  minDaysInactive?: number;
  requiresSources?: string[];
};

const signalLabels: Record<string, string> = {
  payment_failure: 'Payment failed',
  inactivity_7d: 'Inactive for 7 days',
  deal_lost: 'Deal lost',
};

const parseJson = <T,>(value?: string): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export const PlaybookDetailRoute = () => {
  const { playbookId } = useParams<{ playbookId: string }>();
  const navigate = useNavigate();

  const { data: playbook, isLoading, error } = useGetPlaybook(playbookId);
  const activateMutation = useActivatePlaybook();
  const pauseMutation = usePausePlaybook();
  const deleteMutation = useDeletePlaybook();

  const triggerConditions = useMemo(() => {
    if (!playbook?.triggerConditionsJson) return null;
    return parseJson<TriggerConditions>(playbook.triggerConditionsJson);
  }, [playbook?.triggerConditionsJson]);

  const triggerSummary = useMemo(() => {
    if (!triggerConditions) {
      return playbook?.triggerConditionsJson
        ? [{ label: 'Conditions', value: 'Custom configuration' }]
        : [];
    }
    const entries: Array<{ label: string; value: string }> = [];
    const signalLabel = triggerConditions.signalType
      ? signalLabels[triggerConditions.signalType] ?? triggerConditions.signalType
      : 'Any signal';
    entries.push({ label: 'Signal', value: signalLabel });

    if (triggerConditions.minAmount !== undefined) {
      const label = triggerConditions.signalType === 'deal_lost'
        ? 'Minimum deal amount'
        : 'Minimum failed amount';
      entries.push({ label, value: `$${triggerConditions.minAmount}` });
    }
    if (triggerConditions.minMrr !== undefined) {
      entries.push({ label: 'Minimum MRR', value: `$${triggerConditions.minMrr}` });
    }
    if (triggerConditions.minDaysInactive !== undefined) {
      entries.push({ label: 'Days inactive', value: `${triggerConditions.minDaysInactive}` });
    }
    if (triggerConditions.minDaysOverdue !== undefined) {
      entries.push({ label: 'Days overdue', value: `${triggerConditions.minDaysOverdue}` });
    }
    if (triggerConditions.requiresSources && triggerConditions.requiresSources.length > 0) {
      entries.push({
        label: 'Required sources',
        value: triggerConditions.requiresSources.map((source) => source.toUpperCase()).join(', '),
      });
    }

    return entries;
  }, [playbook?.triggerConditionsJson, triggerConditions]);

  const handleStatusToggle = () => {
    if (!playbook) return;
    if (formatEnumLabel(playbook.status, enumLabelMap.status) === 'Active') {
      pauseMutation.mutate(playbook.id);
    } else {
      activateMutation.mutate(playbook.id);
    }
  };

  const handleDelete = () => {
    if (!playbook) return;
    const confirmed = window.confirm('Archive this playbook?');
    if (!confirmed) return;
    deleteMutation.mutate(playbook.id, {
      onSuccess: () => navigate('/app/playbooks'),
    });
  };

  if (!playbookId) {
    return (
      <ContentLayout>
        <div className="text-text-muted">Playbook not found.</div>
      </ContentLayout>
    );
  }

  if (isLoading) {
    return (
      <ContentLayout>
        <div className="text-text-muted">Loading playbook...</div>
      </ContentLayout>
    );
  }

  if (error || !playbook) {
    return (
      <ContentLayout>
        <div className="text-error">Failed to load playbook details.</div>
      </ContentLayout>
    );
  }

  const statusLabel = formatEnumLabel(playbook.status, enumLabelMap.status);
  const isBusy = activateMutation.isPending || pauseMutation.isPending || deleteMutation.isPending;

  const renderActionDetails = (action: PlaybookAction) => {
    const config = parseJson<Record<string, unknown>>(action.configJson) ?? {};
    const actionTypeValue = typeof action.actionType === 'number' ? action.actionType : null;
    const actionTypeString = typeof action.actionType === 'string' ? action.actionType.toLowerCase() : '';
    const isStripe = actionTypeValue === ActionType.StripeRetry || actionTypeString.includes('stripe');
    const isSlack = actionTypeValue === ActionType.SlackAlert || actionTypeString.includes('slack');
    const isCrm = actionTypeValue === ActionType.CrmTask || actionTypeString.includes('crm');

    if (isStripe) {
      return <p className="text-sm text-text-muted">Retries the most recent failed payment in Stripe.</p>;
    }

    if (isSlack) {
      const channel = typeof config.channel === 'string' ? config.channel : null;
      const webhook = typeof config.webhookUrl === 'string' ? config.webhookUrl : null;
      const template = typeof config.messageTemplate === 'string' ? config.messageTemplate : null;
      return (
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Channel</span>
            <span className="text-text-primary font-medium">{channel || 'Default'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-muted">Webhook</span>
            <span className="text-text-primary font-medium">{webhook ? 'Connected' : 'Not set'}</span>
          </div>
          {template && (
            <div className="mt-2 text-text-muted">
              Message: <span className="text-text-primary">{template}</span>
            </div>
          )}
        </div>
      );
    }

    if (isCrm) {
      const subject = typeof config.subject === 'string' ? config.subject : '';
      const body = typeof config.body === 'string' ? config.body : '';
      return (
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-text-muted">Subject:</span>{' '}
            <span className="text-text-primary font-medium">{subject || 'Follow up on churn risk'}</span>
          </div>
          {body && (
            <div className="text-text-muted">
              Notes: <span className="text-text-primary">{body}</span>
            </div>
          )}
        </div>
      );
    }

    return (
      <pre className="text-xs text-text-primary whitespace-pre-wrap">
        {action.configJson || '{}'}
      </pre>
    );
  };

  return (
    <ContentLayout>
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">{playbook.name}</h1>
            <p className="text-text-muted">{playbook.description || 'Playbook details and actions.'}</p>
          </div>
          <div className="flex items-center gap-2">
            <PlaybookCategoryBadge category={playbook.category} />
            <PlaybookStatusBadge status={playbook.status} />
          </div>
        </div>

        <div className="bg-surface-primary/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
              <span>Priority {playbook.priority}</span>
              <span>·</span>
              <span>{playbook.activeRunCount} active runs</span>
              <span>·</span>
              <span>{playbook.totalRunCount} total runs</span>
              <span>·</span>
              <span>Created {formatDateTime(playbook.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleStatusToggle}
                disabled={isBusy}
              >
                {statusLabel === 'Active' ? 'Pause' : 'Activate'}
              </Button>
              <Button size="sm" variant="destructive" onClick={handleDelete} disabled={isBusy}>
                Archive
              </Button>
              <Link to={`/app/playbooks/${playbook.id}/runs`}>
                <Button size="sm" variant="outline">
                  View runs
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">Trigger</h2>
              <div className="rounded-xl border border-border-primary/30 p-4 bg-surface-secondary/40">
                <div className="text-sm text-text-muted mb-2">Trigger type</div>
                <div className="text-text-primary font-medium">
                  {formatEnumLabel(playbook.triggerType, enumLabelMap.triggerType)}
                </div>
                {Number(playbook.triggerType) !== TriggerType.Signal &&
                  formatEnumLabel(playbook.triggerType, enumLabelMap.triggerType) !== 'Signal' && (
                    <p className="text-xs text-warning mt-2">
                      This trigger type is not yet automated. Only Signal triggers run automatically.
                    </p>
                  )}
                <div className="mt-4 text-sm text-text-muted mb-2">Conditions</div>
                {triggerSummary.length === 0 && (
                  <div className="text-sm text-text-muted">No trigger conditions set.</div>
                )}
                {triggerSummary.length > 0 && (
                  <div className="space-y-2">
                    {triggerSummary.map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">{item.label}</span>
                        <span className="text-text-primary font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">Execution</h2>
              <div className="rounded-xl border border-border-primary/30 p-4 bg-surface-secondary/40 space-y-3">
                <div>
                  <div className="text-sm text-text-muted">Min confidence</div>
                  <div className="text-text-primary font-medium">
                    {formatEnumLabel(playbook.minConfidence, enumLabelMap.confidence)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-text-muted">Execution mode</div>
                  <div className="text-text-primary font-medium">
                    {formatEnumLabel(playbook.executionMode, enumLabelMap.executionMode)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-text-muted">Cooldown</div>
                  <div className="text-text-primary font-medium">{playbook.cooldownHours} hours</div>
                </div>
                <div>
                  <div className="text-sm text-text-muted">Max concurrent runs</div>
                  <div className="text-text-primary font-medium">{playbook.maxConcurrentRuns}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">Actions</h2>
              <div className="space-y-3">
                {playbook.actions.length === 0 && (
                  <div className="text-text-muted">No actions configured.</div>
                )}
                {playbook.actions.map((action, index) => (
                  <div
                    key={`${action.actionType}-${index}`}
                    className="rounded-xl border border-border-primary/30 p-4 bg-surface-secondary/40"
                  >
                    <div className="text-text-primary font-medium">
                      {index + 1}. {formatEnumLabel(action.actionType, enumLabelMap.actionType)}
                    </div>
                    <div className="mt-3">{renderActionDetails(action)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">Target Segments</h2>
              <div className="rounded-xl border border-border-primary/30 p-4 bg-surface-secondary/40 space-y-2">
                {playbook.targetSegments.length === 0 && (
                  <div className="text-text-muted">No segment targeting configured.</div>
                )}
                {playbook.targetSegments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {playbook.targetSegments.map((segment) => (
                      <span
                        key={segment.segmentId}
                        className="px-3 py-1 rounded-full text-sm bg-surface-primary/60 border border-border-primary/40 text-text-primary"
                      >
                        {segment.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};
