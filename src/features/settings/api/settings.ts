import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import {
  AccountSettingsResponse,
  BillingPortalSessionResponse,
  BillingSummaryResponse,
  NotificationSettingsResponse,
  ProblemDetails,
  SecurityPasswordUpdateResponse,
  SecuritySessionRevokeResponse,
  SecuritySessionsResponse,
  UpdateAccountSettingsRequest,
  UpdateNotificationSettingsRequest,
  UpdateSecurityPasswordRequest,
} from '@/types/api';

export const settingsQueryKeys = {
  account: ['settings', 'account'] as const,
  notifications: ['settings', 'notifications'] as const,
  billingSummary: ['settings', 'billing', 'summary'] as const,
  securitySessions: ['settings', 'security', 'sessions'] as const,
};

export const parseSettingsProblem = (error: unknown): ProblemDetails => {
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

export const getAccountSettings = async (): Promise<AccountSettingsResponse> => {
  return await api.get('/settings/account');
};

export const updateAccountSettings = async (
  payload: UpdateAccountSettingsRequest,
): Promise<AccountSettingsResponse> => {
  return await api.patch('/settings/account', payload);
};

export const getNotificationSettings = async (): Promise<NotificationSettingsResponse> => {
  return await api.get('/settings/notifications');
};

export const updateNotificationSettings = async (
  payload: UpdateNotificationSettingsRequest,
): Promise<NotificationSettingsResponse> => {
  return await api.patch('/settings/notifications', payload);
};

export const getBillingSummary = async (): Promise<BillingSummaryResponse> => {
  return await api.get('/settings/billing/summary');
};

export const createBillingPortalSession = async (): Promise<BillingPortalSessionResponse> => {
  return await api.post('/settings/billing/portal-session', {});
};

export const getSecuritySessions = async (): Promise<SecuritySessionsResponse> => {
  return await api.get('/settings/security/sessions');
};

export const updateSecurityPassword = async (
  payload: UpdateSecurityPasswordRequest,
): Promise<SecurityPasswordUpdateResponse> => {
  return await api.post('/settings/security/password', payload);
};

export const revokeSecuritySession = async (
  sessionId: string,
): Promise<SecuritySessionRevokeResponse> => {
  return await api.delete(`/settings/security/sessions/${sessionId}`);
};

const getAccountSettingsQueryOptions = () => ({
  queryKey: settingsQueryKeys.account,
  queryFn: getAccountSettings,
});

const getNotificationSettingsQueryOptions = () => ({
  queryKey: settingsQueryKeys.notifications,
  queryFn: getNotificationSettings,
});

const getBillingSummaryQueryOptions = () => ({
  queryKey: settingsQueryKeys.billingSummary,
  queryFn: getBillingSummary,
});

const getSecuritySessionsQueryOptions = () => ({
  queryKey: settingsQueryKeys.securitySessions,
  queryFn: getSecuritySessions,
});

export const useGetAccountSettings = (
  queryConfig?: QueryConfig<typeof getAccountSettingsQueryOptions>,
) =>
  useQuery({
    ...getAccountSettingsQueryOptions(),
    ...queryConfig,
  });

export const useGetNotificationSettings = (
  queryConfig?: QueryConfig<typeof getNotificationSettingsQueryOptions>,
) =>
  useQuery({
    ...getNotificationSettingsQueryOptions(),
    ...queryConfig,
  });

export const useGetBillingSummary = (
  queryConfig?: QueryConfig<typeof getBillingSummaryQueryOptions>,
) =>
  useQuery({
    ...getBillingSummaryQueryOptions(),
    ...queryConfig,
  });

export const useGetSecuritySessions = (
  queryConfig?: QueryConfig<typeof getSecuritySessionsQueryOptions>,
) =>
  useQuery({
    ...getSecuritySessionsQueryOptions(),
    ...queryConfig,
  });

export const useUpdateAccountSettings = (
) => {
  const queryClient = useQueryClient();

  return useMutation<
    AccountSettingsResponse,
    Error,
    UpdateAccountSettingsRequest,
    { previous?: AccountSettingsResponse }
  >({
    mutationFn: updateAccountSettings,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: settingsQueryKeys.account });

      const previous = queryClient.getQueryData<AccountSettingsResponse>(
        settingsQueryKeys.account,
      );

      if (previous) {
        queryClient.setQueryData<AccountSettingsResponse>(settingsQueryKeys.account, {
          ...previous,
          firstName: payload.firstName,
          lastName: payload.lastName,
        });
      }

      return { previous };
    },
    onError: (error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(settingsQueryKeys.account, context.previous);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(settingsQueryKeys.account, data);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: settingsQueryKeys.account });
    },
  });
};

export const useUpdateNotificationSettings = (
) => {
  const queryClient = useQueryClient();

  return useMutation<
    NotificationSettingsResponse,
    Error,
    UpdateNotificationSettingsRequest,
    { previous?: NotificationSettingsResponse }
  >({
    mutationFn: updateNotificationSettings,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: settingsQueryKeys.notifications });

      const previous = queryClient.getQueryData<NotificationSettingsResponse>(
        settingsQueryKeys.notifications,
      );

      if (previous) {
        queryClient.setQueryData<NotificationSettingsResponse>(
          settingsQueryKeys.notifications,
          {
            ...previous,
            personal: payload.personal
              ? {
                  ...previous.personal,
                  ...payload.personal,
                }
              : previous.personal,
            company: payload.company
              ? {
                  ...previous.company,
                  ...payload.company,
                }
              : previous.company,
          },
        );
      }

      return { previous };
    },
    onError: (error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(settingsQueryKeys.notifications, context.previous);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(settingsQueryKeys.notifications, data);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: settingsQueryKeys.notifications });
    },
  });
};

export const useCreateBillingPortalSession = () => {
  return useMutation<BillingPortalSessionResponse, Error>({
    mutationFn: createBillingPortalSession,
  });
};

export const useUpdateSecurityPassword = () => {
  const queryClient = useQueryClient();

  return useMutation<SecurityPasswordUpdateResponse, Error, UpdateSecurityPasswordRequest>({
    mutationFn: updateSecurityPassword,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: settingsQueryKeys.securitySessions });
    },
  });
};

export const useRevokeSecuritySession = () => {
  const queryClient = useQueryClient();

  return useMutation<SecuritySessionRevokeResponse, Error, string>({
    mutationFn: revokeSecuritySession,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: settingsQueryKeys.securitySessions });
    },
  });
};
