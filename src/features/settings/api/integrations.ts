// src/features/settings/api/integrations.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig, QueryConfig } from '@/lib/react-query';
import { Integration, IntegrationStats } from '@/types/api';
import { mockIntegrations, mockIntegrationStats } from './mock-data';

// API Functions
export const getIntegrations = async ({ 
  type, 
  status 
}: { 
  type?: string; 
  status?: string; 
} = {}): Promise<Integration[]> => {
  // TODO: Replace with actual API call when backend is ready
  // return api.get(`/integrations?type=${type}&status=${status}`);
  
  let filtered = mockIntegrations;
  
  if (type && type !== 'all') {
    filtered = filtered.filter(integration => 
      integration.type.toLowerCase() === type.toLowerCase()
    );
  }
  
  if (status && status !== 'all') {
    filtered = filtered.filter(integration => 
      integration.status.toLowerCase() === status.toLowerCase()
    );
  }
  
  return filtered;
};

export const getIntegrationStats = async (): Promise<IntegrationStats> => {
  // TODO: Replace with actual API call when backend is ready
  // return api.get('/integrations/stats');
  return mockIntegrationStats;
};

export const getIntegrationById = async ({ integrationId }: { integrationId: string }): Promise<Integration> => {
  // TODO: Replace with actual API call when backend is ready
  // return api.get(`/integrations/${integrationId}`);
  const integration = mockIntegrations.find(i => i.id === integrationId);
  if (!integration) {
    throw new Error('Integration not found');
  }
  return integration;
};

export const connectIntegration = async (data: {
  type: string;
  name: string;
  configuration?: Record<string, unknown>;
}): Promise<Integration> => {
  // TODO: Replace with actual API call when backend is ready
  // return api.post('/integrations/connect', data);
  
  // Mock implementation
  const newIntegration: Integration = {
    id: Date.now().toString(),
    type: data.type,
    name: data.name,
    status: 'Connected',
    lastSyncedAt: new Date().toISOString(),
    syncedRecordCount: Math.floor(Math.random() * 10000),
    configuration: data.configuration
  };
  
  return newIntegration;
};

export const disconnectIntegration = async ({ integrationId }: { integrationId: string }): Promise<void> => {
  // TODO: Replace with actual API call when backend is ready
  // return api.post(`/integrations/${integrationId}/disconnect`);
  
  // Mock implementation - just return success
  return Promise.resolve();
};

export const syncIntegration = async ({ integrationId }: { integrationId: string }): Promise<Integration> => {
  // TODO: Replace with actual API call when backend is ready
  // return api.post(`/integrations/${integrationId}/sync`);
  
  // Mock implementation
  const integration = mockIntegrations.find(i => i.id === integrationId);
  if (!integration) {
    throw new Error('Integration not found');
  }
  
  return {
    ...integration,
    lastSyncedAt: new Date().toISOString(),
    syncedRecordCount: integration.syncedRecordCount + Math.floor(Math.random() * 100)
  };
};

export const updateIntegration = async ({ 
  integrationId, 
  ...data 
}: { 
  integrationId: string; 
  name?: string;
  configuration?: Record<string, unknown>;
}): Promise<Integration> => {
  // TODO: Replace with actual API call when backend is ready
  // return api.put(`/integrations/${integrationId}`, data);
  
  const integration = mockIntegrations.find(i => i.id === integrationId);
  if (!integration) {
    throw new Error('Integration not found');
  }
  
  return {
    ...integration,
    ...data
  };
};

// Query Options
export const getIntegrationsQueryOptions = (params?: { type?: string; status?: string }) => ({
  queryKey: ['integrations', params],
  queryFn: () => getIntegrations(params),
});

export const getIntegrationStatsQueryOptions = () => ({
  queryKey: ['integrations', 'stats'],
  queryFn: () => getIntegrationStats(),
});

export const getIntegrationByIdQueryOptions = (integrationId: string) => ({
  queryKey: ['integrations', integrationId],
  queryFn: () => getIntegrationById({ integrationId }),
  enabled: !!integrationId,
});

// Hooks
export const useGetIntegrations = (
  params?: { type?: string; status?: string },
  queryConfig?: QueryConfig<typeof getIntegrationsQueryOptions>
) => {
  return useQuery({
    ...getIntegrationsQueryOptions(params),
    ...queryConfig,
  });
};

export const useGetIntegrationStats = (queryConfig?: QueryConfig<typeof getIntegrationStatsQueryOptions>) => {
  return useQuery({
    ...getIntegrationStatsQueryOptions(),
    ...queryConfig,
  });
};

export const useGetIntegrationById = (integrationId: string, queryConfig?: QueryConfig<typeof getIntegrationByIdQueryOptions>) => {
  return useQuery({
    ...getIntegrationByIdQueryOptions(integrationId),
    ...queryConfig,
  });
};

// Mutations
type UseConnectIntegrationOptions = {
  mutationConfig?: MutationConfig<typeof connectIntegration>;
};

export const useConnectIntegration = ({ mutationConfig }: UseConnectIntegrationOptions = {}) => {
  return useMutation({
    mutationFn: connectIntegration,
    ...mutationConfig,
  });
};

type UseDisconnectIntegrationOptions = {
  mutationConfig?: MutationConfig<typeof disconnectIntegration>;
};

export const useDisconnectIntegration = ({ mutationConfig }: UseDisconnectIntegrationOptions = {}) => {
  return useMutation({
    mutationFn: disconnectIntegration,
    ...mutationConfig,
  });
};

type UseSyncIntegrationOptions = {
  mutationConfig?: MutationConfig<typeof syncIntegration>;
};

export const useSyncIntegration = ({ mutationConfig }: UseSyncIntegrationOptions = {}) => {
  return useMutation({
    mutationFn: syncIntegration,
    ...mutationConfig,
  });
};

type UseUpdateIntegrationOptions = {
  mutationConfig?: MutationConfig<typeof updateIntegration>;
};

export const useUpdateIntegration = ({ mutationConfig }: UseUpdateIntegrationOptions = {}) => {
  return useMutation({
    mutationFn: updateIntegration,
    ...mutationConfig,
  });
};