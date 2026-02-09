import type { ComponentType } from 'react';
import { Mail, Send, Webhook } from 'lucide-react';
import {
  SiHubspot,
  SiIntercom,
  SiMailchimp,
  SiPosthog,
  SiSlack,
  SiStripe,
  SiZendesk,
} from 'react-icons/si';
import { cn } from '@/utils/cn';
import { ActionType } from '@/types/playbooks';

type IntegrationIcon = ComponentType<{
  className?: string;
  'aria-hidden'?: boolean;
}>;

type IntegrationVisual = {
  key: string;
  label: string;
  shortLabel: string;
  accentGradient: string;
  icon?: IntegrationIcon;
};

const FALLBACK_GRADIENT = 'from-slate-600 to-slate-800';

const VISUAL_CATALOG: Record<string, IntegrationVisual> = {
  stripe: {
    key: 'stripe',
    label: 'Stripe',
    shortLabel: 'ST',
    accentGradient: 'from-[#6772e5] to-[#3a39c5]',
    icon: SiStripe,
  },
  slack: {
    key: 'slack',
    label: 'Slack',
    shortLabel: 'SL',
    accentGradient: 'from-[#611f69] to-[#36c5f0]',
    icon: SiSlack,
  },
  hubspot: {
    key: 'hubspot',
    label: 'HubSpot',
    shortLabel: 'HS',
    accentGradient: 'from-[#ff7a59] to-[#d62d20]',
    icon: SiHubspot,
  },
  posthog: {
    key: 'posthog',
    label: 'PostHog',
    shortLabel: 'PH',
    accentGradient: 'from-[#ff6f63] to-[#6d3df6]',
    icon: SiPosthog,
  },
  email: {
    key: 'email',
    label: 'Email',
    shortLabel: 'EM',
    accentGradient: 'from-[#fbab7e] to-[#f7ce68]',
    icon: Mail,
  },
  webhook: {
    key: 'webhook',
    label: 'Webhook',
    shortLabel: 'WH',
    accentGradient: 'from-[#22d3ee] to-[#2563eb]',
    icon: Webhook,
  },
  mailchimp: {
    key: 'mailchimp',
    label: 'Mailchimp',
    shortLabel: 'MC',
    accentGradient: 'from-[#ffe01b] to-[#f6b400]',
    icon: SiMailchimp,
  },
  sendgrid: {
    key: 'sendgrid',
    label: 'SendGrid',
    shortLabel: 'SG',
    accentGradient: 'from-[#1a82e2] to-[#0b57b0]',
    icon: Send,
  },
  postmark: {
    key: 'postmark',
    label: 'Postmark',
    shortLabel: 'PM',
    accentGradient: 'from-[#ffb347] to-[#ff8c42]',
    icon: Send,
  },
  ses: {
    key: 'ses',
    label: 'Amazon SES',
    shortLabel: 'SES',
    accentGradient: 'from-[#ff9900] to-[#146eb4]',
    icon: Send,
  },
  smtp: {
    key: 'smtp',
    label: 'SMTP',
    shortLabel: 'SMTP',
    accentGradient: 'from-[#64748b] to-[#334155]',
    icon: Send,
  },
  pipedrive: {
    key: 'pipedrive',
    label: 'Pipedrive',
    shortLabel: 'PD',
    accentGradient: 'from-[#25292c] to-[#017737]',

  },
  chargebee: {
    key: 'chargebee',
    label: 'Chargebee',
    shortLabel: 'CB',
    accentGradient: 'from-[#ff6633] to-[#ef4123]',
  },
  zendesk: {
    key: 'zendesk',
    label: 'Zendesk',
    shortLabel: 'ZD',
    accentGradient: 'from-[#03363d] to-[#78a300]',
    icon: SiZendesk,
  },
  intercom: {
    key: 'intercom',
    label: 'Intercom',
    shortLabel: 'IC',
    accentGradient: 'from-[#286efa] to-[#1b4ddb]',
    icon: SiIntercom,
  },
  microsoftteams: {
    key: 'microsoftteams',
    label: 'Microsoft Teams',
    shortLabel: 'MT',
    accentGradient: 'from-[#5b5fc7] to-[#4b53bc]',
  },
};

const titleCase = (value: string) =>
  value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const normalizeIntegrationKey = (value: string) => {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');

  if (!normalized) {
    return '';
  }

  if (normalized.includes('hubspot')) {
    return 'hubspot';
  }
  if (normalized.includes('stripe')) {
    return 'stripe';
  }
  if (normalized.includes('posthog')) {
    return 'posthog';
  }
  if (normalized.includes('slack')) {
    return 'slack';
  }
  if (normalized.includes('webhook')) {
    return 'webhook';
  }
  if (normalized.includes('mailchimp')) {
    return 'mailchimp';
  }
  if (normalized.includes('sendgrid')) {
    return 'sendgrid';
  }
  if (normalized.includes('postmark')) {
    return 'postmark';
  }
  if (
    normalized === 'ses' ||
    normalized.includes('amazonses')
  ) {
    return 'ses';
  }
  if (normalized.includes('smtp')) {
    return 'smtp';
  }
  if (normalized.includes('email')) {
    return 'email';
  }
  if (normalized.includes('pipedrive')) {
    return 'pipedrive';
  }
  if (normalized.includes('chargebee')) {
    return 'chargebee';
  }
  if (normalized.includes('zendesk')) {
    return 'zendesk';
  }
  if (normalized.includes('intercom')) {
    return 'intercom';
  }
  if (
    normalized.includes('microsoftteams') ||
    normalized.includes('teams')
  ) {
    return 'microsoftteams';
  }

  return normalized;
};

export const getActionTypeIntegrationKey = (
  actionType: number,
): string => {
  switch (actionType) {
    case ActionType.StripeRetry:
      return 'stripe';
    case ActionType.SlackAlert:
      return 'slack';
    case ActionType.CrmTask:
    case ActionType.HubspotWorkflow:
      return 'hubspot';
    case ActionType.Email:
      return 'email';
    case ActionType.Webhook:
      return 'webhook';
    case ActionType.IntercomMessage:
    case ActionType.IntercomNote:
      return 'intercom';
    case ActionType.ZendeskCreateTicket:
      return 'zendesk';
    case ActionType.TeamsAlert:
      return 'microsoftteams';
    default:
      return 'integration';
  }
};

export const getIntegrationVisual = (
  integrationKey: string,
): IntegrationVisual => {
  const normalized = normalizeIntegrationKey(
    integrationKey,
  );
  const catalogMatch = VISUAL_CATALOG[normalized];

  if (catalogMatch) {
    return catalogMatch;
  }

  const fallbackLabel =
    titleCase(integrationKey) || 'Integration';

  return {
    key: normalized || 'integration',
    label: fallbackLabel,
    shortLabel:
      fallbackLabel.length <= 4
        ? fallbackLabel.toUpperCase()
        : fallbackLabel
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 3)
            .toUpperCase(),
    accentGradient: FALLBACK_GRADIENT,
  };
};

export const formatIntegrationLabel = (
  integrationKey: string,
) => getIntegrationVisual(integrationKey).label;

type IntegrationBadgeIconProps = {
  integration: string;
  size?: 'sm' | 'md';
  className?: string;
};

export const IntegrationBadgeIcon = ({
  integration,
  size = 'md',
  className,
}: IntegrationBadgeIconProps) => {
  const visual = getIntegrationVisual(integration);
  const IconComponent = visual.icon;
  const wrapperSize =
    size === 'sm' ? 'h-9 w-9 text-base' : 'h-11 w-11 text-lg';
  const iconSize =
    size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ring-1 ring-black/10',
        wrapperSize,
        visual.accentGradient,
        className,
      )}
      aria-hidden="true"
    >
      {IconComponent ? (
        <IconComponent className={iconSize} />
      ) : (
        <span className="text-[10px] font-semibold uppercase tracking-wide">
          {visual.shortLabel}
        </span>
      )}
    </div>
  );
};
