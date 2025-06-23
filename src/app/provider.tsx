// src/app/provider.tsx (updated with proper SignalR handling)
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import '@mantine/core/styles.css';
import { queryConfig } from '@/lib/react-query';
import { Spinner } from '@/components/ui/spinner';
import { Notifications } from '@/components/ui/notifications';
import { MantineProvider } from '@mantine/core';
import { MainErrorFallback } from '@/components/errors/main';
import { ModalProvider } from './modal-provider';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';
import { ThemeProvider } from '@/lib/theme-context';

// Component to handle real-time notifications
const RealTimeNotificationHandler: React.FC = () => {
  const { connectionState, isAuthenticated } = useRealTimeNotifications();
  
  // Optional: Show connection status in development
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('SignalR Connection State:', connectionState);
      console.log('User Authenticated:', isAuthenticated);
    }
  }, [connectionState, isAuthenticated]);
  
  return null;
};

type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: queryConfig,
      }),
  );

  return (
    <React.Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          <Spinner size="xl" />
        </div>
      }
    >
      <ErrorBoundary FallbackComponent={MainErrorFallback}>
        <ThemeProvider>
          <MantineProvider>
            <QueryClientProvider client={queryClient}>
              <ModalProvider>
                {import.meta.env.DEV && <ReactQueryDevtools />}
                <Notifications />
                <RealTimeNotificationHandler />
                {children}
              </ModalProvider>
            </QueryClientProvider>
          </MantineProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </React.Suspense>
  );
};