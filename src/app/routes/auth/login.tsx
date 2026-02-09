import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";
import { AuthLayout } from '@/components/layouts';
import { LoginForm } from '@/features/auth/components/login-form';
import { useQueryClient } from '@tanstack/react-query';
import { setToken } from '@/lib/api-client';

export const LoginRoute = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [ssoLoading, setSsoLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(null);
  const checkClosedRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanupPopupListeners = useCallback(() => {
    if (messageHandlerRef.current) {
      window.removeEventListener('message', messageHandlerRef.current);
      messageHandlerRef.current = null;
    }
    if (checkClosedRef.current) {
      clearInterval(checkClosedRef.current);
      checkClosedRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (searchParams.get('sessionExpired') === 'true') {
      setError(
        'Your session has expired. Please sign in again.',
      );
      // Clean up the URL parameter
      searchParams.delete('sessionExpired');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  // Clean up popup listeners on unmount
  useEffect(() => {
    return cleanupPopupListeners;
  }, [cleanupPopupListeners]);

  const handleSSOLogin = (provider: 'google' | 'facebook' | 'apple') => {
    // Clean up any previous popup listeners
    cleanupPopupListeners();

    setSsoLoading(provider);
    setError(null);

    const baseUrl = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';
    const frontendOrigin = window.location.origin;
    const popupUrl = `${baseUrl}auth/${provider}/login?popup=true&redirectOrigin=${encodeURIComponent(frontendOrigin)}`;

    const popup = window.open(
      popupUrl,
      'oauth-popup',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    if (!popup) {
      setError('Popup blocked. Please allow popups for this site.');
      setSsoLoading(null);
      return;
    }

    const messageHandler = async (event: MessageEvent) => {
      const apiOrigin = new URL(baseUrl).origin;

      if (event.origin !== apiOrigin) {
        return;
      }

      if (event.data.type === 'OAUTH_SUCCESS') {
        cleanupPopupListeners();
        popup.close();
        setSsoLoading(null);

        const authData = event.data.payload;
        if (authData?.token) {
          setToken(authData.token);
        }

        queryClient.invalidateQueries();
        navigate('/app');
      } else if (event.data.type === 'OAUTH_ERROR') {
        cleanupPopupListeners();
        popup.close();
        setSsoLoading(null);

        if (event.data.error?.includes('SsoAccountNotFound') || event.data.error?.includes('no account') || event.data.error?.includes('not found')) {
          setError('No account found for this provider. Please register first or use a different sign-in method.');
        } else {
          setError(event.data.error || 'Authentication failed. Please try again.');
        }
      }
    };

    messageHandlerRef.current = messageHandler;
    window.addEventListener('message', messageHandler);

    checkClosedRef.current = setInterval(() => {
      try {
        if (popup.closed) {
          cleanupPopupListeners();
          setSsoLoading(null);
        }
      } catch {
        // Cross-origin policy blocks popup.closed check
      }
    }, 1000);
  };

  const handleLoginSuccess = () => {
    queryClient.invalidateQueries();
    navigate('/app');
  };

  return (
    <AuthLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #0ea5e9 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, #1e3a8a 0%, transparent 50%)`,
          }}></div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 2}s`,
              }}
            >
              <div className="w-2 h-2 bg-sky-400 rounded-full blur-sm"></div>
            </div>
          ))}
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20">
            {/* Header */}
            <div className="text-center mb-8">

              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Sign in to PulseLTV
              </h1>
              <p className="text-gray-600">
                Access your dashboard
              </p>
            </div>

            {/* SSO Loading Overlay */}
            {ssoLoading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center z-50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4"></div>
                  <p className="text-gray-700 font-medium">
                    Complete authentication in the popup window
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Signing in with {ssoLoading}...
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* SSO Buttons */}
            <div className="space-y-3 mb-6">
              <button 
                onClick={() => handleSSOLogin('google')}
                disabled={!!ssoLoading}
                className="w-full flex items-center justify-center gap-3 h-12 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaGoogle className="text-red-500" />
                <span>Continue with Google</span>
              </button>

              <button 
                onClick={() => handleSSOLogin('facebook')}
                disabled={!!ssoLoading}
                className="w-full flex items-center justify-center gap-3 h-12 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaFacebook className="text-blue-600" />
                <span>Continue with Facebook</span>
              </button>

              <button 
                onClick={() => handleSSOLogin('apple')}
                disabled={!!ssoLoading}
                className="w-full flex items-center justify-center gap-3 h-12 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaApple className="text-gray-800" />
                <span>Continue with Apple</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center mb-6">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-4 text-sm text-gray-500 font-medium">OR</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            {/* Email/Password Authentication */}
            <LoginForm onSuccess={handleLoginSuccess} />

            {/* Footer Links */}
            <div className="mt-8 text-center space-y-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link 
                  to="/register" 
                  className="font-semibold text-sky-600 hover:text-sky-700 transition-colors"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};