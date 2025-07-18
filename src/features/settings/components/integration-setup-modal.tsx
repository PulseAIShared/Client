// src/features/settings/components/integration-setup-modal.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form';
import { FieldError, useForm, FieldValues } from 'react-hook-form';
import { useAuthorization, CompanyAuthorization } from '@/lib/authorization';

interface IntegrationSetupModalProps {
  integration: {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
  } | null;
  onConnect: (integrationId: string, integrationName: string, config: FieldValues) => Promise<void>;
  onClose: () => void;
}

export const IntegrationSetupModal: React.FC<IntegrationSetupModalProps> = ({ 
  integration, 
  onConnect, 
  onClose 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedSyncOptions, setSelectedSyncOptions] = useState(new Set<string>());
  const { checkCompanyPolicy } = useAuthorization();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  React.useEffect(() => {
    if (integration) {
      setCurrentStep(1);
      setIsConnecting(false);
      setSelectedSyncOptions(new Set());
      reset();
    }
  }, [integration, reset]);

  if (!integration) return null;

  const canSetupIntegrations = checkCompanyPolicy('integrations:write');
  
  if (!canSetupIntegrations) {
    return (
      <div className="fixed inset-0 bg-bg-primary/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-surface-secondary/95 backdrop-blur-lg rounded-2xl border border-border-primary/50 shadow-2xl w-full max-w-md p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-warning-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Access Denied</h3>
            <p className="text-text-muted mb-6">
              You need Staff or Owner role to set up integrations.
            </p>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getIntegrationConfig = (type: string) => {
    const configs = {
      salesforce: {
        steps: [
          { title: 'Authentication', description: 'Connect your Salesforce account' },
          { title: 'Configure Sync', description: 'Choose what data to sync' },
          { title: 'Test Connection', description: 'Verify the integration works' }
        ],
        fields: {
          instanceUrl: { label: 'Salesforce Instance URL', placeholder: 'https://mycompany.salesforce.com', type: 'url' },
          clientId: { label: 'Consumer Key', placeholder: 'Your Salesforce app consumer key', type: 'text' },
          clientSecret: { label: 'Consumer Secret', placeholder: 'Your Salesforce app consumer secret', type: 'password' },
          username: { label: 'Username', placeholder: 'your.email@company.com', type: 'email' },
          password: { label: 'Password', placeholder: 'Your Salesforce password', type: 'password' },
          securityToken: { label: 'Security Token', placeholder: 'Your Salesforce security token', type: 'password' }
        },
        syncOptions: [
          { id: 'contacts', label: 'Contacts', description: 'Sync customer contact information' },
          { id: 'accounts', label: 'Accounts', description: 'Sync company/account data' },
          { id: 'opportunities', label: 'Opportunities', description: 'Sync sales opportunities' },
          { id: 'leads', label: 'Leads', description: 'Sync lead information' },
          { id: 'activities', label: 'Activities', description: 'Sync email/call activities' }
        ]
      },
      hubspot: {
        steps: [
          { title: 'OAuth Connection', description: 'Authorize HubSpot access' },
          { title: 'Select Data', description: 'Choose objects to sync' },
          { title: 'Sync Settings', description: 'Configure sync frequency' }
        ],
        fields: {
          portalId: { label: 'Portal ID', placeholder: 'Your HubSpot Portal ID', type: 'text' }
        },
        syncOptions: [
          { id: 'contacts', label: 'Contacts', description: 'Sync contact database' },
          { id: 'companies', label: 'Companies', description: 'Sync company records' },
          { id: 'deals', label: 'Deals', description: 'Sync deal pipeline' },
          { id: 'tickets', label: 'Tickets', description: 'Sync support tickets' },
          { id: 'emails', label: 'Email Events', description: 'Track email engagement' }
        ]
      },
      pipedrive: {
        steps: [
          { title: 'API Setup', description: 'Connect with Pipedrive API' },
          { title: 'Data Selection', description: 'Choose pipeline data to sync' },
          { title: 'Verification', description: 'Test the connection' }
        ],
        fields: {
          apiToken: { label: 'API Token', placeholder: 'Your Pipedrive API token', type: 'password' },
          companyDomain: { label: 'Company Domain', placeholder: 'yourcompany.pipedrive.com', type: 'text' }
        },
        syncOptions: [
          { id: 'deals', label: 'Deals', description: 'Sync sales pipeline' },
          { id: 'persons', label: 'Persons', description: 'Sync contact persons' },
          { id: 'organizations', label: 'Organizations', description: 'Sync company data' },
          { id: 'activities', label: 'Activities', description: 'Sync sales activities' },
          { id: 'notes', label: 'Notes', description: 'Sync deal notes' }
        ]
      },
      zoho: {
        steps: [
          { title: 'OAuth Setup', description: 'Authorize Zoho CRM access' },
          { title: 'Module Selection', description: 'Choose CRM modules to sync' },
          { title: 'Connection Test', description: 'Verify integration' }
        ],
        fields: {
          clientId: { label: 'Client ID', placeholder: 'Your Zoho app client ID', type: 'text' },
          clientSecret: { label: 'Client Secret', placeholder: 'Your Zoho app client secret', type: 'password' },
          refreshToken: { label: 'Refresh Token', placeholder: 'Your Zoho refresh token', type: 'password' },
          domain: { label: 'Zoho Domain', placeholder: 'com, eu, in, etc.', type: 'text' }
        },
        syncOptions: [
          { id: 'leads', label: 'Leads', description: 'Sync lead information' },
          { id: 'contacts', label: 'Contacts', description: 'Sync contact records' },
          { id: 'accounts', label: 'Accounts', description: 'Sync account data' },
          { id: 'deals', label: 'Deals', description: 'Sync sales opportunities' },
          { id: 'campaigns', label: 'Campaigns', description: 'Sync marketing campaigns' }
        ]
      },
      stripe: {
        steps: [
          { title: 'API Configuration', description: 'Enter Stripe API credentials' },
          { title: 'Webhook Setup', description: 'Configure event notifications' },
          { title: 'Test Payments', description: 'Verify payment data sync' }
        ],
        fields: {
          publishableKey: { label: 'Publishable Key', placeholder: 'pk_live_...', type: 'text' },
          secretKey: { label: 'Secret Key', placeholder: 'sk_live_...', type: 'password' },
          webhookSecret: { label: 'Webhook Endpoint Secret', placeholder: 'whsec_...', type: 'password' }
        },
        syncOptions: [
          { id: 'customers', label: 'Customers', description: 'Sync customer profiles' },
          { id: 'subscriptions', label: 'Subscriptions', description: 'Sync subscription data' },
          { id: 'invoices', label: 'Invoices', description: 'Sync billing information' },
          { id: 'payments', label: 'Payments', description: 'Sync payment transactions' },
          { id: 'disputes', label: 'Disputes', description: 'Sync chargeback data' }
        ]
      },
      mailchimp: {
        steps: [
          { title: 'API Key Setup', description: 'Connect with Mailchimp API' },
          { title: 'Select Lists', description: 'Choose which audiences to sync' },
          { title: 'Campaign Tracking', description: 'Enable engagement tracking' }
        ],
        fields: {
          apiKey: { label: 'API Key', placeholder: 'Your Mailchimp API key', type: 'password' },
          serverPrefix: { label: 'Server Prefix', placeholder: 'us1, us2, etc.', type: 'text' }
        },
        syncOptions: [
          { id: 'audiences', label: 'Audiences', description: 'Sync mailing lists' },
          { id: 'campaigns', label: 'Campaigns', description: 'Track email campaigns' },
          { id: 'automations', label: 'Automations', description: 'Sync automation workflows' },
          { id: 'reports', label: 'Reports', description: 'Import campaign analytics' }
        ]
      },
      'google-analytics': {
        steps: [
          { title: 'Google OAuth', description: 'Authorize Google Analytics access' },
          { title: 'Property Selection', description: 'Choose GA4 properties to track' },
          { title: 'Event Configuration', description: 'Set up custom events' }
        ],
        fields: {
          propertyId: { label: 'GA4 Property ID', placeholder: 'Your Google Analytics 4 property ID', type: 'text' },
          measurementId: { label: 'Measurement ID', placeholder: 'G-XXXXXXXXXX', type: 'text' }
        },
        syncOptions: [
          { id: 'pageviews', label: 'Page Views', description: 'Track user page views' },
          { id: 'events', label: 'Custom Events', description: 'Track custom user events' },
          { id: 'conversions', label: 'Conversions', description: 'Track goal completions' },
          { id: 'audiences', label: 'Audiences', description: 'Sync user segments' },
          { id: 'ecommerce', label: 'E-commerce', description: 'Track purchase events' }
        ]
      }
    };
    return ((configs as unknown) as Record<string, typeof configs.salesforce>)[type.toLowerCase()] || configs.salesforce;
  };

  const config = getIntegrationConfig(integration.id);

  const handleSyncOptionToggle = (optionId: string) => {
    const newSet = new Set(selectedSyncOptions);
    if (newSet.has(optionId)) {
      newSet.delete(optionId);
    } else {
      newSet.add(optionId);
    }
    setSelectedSyncOptions(newSet);
  };

  const onSubmit = async (data: FieldValues) => {
    setIsConnecting(true);
    try {
      await onConnect(integration.id, integration.name, {
        ...data,
        syncOptions: Array.from(selectedSyncOptions)
      });
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Connect {integration.name}
              </h3>
              <p className="text-text-muted">
                Enter your {integration.name} credentials to establish the connection
              </p>
            </div>

            <div className="space-y-4">
              {Object.entries(config.fields as { [key: string]: { label: string; placeholder: string; type: string } }).map(([key, field]) => (
                <Input
                  key={key}
                  label={field.label}
                  type={field.type}
                  placeholder={field.placeholder}
                  registration={register(key, { required: `${field.label} is required` })}
                  error={errors[key] as FieldError | undefined}
                />
              ))}
            </div>

            {/* Special OAuth instructions for certain integrations */}
            {integration.id === 'hubspot' && (
              <div className="bg-warning/20 p-4 rounded-lg border border-warning/30">
                <h4 className="text-warning-muted font-medium mb-2">OAuth Setup Required</h4>
                <p className="text-warning text-sm mb-3">
                  HubSpot uses OAuth for secure authentication. Click below to authorize PulseLTV.
                </p>
                <Button className="bg-warning hover:bg-warning text-text-primary">
                  Authorize with HubSpot
                </Button>
              </div>
            )}

            {integration.id === 'google-analytics' && (
              <div className="bg-accent-primary/20 p-4 rounded-lg border border-accent-primary/30">
                <h4 className="text-accent-primary font-medium mb-2">Google OAuth Required</h4>
                <p className="text-accent-primary text-sm mb-3">
                  Connect your Google account to access Analytics data.
                </p>
                <Button className="bg-accent-primary hover:bg-accent-primary text-text-primary">
                  Sign in with Google
                </Button>
              </div>
            )}

            {integration.id === 'stripe' && (
              <div className="bg-accent-secondary/20 p-4 rounded-lg border border-accent-secondary/30">
                <h4 className="text-accent-secondary font-medium mb-2">Webhook Configuration</h4>
                <p className="text-accent-secondary text-sm mb-2">
                  Add this endpoint URL to your Stripe webhook settings:
                </p>
                <code className="block bg-surface-primary p-2 rounded text-sm text-success-muted border border-border-primary">
                  https://your-domain.com/api/webhooks/stripe
                </code>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Configure Data Sync
              </h3>
              <p className="text-text-muted">
                Choose which data objects to sync from {integration.name}
              </p>
            </div>

            <div className="space-y-3">
              {config.syncOptions.map((option: { id: string; label: string; description: string }) => (
                <div
                  key={option.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedSyncOptions.has(option.id)
                      ? 'bg-accent-primary/20 border-accent-primary/50 text-accent-primary'
                      : 'bg-surface-secondary/30 border-border-primary/50 hover:bg-surface-secondary/50 text-text-primary'
                  }`}
                  onClick={() => handleSyncOptionToggle(option.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedSyncOptions.has(option.id)}
                        onChange={() => handleSyncOptionToggle(option.id)}
                        className="w-4 h-4 text-accent-primary bg-surface-secondary border-border-primary rounded focus:ring-accent-primary"
                      />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-text-muted">{option.description}</div>
                      </div>
                    </div>
                    {selectedSyncOptions.has(option.id) && (
                      <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-accent-secondary/20 p-4 rounded-lg border border-accent-secondary/30">
              <h4 className="text-accent-secondary font-medium mb-2">Sync Frequency</h4>
              <select 
                {...register('syncFrequency')}
                className="w-full bg-surface-secondary/50 border border-border-primary/50 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-secondary/50"
              >
                <option value="realtime">Real-time (recommended)</option>
                <option value="hourly">Every hour</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            {selectedSyncOptions.size === 0 && (
              <div className="bg-warning/20 p-4 rounded-lg border border-warning/30">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-warning-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-warning-muted font-medium">Please select at least one data object to sync</span>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Test Connection
              </h3>
              <p className="text-text-muted">
                Verify that the integration is working correctly
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-success/20 p-4 rounded-lg border border-success/30">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-success-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <div className="text-success-muted font-medium">Connection Successful</div>
                    <div className="text-success text-sm">Successfully authenticated with {integration.name}</div>
                  </div>
                </div>
              </div>

              <div className="bg-accent-primary/20 p-4 rounded-lg border border-accent-primary/30">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <div>
                    <div className="text-accent-primary font-medium">Initial Sync Started</div>
                    <div className="text-accent-primary text-sm">Syncing {selectedSyncOptions.size} data objects</div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-secondary/30 p-4 rounded-lg border border-border-primary/50">
                <h4 className="text-text-primary font-medium mb-3">Sync Preview</h4>
                <div className="space-y-2 text-sm">
                  {Array.from(selectedSyncOptions).map(optionId => {
                    const option = config.syncOptions.find((o: { id: string; label: string; description: string }) => o.id === optionId);
                    return (
                      <div key={optionId} className="flex justify-between text-text-secondary">
                        <span>{option?.label}</span>
                        <span className="text-success-muted">✓ Ready</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-accent-secondary/20 p-4 rounded-lg border border-accent-secondary/30">
                <h4 className="text-accent-secondary font-medium mb-2">What happens next?</h4>
                <ul className="text-accent-secondary text-sm space-y-1">
                  <li>• Data will start syncing within the next few minutes</li>
                  <li>• You'll receive a notification when the initial sync is complete</li>
                  <li>• Check the integrations page to monitor sync status</li>
                  <li>• Historical data from the last 90 days will be imported</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-bg-primary/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-secondary/95 backdrop-blur-lg rounded-2xl border border-border-primary/50 shadow-2xl w-full max-w-2xl h-[95vh] min-h-[500px] max-h-[800px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-primary/50 flex-shrink-0">
          <div className="flex items-center gap-4">
            {integration.icon}
            <div>
              <h2 className="text-xl font-bold text-text-primary">Setup {integration.name}</h2>
              <p className="text-sm text-text-muted">{integration.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary/50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-border-primary/50 flex-shrink-0">
          <div className="flex items-center">
            {config.steps.map((step: { title: string; description: string }, index: number) => (
              <div key={index} className="flex items-center flex-1">
                <div className={`flex items-center gap-3 ${index < config.steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    currentStep > index + 1
                      ? 'bg-success border-success text-text-primary'
                      : currentStep === index + 1
                      ? 'bg-accent-primary border-accent-primary text-text-primary'
                      : 'bg-surface-secondary border-border-primary text-text-muted'
                  }`}>
                    {currentStep > index + 1 ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <div className={`text-sm font-medium ${
                      currentStep >= index + 1 ? 'text-text-primary' : 'text-text-muted'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-text-muted">{step.description}</div>
                  </div>
                </div>
                {index < config.steps.length - 1 && (
                  <div className={`hidden sm:block flex-1 h-px mx-4 ${
                    currentStep > index + 1 ? 'bg-success' : 'bg-border-primary'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border-primary/50 flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
            className="border-border-primary/50 hover:border-border-primary/70"
          >
            {currentStep > 1 ? 'Previous' : 'Cancel'}
          </Button>

          <div className="flex gap-3">
            {currentStep < config.steps.length ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={currentStep === 2 && selectedSyncOptions.size === 0}
                className="bg-gradient-to-r from-accent-primary to-accent-secondary hover:from-accent-primary hover:to-accent-secondary"
              >
                Next Step
              </Button>
            ) : (
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={isConnecting}
                isLoading={isConnecting}
                className="bg-gradient-to-r from-success to-success-muted hover:from-success hover:to-success-muted"
              >
                {isConnecting ? 'Connecting...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};