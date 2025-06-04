// src/features/notifications/api/notifications.ts (fixed TypeScript errors)
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig, QueryConfig } from '@/lib/react-query';

// Updated to match your backend NotificationResponse exactly
export interface NotificationResponse {
  id: string; // Guid from backend gets serialized as string
  title: string;
  message: string;
  type: string; // Success, Error, Warning, Info, etc.
  category: string; // Import, Customer, System, etc.
  actionUrl?: string | null;
  actionText?: string | null;
  isRead: boolean;
  createdAt: string; // DateTime serialized as ISO string
  metadata?: Record<string, unknown> | null;
}

// This matches your backend API response structure exactly
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

// Get notifications - matches your endpoint exactly
export const getNotifications = async (params: NotificationsQueryParams = {}): Promise<NotificationsApiResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
  if (params.unreadOnly !== undefined) queryParams.append('unreadOnly', params.unreadOnly.toString());

  // Type the response properly since api.get returns the processed data
  const response = await api.get(`notifications?${queryParams.toString()}`) as NotificationsApiResponse;
  
  // Your backend returns the response structure directly after the interceptor processes it
  return {
    notifications: response.notifications,
    totalCount: response.totalCount,
    page: response.page,
    pageSize: response.pageSize,
    totalPages: response.totalPages,
  };
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

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  return api.post(`notifications/${notificationId}/mark-read`);
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

// Mark all notifications as read - no parameters needed
export const markAllNotificationsAsRead = async (): Promise<void> => {
  return api.post('notifications/mark-all-read');
};

type UseMarkAllNotificationsAsReadOptions = {
  mutationConfig?: MutationConfig<typeof markAllNotificationsAsRead>;
};

export const useMarkAllNotificationsAsRead = ({ mutationConfig }: UseMarkAllNotificationsAsReadOptions = {}) => {
  return useMutation({
    mutationFn: markAllNotificationsAsRead, // This function takes no parameters
    ...mutationConfig,
  });
};