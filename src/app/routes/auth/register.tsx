import { useNavigate, useSearchParams } from 'react-router-dom';

import { AuthLayout } from '@/components/layouts/auth-layout';
import { RegisterForm } from '@/features/auth/components/register-form';
import { useState } from 'react';
import { Link } from '@/components/ui/link';

export const RegisterRoute = () => {
  const navigate = useNavigate();


  return (
    <AuthLayout>
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center">
          Let's create your <br /> BodyLedger account.
        </h2>
        <p className="text-center text-sm text-gray-500 mt-2">
          For your security, we recommend using an email that you'll have easy access to in the future.
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>

        <Link to="/auth/" className="mt-4 text-blue-600 flex items-center gap-1 hover:underline">
        <span>&larr;</span> Back
      </Link>

        <div className="mt-4">
          <RegisterForm onSuccess={() => navigate("/app")} />
        </div>
      </div>
    </div>
    </AuthLayout>
  );
};

