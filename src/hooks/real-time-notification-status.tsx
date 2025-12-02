import * as React from 'react';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';

type RealTimeNotificationStatus = ReturnType<typeof useRealTimeNotifications>;

const defaultStatus: RealTimeNotificationStatus = {
  connectionState: 'Disconnected',
  isAuthenticated: false,
};

const RealTimeNotificationContext = React.createContext<RealTimeNotificationStatus>(defaultStatus);

export const RealTimeNotificationStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const status = useRealTimeNotifications();

  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('SignalR Connection State:', status.connectionState);
      console.log('User Authenticated:', status.isAuthenticated);
    }
  }, [status.connectionState, status.isAuthenticated]);

  return (
    <RealTimeNotificationContext.Provider value={status}>
      {children}
    </RealTimeNotificationContext.Provider>
  );
};

export const useRealTimeNotificationStatus = () => React.useContext(RealTimeNotificationContext);
