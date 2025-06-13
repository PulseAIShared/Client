import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { signalRConnection } from '@/lib/signalr-connection';
import { useUser } from '@/lib/auth';
import { getToken } from '@/lib/api-client';
import { registerNotificationEvents, unregisterNotificationEvents } from '@/lib/signalr-event-helper';

export const useRealTimeNotifications = () => {
  const queryClient = useQueryClient();
  const user = useUser();

  const isAuthenticated = !!user.data && !user.isLoading;

  // Handler for analysis completion - invalidate analysis and notifications
  const handleAnalysisCompleted = useCallback(() => {
    console.log('Analysis completed - refreshing relevant queries');
    
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
    queryClient.invalidateQueries({ queryKey: ['customers'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
  }, [queryClient]);

  // Handler for import completion - invalidate customers, dashboard and notifications
  const handleImportCompleted = useCallback(() => {
    console.log('Import completed - refreshing relevant queries');
    
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
  }, [queryClient]);

  useEffect(() => {
    let isSubscribed = true;

    const setupSignalRConnection = async () => {
      if (!isAuthenticated) {
        console.log('User not authenticated, skipping SignalR connection');
        return;
      }

      const token = getToken();
      if (!token) {
        console.log('No authentication token available, skipping SignalR connection');
        return;
      }

      try {
        console.log('Setting up SignalR connection...');
        await signalRConnection.connect();
        
        if (!isSubscribed) return;

        // Register specific event handlers
        registerNotificationEvents.analysisCompleted(handleAnalysisCompleted);
        registerNotificationEvents.importCompleted(handleImportCompleted);
        
        console.log('SignalR event handlers registered');
        
      } catch (error) {
        console.error('Failed to setup SignalR connection:', error);
      }
    };

    setupSignalRConnection();

    return () => {
      isSubscribed = false;
      unregisterNotificationEvents.all();
    };
  }, [isAuthenticated, handleAnalysisCompleted, handleImportCompleted]);

  return {
    connectionState: signalRConnection.connectionState,
    isAuthenticated,
  };
};