import { z } from 'zod';
import {
  ActionType,
  ConfidenceLevel,
  ExecutionMode,
  PlaybookCategory,
  TriggerType,
} from '@/types/playbooks';
import { PlaybookInput } from '@/features/playbooks/api/playbooks';

// ── Signal options & helpers (moved from playbook-create.tsx) ──

export type TriggerSignalType =
  | 'payment_failure'
  | 'inactivity_7d'
  | 'deal_lost';

export const signalOptions: Array<{
  value: TriggerSignalType;
  label: string;
  description: string;
}> = [
  {
    value: 'payment_failure',
    label: 'Payment failed',
    description:
      'Triggered when Stripe reports a failed payment.',
  },
  {
    value: 'inactivity_7d',
    label: 'Inactive for 7 days',
    description:
      'Triggered when engagement activity has been quiet for a week.',
  },
  {
    value: 'deal_lost',
    label: 'Deal lost',
    description:
      'Triggered when a HubSpot deal is marked lost.',
  },
];

export type TriggerSourceState = {
  stripe: boolean;
  posthog: boolean;
  hubspot: boolean;
};

export type ConfidenceMode = 'auto' | 'manual';

export const defaultSourcesForSignal = (
  signalType: TriggerSignalType,
): TriggerSourceState => {
  switch (signalType) {
    case 'payment_failure':
      return { stripe: true, posthog: false, hubspot: false };
    case 'inactivity_7d':
      return { stripe: false, posthog: true, hubspot: false };
    case 'deal_lost':
      return { stripe: false, posthog: false, hubspot: true };
    default:
      return { stripe: false, posthog: false, hubspot: false };
  }
};

// ── Action config helpers ──

export type ActionConfigState = {
  webhookUrl?: string;
  webhookMethod?: string;
  webhookBody?: string;
  channel?: string;
  username?: string;
  iconEmoji?: string;
  messageTemplate?: string;
  subject?: string;
  body?: string;
  senderProfileId?: string;
  dueDays?: string;
  assignToOwnerId?: string;
  rawJson?: string;
};

export const defaultActionConfig = (
  actionType: ActionType,
): ActionConfigState => {
  switch (actionType) {
    case ActionType.SlackAlert:
      return {
        webhookUrl: '',
        channel: '',
        username: '',
        iconEmoji: '',
        messageTemplate: '',
      };
    case ActionType.CrmTask:
      return {
        subject: '',
        body: '',
        dueDays: '',
        assignToOwnerId: '',
      };
    case ActionType.Email:
      return {
        subject: '',
        body: '',
        senderProfileId: '',
      };
    case ActionType.Webhook:
      return {
        webhookUrl: '',
        webhookMethod: 'POST',
        webhookBody: '',
      };
    case ActionType.StripeRetry:
      return {};
    default:
      return { rawJson: '{}' };
  }
};

const parseJsonObject = (rawJson: string) => {
  try {
    const parsed = JSON.parse(rawJson);
    if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
    ) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Fall through to default object.
  }

  return {};
};

const toStringOrEmpty = (value: unknown) => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
};

export const parseActionConfigJson = (
  actionType: ActionType,
  rawConfigJson: string | null | undefined,
): ActionConfigState => {
  const configJson = rawConfigJson?.trim() || '{}';
  const parsedObject = parseJsonObject(configJson);

  if (actionType === ActionType.StripeRetry) {
    return {};
  }

  if (actionType === ActionType.SlackAlert) {
    return {
      webhookUrl: toStringOrEmpty(
        parsedObject.webhookUrl,
      ),
      channel: toStringOrEmpty(parsedObject.channel),
      username: toStringOrEmpty(
        parsedObject.username,
      ),
      iconEmoji: toStringOrEmpty(
        parsedObject.iconEmoji,
      ),
      messageTemplate: toStringOrEmpty(
        parsedObject.messageTemplate,
      ),
    };
  }

  if (actionType === ActionType.CrmTask) {
    return {
      subject: toStringOrEmpty(parsedObject.subject),
      body: toStringOrEmpty(parsedObject.body),
      dueDays: toStringOrEmpty(parsedObject.dueDays),
      assignToOwnerId: toStringOrEmpty(
        parsedObject.assignToOwnerId,
      ),
    };
  }

  if (actionType === ActionType.Email) {
    return {
      subject: toStringOrEmpty(parsedObject.subject),
      body: toStringOrEmpty(parsedObject.body),
      senderProfileId: toStringOrEmpty(
        parsedObject.senderProfileId,
      ),
    };
  }

  if (actionType === ActionType.Webhook) {
    return {
      webhookUrl: toStringOrEmpty(
        parsedObject.url ?? parsedObject.webhookUrl,
      ),
      webhookMethod:
        toStringOrEmpty(parsedObject.method) ||
        'POST',
      webhookBody: toStringOrEmpty(
        parsedObject.body ?? parsedObject.bodyTemplate,
      ),
    };
  }

  return {
    rawJson: configJson,
  };
};

// ── Zod schemas ──

const identitySchema = z.object({
  name: z
    .string()
    .min(1, 'Playbook name is required')
    .max(100, 'Name must be 100 characters or fewer'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or fewer')
    .optional()
    .or(z.literal('')),
  category: z.nativeEnum(PlaybookCategory),
});

const triggerSchema = z.object({
  confidenceMode: z.enum(['auto', 'manual']),
  signalType: z.enum([
    'payment_failure',
    'inactivity_7d',
    'deal_lost',
  ]),
  minConfidence: z.nativeEnum(ConfidenceLevel),
  minAmount: z.string().optional().or(z.literal('')),
  minMrr: z.string().optional().or(z.literal('')),
  minDaysInactive: z.string().optional().or(z.literal('')),
  minDaysOverdue: z.string().optional().or(z.literal('')),
  requiredSources: z.object({
    stripe: z.boolean(),
    posthog: z.boolean(),
    hubspot: z.boolean(),
  }),
  targetSegmentIds: z.array(z.string()),
});

const executionSchema = z.object({
  executionMode: z.nativeEnum(ExecutionMode),
  cooldownHours: z.coerce
    .number()
    .min(0, 'Cooldown must be 0 or more'),
  maxConcurrentRuns: z.coerce
    .number()
    .min(1, 'Must allow at least 1 concurrent run'),
  priority: z.coerce
    .number()
    .min(1, 'Priority must be between 1 and 100')
    .max(100, 'Priority must be between 1 and 100'),
});

const actionConfigSchema = z.object({
  webhookUrl: z.string().optional().or(z.literal('')),
  webhookMethod: z.string().optional().or(z.literal('')),
  webhookBody: z.string().optional().or(z.literal('')),
  channel: z.string().optional().or(z.literal('')),
  username: z.string().optional().or(z.literal('')),
  iconEmoji: z.string().optional().or(z.literal('')),
  messageTemplate: z.string().optional().or(z.literal('')),
  subject: z.string().optional().or(z.literal('')),
  body: z.string().optional().or(z.literal('')),
  senderProfileId: z.string().optional().or(z.literal('')),
  dueDays: z.string().optional().or(z.literal('')),
  assignToOwnerId: z.string().optional().or(z.literal('')),
  rawJson: z.string().optional().or(z.literal('')),
});

const actionItemSchema = z
  .object({
    actionType: z.nativeEnum(ActionType),
    config: actionConfigSchema,
  })
  .superRefine((action, ctx) => {
    if (
      action.actionType === ActionType.SlackAlert &&
      !action.config.channel?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Slack channel is required',
        path: ['config', 'channel'],
      });
    }

    if (
      action.actionType === ActionType.Email &&
      !action.config.subject?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Email subject is required',
        path: ['config', 'subject'],
      });
    }

    if (
      action.actionType === ActionType.Email &&
      !action.config.body?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Email body is required',
        path: ['config', 'body'],
      });
    }

    if (
      action.actionType === ActionType.Webhook &&
      !action.config.webhookUrl?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Webhook URL is required',
        path: ['config', 'webhookUrl'],
      });
    }
  });

const actionsSchema = z.object({
  actions: z
    .array(actionItemSchema)
    .min(1, 'At least one action is required'),
});

export const playbookFormSchema = identitySchema
  .merge(triggerSchema)
  .merge(executionSchema)
  .merge(actionsSchema);

export type PlaybookFormValues = z.infer<
  typeof playbookFormSchema
>;

// ── Step configuration ──

export const WIZARD_STEPS = [
  { label: 'Define', description: 'Name and category' },
  { label: 'Trigger', description: 'Signal and conditions' },
  { label: 'Configure', description: 'Execution rules' },
  { label: 'Actions', description: 'What should happen' },
  { label: 'Review', description: 'Confirm and create' },
] as const;

export const STEP_FIELDS: Record<
  number,
  (keyof PlaybookFormValues)[]
> = {
  0: ['name', 'description', 'category'],
  1: [
    'confidenceMode',
    'signalType',
    'minConfidence',
    'minAmount',
    'minMrr',
    'minDaysInactive',
    'minDaysOverdue',
    'requiredSources',
    'targetSegmentIds',
  ],
  2: [
    'executionMode',
    'cooldownHours',
    'maxConcurrentRuns',
    'priority',
  ],
  3: ['actions'],
  // Step 4 (review) has no fields to validate
};

export const PLAYBOOK_DEFAULT_VALUES: PlaybookFormValues = {
  name: '',
  description: '',
  category: PlaybookCategory.Payment,
  confidenceMode: 'auto',
  signalType: 'payment_failure',
  minConfidence: ConfidenceLevel.Good,
  minAmount: '',
  minMrr: '',
  minDaysInactive: '',
  minDaysOverdue: '',
  requiredSources: defaultSourcesForSignal('payment_failure'),
  targetSegmentIds: [],
  executionMode: ExecutionMode.Approval,
  cooldownHours: 72,
  maxConcurrentRuns: 1,
  priority: 100,
  actions: [
    {
      actionType: ActionType.StripeRetry,
      config: defaultActionConfig(ActionType.StripeRetry),
    },
  ],
};

// ── Payload transformation ──

const parseNumber = (value: string | undefined) => {
  if (!value?.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const buildTriggerConditionsJson = (
  values: PlaybookFormValues,
) => {
  const sources = Object.entries(values.requiredSources)
    .filter(([, enabled]) => enabled)
    .map(([source]) => source);

  const conditions: Record<string, unknown> = {
    signalType: values.signalType,
    minAmount: parseNumber(values.minAmount),
    minMrr: parseNumber(values.minMrr),
    minDaysOverdue: parseNumber(values.minDaysOverdue),
    minDaysInactive: parseNumber(values.minDaysInactive),
    requiresSources:
      sources.length > 0 ? sources : undefined,
  };

  const cleaned = Object.fromEntries(
    Object.entries(conditions).filter(
      ([, value]) =>
        value !== undefined && value !== '',
    ),
  );

  return JSON.stringify(cleaned);
};

const buildActionConfigJson = (action: {
  actionType: ActionType;
  config: ActionConfigState;
}) => {
  if (action.actionType === ActionType.StripeRetry) {
    return '{}';
  }

  if (action.actionType === ActionType.SlackAlert) {
    const config: Record<string, unknown> = {
      webhookUrl:
        action.config.webhookUrl?.trim() || undefined,
      channel:
        action.config.channel?.trim() || undefined,
      username:
        action.config.username?.trim() || undefined,
      iconEmoji:
        action.config.iconEmoji?.trim() || undefined,
      messageTemplate:
        action.config.messageTemplate?.trim() || undefined,
    };
    return JSON.stringify(
      Object.fromEntries(
        Object.entries(config).filter(
          ([, value]) => value !== undefined,
        ),
      ),
    );
  }

  if (action.actionType === ActionType.CrmTask) {
    const config: Record<string, unknown> = {
      subject:
        action.config.subject?.trim() || undefined,
      body: action.config.body?.trim() || undefined,
      dueDays: parseNumber(action.config.dueDays ?? ''),
      assignToOwnerId:
        action.config.assignToOwnerId?.trim() ||
        undefined,
    };
    return JSON.stringify(
      Object.fromEntries(
        Object.entries(config).filter(
          ([, value]) => value !== undefined,
        ),
      ),
    );
  }

  if (action.actionType === ActionType.Email) {
    const config: Record<string, unknown> = {
      subject:
        action.config.subject?.trim() || undefined,
      body: action.config.body?.trim() || undefined,
      senderProfileId:
        action.config.senderProfileId?.trim() ||
        undefined,
    };
    return JSON.stringify(
      Object.fromEntries(
        Object.entries(config).filter(
          ([, value]) => value !== undefined,
        ),
      ),
    );
  }

  if (action.actionType === ActionType.Webhook) {
    const method =
      action.config.webhookMethod?.trim().toUpperCase() ||
      'POST';
    const config: Record<string, unknown> = {
      url:
        action.config.webhookUrl?.trim() || undefined,
      method,
      body:
        action.config.webhookBody?.trim() ||
        undefined,
    };
    return JSON.stringify(
      Object.fromEntries(
        Object.entries(config).filter(
          ([, value]) => value !== undefined,
        ),
      ),
    );
  }

  if (
    action.config.rawJson &&
    action.config.rawJson.trim()
  ) {
    try {
      return JSON.stringify(
        JSON.parse(action.config.rawJson),
      );
    } catch {
      return action.config.rawJson;
    }
  }

  return '{}';
};

export const toPlaybookInput = (
  values: PlaybookFormValues,
): PlaybookInput => ({
  name: values.name.trim(),
  description: values.description?.trim() || null,
  category: values.category,
  triggerType: TriggerType.Signal,
  triggerConditionsJson:
    buildTriggerConditionsJson(values),
  minConfidence: values.minConfidence,
  confidenceMode:
    values.confidenceMode === 'auto' ? 1 : 0,
  cooldownHours: values.cooldownHours,
  maxConcurrentRuns: values.maxConcurrentRuns,
  executionMode: values.executionMode,
  priority: values.priority,
  targetSegmentIds: values.targetSegmentIds,
  actions: values.actions.map((action, index) => ({
    actionType: action.actionType,
    orderIndex: index,
    configJson: buildActionConfigJson(action),
  })),
});
