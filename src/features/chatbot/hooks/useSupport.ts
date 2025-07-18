import { useEffect } from 'react';
import { useSupportStore } from '../support-store';
import { useGetActiveSupportSession } from '../api/chatbot';

export const useSupport = () => {
  const {
    connect,
    disconnect,
    isConnected,
    connectionError,
    currentSession,
    messages,
    typingUsers,
    joinSession,
    sendMessage,
    setTyping,
    setCurrentSession,
    isLoading,
    error,
  } = useSupportStore();

  const { data: activeSession } = useGetActiveSupportSession();

  // Initialize connection on mount
  useEffect(() => {
    const initializeConnection = async () => {
      try {
        await connect();
      } catch (error) {
        console.error('Failed to initialize support connection:', error);
      }
    };

    initializeConnection();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Sync active session from API
  useEffect(() => {
    if (activeSession && activeSession.id !== currentSession?.id) {
      setCurrentSession(activeSession);
    }
  }, [activeSession, currentSession, setCurrentSession]);

  return {
    // Connection state
    isConnected,
    connectionError,
    
    // Session state
    currentSession,
    messages,
    typingUsers,
    
    // Actions
    joinSession,
    sendMessage,
    setTyping,
    setCurrentSession,
    
    // Status
    isLoading,
    error,
  };
};

export const useAdminSupport = () => {
  const {
    connect,
    disconnect,
    isConnected,
    connectionError,
    adminSessions,
    onlineAdmins,
    pickupSession,
    getActiveSessions,
    isLoading,
    error,
  } = useSupportStore();

  // Initialize admin connection on mount
  useEffect(() => {
    const initializeAdminConnection = async () => {
      try {
        await connect();
        if (isConnected) {
          await getActiveSessions();
        }
      } catch (error) {
        console.error('Failed to initialize admin support connection:', error);
      }
    };

    initializeAdminConnection();

    return () => {
      disconnect();
    };
  }, [connect, disconnect, getActiveSessions, isConnected]);

  return {
    // Connection state
    isConnected,
    connectionError,
    
    // Admin state
    adminSessions,
    onlineAdmins,
    
    // Admin actions
    pickupSession,
    getActiveSessions,
    
    // Status
    isLoading,
    error,
  };
};