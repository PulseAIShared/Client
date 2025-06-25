import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";
import { AuthLayout } from '@/components/layouts';
import { LoginForm } from '@/features/auth/components/login-form';

export const LoginRoute = () => {
  const navigate = useNavigate();
  const [ssoLoading, setSsoLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

      
  const handleSSOLogin = (provider: 'google' | 'facebook' | 'apple') => {
    setSsoLoading(provider);
    setError(null);
    
    const baseUrl = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';
    const popup = window.open(
      `${baseUrl}auth/${provider}?popup=true`,
      'oauth-popup',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    if (!popup) {
      setError('Popup blocked. Please allow popups for this site.');
      setSsoLoading(null);
      return;
    }

    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'OAUTH_SUCCESS') {
        popup.close();
        setSsoLoading(null);
        navigate('/app');
      } else if (event.data.type === 'OAUTH_ERROR') {
        setError(event.data.error);
        popup.close();
        setSsoLoading(null);
      }
    };

    window.addEventListener('message', messageHandler);
    
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        window.removeEventListener('message', messageHandler);
        setSsoLoading(null);
        clearInterval(checkClosed);
      }
    }, 1000);
  };

  const handleLoginSuccess = () => {
    navigate('/app');
  };

  return (
    <AuthLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #7c3aed 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, #3b82f6 0%, transparent 50%)`,
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
              <div className="w-2 h-2 bg-blue-400 rounded-full blur-sm"></div>
            </div>
          ))}
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full mb-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm font-medium text-blue-700">Welcome Back</span>
              </div>
              
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Sign in to PulseLTV
              </h1>
              <p className="text-slate-600">
                Access your AI-powered dashboard
              </p>
            </div>

            {/* SSO Loading Overlay */}
            {ssoLoading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center z-50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-700 font-medium">
                    Complete authentication in the popup window
                  </p>
                  <p className="text-slate-500 text-sm mt-1">
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
                className="w-full flex items-center justify-center gap-3 h-12 border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaGoogle className="text-red-500" />
                <span>Continue with Google</span>
              </button>

              <button 
                onClick={() => handleSSOLogin('facebook')}
                disabled={!!ssoLoading}
                className="w-full flex items-center justify-center gap-3 h-12 border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaFacebook className="text-blue-600" />
                <span>Continue with Facebook</span>
              </button>

              <button 
                onClick={() => handleSSOLogin('apple')}
                disabled={!!ssoLoading}
                className="w-full flex items-center justify-center gap-3 h-12 border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaApple className="text-slate-800" />
                <span>Continue with Apple</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center mb-6">
              <hr className="flex-grow border-slate-300" />
              <span className="mx-4 text-sm text-slate-500 font-medium">OR</span>
              <hr className="flex-grow border-slate-300" />
            </div>

            {/* Email/Password Authentication */}
            <LoginForm onSuccess={handleLoginSuccess} />

            {/* Footer Links */}
            <div className="mt-8 text-center space-y-4">
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <Link 
                  to="/register" 
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
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