// src/lib/auth.tsx
import { configureAuth } from 'react-query-auth';
import { Navigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Spinner } from '@/components/ui/spinner';

import { api, clearToken, getToken, setToken} from './api-client';
import { AuthResponse, User, CompanyCreationRequest, VerifyCodeResponse, PlatformRole, CompanyRole, isPlatformAdmin, isPlatformModerator, isCompanyOwner, hasCompanyEditAccess, canAccessPlatformAdmin } from '@/types/api';
import { AUTH_USER_QUERY_KEY } from './auth-constants';
import { currentPathWithQuery, resolveReturnPath } from './auth-redirect';

const getUser = async (): Promise<User | null> => {
  try {
    const response = (await api.get('/auth/me')) as AuthResponse;
    if (response.token) {
      setToken(response.token);
    }
    return response.user ?? null;
  } catch {
    // 401 or network error means not authenticated - return null
    // instead of throwing so react-query enters "no data" state
    // rather than "error" state (which can trigger retry/loop behavior)
    return null;
  }
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

// Role-based utility functions
export const hasAdminAccess = (user: User): boolean => {
  return canAccessPlatformAdmin(user.platformRole);
};

export const canManageUsers = (user: User): boolean => {
  return isPlatformAdmin(user.platformRole) || isPlatformModerator(user.platformRole);
};

export const canEditCompanyData = (user: User): boolean => {
  return hasCompanyEditAccess(user.companyRole);
};

export const canManageCompany = (user: User): boolean => {
  return isCompanyOwner(user.companyRole);
};

export const canViewAdminPanel = (user: User): boolean => {
  return canAccessPlatformAdmin(user.platformRole);
};

const authConfig = {
  userFn: getUser,
  userKey: AUTH_USER_QUERY_KEY,
  loginFn: async (data: LoginInput) => {
    await loginWithEmailAndPassword(data);
    const user = await getUser();
    if (!user) {
      throw new Error('Unable to load user profile after login.');
    }

    return user;
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
  const user = useUser({
    refetchOnMount: 'always',
    retry: false,
  });
  const location = useLocation();

  if (user.isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!user.data || !getToken()) {
    const returnTo = resolveReturnPath(
      currentPathWithQuery(location.pathname, location.search, location.hash),
    );
    const loginUrl = returnTo
      ? `/login?returnTo=${encodeURIComponent(returnTo)}`
      : '/login';

    return (
      <Navigate to={loginUrl} replace />
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
