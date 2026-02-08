import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import { useNotifications } from '@/components/ui/notifications';
import { useHandleCallback, parseIntegrationProblem } from '../api/integrations';
import { clearOAuthSession, readOAuthSession } from '../lib/oauth-session';

type CallbackStatus = 'processing' | 'success' | 'error';

const FALLBACK_PROVIDER_TYPE = 'Slack';
const EXPIRATION_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export const SlackOAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const handleCallbackMutation = useHandleCallback();

  const [status, setStatus] = useState<CallbackStatus>('processing');
  const [message, setMessage] = useState('Processing Slack connection...');
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    const processCallback = async () => {
      if (hasProcessedRef.current) {
        return;
      }
      hasProcessedRef.current = true;

      const providerType = FALLBACK_PROVIDER_TYPE;
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const oauthError = searchParams.get('error');

      if (oauthError) {
        setStatus('error');
        setMessage(`OAuth error: ${oauthError}`);
        addNotification({
          type: 'error',
          title: 'Slack Connection Failed',
          message: `OAuth error: ${oauthError}`,
        });
        clearOAuthSession(providerType);
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setMessage('Missing authorization code or state parameter');
        addNotification({
          type: 'error',
          title: 'Slack Connection Failed',
          message: 'Invalid OAuth callback parameters',
        });
        clearOAuthSession(providerType);
        return;
      }

      const storedSession = readOAuthSession(providerType);
      if (!storedSession) {
        setStatus('error');
        setMessage('OAuth session not found or expired. Please restart the connection.');
        addNotification({
          type: 'error',
          title: 'Slack Connection Failed',
          message: 'OAuth session expired. Please try connecting again.',
        });
        return;
      }

      const { state: storedState, timestamp } = storedSession;
      if (storedState !== state) {
        setStatus('error');
        setMessage('State mismatch detected. Connection cancelled for security.');
        addNotification({
          type: 'error',
          title: 'Slack Connection Failed',
          message: 'OAuth state validation failed. Please try connecting again.',
        });
        clearOAuthSession(providerType);
        return;
      }

      if (typeof timestamp === 'number' && Date.now() - timestamp > EXPIRATION_WINDOW_MS) {
        setStatus('error');
        setMessage('OAuth session expired. Please restart the connection.');
        addNotification({
          type: 'error',
          title: 'Slack Connection Failed',
          message: 'OAuth session expired. Please try connecting again.',
        });
        clearOAuthSession(providerType);
        return;
      }

      try {
        const result = await handleCallbackMutation.mutateAsync({
          type: providerType,
          callbackData: { code, state },
        });

        const successMessage =
          result.message ??
          (result.needsConfiguration
            ? 'Connection successful. Additional configuration required.'
            : 'Slack connected successfully!');

        setStatus('success');
        setMessage(successMessage);

        addNotification({
          type: 'success',
          title: 'Slack Connected',
          message: successMessage,
        });

        const params = new URLSearchParams();
        params.set('integrationId', result.integrationId);
        if (result.needsConfiguration) {
          params.set('action', 'configure');
        }

        setTimeout(() => {
          const query = params.toString();
          navigate(query ? `/app/integrations?${query}` : '/app/integrations', { replace: true });
        }, 1500);
      } catch (error) {
        const problem = parseIntegrationProblem(error);
        const detail =
          problem.detail ??
          'Failed to complete Slack connection. Please retry the integration process.';
        setStatus('error');
        setMessage(detail);

        addNotification({
          type: 'error',
          title: 'Slack Connection Failed',
          message: detail,
        });
      } finally {
        clearOAuthSession(providerType);
      }
    };

    void processCallback();
    // Intentionally run once; guard prevents React.StrictMode double-call in dev
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Spinner size="lg" className="text-accent-primary" />;
      case 'success':
        return (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
            <svg className="h-8 w-8 text-success-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error/20">
            <svg className="h-8 w-8 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusGradient = () => {
    switch (status) {
      case 'processing':
        return 'from-accent-primary/10 to-accent-secondary/10';
      case 'success':
        return 'from-success/10 to-success-muted/10';
      case 'error':
        return 'from-error/10 to-warning/10';
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gradient-from via-gradient-via to-gradient-to p-4">
      <div className="relative">
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${getStatusGradient()} blur-3xl`} />

        <div className="relative w-full max-w-md rounded-2xl border border-border-primary/50 bg-surface-secondary/50 p-8 text-center shadow-xl backdrop-blur-lg">
          <div className="mb-6">{getStatusIcon()}</div>

          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-bold text-text-primary">
              {status === 'processing' && 'Connecting Slack...'}
              {status === 'success' && 'Connection Successful!'}
              {status === 'error' && 'Connection Failed'}
            </h1>
            <p className="text-text-secondary">{message}</p>
          </div>

          {status === 'success' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-success/30 bg-success/10 p-4">
                <p className="text-sm text-success">Redirecting you to the integrations dashboard.</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <button
                onClick={() => navigate('/app/integrations')}
                className="w-full transform rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary px-4 py-2 font-medium text-text-primary transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-secondary/25"
              >
                Back to Integrations
              </button>
            </div>
          )}

          {status === 'processing' && (
            <div className="text-sm text-text-muted">Please wait while we complete the connection.</div>
          )}
        </div>
      </div>
    </div>
  );
};
