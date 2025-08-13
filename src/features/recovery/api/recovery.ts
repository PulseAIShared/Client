import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import {
  RecoveryDashboardResponse,
  RecoveryFlow,
  FlowTemplate,
  MissedPaymentRow,
  CreateFlowRequest,
  UpdateFlowRequest,
  EnrollPaymentRequest,
  BulkEnrollRequest,
  RetryPaymentResponse,
  EnrollPaymentResponse,
  PaymentFilters,
  FlowFilters,
  FlowPerformanceMetrics
} from '@/types/recovery';

// ========== MAIN RECOVERY DATA ==========

export const getRecoveryData = async (): Promise<RecoveryDashboardResponse> => {
  return await api.get('/recovery');
};

export const getRecoveryDataQueryOptions = () => ({
  queryKey: ['recovery'],
  queryFn: () => getRecoveryData(),
});

export const useGetRecoveryData = (queryConfig?: QueryConfig<typeof getRecoveryDataQueryOptions>) => {
  return useQuery({
    ...getRecoveryDataQueryOptions(),
    ...queryConfig,
  });
};

// ========== MISSED PAYMENTS ==========

export const getMissedPayments = async (filters?: PaymentFilters): Promise<MissedPaymentRow[]> => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          params.append(key, JSON.stringify(value));
        } else {
          params.append(key, String(value));
        }
      }
    });
  }
  return api.get(`/recovery/payments/missed?${params.toString()}`);
};

export const useMissedPayments = (filters?: PaymentFilters) => {
  return useQuery({
    queryKey: ['recovery', 'missed-payments', filters],
    queryFn: () => getMissedPayments(filters),
  });
};

// ========== RECOVERY FLOWS ==========

export const getRecoveryFlows = async (filters?: FlowFilters): Promise<RecoveryFlow[]> => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }
  return api.get(`/recovery/flows?${params.toString()}`);
};

export const getFlowTemplates = async (): Promise<FlowTemplate[]> => {
  return api.get('/recovery/flows/templates');
};

export const createRecoveryFlow = async (flow: CreateFlowRequest): Promise<RecoveryFlow> => {
  return api.post('/recovery/flows', flow);
};

export const updateRecoveryFlow = async (flow: UpdateFlowRequest): Promise<RecoveryFlow> => {
  return api.put(`/recovery/flows/${flow.id}`, flow);
};

export const deleteRecoveryFlow = async (flowId: string): Promise<{ success: boolean }> => {
  return api.delete(`/recovery/flows/${flowId}`);
};

export const getFlowPerformance = async (flowId: string): Promise<FlowPerformanceMetrics> => {
  return api.get(`/recovery/flows/${flowId}/performance`);
};

// ========== PAYMENT ACTIONS ==========

export const retryPayment = async (paymentId: string): Promise<RetryPaymentResponse> => {
  return api.post(`/recovery/payments/${paymentId}/retry`);
};

export const enrollInFlow = async (paymentId: string, request: EnrollPaymentRequest): Promise<EnrollPaymentResponse> => {
  return api.post(`/recovery/payments/${paymentId}/enroll`, request);
};

export const bulkEnrollInFlow = async (request: BulkEnrollRequest): Promise<EnrollPaymentResponse[]> => {
  return api.post('/recovery/payments/bulk-enroll', request);
};

export const updatePaymentStatus = async (paymentId: string, status: MissedPaymentRow['status']): Promise<{ success: boolean }> => {
  return api.patch(`/recovery/payments/${paymentId}`, { status });
};

// ========== HOOKS ==========

export const useRecoveryFlows = (filters?: FlowFilters) => {
  return useQuery({
    queryKey: ['recovery', 'flows', filters],
    queryFn: () => getRecoveryFlows(filters),
  });
};

export const useFlowTemplates = () => {
  return useQuery({
    queryKey: ['recovery', 'flow-templates'],
    queryFn: getFlowTemplates,
  });
};

export const useCreateFlow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRecoveryFlow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recovery'] });
      queryClient.invalidateQueries({ queryKey: ['recovery', 'flows'] });
    },
  });
};

export const useUpdateFlow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRecoveryFlow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recovery'] });
      queryClient.invalidateQueries({ queryKey: ['recovery', 'flows'] });
    },
  });
};

export const useDeleteFlow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRecoveryFlow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recovery'] });
      queryClient.invalidateQueries({ queryKey: ['recovery', 'flows'] });
    },
  });
};

export const useRetryPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: retryPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recovery'] });
      queryClient.invalidateQueries({ queryKey: ['recovery', 'missed-payments'] });
    },
  });
};

export const useEnrollInFlow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, flowId }: { paymentId: string; flowId: string }) =>
      enrollInFlow(paymentId, { flowId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recovery'] });
      queryClient.invalidateQueries({ queryKey: ['recovery', 'missed-payments'] });
    },
  });
};

export const useBulkEnrollInFlow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkEnrollInFlow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recovery'] });
      queryClient.invalidateQueries({ queryKey: ['recovery', 'missed-payments'] });
    },
  });
};

export const useFlowPerformance = (flowId: string) => {
  return useQuery({
    queryKey: ['recovery', 'flow-performance', flowId],
    queryFn: () => getFlowPerformance(flowId),
    enabled: !!flowId,
  });
};


