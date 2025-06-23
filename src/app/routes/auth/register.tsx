// src/app/routes/auth/register.tsx
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Link } from '@/components/ui/link';
import { RegisterForm } from '@/features/auth/components/register-form';
import { AuthLayout } from '@/components/layouts';
import { useEffect, useState } from 'react';

export const RegisterRoute = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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

        <div className="relative z-10 w-full max-w-2xl">
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

            {/* Register Form */}
            <RegisterForm onSuccess={() => navigate("/app")} />

            {/* Footer Links */}
            <div className="mt-8 text-center space-y-4">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <Link 
                  to="/auth/login" 
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Sign in
                </Link>
              </p>
              
              {!invitationInfo.hasInvitation && (
                <Link 
                  to="/auth" 
                  className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to options
                </Link>
              )}
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