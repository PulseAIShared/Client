// src/features/settings/components/integrations-section.tsx
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { 
  useGetIntegrations, 
  useGetIntegrationStats,
  useConnectIntegration,
  useDisconnectIntegration,
  useSyncIntegration,
  useStartConnection,
} from '../api/integrations';
import { useNotifications } from '@/components/ui/notifications';
import { Integration, IntegrationStatusResponse, IntegrationType } from '@/types/api';
import { IntegrationSetupModal } from './integration-setup-modal';
import { useModal } from '@/app/modal-provider';
import { api } from '@/lib/api-client';
import { useAuthorization, CompanyAuthorization } from '@/lib/authorization';

interface IntegrationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'crm' | 'email' | 'payment' | 'analytics';
  icon: React.ReactNode;
  features: string[];
  setupComplexity: 'Easy' | 'Medium' | 'Advanced';
}

// Define API response types
interface HubSpotTestConnectionResponse {
  isConnected: boolean;
  status: string;
}

interface HubSpotConnectResponse {
  authorizationUrl: string;
}

interface HubSpotSyncResponse {
  totalRecords: number;
  message: string;
}

export const IntegrationsSection = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'crm' | 'email' | 'payment' | 'analytics'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationTemplate | null>(null);
  const { openModal, closeModal } = useModal();
  const { checkCompanyPolicy } = useAuthorization();

  const { addNotification } = useNotifications();
  
  // Hooks
  const { data: integrations = [], isLoading, error, refetch } = useGetIntegrations();

  console.log(integrations);
  const { data: stats } = useGetIntegrationStats();
  const connectMutation = useConnectIntegration({
    onSuccess: () => {
      addNotification({ type: 'success', title: 'Integration connected successfully' });
      refetch(); // This will refresh the integrations from the server
    },
    onError: () => {
      addNotification({ type: 'error', title: 'Failed to connect integration' });
    }
  });
  const disconnectMutation = useDisconnectIntegration({
    onSuccess: () => {
      addNotification({ type: 'success', title: 'Integration disconnected successfully' });
      refetch(); // This will refresh the integrations from the server
    },
    onError: () => {
      addNotification({ type: 'error', title: 'Failed to disconnect integration' });
    }
  });
  const syncMutation = useSyncIntegration({
    onSuccess: () => {
      addNotification({ type: 'success', title: 'Integration synced successfully' });
      refetch(); // This will refresh the integrations from the server
    },
    onError: () => {
      addNotification({ type: 'error', title: 'Failed to sync integration' });
    }
  });

  const startConnectionMutation = useStartConnection({
    onSuccess: (result) => {
      // Redirect to OAuth provider
      window.location.href = result.authorizationUrl;
    },
    onError: (error) => {
      addNotification({ 
        type: 'error', 
        title: 'Failed to start connection',
        message: error instanceof Error ? error.message : 'OAuth flow failed to start'
      });
    }
  });

  // Add real-time refresh capabilities
  const refreshIntegrations = () => {
    refetch();
  };

  // Auto-refresh every 30 seconds when user is active
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const integrationTemplates: IntegrationTemplate[] = useMemo(() => [
      {
        id: 'salesforce',
        name: 'Salesforce',
        description: 'Sync customer data, lead scores, and opportunity information for enhanced churn prediction.',
        category: 'crm',
        setupComplexity: 'Medium',
        features: ['Customer Data Sync', 'Lead Scoring', 'Opportunity Tracking', 'Real-time Updates'],
        icon: (
          <div className="w-12 h-12 bg-gradient-to-r from-accent-primary to-accent-primary rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.5 0a5.5 5.5 0 00-5.5 5.5v.5H5a5 5 0 00-5 5v8a5 5 0 005 5h14a5 5 0 005-5v-8a5 5 0 00-5-5h-1v-.5A5.5 5.5 0 0012.5 0h-1zm0 2h1a3.5 3.5 0 013.5 3.5V6h-8v-.5A3.5 3.5 0 0111.5 2zM5 8h14a3 3 0 013 3v8a3 3 0 01-3 3H5a3 3 0 01-3-3v-8a3 3 0 013-3z"/>
            </svg>
          </div>
        )
      },
      {
        id: 'hubspot',
        name: 'HubSpot',
        description: 'Connect your HubSpot CRM to automatically sync contacts, deals, and engagement metrics using secure OAuth authentication.',
        category: 'crm',
        setupComplexity: 'Easy',
        features: ['OAuth Security', 'Contact Management', 'Deal Pipeline', 'Email Tracking', 'Marketing Automation'],
        icon: (
          <div className="w-12 h-12 bg-gradient-to-r from-warning to-error rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-text-primary" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="6" r="4"/>
              <circle cx="6" cy="18" r="4"/>
              <circle cx="18" cy="18" r="4"/>
              <path d="M8.5 14.5l7-7M15.5 14.5l-7-7"/>
            </svg>
          </div>
        )
      },
      {
        id: 'pipedrive',
        name: 'Pipedrive',
        description: 'Integrate your sales pipeline data to enhance customer lifecycle predictions.',
        category: 'crm',
        setupComplexity: 'Easy',
        features: ['Pipeline Management', 'Activity Tracking', 'Custom Fields', 'Sales Reporting'],
        icon: (
          <div className="w-12 h-12 bg-gradient-to-r from-success to-success-muted rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
            </svg>
          </div>
        )
      },
      {
        id: 'stripe',
        name: 'Stripe',
        description: 'Sync payment data, subscription status, and billing events for revenue tracking.',
        category: 'payment',
        setupComplexity: 'Medium',
        features: ['Payment Processing', 'Subscription Management', 'Billing Events', 'Revenue Analytics'],
        icon: (
          <div className="w-12 h-12 bg-gradient-to-r from-accent-secondary to-info rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        )
      },
      {
        id: 'mailchimp',
        name: 'Mailchimp',
        description: 'Connect email campaign data to analyze customer engagement patterns.',
        category: 'email',
        setupComplexity: 'Easy',
        features: ['Email Campaigns', 'Audience Segmentation', 'Open/Click Tracking', 'Automation Workflows'],
        icon: (
          <div className="w-12 h-12 bg-gradient-to-r from-warning-muted to-warning rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </div>
        )
      },
      {
        id: 'google-analytics',
        name: 'Google Analytics',
        description: 'Track user behavior and engagement metrics to improve churn prediction accuracy.',
        category: 'analytics',
        setupComplexity: 'Medium',
        features: ['User Behavior', 'Conversion Tracking', 'Event Analytics', 'Audience Insights'],
        icon: (
          <div className="w-12 h-12 bg-gradient-to-r from-accent-primary to-success rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
        )
      }
  ], []);

  const categories = [
    { id: 'all' as const, label: 'All Integrations', count: integrationTemplates.length },
    { id: 'crm' as const, label: 'CRM Systems', count: integrationTemplates.filter(i => i.category === 'crm').length },
    { id: 'email' as const, label: 'Email Marketing', count: integrationTemplates.filter(i => i.category === 'email').length },
    { id: 'payment' as const, label: 'Payment Processing', count: integrationTemplates.filter(i => i.category === 'payment').length },
    { id: 'analytics' as const, label: 'Analytics', count: integrationTemplates.filter(i => i.category === 'analytics').length }
  ];

  const filteredTemplates = useMemo(() => {
    return integrationTemplates.filter(template => {
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [integrationTemplates, selectedCategory, searchTerm]);

  const getIntegrationStatus = (templateId: string): IntegrationStatusResponse | undefined => {
    return integrations.find(integration => 
      integration.type.toLowerCase() === templateId.toLowerCase()
    );
  };

  // HubSpot-specific test connection function
  const testHubSpotConnection = async (integrationId: string) => {
    try {
      const result = await api.post(`/integrations/hubspot/${integrationId}/test`) as HubSpotTestConnectionResponse;
      
      addNotification({
        type: result.isConnected ? 'success' : 'warning',
        title: result.isConnected ? 'Connection successful' : 'Connection test failed',
        message: `Status: ${result.status}`
      });
      
      if (result.isConnected) {
        refetch(); // Refresh integrations to update status
      }
    } catch (error: unknown) {
      console.error('Test connection failed:', error);
      addNotification({
        type: 'error',
        title: 'Failed to test connection',
        message: error instanceof Error ? error.message : 'Please try again'
      });
    }
  };

  // Map template IDs to IntegrationType enum values
  const getIntegrationType = (templateId: string): IntegrationType | null => {
    const typeMap: Record<string, IntegrationType> = {
      'hubspot': IntegrationType.HubSpot,
      'salesforce': IntegrationType.Salesforce,
      'mailchimp': IntegrationType.Mailchimp,
      'stripe': IntegrationType.Stripe,
      'slack': IntegrationType.Slack
    };
    return typeMap[templateId.toLowerCase()] || null;
  };

  const handleConnect = async (templateId: string, templateName: string): Promise<void> => {
    const integrationType = getIntegrationType(templateId);
    
    if (!integrationType) {
      addNotification({
        type: 'error',
        title: 'Integration not supported',
        message: `${templateName} is not yet available for connection.`
      });
      return;
    }

    // Start OAuth flow for all supported integrations
    try {
      addNotification({
        type: 'info',
        title: 'Starting connection...',
        message: `Redirecting to ${templateName} for authorization.`
      });
      
      await startConnectionMutation.mutateAsync(integrationType);
    } catch (error: unknown) {
      console.error(`Failed to start ${templateName} OAuth:`, error);
      // Error notification is handled by the mutation's onError callback
    }
  };

  interface ConnectionConfig {
    syncOptions?: Record<string, unknown>[];
    [key: string]: unknown;
  }

  interface HandleConnectionComplete {
    (integrationId: string, integrationName: string, config: ConnectionConfig): Promise<void>;
  }

  const handleConnectionComplete: HandleConnectionComplete = async (integrationId, integrationName, config) => {
    try {
      await connectMutation.mutateAsync({
        type: integrationId,
        name: integrationName
      });
      
      addNotification({ 
        type: 'success', 
        title: `${integrationName} connected successfully`,
        message: `Started syncing ${config.syncOptions?.length || 0} data objects`
      });
      
      refetch();
      closeModal();
      setSelectedIntegration(null);
      
    } catch (error: unknown) {
      console.error('Connection failed:', error);
      addNotification({ 
        type: 'error', 
        title: `Failed to connect ${integrationName}`,
        message: error instanceof Error ? error.message : 'Please check your credentials and try again'
      });
      throw error;
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    try {
      // Find the integration to determine the type
      const integration = integrations.find(i => i.id === integrationId);
      if (!integration) return;

      if (integration.type.toLowerCase() === 'hubspot') {
        // Use HubSpot-specific disconnect endpoint
        await api.delete(`/integrations/hubspot/${integrationId}`);
      } else {
        // Use generic disconnect endpoint for other integrations
        await disconnectMutation.mutateAsync(integrationId);
      }
      
      addNotification({
        type: 'success',
        title: `${integration.name} disconnected successfully`
      });
      
      refetch();
    } catch (error: unknown) {
      console.error('Disconnect failed:', error);
      addNotification({
        type: 'error',
        title: 'Failed to disconnect integration',
        message: error instanceof Error ? error.message : 'Please try again'
      });
    }
  };

  const handleSync = async (integrationId: string) => {
    try {
      // Find the integration to determine the type
      const integration = integrations.find(i => i.id === integrationId);
      if (!integration) return;

      if (integration.type.toLowerCase() === 'hubspot') {
        // Use HubSpot-specific sync endpoint
        const response = await api.post(`/integrations/hubspot/${integrationId}/sync`, {
          incrementalSync: true,
          syncFromDate: null
        }) as HubSpotSyncResponse;
        
        addNotification({
          type: 'success',
          title: 'HubSpot sync started',
          message: `Processing ${response.totalRecords} records...`
        });
      } else {
        // Use generic sync endpoint for other integrations
        await syncMutation.mutateAsync({ integrationId });
      }
      
      refetch();
    } catch (error: unknown) {
      console.error('Sync failed:', error);
      addNotification({
        type: 'error',
        title: 'Failed to sync integration',
        message: error instanceof Error ? error.message : 'Please try again'
      });
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats Loading */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-surface-secondary/30 backdrop-blur-lg p-6 rounded-xl border border-border-primary/50 animate-pulse">
              <div className="h-6 bg-surface-secondary rounded mb-2"></div>
              <div className="h-8 bg-surface-secondary rounded"></div>
            </div>
          ))}
        </div>

        {/* Search and Filters Loading */}
        <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg animate-pulse">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 h-12 bg-surface-secondary rounded"></div>
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-10 w-24 bg-surface-secondary rounded"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Integrations Grid Loading */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-surface-secondary/30 backdrop-blur-lg p-6 rounded-xl border border-border-primary/50 animate-pulse">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface-secondary rounded-xl"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-surface-secondary rounded w-3/4"></div>
                    <div className="h-3 bg-surface-secondary rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-16 bg-surface-secondary rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg">
        <div className="text-center py-8">
          <div className="text-error-muted mb-2">Failed to load integrations</div>
          <div className="text-text-muted text-sm">Please try refreshing the page</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-success/20 to-success-muted/20 backdrop-blur-lg p-6 rounded-xl border border-success/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-success-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-success-muted">{stats?.connectedCount || 0}</div>
              <div className="text-sm text-success">Connected Integrations</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 backdrop-blur-lg p-6 rounded-xl border border-accent-primary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-primary/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10l1 16H6L7 4z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent-primary">{stats?.totalRecordsSynced?.toLocaleString() || '0'}</div>
              <div className="text-sm text-accent-primary">Total Records Synced</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-accent-secondary/20 to-accent-secondary/30 backdrop-blur-lg p-6 rounded-xl border border-accent-secondary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-secondary/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent-secondary">{stats?.lastSyncTime || 'Never'}</div>
              <div className="text-sm text-accent-secondary">Last Sync</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Search integrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-secondary/50 border border-border-primary/50 rounded-lg px-4 py-3 pl-10 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 transition-all"
            />
            <svg className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={refreshIntegrations}
              disabled={isLoading}
              className="px-3 py-2 bg-surface-secondary/50 text-text-secondary hover:text-text-primary hover:bg-surface-secondary/70 rounded-lg transition-all duration-200 border border-border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh integrations"
            >
              <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-accent-primary/30 to-accent-secondary/30 text-accent-primary border border-accent-primary/30'
                      : 'bg-surface-secondary/50 text-text-secondary hover:bg-surface-secondary/70 border border-border-primary/50'
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTemplates.map((template) => {
          const integration = getIntegrationStatus(template.id);
          const isConnected = integration?.status === 'Connected';
          
          return (
            <div
              key={template.id}
              className="group bg-surface-secondary/30 backdrop-blur-lg p-6 rounded-xl border border-border-primary/50 hover:border-border-primary/70 transition-all duration-300 hover:shadow-lg"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {template.icon}
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
                      {template.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isConnected
                          ? 'bg-success/20 text-success-muted border border-success/30'
                          : 'bg-surface-secondary/50 text-text-muted border border-border-primary/50'
                      }`}>
                        {isConnected ? 'Connected' : 'Not Connected'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        template.setupComplexity === 'Easy' ? 'bg-success/20 text-success-muted' :
                        template.setupComplexity === 'Medium' ? 'bg-warning/20 text-warning-muted' :
                        'bg-error/20 text-error-muted'
                      }`}>
                        {template.setupComplexity} Setup
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {isConnected ? (
                    <>
                      {template.id === 'hubspot' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testHubSpotConnection(integration!.id)}
                            className="border-border-primary/50 hover:border-accent-primary/50 hover:text-accent-primary"
                          >
                            Test Connection
                          </Button>
                          <CompanyAuthorization policyCheck={checkCompanyPolicy('integrations:write')}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSync(integration!.id)}
                              disabled={syncMutation.isPending}
                              className="border-border-primary/50 hover:border-accent-primary/50 hover:text-accent-primary"
                            >
                              {syncMutation.isPending ? 'Syncing...' : 'Sync'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDisconnect(integration!.id)}
                              disabled={disconnectMutation.isPending}
                              className="border-border-primary/50 hover:border-error/50 hover:text-error-muted"
                            >
                              {disconnectMutation.isPending ? 'Disconnecting...' : 'Disconnect'}
                            </Button>
                          </CompanyAuthorization>
                        </>
                      ) : (
                        <>
                          <CompanyAuthorization policyCheck={checkCompanyPolicy('integrations:write')}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSync(integration!.id)}
                              disabled={syncMutation.isPending}
                              className="border-border-primary/50 hover:border-accent-primary/50 hover:text-accent-primary"
                            >
                              {syncMutation.isPending ? 'Syncing...' : 'Sync'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDisconnect(integration!.id)}
                              disabled={disconnectMutation.isPending}
                              className="border-border-primary/50 hover:border-error/50 hover:text-error-muted"
                            >
                              {disconnectMutation.isPending ? 'Disconnecting...' : 'Disconnect'}
                            </Button>
                          </CompanyAuthorization>
                        </>
                      )}
                    </>
                  ) : (
                    <CompanyAuthorization policyCheck={checkCompanyPolicy('integrations:write')}>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleConnect(template.id, template.name)}
                        disabled={startConnectionMutation.isPending}
                        className="bg-gradient-to-r from-accent-primary to-accent-secondary hover:from-accent-primary hover:to-accent-secondary"
                      >
                        {startConnectionMutation.isPending ? 'Connecting...' : 'Connect'}
                      </Button>
                    </CompanyAuthorization>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                {template.description}
              </p>

              {/* Connection Details */}
              {isConnected && integration && (
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-text-muted">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{integration.syncedRecordCount.toLocaleString()} records</span>
                  </div>
                  {integration.lastSyncedAt && (
                    <div className="flex items-center gap-2 text-text-muted">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Last sync: {formatTimeAgo(integration.lastSyncedAt)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Features */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-text-secondary">Key Features:</h4>
                <div className="flex flex-wrap gap-2">
                  {template.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-surface-secondary/50 text-text-secondary rounded-md text-xs border border-border-primary/50"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-text-muted mb-2">No integrations found</div>
          <div className="text-sm text-text-muted">Try adjusting your search or filter criteria</div>
        </div>
      )}

      {/* Bottom CTA Section */}
      <div className="bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 backdrop-blur-lg p-8 rounded-2xl border border-accent-primary/30 mt-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-text-primary mb-4">
            Need a Custom Integration?
          </h3>
          <p className="text-text-secondary mb-6 max-w-2xl mx-auto">
            Don't see your system listed? Our team can help you build custom integrations to connect any data source with PulseLTV's churn prediction engine.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CompanyAuthorization policyCheck={checkCompanyPolicy('integrations:write')}>
              <Button className="bg-gradient-to-r from-accent-primary to-accent-secondary hover:from-accent-primary hover:to-accent-secondary">
                Request Custom Integration
              </Button>
            </CompanyAuthorization>
            <Button variant="outline" className="border-border-primary/50 hover:border-accent-primary/50 hover:text-accent-primary">
              View API Documentation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};