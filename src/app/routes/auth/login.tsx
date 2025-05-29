import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";
import { Link } from '@/components/ui/link';
import { IoMdMail } from "react-icons/io";
import { LoginForm } from '@/features/auth/components/login-form';
import { AuthLayout } from '@/components/layouts';
export const LoginRoute = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout>
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="bg-white p-8 rounded-lg shadow-md w-96">
      <h2 className="text-2xl font-bold text-center">
        Let's log into <br /> BodyLedger account.
      </h2>
      <p className="text-center text-sm text-gray-500 mt-2">
        Need an account?{" "}
        <Link to="/auth/register" className="text-blue-600 hover:underline">
          Create one
        </Link>
      </p>

      <Link to="/auth/" className="mt-4 text-blue-600 flex items-center gap-1 hover:underline">
        <span>&larr;</span> Back
      </Link>

      <div className="mt-4">
        <LoginForm onSuccess={() => navigate("/app")} />
      </div>
    </div>
  </div>
  </AuthLayout>
  );
};
