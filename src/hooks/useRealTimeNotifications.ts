// src/hooks/useRealTimeNotifications.ts
import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '@/components/ui/notifications/notifications-store';
import { signalRConnection } from '@/lib/signalr-connection';
import { NotificationResponse } from '@/features/notifications/api/notifications';

interface ImportCompletedData {
  importJobId: string;
  status: 'Completed' | 'Failed' | 'Cancelled';
  message: string;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  metadata?: Record<string, unknown>;
}

interface CustomerUpdatedData {
  customerId: string;
  action: 'created' | 'updated' | 'deleted';
  customerCount?: number;
}

export const useRealTimeNotifications = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const handleNewNotification = useCallback((notification: NotificationResponse) => {
    console.log('Received new notification:', notification);
    
    // Add to local notification store
    addNotification({
      type: notification.type.toLowerCase() as 'success' | 'error' | 'warning' | 'info',
      title: notification.title,
      message: notification.message,
    });

    // Invalidate notifications query to refresh the list
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    // Also invalidate unread count
    queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
  }, [addNotification, queryClient]);

  const handleImportCompleted = useCallback((data: ImportCompletedData) => {
    console.log('Import completed:', data);
    
    // Invalidate customer and dashboard data
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['imports'] });

    // Show appropriate notification
    if (data.status === 'Completed') {
      addNotification({
        type: 'success',
        title: 'Import Completed',
        message: `Successfully imported ${data.successfulRecords} customers. Data refreshed automatically.`,
      });
    } else if (data.status === 'Failed') {
      addNotification({
        type: 'error',
        title: 'Import Failed',
        message: data.message || 'The import could not be completed.',
      });
    }
  }, [queryClient, addNotification]);

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
  }, [queryClient]);

  const handleUnreadCountChanged = useCallback((count: number) => {
    console.log('Unread count changed:', count);
    
    // Update unread count query data directly
    queryClient.setQueryData(['notifications', 'unread-count'], { count });
    
    // Also invalidate notifications query to ensure consistency
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }, [queryClient]);

  useEffect(() => {
    let isSubscribed = true;

    const setupSignalRConnection = async () => {
      try {
        await signalRConnection.connect();
        
        if (!isSubscribed) return;

        // Subscribe to events
        signalRConnection.on('NewNotification', handleNewNotification);
        signalRConnection.on('ImportCompleted', handleImportCompleted);
        signalRConnection.on('CustomerUpdated', handleCustomerUpdated);
        signalRConnection.on('UnreadCountChanged', handleUnreadCountChanged);
        
        console.log('SignalR event handlers registered');
        
      } catch (error) {
        console.error('Failed to setup SignalR connection:', error);
      }
    };

    setupSignalRConnection();

    return () => {
      isSubscribed = false;
      
      // Unsubscribe from events
      signalRConnection.off('NewNotification', handleNewNotification);
      signalRConnection.off('ImportCompleted', handleImportCompleted);
      signalRConnection.off('CustomerUpdated', handleCustomerUpdated);
      signalRConnection.off('UnreadCountChanged', handleUnreadCountChanged);
    };
  }, [handleNewNotification, handleImportCompleted, handleCustomerUpdated, handleUnreadCountChanged]);

  return {
    connectionState: signalRConnection.connectionState,
  };
};

// Hook for specific import job monitoring
export const useRealTimeImportUpdates = (importJobId?: string) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const handleImportProgress = useCallback((data: {
    importJobId: string;
    status: string;
    processedRecords: number;
    totalRecords: number;
    message?: string;
  }) => {
    if (data.importJobId !== importJobId) return;
    
    console.log('Import progress:', data);
    
    // Update import status query data
    queryClient.setQueryData(['imports', 'status', importJobId], (oldData: any) => ({
      ...oldData,
      ...data,
    }));
    
    // Show progress notification for significant milestones
    const progressPercent = Math.round((data.processedRecords / data.totalRecords) * 100);
    if (progressPercent % 25 === 0 && progressPercent > 0 && progressPercent < 100) {
      addNotification({
        type: 'info',
        title: 'Import Progress',
        message: `${progressPercent}% complete (${data.processedRecords}/${data.totalRecords} records)`,
      });
    }
  }, [importJobId, queryClient, addNotification]);

  useEffect(() => {
    if (!importJobId) return;

    const setupImportMonitoring = async () => {
      try {
        await signalRConnection.connect();
        signalRConnection.on('ImportProgress', handleImportProgress);
      } catch (error) {
        console.error('Failed to setup import monitoring:', error);
      }
    };

    setupImportMonitoring();

    return () => {
      signalRConnection.off('ImportProgress', handleImportProgress);
    };
  }, [importJobId, handleImportProgress]);
};