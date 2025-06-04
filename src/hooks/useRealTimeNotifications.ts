// src/hooks/useRealTimeNotifications.ts (fixed TypeScript errors)
import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '@/components/ui/notifications/notifications-store';
import { signalRConnection } from '@/lib/signalr-connection';
import { NotificationResponse } from '@/features/notifications/api/notifications';
import { useUser } from '@/lib/auth';
import { getToken } from '@/lib/api-client';
import { registerNotificationEvents, unregisterNotificationEvents } from '@/lib/signalr-event-helper';

// Event data interfaces matching your backend SignalR events
interface ImportCompletedData {
  importJobId?: string;
  status?: 'Completed' | 'Failed' | 'Cancelled';
  message?: string;
  totalRecords?: number;
  successfulRecords?: number;
  failedRecords?: number;
  metadata?: Record<string, unknown> | null; 
  id?: string;
  type?: string;
  title?: string;
  category?: string;
  isRead?: boolean;
  createdAt?: string;
  actionUrl?: string | null;
  actionText?: string | null;
}

interface CustomerUpdatedData {
  customerId: string;
  action: 'created' | 'updated' | 'deleted';
  customerCount?: number;
}

interface ImportProgressData {
  importJobId: string;
  status: string;
  processedRecords: number;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  message?: string;
}

// Type guard to check if data is a complete NotificationResponse
// Using a more flexible approach - check if it has the core notification properties
const isNotificationResponse = (data: unknown): data is NotificationResponse => {
  if (!data || typeof data !== 'object') return false;
  
  const obj = data as Record<string, unknown>;
  return !!(obj.id && 
           obj.type && 
           obj.title && 
           obj.message && 
           typeof obj.category === 'string' && 
           typeof obj.isRead === 'boolean' && 
           typeof obj.createdAt === 'string');
};

export const useRealTimeNotifications = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const user = useUser();

  // Only try to connect if user is authenticated
  const isAuthenticated = !!user.data && !user.isLoading;

  // Handle new notifications from SignalR
  const handleNewNotification = useCallback((notification: NotificationResponse) => {
    console.log('Received new notification:', notification);
    
    // Map backend notification types to frontend notification types
    const mapNotificationType = (type: string): 'success' | 'error' | 'warning' | 'info' => {
      switch (type.toLowerCase()) {
        case 'success':
          return 'success';
        case 'error':
        case 'failed':
          return 'error';
        case 'warning':
          return 'warning';
        case 'info':
        case 'information':
          return 'info';
        default:
          return 'info';
      }
    };
    
    // Add to local notification store for immediate display
    addNotification({
      type: mapNotificationType(notification.type),
      title: notification.title,
      message: notification.message,
    });

    // Invalidate notifications queries to refresh the dropdown/list
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    
    // Also update the unread count directly for immediate UI feedback
    queryClient.setQueryData(['notifications', 'unread-count'], (oldData: { count: number } | undefined) => {
      const currentCount = oldData?.count || 0;
      return { count: currentCount + 1 };
    });
  }, [addNotification, queryClient]);

  // Handle import completion events
  const handleImportCompleted = useCallback((data: ImportCompletedData) => {
    console.log('Import completed:', data);
    
    // Check if this is a notification object using type guard
    if (isNotificationResponse(data)) {
      // This is a notification object from the backend - treat it as a new notification
      console.log('Handling import completion as notification');
      handleNewNotification(data);
    } else {
      // This is import completion data - handle as before
      console.log('Handling import completion as data event');
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['imports'] });
      
      // Also invalidate the specific import status query
      if (data.importJobId) {
        queryClient.invalidateQueries({ 
          queryKey: ['imports', 'status', data.importJobId] 
        });
      }

      // Show appropriate local notification based on status
      if (data.status === 'Completed') {
        addNotification({
          type: 'success',
          title: 'Import Completed Successfully',
          message: `${data.successfulRecords || 0} customers imported. Dashboard data refreshed automatically.`,
        });
      } else if (data.status === 'Failed') {
        addNotification({
          type: 'error',
          title: 'Import Failed',
          message: data.message || 'The import could not be completed. Please check the import details.',
        });
      } else if (data.status === 'Cancelled') {
        addNotification({
          type: 'warning',
          title: 'Import Cancelled',
          message: 'The import was cancelled before completion.',
        });
      }
    }
  }, [queryClient, addNotification, handleNewNotification]);

  // Handle customer updates
  const handleCustomerUpdated = useCallback((data: CustomerUpdatedData) => {
    console.log('Customer updated:', data);
    
    // Invalidate specific customer if we have an ID
    if (data.customerId) {
      queryClient.invalidateQueries({ 
        queryKey: ['customers', data.customerId] 
      });
    }
    
    // Always invalidate customer list and dashboard
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    
    // Optional: Show notification for customer updates
    if (data.action === 'created') {
      addNotification({
        type: 'info',
        title: 'New Customer Added',
        message: 'Customer data has been updated automatically.',
      });
    }
  }, [queryClient, addNotification]);

  // Handle import progress updates
  const handleImportProgress = useCallback((data: ImportProgressData) => {
    console.log('Import progress:', data);
    
    // Update import status query data directly for real-time progress
    queryClient.setQueryData(['imports', 'status', data.importJobId], (oldData: ImportProgressData | undefined) => {
      if (!oldData) return data;
      
      return {
        ...oldData,
        status: data.status,
        processedRecords: data.processedRecords,
        validRecords: data.validRecords,
        invalidRecords: data.invalidRecords,
        message: data.message,
      };
    });
    
    // Show progress notifications for significant milestones
    const progressPercent = Math.round((data.processedRecords / data.totalRecords) * 100);
    
    // Show notifications at 25%, 50%, 75% completion
    if ([25, 50, 75].includes(progressPercent)) {
      addNotification({
        type: 'info',
        title: 'Import Progress Update',
        message: `${progressPercent}% complete - ${data.processedRecords}/${data.totalRecords} records processed`,
      });
    }
    
    // Show validation completion
    if (data.status === 'Validated') {
      addNotification({
        type: 'success',
        title: 'Validation Complete',
        message: `${data.validRecords} valid records found, ${data.invalidRecords} invalid records. Processing started.`,
      });
    }
  }, [queryClient, addNotification]);

  // Handle unread count changes
  const handleUnreadCountChanged = useCallback((count: number) => {
    console.log('Unread count changed:', count);
    
    // Update unread count query data directly
    queryClient.setQueryData(['notifications', 'unread-count'], { count });
  }, [queryClient]);

  useEffect(() => {
    let isSubscribed = true;

    const setupSignalRConnection = async () => {
      // Don't attempt connection if not authenticated
      if (!isAuthenticated) {
        console.log('User not authenticated, skipping SignalR connection');
        return;
      }

      // Double-check we have a token
      const token = getToken();
      if (!token) {
        console.log('No authentication token available, skipping SignalR connection');
        return;
      }

      try {
        console.log('Setting up SignalR connection for authenticated user...');
        await signalRConnection.connect();
        
        if (!isSubscribed) return;

        // Subscribe to all SignalR events using the helper
        registerNotificationEvents.newNotification((data: unknown) => handleNewNotification(data as NotificationResponse));
        registerNotificationEvents.importCompleted((data: unknown) => handleImportCompleted(data as ImportCompletedData));
        registerNotificationEvents.importProgress((data: unknown) => handleImportProgress(data as ImportProgressData));
        registerNotificationEvents.customerUpdated((data: unknown) => handleCustomerUpdated(data as CustomerUpdatedData));
        registerNotificationEvents.unreadCountChanged(handleUnreadCountChanged);
        
        console.log('SignalR event handlers registered successfully');
        
      } catch (error) {
        console.error('Failed to setup SignalR connection:', error);
        
        // Optional: Show connection error notification only if we expected to connect
        if (isAuthenticated) {
          addNotification({
            type: 'warning',
            title: 'Real-time Updates Unavailable',
            message: 'Some features may require manual refresh. Attempting to reconnect...',
          });
        }
      }
    };

    setupSignalRConnection();

    return () => {
      isSubscribed = false;
      
      // Clean up all event listeners using the helper
      unregisterNotificationEvents.all();
    };
  }, [
    isAuthenticated, // Re-run when authentication state changes
    handleNewNotification, 
    handleImportCompleted, 
    handleImportProgress,
    handleCustomerUpdated, 
    handleUnreadCountChanged,
    addNotification
  ]);

  return {
    connectionState: signalRConnection.connectionState,
    isAuthenticated,
    // Expose connection methods for manual control if needed
    joinUserGroup: () => signalRConnection.joinUserGroup(),
    leaveUserGroup: () => signalRConnection.leaveUserGroup(),
  };
};

// Specialized hook for monitoring specific import jobs
export const useRealTimeImportUpdates = (importJobId?: string) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const user = useUser();

  // Only try to connect if user is authenticated
  const isAuthenticated = !!user.data && !user.isLoading;

  const handleImportProgress = useCallback((data: ImportProgressData) => {
    // Only handle events for our specific import job
    if (!importJobId || data.importJobId !== importJobId) return;
    
    console.log(`Import progress for job ${importJobId}:`, data);
    
    // Update the specific import status query
    queryClient.setQueryData<ImportProgressData | undefined>(['imports', 'status', importJobId], (oldData) => {
      if (!oldData) return data;
      
      return {
        ...oldData,
        status: data.status,
        processedRecords: data.processedRecords,
        validRecords: data.validRecords,
        invalidRecords: data.invalidRecords,
        message: data.message,
      };
    });
    
    // Show status change notifications
    if (data.status === 'Validated') {
      addNotification({
        type: 'success',
        title: 'File Validated',
        message: `${data.validRecords} valid records found. Import processing started.`,
      });
    } else if (data.status === 'Processing') {
      addNotification({
        type: 'info',
        title: 'Import Processing',
        message: 'Your customer data is being imported...',
      });
    }
  }, [importJobId, queryClient, addNotification]);

  const handleImportCompleted = useCallback((data: ImportCompletedData) => {
    // Only handle events for our specific import job
    if (!importJobId) return;
    
    console.log(`Import completed for job ${importJobId}:`, data);
    
    // Check if this matches our import job
    const dataImportJobId = data.importJobId || data.id; // Handle both formats
    if (dataImportJobId && dataImportJobId !== importJobId) return;
    
    // Refresh all relevant data
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['imports'] });
  }, [importJobId, queryClient]);

  useEffect(() => {
    if (!importJobId || !isAuthenticated) return;

    const setupImportMonitoring = async () => {
      try {
        console.log(`Setting up import monitoring for job: ${importJobId}`);
        await signalRConnection.connect();
        
        // Subscribe to progress and completion events using the helper
        registerNotificationEvents.importProgress((data: unknown) => handleImportProgress(data as ImportProgressData));
        registerNotificationEvents.importCompleted((data: unknown) => handleImportCompleted(data as ImportCompletedData));
        
        console.log(`Import monitoring setup for job: ${importJobId}`);
      } catch (error) {
        console.error('Failed to setup import monitoring:', error);
      }
    };

    setupImportMonitoring();

    return () => {
      // Clean up specific event listeners using the helper
      unregisterNotificationEvents.importProgress();
      unregisterNotificationEvents.importCompleted();
    };
  }, [importJobId, isAuthenticated, handleImportProgress, handleImportCompleted]);

  return {
    importJobId,
    connectionState: signalRConnection.connectionState,
  };
};