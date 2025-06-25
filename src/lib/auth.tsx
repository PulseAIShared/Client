// src/lib/auth.tsx
import { configureAuth } from 'react-query-auth';
import { Navigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Spinner } from '@/components/ui/spinner';

import { api, clearToken, setToken} from './api-client';
import { AuthResponse, User, CompanyCreationRequest, VerifyCodeResponse } from '@/types/api';

const getUser = async (): Promise<User> => {
  const response = await api.get('/auth/me') as AuthResponse;
  console.log(response)
  if (response.token) {
    setToken(response.token);
  }
  
  return response.user;
};

const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } finally {
    clearToken();
  }
};

export const loginInputSchema = z.object({
  email: z.string().min(1, 'Required'),
  password: z.string().min(5, 'Required'),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

const loginWithEmailAndPassword = async (data: LoginInput): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', data) as AuthResponse;
  
  if (response.token) {
    setToken(response.token);
  }
    
  return response;
};

// Company size enum to match backend exactly (C# enum values are 0, 1, 2)
export enum CompanySize {
  Startup = 0,
  SMB = 1,
  Enterprise = 2
}



const createCompany = async (data: CompanyCreationRequest): Promise<{ success: boolean }> => {
  return api.post('/companies', data);
};


// Dynamic onboarding API call
const processOnboardingStep = async (data: {
  step: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  companyName?: string;
  companyDomain?: string;
  companyCountry?: string;
  companySize?: string;
  companyIndustry?: string;
}): Promise<any> => {
  return api.post('/auth/onboarding', data);
};

const sendVerificationCode = async (email: string): Promise<any> => {
  return api.post('/auth/send-verification-code', { email });
};

const verifyCode = async (email: string, code: string): Promise<VerifyCodeResponse> => {
  const response = await api.post('/auth/verify-code', { email, code }) as VerifyCodeResponse;
  if (response.authData?.token) {
    setToken(response.authData.token);
  } 
  return response;
};



export const needsOnboarding = (user: User): boolean => {
  return user.onboardingCompleted === false;
};

export const getOnboardingStep = (user: User): number => {
  return user.onboardingCurrentStep || 1;
};

const authConfig = {
  userFn: getUser,
  loginFn: async (data: LoginInput) => {
    const response = await loginWithEmailAndPassword(data);
    return response.user;
  },
  logoutFn: logout,
  registerFn: async (data: any) => {
    throw new Error('Register not implemented');
  },
};

export const { useUser, useLogin, useLogout, AuthLoader } =
  configureAuth(authConfig);
export const useCompanyCreation = () => {
  return useMutation({
    mutationFn: createCompany,
  });
};

// Single dynamic onboarding hook
export const useProcessOnboardingStep = (options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation({
    mutationFn: processOnboardingStep,
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

export const useSendVerificationCode = (options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation({
    mutationFn: sendVerificationCode,
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

export const useVerifyCode = (options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => verifyCode(email, code),
    onSuccess: async (data) => {
      // Token is already set in verifyCode function
      // Let the parent component handle the refetch/navigation
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useUser();
  const location = useLocation();

  if (user.isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!user.data) {
    return (
      <Navigate to='/login' replace />
    );
  }

  // Check if user needs onboarding
  const userNeedsOnboarding = needsOnboarding(user.data);
  const isOnboardingRoute = location.pathname === '/onboarding';
  
  // Redirect to onboarding if needed and not already there
  if (userNeedsOnboarding && !isOnboardingRoute) {
    return <Navigate to='/onboarding' replace />;
  }
  
  // If user doesn't need onboarding but is on onboarding route, redirect to app
  if (!userNeedsOnboarding && isOnboardingRoute) {
    return <Navigate to='/app' replace />;
  }

  return children;
};