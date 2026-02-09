import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Outlet, useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts';
import { SupportProvider } from '@/features/chatbot';
import { RealTimeNotificationStatusProvider } from '@/hooks/real-time-notification-status';

export const AppRoot = () => {
  const location = useLocation();
  return (
    <RealTimeNotificationStatusProvider>
      <SupportProvider>
        <DashboardLayout>
          <Suspense
            fallback={
              <div className="flex size-full items-center justify-center">
           Spinner
              </div>
            }
          >
            <ErrorBoundary
              key={location.pathname}
              fallback={<div>Something went wrong!</div>}
            >
              <Outlet />
            </ErrorBoundary>
          </Suspense>
        </DashboardLayout>
      </SupportProvider>
    </RealTimeNotificationStatusProvider>
  );
};
