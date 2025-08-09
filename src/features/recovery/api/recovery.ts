import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export const retryPayment = async (paymentId: string): Promise<{ success: boolean }> => {
  return api.post(`/recovery/payments/${paymentId}/retry`);
};

export const enrollInFlow = async (params: { paymentId: string; flowId: string }): Promise<{ success: boolean }> => {
  const { paymentId, flowId } = params;
  return api.post(`/recovery/payments/${paymentId}/enroll`, { flowId });
};

export const useRetryPayment = () => {
  return useMutation({ mutationFn: retryPayment });
};

export const useEnrollInFlow = () => {
  return useMutation({ mutationFn: enrollInFlow });
};


