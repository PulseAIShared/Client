import { useNavigate } from 'react-router-dom';
import { Link } from '@/components/ui/link';
import { LoginForm } from '@/features/auth/components/login-form';
import { AuthLayout } from '@/components/layouts';

export const LoginRoute = () => {
  const navigate = useNavigate();

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

            {/* Login Form */}
            <LoginForm onSuccess={() => navigate("/app")} />

            {/* Footer Links */}
            <div className="mt-8 text-center space-y-4">
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <Link 
                  to="/auth/register" 
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Create one
                </Link>
              </p>
              
              <Link 
                to="/auth" 
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to options
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};