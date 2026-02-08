import { Link } from 'react-router-dom';
import {
  formatIntegrationLabel,
  IntegrationBadgeIcon,
  normalizeIntegrationKey,
} from './integration-visuals';

type DetectedIntegrationsProps = {
  connectedProviders: string[];
};

export const DetectedIntegrations = ({
  connectedProviders,
}: DetectedIntegrationsProps) => {
  const normalizedProviders = Array.from(
    new Set(
      connectedProviders
        .map(normalizeIntegrationKey)
        .filter(Boolean),
    ),
  );

  if (normalizedProviders.length === 0) {
    return (
      <p className="text-xs text-text-muted">
        No integrations detected. Connect an integration to
        improve recommendations.{' '}
        <Link
          to="/app/integrations"
          className="text-accent-primary hover:underline"
        >
          Connect
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-text-secondary">
        Connected integrations
      </div>
      <div className="flex flex-wrap gap-2">
        {normalizedProviders.map((provider) => (
          <span
            key={provider}
            className="inline-flex items-center gap-2 rounded-full border border-border-primary/35 bg-surface-secondary/60 px-2.5 py-1 text-xs text-text-primary"
          >
            <IntegrationBadgeIcon
              integration={provider}
              size="sm"
              className="h-6 w-6 rounded-lg text-[10px]"
            />
            {formatIntegrationLabel(provider)}
          </span>
        ))}
      </div>
      <p className="text-xs text-text-muted">
        Recommendations use connected integrations as
        context.{' '}
        <Link
          to="/app/integrations"
          className="text-accent-primary hover:underline"
        >
          Manage
        </Link>
      </p>
    </div>
  );
};
