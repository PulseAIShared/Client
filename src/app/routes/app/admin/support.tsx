import { useEffect } from 'react';
import { useSupportStore } from '@/features/chatbot/support-store';
import { useGetAdminSupportSessions } from '@/features/chatbot/api/chatbot';
import { AdminSupportDashboard } from '@/features/chatbot/components/admin-support-dashboard';
import { PlatformAuthorization, useAuthorization } from '@/lib/authorization';
import { AppPageHeader, ContentLayout } from '@/components/layouts';

export default function AdminSupportPage() {
  const { 
    connect, 
    disconnect, 
    isConnected,
    connectionError,
    setAdminSessions 
  } = useSupportStore();

  const { data: apiAdminSessions, isLoading, error } = useGetAdminSupportSessions();
const { checkPlatformPolicy } = useAuthorization();
  useEffect(() => {
    const initializeSupport = async () => {
      try {
        await connect();
        // Admin group is joined automatically by server
      } catch (error) {
        console.warn('Failed to initialize support event handlers, continuing without real-time features:', error);
      }
    };

    initializeSupport();

    return () => {
      disconnect();
    };
  }, [connect, disconnect, isConnected]);

  useEffect(() => {
    if (apiAdminSessions) {
      setAdminSessions(apiAdminSessions);
    }
  }, [apiAdminSessions, setAdminSessions]);

  if (isLoading) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto mb-4"></div>
            <p className="text-text-muted">Loading support dashboard...</p>
          </div>
        </div>
      </ContentLayout>
    );
  }

  if (error || connectionError) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error-bg flex items-center justify-center">
              <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              Support Dashboard Error
            </h2>
            <p className="text-text-muted mb-4">
              {error?.message || connectionError || 'Failed to load support dashboard'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <PlatformAuthorization 
      policyCheck={checkPlatformPolicy('admin:users')}
      forbiddenFallback={
        <ContentLayout>
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error-bg flex items-center justify-center">
                <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-text-primary mb-2">Access Denied</h2>
              <p className="text-text-muted">You don't have permission to access the support dashboard.</p>
            </div>
          </div>
        </ContentLayout>
      }
    >
      <ContentLayout>
        <div className="space-y-6">
          <AppPageHeader
            title="Support Dashboard"
            description="Manage customer support sessions and assist users in real-time."
          />
          {!isConnected && (
            <div className="p-4 bg-warning-bg border border-warning text-warning-muted rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>Real-time connection unavailable. Support features may be limited.</span>
              </div>
            </div>
          )}

          <AdminSupportDashboard />
        </div>
      </ContentLayout>
    </PlatformAuthorization>
  );
}
