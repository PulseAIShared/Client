import { Link } from 'react-router-dom';

type DetectedIntegrationsProps = {
  connectedProviders: string[];
};

const providerLabelMap: Record<string, string> = {
  stripe: 'Stripe',
  hubspot: 'HubSpot',
  posthog: 'PostHog',
};

const formatProviderLabel = (provider: string) =>
  providerLabelMap[provider] ??
  provider.charAt(0).toUpperCase() + provider.slice(1);

export const DetectedIntegrations = ({
  connectedProviders,
}: DetectedIntegrationsProps) => {
  if (connectedProviders.length === 0) {
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
    <p className="text-xs text-text-muted">
      Connected integrations:{' '}
      <span className="text-text-primary">
        {connectedProviders
          .map(formatProviderLabel)
          .join(', ')}
      </span>{' '}
      {'\u00B7'}{' '}
      <Link
        to="/app/integrations"
        className="text-accent-primary hover:underline"
      >
        Manage
      </Link>
    </p>
  );
};

