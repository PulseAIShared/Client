import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { AuthLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { useSendVerificationCode, useVerifyCode } from '@/lib/auth';

type AuthStep = 'email' | 'code';

export const RegisterRoute = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [ssoLoading, setSsoLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auth hooks
  const sendCodeMutation = useSendVerificationCode({
    onSuccess: () => {
      setStep('code');
      setError(null);
    },
    onError: (error) => {
      setError(error.message || 'Failed to send verification code');
    }
  });

  const verifyCodeMutation = useVerifyCode({
    onSuccess: (data) => {
      console.log('Registration successful:', data);
      navigate('/app');
    },
    onError: (error) => {
      setError(error.message || 'Invalid verification code');
    }
  });
  const [invitationInfo, setInvitationInfo] = useState<{
    companyName?: string;
    inviterName?: string;
    hasInvitation: boolean;
  }>({ hasInvitation: false });


  useEffect(() => {
    const invitationToken = searchParams.get('invitation') || searchParams.get('token');
    const companyName = searchParams.get('company');
    const inviterName = searchParams.get('inviter');

    if (invitationToken) {
      setInvitationInfo({
        companyName: companyName || undefined,
        inviterName: inviterName || undefined,
        hasInvitation: true,
      });
    }
  }, [searchParams]);

  // SSO Popup handling
  const handleSSOLogin = (provider: 'google' | 'facebook' | 'apple') => {
    setSsoLoading(provider);
    setError(null);
    
    // Include invitation token in SSO URL if present
    const invitationToken = searchParams.get('invitation') || searchParams.get('token');
    const inviteParam = invitationToken ? `&invitation=${invitationToken}` : '';
    
    const baseUrl = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';
    const popup = window.open(
      `${baseUrl}auth/${provider}?popup=true${inviteParam}`,
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
        // Store auth data and redirect
        const authData = event.data.payload;
        popup.close();
        setSsoLoading(null);
        
        // Redirect based on onboarding status (ProtectedRoute will handle this)
        navigate('/app');
      } else if (event.data.type === 'OAUTH_ERROR') {
        setError(event.data.error);
        popup.close();
        setSsoLoading(null);
      }
    };

    window.addEventListener('message', messageHandler);
    
    // Cleanup listener when popup closes
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        window.removeEventListener('message', messageHandler);
        setSsoLoading(null);
        clearInterval(checkClosed);
      }
    }, 1000);
  };

  // Email verification flow
  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // TODO: Need to modify the hook to support invitation tokens
    sendCodeMutation.mutate(email);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // TODO: Need to modify the hook to support invitation tokens
    verifyCodeMutation.mutate({ email, code });
  };

  const getHeaderContent = () => {
    if (invitationInfo.hasInvitation) {
      return {
        badge: { text: "Team Invitation", color: "bg-blue-100", textColor: "text-blue-700" },
        title: invitationInfo.companyName 
          ? `Join ${invitationInfo.companyName} on PulseLTV`
          : "Join Team on PulseLTV",
        subtitle: invitationInfo.inviterName
          ? `${invitationInfo.inviterName} has invited you to collaborate`
          : "You've been invited to join a team workspace"
      };
    }

    return {
      badge: { text: "Get Started", color: "bg-green-100", textColor: "text-green-700" },
      title: "Create your PulseLTV account",
      subtitle: "Start predicting and recovering revenue with AI"
    };
  };

  const headerContent = getHeaderContent();

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
              <div className={`inline-flex items-center gap-2 ${headerContent.badge.color} px-4 py-2 rounded-full mb-4`}>
                <div className={`w-2 h-2 ${invitationInfo.hasInvitation ? 'bg-blue-600' : 'bg-green-600'} rounded-full`}></div>
                <span className={`text-sm font-medium ${headerContent.badge.textColor}`}>
                  {headerContent.badge.text}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {headerContent.title}
              </h1>
              <p className="text-slate-600">
                {headerContent.subtitle}
              </p>

              {/* Invitation-specific info */}
              {invitationInfo.hasInvitation && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center gap-2 text-blue-800">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm font-medium">
                      You'll automatically join the team workspace after registration
                    </span>
                  </div>
                </div>
              )}
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
                    Signing up with {ssoLoading}...
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

            {/* Email Authentication */}
            {step === 'email' ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  isLoading={sendCodeMutation.isPending}
                  icon={<IoMdMail className="mr-2" />}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                >
                  Send Verification Code
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-slate-600">
                    Enter the verification code sent to
                  </p>
                  <p className="font-semibold text-slate-900">{email}</p>
                </div>
                
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-2">
                      Verification Code
                    </label>
                    <input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                      maxLength={6}
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    isLoading={verifyCodeMutation.isPending}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                  >
                    Verify & Create Account
                  </Button>
                  
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="w-full text-sm text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    ← Back to email
                  </button>
                </form>
              </div>
            )}

            {/* Footer Links */}
            <div className="mt-8 text-center space-y-4">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <Link 
                  to="/login" 
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Trust indicator */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};