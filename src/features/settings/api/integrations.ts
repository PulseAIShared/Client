// src/features/settings/api/integrations.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig, QueryConfig } from '@/lib/react-query';
import { 
  Integration, 
  IntegrationStats, 
  IntegrationStatusResponse,
  IntegrationType,
  IntegrationStatus,
  ConfigurationOptions,
  StartConnectionResult,
  OAuthCallbackRequest,
  HandleCallbackResult,
  SyncConfigRequest,
  ConfigureIntegrationResult,
  ReconnectIntegrationResult,
  TestConnectionResult,
  TriggerSyncResult,
  DisconnectIntegrationResult
} from '@/types/api';
import { mockIntegrations } from './mock-data';

// API Functions
export const getIntegrations = async ({ 
  type, 
  status 
}: { 
  type?: IntegrationType; 
  status?: IntegrationStatus; 
} = {}): Promise<IntegrationStatusResponse[]> => {
  const queryParams = new URLSearchParams();
  
  if (type) {
    queryParams.append('type', type);
  }
  
  if (status) {
    queryParams.append('status', status);
  }

  const queryString = queryParams.toString();
  const url = queryString ? `/integrations?${queryString}` : '/integrations';
  
  return await api.get(url);
};

export const getIntegrationById = async (integrationId: string): Promise<IntegrationStatusResponse> => {
  return await api.get(`/integrations/${integrationId}`);
};

export const getConfigurationOptions = async (type: IntegrationType): Promise<ConfigurationOptions> => {
  return await api.get(`/integrations/${type}/config-options`);
};

// OAuth Flow Functions
export const startConnection = async (type: IntegrationType): Promise<StartConnectionResult> => {
  return await api.post(`/integrations/${type}/connect`);
};

export const handleCallback = async (
  type: IntegrationType,
  callbackData: OAuthCallbackRequest
): Promise<HandleCallbackResult> => {
  return await api.post(`/integrations/${type}/callback`, callbackData);
};

export const reconnectIntegration = async (integrationId: string): Promise<ReconnectIntegrationResult> => {
  return await api.post(`/integrations/${integrationId}/reconnect`);
};

// Configuration Functions
export const configureIntegration = async (
  integrationId: string,
  config: SyncConfigRequest
): Promise<ConfigureIntegrationResult> => {
  return await api.post(`/integrations/${integrationId}/configure`, config);
};

// Connection Management Functions
export const testConnection = async (integrationId: string): Promise<TestConnectionResult> => {
  return await api.post(`/integrations/${integrationId}/test`);
};

export const triggerSync = async (
  integrationId: string,
  options?: { incrementalSync?: boolean; syncFromDate?: Date }
): Promise<TriggerSyncResult> => {
  return await api.post(`/integrations/${integrationId}/sync`, options);
};

export const disconnectIntegration = async (integrationId: string): Promise<DisconnectIntegrationResult> => {
  return await api.delete(`/integrations/${integrationId}`);
};

// Legacy function for backward compatibility
export const getIntegrationStats = async (): Promise<IntegrationStats> => {
  const integrations = await getIntegrations();
  return {
    connectedCount: integrations.filter(i => i.isConnected).length,
    totalRecordsSynced: integrations.reduce((sum, i) => sum + i.syncedRecordCount, 0),
    lastSyncTime: integrations
      .filter(i => i.lastSyncedAt)
      .sort((a, b) => new Date(b.lastSyncedAt!).getTime() - new Date(a.lastSyncedAt!).getTime())[0]
      ?.lastSyncedAt || new Date().toISOString()
  };
};

// Query Options
export const getIntegrationsQueryOptions = (params?: { type?: IntegrationType; status?: IntegrationStatus }) => ({
  queryKey: ['integrations', params],
  queryFn: () => getIntegrations(params),
});

export const getIntegrationByIdQueryOptions = (integrationId: string) => ({
  queryKey: ['integrations', integrationId],
  queryFn: () => getIntegrationById(integrationId),
  enabled: !!integrationId,
});

export const getConfigurationOptionsQueryOptions = (type: IntegrationType) => ({
  queryKey: ['integrations', 'config-options', type],
  queryFn: () => getConfigurationOptions(type),
  enabled: !!type,
});

export const getIntegrationStatsQueryOptions = () => ({
  queryKey: ['integrations', 'stats'],
  queryFn: () => getIntegrationStats(),
});

// Hooks
export const useGetIntegrations = (
  params?: { type?: IntegrationType; status?: IntegrationStatus },
  queryConfig?: QueryConfig<typeof getIntegrationsQueryOptions>
) => {
  return useQuery({
    ...getIntegrationsQueryOptions(params),
    ...queryConfig,
  });
};

export const useGetIntegrationById = (integrationId: string, queryConfig?: QueryConfig<typeof getIntegrationByIdQueryOptions>) => {
  return useQuery({
    ...getIntegrationByIdQueryOptions(integrationId),
    ...queryConfig,
  });
};

export const useGetConfigurationOptions = (type: IntegrationType, queryConfig?: QueryConfig<typeof getConfigurationOptionsQueryOptions>) => {
  return useQuery({
    ...getConfigurationOptionsQueryOptions(type),
    ...queryConfig,
  });
};

export const useGetIntegrationStats = (queryConfig?: QueryConfig<typeof getIntegrationStatsQueryOptions>) => {
  return useQuery({
    ...getIntegrationStatsQueryOptions(),
    ...queryConfig,
  });
};

// Mutations
export const useStartConnection = (mutationConfig?: MutationConfig<(type: IntegrationType) => Promise<StartConnectionResult>>) => {
  return useMutation({
    mutationFn: (type: IntegrationType) => startConnection(type),
    ...mutationConfig,
  });
};

export const useHandleCallback = (mutationConfig?: MutationConfig<(params: { type: IntegrationType; callbackData: OAuthCallbackRequest }) => Promise<HandleCallbackResult>>) => {
  return useMutation({
    mutationFn: ({ type, callbackData }: { type: IntegrationType; callbackData: OAuthCallbackRequest }) =>
      handleCallback(type, callbackData),
    ...mutationConfig,
  });
};

export const useReconnectIntegration = (mutationConfig?: MutationConfig<(integrationId: string) => Promise<ReconnectIntegrationResult>>) => {
  return useMutation({
    mutationFn: (integrationId: string) => reconnectIntegration(integrationId),
    ...mutationConfig,
  });
};

export const useConfigureIntegration = (mutationConfig?: MutationConfig<(params: { integrationId: string; config: SyncConfigRequest }) => Promise<ConfigureIntegrationResult>>) => {
  return useMutation({
    mutationFn: ({ integrationId, config }: { integrationId: string; config: SyncConfigRequest }) =>
      configureIntegration(integrationId, config),
    ...mutationConfig,
  });
};

export const useTestConnection = (mutationConfig?: MutationConfig<(integrationId: string) => Promise<TestConnectionResult>>) => {
  return useMutation({
    mutationFn: (integrationId: string) => testConnection(integrationId),
    ...mutationConfig,
  });
};

export const useTriggerSync = (mutationConfig?: MutationConfig<(params: { integrationId: string; options?: { incrementalSync?: boolean; syncFromDate?: Date } }) => Promise<TriggerSyncResult>>) => {
  return useMutation({
    mutationFn: ({ integrationId, options }: { integrationId: string; options?: { incrementalSync?: boolean; syncFromDate?: Date } }) =>
      triggerSync(integrationId, options),
    ...mutationConfig,
  });
};

export const useDisconnectIntegration = (mutationConfig?: MutationConfig<(integrationId: string) => Promise<DisconnectIntegrationResult>>) => {
  return useMutation({
    mutationFn: (integrationId: string) => disconnectIntegration(integrationId),
    ...mutationConfig,
  });
};

// Legacy mutations for backward compatibility
export const useConnectIntegration = (mutationConfig?: MutationConfig<(params: { type: string; name?: string }) => Promise<StartConnectionResult>>) => {
  return useMutation({
    mutationFn: ({ type }: { type: string; name?: string }) => startConnection(type as IntegrationType),
    ...mutationConfig,
  });
};

export const useSyncIntegration = (mutationConfig?: MutationConfig<(params: { integrationId: string }) => Promise<TriggerSyncResult>>) => {
  return useMutation({
    mutationFn: ({ integrationId }: { integrationId: string }) => triggerSync(integrationId),
    ...mutationConfig,
  });
};