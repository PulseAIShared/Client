import { api } from "@/lib/api-client";
import { MutationConfig, QueryConfig } from "@/lib/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Types
export interface ConnectionDiagnosticsResponse {
  timestamp: string;
  active_connections: number;
  pool_stats: {
    main_pool_max: number;
    main_pool_min: number;
    readonly_pool_max: number;
    readonly_pool_min: number;
  };
  connections_by_operation: Record<string, number>;
  long_running_connections: Array<{
    connection_id: string;
    operation: string;
    duration_minutes: number;
    thread_id: number;
  }>;
  health_status: 'healthy' | 'warning' | 'critical';
}

export interface LeakDetectionResponse {
  timestamp: string;
  has_leaks: boolean;
  active_connections: number;
  long_running_count: number;
  analysis: {
    high_connection_count: boolean;
    long_running_connections: boolean;
    repeated_operations: Record<string, number>;
  };
  recommendations: string[];
}

export interface RawConnectionDataResponse {
  timestamp: string;
  total_active: number;
  detailed_connections: Array<{
    connection_id: string;
    operation: string;
    duration_ms: number;
    thread_id: number;
    stack_trace: string[];
  }>;
  operations_summary: Record<string, number>;
  pool_configuration: {
    mainPoolMaxSize: number;
    mainPoolMinSize: number;
    readOnlyPoolMaxSize: number;
    readOnlyPoolMinSize: number;
  };
}

export interface RecoveryResponse {
  timestamp: string;
  recovery_attempted: boolean;
  success: boolean;
  connections_before: number;
  connections_after: number;
  improvement: number;
  status: string;
}

export interface ForceResetResponse {
  timestamp: string;
  emergency_reset_performed: boolean;
  success: boolean;
  connections_before: number;
  connections_after: number;
  recovery_duration_ms: number;
  error_message?: string;
  warning: string;
}

// API Functions
export const getConnectionDiagnostics = async (): Promise<ConnectionDiagnosticsResponse> => {
  return api.get('/diagnostics/connections');
};

export const detectConnectionLeaks = async (): Promise<LeakDetectionResponse> => {
  return api.post('/diagnostics/connections/detect-leaks');
};

export const getRawConnectionData = async (): Promise<RawConnectionDataResponse> => {
  return api.get('/diagnostics/connections/raw');
};

export const attemptRecovery = async (): Promise<RecoveryResponse> => {
  return api.post('/diagnostics/connections/recover');
};

export const forceConnectionReset = async (): Promise<ForceResetResponse> => {
  return api.post('/diagnostics/connections/force-reset');
};

// Query Options
export const getConnectionDiagnosticsQueryOptions = () => {
  return {
    queryKey: ['admin', 'connection-diagnostics'],
    queryFn: getConnectionDiagnostics,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time monitoring
  };
};

export const getRawConnectionDataQueryOptions = () => {
  return {
    queryKey: ['admin', 'connection-diagnostics', 'raw'],
    queryFn: getRawConnectionData,
  };
};

// Hooks
export const useGetConnectionDiagnostics = (
  queryConfig?: QueryConfig<typeof getConnectionDiagnosticsQueryOptions>
) => {
  return useQuery({
    ...getConnectionDiagnosticsQueryOptions(),
    ...queryConfig,
  });
};

export const useGetRawConnectionData = (
  queryConfig?: QueryConfig<typeof getRawConnectionDataQueryOptions>
) => {
  return useQuery({
    ...getRawConnectionDataQueryOptions(),
    ...queryConfig,
  });
};

export const useDetectConnectionLeaks = (options?: {
  mutationConfig?: MutationConfig<typeof detectConnectionLeaks>;
}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: detectConnectionLeaks,
    onSuccess: () => {
      // Invalidate diagnostics to refresh data after leak detection
      queryClient.invalidateQueries({ queryKey: ['admin', 'connection-diagnostics'] });
    },
    ...options?.mutationConfig,
  });
};

export const useAttemptRecovery = (options?: {
  mutationConfig?: MutationConfig<typeof attemptRecovery>;
}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: attemptRecovery,
    onSuccess: () => {
      // Invalidate diagnostics to refresh data after recovery attempt
      queryClient.invalidateQueries({ queryKey: ['admin', 'connection-diagnostics'] });
    },
    ...options?.mutationConfig,
  });
};

export const useForceConnectionReset = (options?: {
  mutationConfig?: MutationConfig<typeof forceConnectionReset>;
}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: forceConnectionReset,
    onSuccess: () => {
      // Invalidate all diagnostics data after force reset
      queryClient.invalidateQueries({ queryKey: ['admin', 'connection-diagnostics'] });
    },
    ...options?.mutationConfig,
  });
};