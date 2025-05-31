import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig, QueryConfig } from '@/lib/react-query';

interface Integration {
  id: string;
  type: string;
  name: string;
  status: string;
  lastSyncedAt?: string;
  syncedRecordCount: number;
  configuration?: Record<string, unknown>;
}

// Mock data
const mockIntegrations: Integration[] = [
  {
    id: '1',
    type: 'Salesforce',
    name: 'Salesforce CRM',
    status: 'Connected',
    lastSyncedAt: '2024-03-15T10:30:00Z',
    syncedRecordCount: 12450
  },
  {
    id: '2',
    type: 'Stripe',
    name: 'Stripe Payments',
    status: 'Connected',
    lastSyncedAt: '2024-03-15T10:15:00Z',
    syncedRecordCount: 9870
  }
];

// Get all integrations
export const getIntegrations = async ({ 
  type, 
  status 
}: { 
  type?: string; 
  status?: string; 
} = {}): Promise<Integration[]> => {
  // TODO: Replace with actual API call when backend is ready
  // return api.get(`/integrations?type=${type}&status=${status}`);
  return mockIntegrations;
};

export const getIntegrationsQueryOptions = (params?: { type?: string; status?: string }) => {
  return {
    queryKey: ['integrations', params],
    queryFn: () => getIntegrations(params),
  };
};

export const useGetIntegrations = (
  params?: { type?: string; status?: string },
  queryConfig?: QueryConfig<typeof getIntegrationsQueryOptions>
) => {
  return useQuery({
    ...getIntegrationsQueryOptions(params),
    ...queryConfig,
  });
};

// Get integration by ID
export const getIntegrationById = async ({ integrationId }: { integrationId: string }): Promise<Integration> => {
  // TODO: Replace with actual API call when backend is ready
  // return api.get(`/integrations/${integrationId}`);
  const integration = mockIntegrations.find(i => i.id === integrationId);
  if (!integration) {
    throw new Error('Integration not found');
  }
  return integration;
};

export const getIntegrationByIdQueryOptions = (integrationId: string) => {
  return {
    queryKey: ['integrations', integrationId],
    queryFn: () => getIntegrationById({ integrationId }),
    enabled: !!integrationId,
  };
};

export const useGetIntegrationById = (integrationId: string, queryConfig?: QueryConfig<typeof getIntegrationByIdQueryOptions>) => {
  return useQuery({
    ...getIntegrationByIdQueryOptions(integrationId),
    ...queryConfig,
  });
};

// Create integration
export const createIntegration = async (data: {
  type: string;
  name: string;
  configuration?: Record<string, unknown>;
}): Promise<Integration> => {
  return api.post('/integrations', data);
};

type UseCreateIntegrationOptions = {
  mutationConfig?: MutationConfig<typeof createIntegration>;
};

export const useCreateIntegration = ({ mutationConfig }: UseCreateIntegrationOptions = {}) => {
  return useMutation({
    mutationFn: createIntegration,
    ...mutationConfig,
  });
};
