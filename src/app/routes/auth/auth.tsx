import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";
import { Link } from '@/components/ui/link';
import { IoMdMail } from "react-icons/io";
import { AuthLayout } from '@/components/layouts';

export const AuthRoute = () => {
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
              <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full mb-4">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <span className="text-sm font-medium text-purple-700">Welcome</span>
              </div>
              
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Sign in to PulseLTV
              </h1>
              <p className="text-slate-600 mb-2">
                AI-powered churn prediction and revenue recovery
              </p>
              <p className="text-sm text-slate-500">
                New to PulseLTV?{" "}
                <Link 
                  to="/auth/register" 
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Create an Account
                </Link>
              </p>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3 mb-6">
              <button className="w-full flex items-center justify-center gap-3 h-12 border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium text-slate-700">
                <FaGoogle className="text-red-500" />
                <span>Continue with Google</span>
              </button>

              <button className="w-full flex items-center justify-center gap-3 h-12 border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium text-slate-700">
                <FaFacebook className="text-blue-600" />
                <span>Continue with Facebook</span>
              </button>

              <button className="w-full flex items-center justify-center gap-3 h-12 border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium text-slate-700">
                <FaApple className="text-slate-800" />
                <span>Continue with Apple</span>
              </button>
            </div>

            {/* Information Box */}
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 mb-6">
              <p className="text-sm text-blue-800 font-semibold mb-1">
                Skip the verification step
              </p>
              <p className="text-xs text-blue-700">
                Social sign-in is faster and more secure than email verification codes.
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center mb-6">
              <hr className="flex-grow border-slate-300" />
              <span className="mx-4 text-sm text-slate-500 font-medium">OR</span>
              <hr className="flex-grow border-slate-300" />
            </div>

            {/* Email Sign In Button */}
            <Link 
              to="login" 
              className="w-full flex items-center justify-center gap-3 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              <IoMdMail className="text-lg" />
              <span>Sign in with Email</span>
            </Link>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};