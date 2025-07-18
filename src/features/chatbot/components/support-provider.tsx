import React, { createContext, useContext, useEffect } from 'react';
import { useSupportStore } from '../support-store';
import { useUser } from '@/lib/auth';

interface SupportProviderProps {
  children: React.ReactNode;
}

const SupportContext = createContext<{
  isReady: boolean;
} | null>(null);

export const SupportProvider: React.FC<SupportProviderProps> = ({ children }) => {
  const { data: user } = useUser();
  const { connect, disconnect, isConnected, connectionError } = useSupportStore();

  useEffect(() => {
    if (user) {
      // Only connect if user is authenticated
      const initializeConnection = async () => {
        try {
          await connect();
        } catch (error) {
          console.warn('Support connection failed, continuing without real-time features:', error);
        }
      };

      // Don't auto-connect, let individual components connect when needed
      // initializeConnection();
    }

    return () => {
      if (user) {
        disconnect();
      }
    };
  }, [user, connect, disconnect]);

  return (
    <SupportContext.Provider value={{ isReady: isConnected }}>
      {children}
    </SupportContext.Provider>
  );
};

export const useSupportContext = () => {
  const context = useContext(SupportContext);
  if (!context) {
    throw new Error('useSupportContext must be used within a SupportProvider');
  }
  return context;
};