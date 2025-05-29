import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";
import { Link } from '@/components/ui/link';
import { IoMdMail } from "react-icons/io";
import { AuthLayout } from '@/components/layouts';



export const AuthRoute = () => {

  return (
    <AuthLayout>
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-2">Sign in to Bodyledger</h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          New to Bodyledger? <Link to="/auth/register" className="text-blue-600 hover:underline">Create an Account</Link>
        </p>

        <div className="space-y-3">
          <button className="w-full flex items-center justify-center gap-2 border py-2 rounded-md hover:bg-gray-100 hover:cursor-pointer">
            <FaGoogle/>
            <span>Sign in with Google</span>
          </button>

          <button className="w-full flex items-center justify-center gap-2 border py-2 rounded-md hover:bg-gray-100 hover:cursor-pointer">
            <FaFacebook/>
            <span>Sign in with Facebook</span>
          </button>

          <button className="w-full flex items-center justify-center gap-2 border py-2 rounded-md hover:bg-gray-100 hover:cursor-pointer">
          <FaApple/>
            <span>Sign in with Apple</span>
          </button>
        </div>

        <div className="mt-4 p-3 border border-blue-500 rounded-md text-center bg-blue-50">
          <p className="text-sm text-blue-700 font-semibold">
            Use your social account to skip authentication
          </p>
          <p className="text-xs text-blue-600">
            Otherwise, you'll need a verification code every time you sign in with your email.
          </p>
        </div>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-gray-500 text-sm">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <Link to="login" className="w-full flex items-center justify-center gap-2 border py-2 rounded-md hover:bg-gray-100 hover:cursor-pointer">
        <IoMdMail/>
          <span>Sign in with your email</span>
        </Link>
      </div>
    </div>
    </AuthLayout>
  );
};
