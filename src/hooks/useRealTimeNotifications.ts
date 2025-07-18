import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { signalRConnection } from '@/lib/signalr';
import { useUser } from '@/lib/auth';
import { getToken } from '@/lib/api-client';
import { useChatbotStore } from '@/features/chatbot/store';
import type { SupportSession, SupportMessage } from '@/features/chatbot/api/chatbot';
import { PlatformRole } from '@/types/api';

export const useRealTimeNotifications = () => {
  const queryClient = useQueryClient();
  const user = useUser();
  const { 
    setSupportSession, 
    updateSupportSession, 
    addSupportMessage,
    supportSession,
    openChat,
    setActiveMode
  } = useChatbotStore();

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

  // Support session event handlers
  const handleSupportSessionCreated = useCallback((session: SupportSession) => {
    console.log('Support session created:', session);
    setSupportSession(session);
    setActiveMode('support_session');
    
    // Invalidate support queries
    queryClient.invalidateQueries({ queryKey: ['support'] });
  }, [setSupportSession, setActiveMode, queryClient]);

  const handleSupportSessionClaimed = useCallback((session: SupportSession) => {
    console.log('Support session claimed by admin:', session);
    updateSupportSession(session);
    
    // Open chat and switch to support mode if not already open
    if (!supportSession) {
      openChat();
      setActiveMode('support_session');
    }
  }, [updateSupportSession, supportSession, openChat, setActiveMode]);

  const handleSupportSessionEscalated = useCallback((data: { sessionId: string; escalationLevel: number; reason?: string }) => {
    console.log('Support session escalated:', data);
    
    if (supportSession?.id === data.sessionId) {
      updateSupportSession({
        escalationLevel: data.escalationLevel as 0 | 1 | 2 | 3,
        aiEscalationReason: data.reason,
      });
    }
  }, [supportSession, updateSupportSession]);

  const handleSupportSessionClosed = useCallback((data: { sessionId: string }) => {
    console.log('Support session closed:', data);
    
    if (supportSession?.id === data.sessionId) {
      setSupportSession(null);
      setActiveMode('page_help');
    }
    
    // Invalidate support queries
    queryClient.invalidateQueries({ queryKey: ['support'] });
  }, [supportSession, setSupportSession, setActiveMode, queryClient]);

  const handleSupportMessageReceived = useCallback((message: SupportMessage) => {
    console.log('Support message received:', message);
    
    if (supportSession?.id === message.sessionId) {
      addSupportMessage(message);
      
      // Open chat if message is from admin/AI and chat is closed
      if (!message.isFromUser && !supportSession) {
        openChat();
        setActiveMode('support_session');
      }
    }
  }, [supportSession, addSupportMessage, openChat, setActiveMode]);

  const handleNewSupportRequest = useCallback((session: SupportSession) => {
    console.log('New support request for admin:', session);
    
    // Only handle if user is admin
    if (user.data?.platformRole === PlatformRole.Admin) {
      // Invalidate admin support queries
      queryClient.invalidateQueries({ queryKey: ['support', 'admin'] });
      
      // Show notification (could add toast notification here)
      console.log('Admin notification: New support request from', session.userEmail);
    }
  }, [user.data?.platformRole, queryClient]);

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

        // Register specific event handlers AFTER connection is established
        signalRConnection.on('analysis_completed', handleAnalysisCompleted);
        signalRConnection.on('import_completed', handleImportCompleted);
        
        console.log('Notification event handlers registered');
        
        // Register support session event handlers with type-safe wrappers
        signalRConnection.on('SupportSessionCreated', (session: unknown) => 
          handleSupportSessionCreated(session as SupportSession)
        );
        signalRConnection.on('SupportSessionClaimed', (session: unknown) => 
          handleSupportSessionClaimed(session as SupportSession)
        );
        signalRConnection.on('SupportSessionEscalated', (data: unknown) => 
          handleSupportSessionEscalated(data as { sessionId: string; escalationLevel: number; reason?: string })
        );
        signalRConnection.on('SupportSessionClosed', (data: unknown) => 
          handleSupportSessionClosed(data as { sessionId: string })
        );
        signalRConnection.on('SupportMessageReceived', (message: unknown) => 
          handleSupportMessageReceived(message as SupportMessage)
        );
        signalRConnection.on('NewSupportRequest', (session: unknown) => 
          handleNewSupportRequest(session as SupportSession)
        );
        
        // Note: Admin support group joining is handled automatically by the server
        // based on user permissions when they connect
        
        console.log('SignalR event handlers registered');
        
      } catch (error) {
        console.error('Failed to setup SignalR connection:', error);
      }
    };

    setupSignalRConnection();

    return () => {
      isSubscribed = false;
      
      // Clean up event handlers
      signalRConnection.off('analysis_completed', handleAnalysisCompleted);
      signalRConnection.off('import_completed', handleImportCompleted);
      
      // Note: SignalR automatically cleans up handlers on disconnect
      // We don't need to manually remove them since they're wrapped
    };
  }, [
    isAuthenticated, 
    handleAnalysisCompleted, 
    handleImportCompleted,
    handleSupportSessionCreated,
    handleSupportSessionClaimed,
    handleSupportSessionEscalated,
    handleSupportSessionClosed,
    handleSupportMessageReceived,
    handleNewSupportRequest,
    user.data?.platformRole
  ]);

  return {
    connectionState: signalRConnection.connectionState,
    isAuthenticated,
  };
};