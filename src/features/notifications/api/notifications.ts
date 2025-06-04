// src/features/notifications/api/notifications.ts (updated to match your API)
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig, QueryConfig } from '@/lib/react-query';

export interface NotificationResponse {
  id: string; // Changed from Guid to string for frontend
  title: string;
  message: string;
  type: string;
  category: string;
  actionUrl?: string;
  actionText?: string;
  isRead: boolean;
  createdAt: string; // ISO string format
  metadata?: Record<string, unknown>;
}

// This matches your actual API response structure
export interface NotificationsApiResponse {
  notifications: NotificationResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface NotificationsQueryParams {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
}

// Get notifications - matches your endpoint structure exactly
export const getNotifications = async (params: NotificationsQueryParams = {}): Promise<NotificationsApiResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params.unreadOnly !== undefined) queryParams.append('unreadOnly', params.unreadOnly.toString());

  return api.get(`/notifications?${queryParams.toString()}`);
};

export const getNotificationsQueryOptions = (params?: NotificationsQueryParams) => {
  return {
    queryKey: ['notifications', params],
    queryFn: () => getNotifications(params),
  };
};

export const useGetNotifications = (
  params?: NotificationsQueryParams,
  queryConfig?: QueryConfig<typeof getNotificationsQueryOptions>
) => {
  return useQuery({
    ...getNotificationsQueryOptions(params),
    ...queryConfig,
  });
};

// Get unread count by fetching unread notifications and using totalCount
export const getUnreadCount = async (): Promise<{ count: number }> => {
  const unreadNotifications = await getNotifications({ unreadOnly: true, pageSize: 1 });
  return { count: unreadNotifications.totalCount };
};

export const getUnreadCountQueryOptions = () => {
  return {
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => getUnreadCount(),
  };
};

export const useGetUnreadCount = (queryConfig?: QueryConfig<typeof getUnreadCountQueryOptions>) => {
  return useQuery({
    ...getUnreadCountQueryOptions(),
    ...queryConfig,
  });
};


export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  return api.post(`/notifications/${notificationId}/mark-read`);
};

type UseMarkNotificationAsReadOptions = {
  mutationConfig?: MutationConfig<typeof markNotificationAsRead>;
};

export const useMarkNotificationAsRead = ({ mutationConfig }: UseMarkNotificationAsReadOptions = {}) => {
  return useMutation({
    mutationFn: markNotificationAsRead,
    ...mutationConfig,
  });
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
  return api.post('/notifications/mark-all-read');
};


type UseMarkAllNotificationsAsReadOptions = {
  mutationConfig?: MutationConfig<typeof markAllNotificationsAsRead>;
};

export const useMarkAllNotificationsAsRead = ({ mutationConfig }: UseMarkAllNotificationsAsReadOptions = {}) => {
  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    ...mutationConfig,
  });
};

