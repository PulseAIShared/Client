// src/features/settings/api/integrations.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { api } from '@/lib/api-client';
import { MutationConfig, QueryConfig } from '@/lib/react-query';
import { 
  IntegrationStats, 
  IntegrationStatusResponse,
  IntegrationType,
  IntegrationStatus,
  IntegrationApiItem,
  ConfigurationOptions,
  IntegrationConfigurationMap,
  StartConnectionResult,
  OAuthCallbackRequest,
  HandleCallbackResult,
  SyncConfigRequest,
  ConfigureIntegrationResult,
  ReconnectIntegrationResult,
  TestConnectionResult,
  TriggerSyncResult,
  DisconnectIntegrationResult,
  IntegrationInspection,
  ProblemDetails,
  IntegrationSyncJobSummary
} from '@/types/api';

export const parseIntegrationProblem = (error: unknown): ProblemDetails => {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === 'object') {
      return data as ProblemDetails;
    }

    return {
      status: error.response?.status,
      title: error.name,
      detail: typeof data === 'string' ? data : error.message,
    };
  }

  if (error instanceof Error) {
    return { detail: error.message };
  }

  return { detail: 'Unknown error' };
};

// API Functions
const mapIntegrationFromApi = (item: IntegrationApiItem): IntegrationStatusResponse => {
  const isConnected = item.status === 'Connected';
  // Map server status + token flags to UI enum
  const mappedStatus: IntegrationStatus = item.isTokenExpired
    ? IntegrationStatus.TokenExpired
    : isConnected
      ? IntegrationStatus.Connected
      : item.status === 'Disconnected'
        ? IntegrationStatus.NotConnected
        : item.status === 'Error'
          ? IntegrationStatus.Error
          : IntegrationStatus.Error;

  return {
    id: item.integrationId,
    type: item.type as IntegrationType | string,
    name: item.name,
    status: mappedStatus,
    isConnected,
    lastSyncedAt: item.lastSyncAt || undefined,
    nextSyncAt: item.nextSyncAt || undefined,
    syncedRecordCount: item.syncedRecordCount ?? 0,
    syncConfiguration: item.syncConfiguration || undefined,
    errorMessage: item.errorMessage || undefined,
    needsTokenRefresh: item.needsTokenRefresh || false,
    needsConfiguration: item.needsConfiguration || false,
    isTokenExpired: item.isTokenExpired,
    tokenExpiresAt: item.tokenExpiresAt ?? null,
    connectionDetails: item.connectedAt
      ? {
          connectedAt: item.connectedAt,
          connectedBy: '',
          permissions: [],
        }
      : undefined,
  };
};

const mapStatusFilterToApi = (status: IntegrationStatus): string => {
  switch (status) {
    case IntegrationStatus.NotConnected:
      return 'Disconnected';
    case IntegrationStatus.Connected:
      return 'Connected';
    case IntegrationStatus.Error:
      return 'Error';
    case IntegrationStatus.Syncing:
      return 'Syncing';
    case IntegrationStatus.TokenExpired:
      return 'TokenExpired';
    default:
      return String(status);
  }
};

export const getIntegrations = async ({ 
  type, 
  status 
}: { 
  type?: IntegrationType | string; 
  status?: IntegrationStatus; 
} = {}): Promise<IntegrationStatusResponse[]> => {
  const queryParams = new URLSearchParams();
  
  if (type) {
    queryParams.append('type', type);
  }
  
  if (status) {
    queryParams.append('status', mapStatusFilterToApi(status));
  }

  const queryString = queryParams.toString();
  const url = queryString ? `/integrations?${queryString}` : '/integrations';
  
  const raw: IntegrationApiItem[] = await api.get(url);
  return raw.map(mapIntegrationFromApi);
};

export const getIntegrationById = async (integrationId: string): Promise<IntegrationStatusResponse> => {
  const raw: IntegrationApiItem = await api.get(`/integrations/${integrationId}`);
  return mapIntegrationFromApi(raw);
};

export const getConfigurationOptions = async (type: IntegrationType | string): Promise<ConfigurationOptions> => {
  return await api.get(`/integrations/${type}/config-options`);
};

export const getAllConfigurationOptions = async (): Promise<IntegrationConfigurationMap> => {
  return await api.get('/integrations/config-options');
};

export const getSyncJobs = async (
  params: { integrationId?: string } = {}
): Promise<IntegrationSyncJobSummary[]> => {
  const queryParams = new URLSearchParams();

  if (params.integrationId) {
    queryParams.append('integrationId', params.integrationId);
  }

  const query = queryParams.toString();
  const url = query ? `/integrations/sync-jobs?${query}` : '/integrations/sync-jobs';
  return await api.get(url);
};

// OAuth Flow Functions
export const startConnection = async (type: IntegrationType | string): Promise<StartConnectionResult> => {
  return await api.post(`/integrations/${type}/connect`, {});
};

export const handleCallback = async (
  type: IntegrationType | string,
  callbackData: OAuthCallbackRequest
): Promise<HandleCallbackResult> => {
  return await api.post(`/integrations/${type}/callback`, callbackData);
};

export const reconnectIntegration = async (integrationId: string): Promise<ReconnectIntegrationResult> => {
  return await api.post(`/integrations/${integrationId}/reconnect`, {});
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
  return await api.post(`/integrations/${integrationId}/test`, {});
};

export const triggerSync = async (
  integrationId: string,
  options?: { incrementalSync?: boolean; syncFromDate?: Date }
): Promise<TriggerSyncResult> => {
  const payload = options
    ? {
        ...options,
        syncFromDate: options.syncFromDate ? options.syncFromDate.toISOString() : undefined,
      }
    : {};

  return await api.post(`/integrations/${integrationId}/sync`, payload);
};

export const disconnectIntegration = async (integrationId: string): Promise<DisconnectIntegrationResult> => {
  return await api.delete(`/integrations/${integrationId}`);
};

export const deleteIntegrationPermanent = async (integrationId: string): Promise<void> => {
  await api.delete(`/integrations/${integrationId}/permanent`);
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
export const getIntegrationsQueryOptions = (params?: { type?: IntegrationType | string; status?: IntegrationStatus }) => ({
  queryKey: ['integrations', params],
  queryFn: () => getIntegrations(params),
});

export const getIntegrationByIdQueryOptions = (integrationId: string) => ({
  queryKey: ['integrations', integrationId],
  queryFn: () => getIntegrationById(integrationId),
  enabled: !!integrationId,
});

export const getConfigurationOptionsQueryOptions = (type: IntegrationType | string) => ({
  queryKey: ['integrations', 'config-options', type],
  queryFn: () => getConfigurationOptions(type),
  enabled: !!type,
});

export const getAllConfigurationOptionsQueryOptions = () => ({
  queryKey: ['integrations', 'config-options', 'all'],
  queryFn: () => getAllConfigurationOptions(),
});

export const getSyncJobsQueryOptions = (integrationId?: string) => ({
  queryKey: ['integrations', 'sync-jobs', integrationId ?? 'all'],
  queryFn: () => getSyncJobs({ integrationId }),
});

export const getIntegrationStatsQueryOptions = () => ({
  queryKey: ['integrations', 'stats'],
  queryFn: () => getIntegrationStats(),
});

// Hooks
export const useGetIntegrations = (
  params?: { type?: IntegrationType | string; status?: IntegrationStatus },
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

export const useGetConfigurationOptions = (type: IntegrationType | string, queryConfig?: QueryConfig<typeof getConfigurationOptionsQueryOptions>) => {
  return useQuery({
    ...getConfigurationOptionsQueryOptions(type),
    ...queryConfig,
  });
};

export const useGetAllConfigurationOptions = (queryConfig?: QueryConfig<typeof getAllConfigurationOptionsQueryOptions>) => {
  return useQuery({
    ...getAllConfigurationOptionsQueryOptions(),
    ...queryConfig,
  });
};

export const useGetSyncJobs = (integrationId?: string, queryConfig?: QueryConfig<typeof getSyncJobsQueryOptions>) => {
  return useQuery({
    ...getSyncJobsQueryOptions(integrationId),
    ...queryConfig,
  });
};

export const useGetIntegrationStats = (queryConfig?: QueryConfig<typeof getIntegrationStatsQueryOptions>) => {
  return useQuery({
    ...getIntegrationStatsQueryOptions(),
    ...queryConfig,
  });
};

// Inspection (capabilities discovery)
export const inspectIntegration = async (integrationId: string): Promise<IntegrationInspection> => {
  return await api.post(`/integrations/${integrationId}/inspect`, {});
};

export const getInspectIntegrationQueryOptions = (integrationId: string) => ({
  queryKey: ['integrations', integrationId, 'inspect'],
  queryFn: () => inspectIntegration(integrationId),
  enabled: !!integrationId,
});

export const useInspectIntegration = (integrationId: string, queryConfig?: QueryConfig<typeof getInspectIntegrationQueryOptions>) => {
  return useQuery({
    ...getInspectIntegrationQueryOptions(integrationId),
    ...queryConfig,
  });
};

// Mutations
export const useStartConnection = (mutationConfig?: MutationConfig<(type: IntegrationType | string) => Promise<StartConnectionResult>>) => {
  return useMutation({
    mutationFn: (type: IntegrationType | string) => startConnection(type),
    ...mutationConfig,
  });
};

export const useHandleCallback = (mutationConfig?: MutationConfig<(params: { type: IntegrationType | string; callbackData: OAuthCallbackRequest }) => Promise<HandleCallbackResult>>) => {
  return useMutation({
    mutationFn: ({ type, callbackData }: { type: IntegrationType | string; callbackData: OAuthCallbackRequest }) =>
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

export const useDeleteIntegrationPermanent = (mutationConfig?: MutationConfig<(integrationId: string) => Promise<void>>) => {
  return useMutation({
    mutationFn: (integrationId: string) => deleteIntegrationPermanent(integrationId),
    ...mutationConfig,
  });
};

// Legacy mutations for backward compatibility
export const useConnectIntegration = (mutationConfig?: MutationConfig<(params: { type: string; name?: string }) => Promise<StartConnectionResult>>) => {
  return useMutation({
    mutationFn: ({ type }: { type: string; name?: string }) => startConnection(type),
    ...mutationConfig,
  });
};

export const useSyncIntegration = (mutationConfig?: MutationConfig<(params: { integrationId: string }) => Promise<TriggerSyncResult>>) => {
  return useMutation({
    mutationFn: ({ integrationId }: { integrationId: string }) => triggerSync(integrationId),
    ...mutationConfig,
  });
};
