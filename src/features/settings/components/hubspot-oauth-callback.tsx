// src/features/settings/components/hubspot-oauth-callback.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useNotifications } from '@/components/ui/notifications';
import { api } from '@/lib/api-client';
import { Spinner } from '@/components/ui/spinner';

export const HubSpotOAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing HubSpot connection...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage(`OAuth error: ${error}`);
          addNotification({
            type: 'error',
            title: 'HubSpot Connection Failed',
            message: `OAuth error: ${error}`
          });
          return;
        }

        if (!code || !state) {
          setStatus('error');
          setMessage('Missing authorization code or state parameter');
          addNotification({
            type: 'error',
            title: 'HubSpot Connection Failed',
            message: 'Invalid OAuth callback parameters'
          });
          return;
        }

        // Send callback data to backend
        const response = await api.post('/integrations/hubspot/callback', {
          code,
          state
        });

        setStatus('success');
        setMessage('HubSpot connected successfully!');
        
        addNotification({
          type: 'success',
          title: 'HubSpot Connected',
          message: 'Your HubSpot integration is now active'
        });

        // Redirect to settings page after a short delay
        setTimeout(() => {
          navigate('/app/settings', { replace: true });
        }, 2000);

      } catch (error: unknown) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Failed to complete HubSpot connection');
        
        addNotification({
          type: 'error',
          title: 'HubSpot Connection Failed',
          message: error instanceof Error ? error.message : 'Please try connecting again'
        });
      }
    };

    handleCallback();
  }, [searchParams, navigate, addNotification]);

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Spinner size="lg" className="text-blue-400" />;
      case 'success':
        return (
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'from-blue-600/10 to-purple-600/10';
      case 'success':
        return 'from-green-600/10 to-emerald-600/10';
      case 'error':
        return 'from-red-600/10 to-orange-600/10';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="relative">
        <div className={`absolute inset-0 bg-gradient-to-r ${getStatusColor()} rounded-2xl blur-3xl`}></div>
        
        <div className="relative bg-slate-800/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-700/50 shadow-xl max-w-md w-full text-center">
          <div className="mb-6">
            {getStatusIcon()}
          </div>
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              {status === 'processing' && 'Connecting HubSpot...'}
              {status === 'success' && 'Connection Successful!'}
              {status === 'error' && 'Connection Failed'}
            </h1>
            <p className="text-slate-300">
              {message}
            </p>
          </div>

          {status === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-600/10 p-4 rounded-lg border border-green-500/30">
                <p className="text-green-300 text-sm">
                  Redirecting you to settings page...
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <button
                onClick={() => navigate('/app/settings')}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
              >
                Back to Settings
              </button>
            </div>
          )}

          {status === 'processing' && (
            <div className="text-slate-400 text-sm">
              Please wait while we complete the connection...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};