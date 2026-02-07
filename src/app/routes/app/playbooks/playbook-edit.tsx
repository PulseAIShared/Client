import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppPageHeader, ContentLayout } from '@/components/layouts';
import { Spinner } from '@/components/ui/spinner';
import { useNotifications } from '@/components/ui/notifications';
import {
  PlaybookInput,
  useGetPlaybook,
  useUpdatePlaybook,
} from '@/features/playbooks/api/playbooks';
import {
  ActionType,
  ConfidenceLevel,
  ConfidenceMode,
  ExecutionMode,
  PlaybookCategory,
  PlaybookDetail,
  PlaybookStatus,
  TriggerType,
} from '@/types/playbooks';

const normalizeEnumKey = (value: string) =>
  value.trim().toLowerCase().replace(/[\s_-]+/g, '');

const parseEnumValue = (
  value: number | string | null | undefined,
  map: Record<string, number>,
  fallback: number,
) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const numericValue = Number(value);
    if (Number.isFinite(numericValue)) {
      return numericValue;
    }

    const mapped = map[normalizeEnumKey(value)];
    if (mapped !== undefined) {
      return mapped;
    }
  }

  return fallback;
};

const categoryMap: Record<string, number> = {
  payment: PlaybookCategory.Payment,
  engagement: PlaybookCategory.Engagement,
  support: PlaybookCategory.Support,
  cancellation: PlaybookCategory.Cancellation,
  custom: PlaybookCategory.Custom,
};

const triggerTypeMap: Record<string, number> = {
  signal: TriggerType.Signal,
  segment: TriggerType.Segment,
  manual: TriggerType.Manual,
};

const confidenceLevelMap: Record<string, number> = {
  minimal: ConfidenceLevel.Minimal,
  good: ConfidenceLevel.Good,
  high: ConfidenceLevel.High,
  excellent: ConfidenceLevel.Excellent,
};

const confidenceModeMap: Record<string, number> = {
  manual: ConfidenceMode.Manual,
  auto: ConfidenceMode.Auto,
};

const executionModeMap: Record<string, number> = {
  immediate: ExecutionMode.Immediate,
  approval: ExecutionMode.Approval,
  scheduled: ExecutionMode.Scheduled,
};

const actionTypeMap: Record<string, number> = {
  striperetry: ActionType.StripeRetry,
  slackalert: ActionType.SlackAlert,
  crmtask: ActionType.CrmTask,
  hubspotworkflow: ActionType.HubspotWorkflow,
  email: ActionType.Email,
  webhook: ActionType.Webhook,
};

const statusMap: Record<string, number> = {
  draft: PlaybookStatus.Draft,
  active: PlaybookStatus.Active,
  paused: PlaybookStatus.Paused,
  archived: PlaybookStatus.Archived,
};

const resolveStatusValue = (status: number | string) =>
  parseEnumValue(status, statusMap, PlaybookStatus.Draft);

const isEditableStatus = (status: number | string) => {
  const statusValue = resolveStatusValue(status);
  return statusValue === PlaybookStatus.Draft || statusValue === PlaybookStatus.Paused;
};

const buildUpdatePayload = (
  playbook: PlaybookDetail,
  name: string,
  description: string,
): PlaybookInput => ({
  name: name.trim(),
  description: description.trim() ? description.trim() : null,
  category: parseEnumValue(
    playbook.category,
    categoryMap,
    PlaybookCategory.Custom,
  ),
  triggerType: parseEnumValue(
    playbook.triggerType,
    triggerTypeMap,
    TriggerType.Signal,
  ),
  triggerConditionsJson: playbook.triggerConditionsJson || '{}',
  minConfidence: parseEnumValue(
    playbook.minConfidence,
    confidenceLevelMap,
    ConfidenceLevel.Minimal,
  ),
  confidenceMode: parseEnumValue(
    playbook.confidenceMode,
    confidenceModeMap,
    ConfidenceMode.Manual,
  ),
  cooldownHours: playbook.cooldownHours ?? 0,
  maxConcurrentRuns: playbook.maxConcurrentRuns ?? 1,
  executionMode: parseEnumValue(
    playbook.executionMode,
    executionModeMap,
    ExecutionMode.Immediate,
  ),
  priority: playbook.priority ?? 100,
  targetSegmentIds: (playbook.targetSegments ?? []).map((segment) => segment.segmentId),
  actions: (playbook.actions ?? []).map((action, index) => ({
    actionType: parseEnumValue(
      action.actionType,
      actionTypeMap,
      ActionType.SlackAlert,
    ),
    orderIndex:
      typeof action.orderIndex === 'number' && Number.isFinite(action.orderIndex)
        ? action.orderIndex
        : index,
    configJson: action.configJson || '{}',
  })),
});

export const PlaybookEditRoute: React.FC = () => {
  const { playbookId } = useParams<{ playbookId: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const { data: playbook, isLoading, error } = useGetPlaybook(playbookId);
  const updateMutation = useUpdatePlaybook();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!playbook) {
      return;
    }

    setName(playbook.name ?? '');
    setDescription(playbook.description ?? '');
  }, [playbook]);

  const canEdit = useMemo(
    () => (playbook ? isEditableStatus(playbook.status) : false),
    [playbook],
  );

  const statusLabel = useMemo(() => {
    if (!playbook) {
      return '';
    }

    const statusValue = resolveStatusValue(playbook.status);
    switch (statusValue) {
      case PlaybookStatus.Draft:
        return 'Draft';
      case PlaybookStatus.Active:
        return 'Active';
      case PlaybookStatus.Paused:
        return 'Paused';
      case PlaybookStatus.Archived:
        return 'Archived';
      default:
        return String(playbook.status);
    }
  }, [playbook]);

  const handleSave = async () => {
    if (!playbookId || !playbook) {
      return;
    }

    if (!name.trim()) {
      addNotification({
        type: 'warning',
        title: 'Name required',
        message: 'Please provide a playbook name before saving.',
      });
      return;
    }

    if (!canEdit) {
      addNotification({
        type: 'warning',
        title: 'Playbook is not editable',
        message: 'Only Draft and Paused playbooks can be edited.',
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        playbookId,
        payload: buildUpdatePayload(playbook, name, description),
      });

      addNotification({
        type: 'success',
        title: 'Playbook updated',
        message: 'Title and description have been saved.',
      });

      navigate(`/app/playbooks/${playbookId}`);
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Update failed',
        message: err instanceof Error ? err.message : 'Failed to update playbook.',
      });
    }
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
        <div className="flex items-center justify-center py-12">
          <Spinner size="xl" />
        </div>
      </ContentLayout>
    );
  }

  if (error || !playbook) {
    return (
      <ContentLayout>
        <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-error/20 to-error-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="text-error-muted font-medium mb-2">Failed to load playbook</div>
            <Link
              to="/app/playbooks"
              className="px-4 py-2 bg-surface-secondary/50 text-text-primary rounded-lg border border-border-primary/30 hover:bg-surface-secondary/80"
            >
              Back to Playbooks
            </Link>
          </div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout>
      <div className="space-y-6">
        <AppPageHeader
          title="Edit Playbook"
          description="Update title and description. Trigger and action settings stay unchanged."
          compact
          actions={(
            <>
              <button
                onClick={() => navigate(`/app/playbooks/${playbookId}`)}
                className="px-4 py-2 bg-surface-secondary/50 text-text-primary rounded-lg border border-border-primary/30 hover:bg-surface-secondary/80 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending || !canEdit}
                className="px-4 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg hover:shadow-lg hover:shadow-accent-primary/25 transform hover:-translate-y-0.5 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {updateMutation.isPending && <Spinner size="sm" />}
                Save Changes
              </button>
            </>
          )}
        />

        {!canEdit && (
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
            <div className="text-warning-muted font-medium">This playbook is {statusLabel}</div>
            <p className="text-sm text-text-secondary mt-1">
              Edit is allowed only when a playbook is in Draft or Paused status.
            </p>
          </div>
        )}

        <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg space-y-6">
          <div className="space-y-2">
            <label className="block text-text-primary font-medium">Title</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={!canEdit}
              className="w-full bg-surface-secondary/50 border border-border-primary/30 rounded-xl px-3 py-2 text-text-primary disabled:opacity-70"
              placeholder="Playbook title"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-text-primary font-medium">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={!canEdit}
              rows={5}
              className="w-full bg-surface-secondary/50 border border-border-primary/30 rounded-xl px-3 py-2 text-text-primary disabled:opacity-70"
              placeholder="Describe what this playbook is intended to do"
            />
          </div>

          <div className="rounded-xl border border-border-primary/30 p-4 bg-surface-secondary/40 text-sm text-text-secondary">
            <div className="font-medium text-text-primary mb-1">Current locked settings</div>
            <div>Trigger conditions and actions are preserved exactly as-is in this editor.</div>
            <div className="mt-2">
              Actions configured: <span className="text-text-primary font-medium">{playbook.actions.length}</span>
              {' '}| Target segments: <span className="text-text-primary font-medium">{playbook.targetSegments.length}</span>
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};
