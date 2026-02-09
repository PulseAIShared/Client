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
import { ThemeProvider } from '@/lib/theme-context';
import { AUTH_CLEARED_EVENT, AUTH_USER_QUERY_KEY } from '@/lib/auth-constants';
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

  React.useEffect(() => {
    const handleAuthCleared = () => {
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, null);
    };

    window.addEventListener(AUTH_CLEARED_EVENT, handleAuthCleared);
    return () => {
      window.removeEventListener(AUTH_CLEARED_EVENT, handleAuthCleared);
    };
  }, [queryClient]);

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
                {children}
              </ModalProvider>
            </QueryClientProvider>
          </MantineProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </React.Suspense>
  );
};
