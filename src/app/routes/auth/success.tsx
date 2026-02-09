import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { needsOnboarding } from '@/lib/auth';
import { setToken } from '@/lib/api-client';
import { Spinner } from '@/components/ui/spinner';
import { AuthLayout } from '@/components/layouts';
import { User } from '@/types/api';

export const AuthSuccessRoute = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Verifying authentication...');

  useEffect(() => {
    const verifyAuthentication = async () => {
      try {
        // Check for OAuth errors in URL parameters
        const oauthError = searchParams.get('error');
        if (oauthError) {
          setError(`Authentication failed: ${searchParams.get('error_description') || oauthError}`);
          return;
        }

        // Call /auth/me to verify authentication (cookies should be set by backend)
        setStatus('Checking authentication status...');
        
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL || 'http://localhost:5000'}/auth/me`, {
          credentials: 'include' // Important: Include cookies for authentication
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('Authentication failed - please try signing in again');
          } else {
            setError('Failed to verify authentication - please try again');
          }
          return;
        }
        
        const authResponse = await response.json();
        if (authResponse.token) {
          setToken(authResponse.token);
        }

        const user: User = authResponse.user || authResponse;
        
        setStatus('Setting up your account...');
        
        // Check if user needs onboarding
        if (needsOnboarding(user)) {
          navigate('/onboarding');
        } else {
          navigate('/app');
        }
        
      } catch (err) {
        console.error('Authentication verification error:', err);
        setError(err instanceof Error ? err.message : 'Authentication verification failed');
      }
    };

    verifyAuthentication();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <AuthLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="relative z-10 w-full max-w-md">
            <div className="bg-white/95 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Authentication Failed</h1>
                <p className="text-slate-600 mb-4">{error}</p>
                <button
                  onClick={() => navigate('/auth')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20 text-center">
            <Spinner size="xl" className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Completing Sign In</h1>
            <p className="text-slate-600">{status}</p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};
