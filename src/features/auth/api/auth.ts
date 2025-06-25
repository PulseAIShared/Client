import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api, clearToken, setToken } from '@/lib/api-client';
import { AuthResponse, User, CompanyCreationRequest } from '@/types/api';

// Auth schemas
export const loginInputSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerInputSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  // Company fields - will be validated conditionally in the form component
  companyName: z.string().optional(),
  companyDomain: z.string().optional(),
  companyCountry: z.string().optional(),
  companySize: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
  companyIndustry: z.string().optional(),
  invitationToken: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginInputSchema>;
export type RegisterInput = z.infer<typeof registerInputSchema>;

// API functions
const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/auth/me') as AuthResponse;
  
  if (response.token) {
    setToken(response.token);
  }
  
  return response.user;
};

const loginUser = async (data: LoginInput): Promise<AuthResponse> => {
  const response = await api.post('/users/login', data) as AuthResponse;
  
  if (response.token) {
    setToken(response.token);
  }
    
  return response;
};

const registerUser = async (data: RegisterInput): Promise<AuthResponse> => {
  const response = await api.post('/users/register', data) as AuthResponse;
  
  if (response.token) {
    setToken(response.token);
  }
    
  return response;
};

const logoutUser = async (): Promise<void> => {
  try {
    await api.post('/users/logout');
  } finally {
    clearToken();
  }
};

const createCompany = async (data: CompanyCreationRequest): Promise<{ success: boolean }> => {
  return api.post('/companies', data);
};

// React Query hooks
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useLogin = (options?: {
  onSuccess?: (response: AuthResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      // Update the user query cache
      queryClient.setQueryData(['auth', 'user'], response.user);
      options?.onSuccess?.(response);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

export const useRegister = (options?: {
  onSuccess?: (response: AuthResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: registerUser,
    onSuccess: (response) => {
      // Update the user query cache
      queryClient.setQueryData(['auth', 'user'], response.user);
      options?.onSuccess?.(response);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

export const useLogout = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Clear all auth-related queries
      queryClient.removeQueries({ queryKey: ['auth'] });
      queryClient.clear();
      options?.onSuccess?.();
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

export const useCompanyCreation = (options?: {
  onSuccess?: (data: { success: boolean }) => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation({
    mutationFn: createCompany,
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

// Utility functions
export const needsCompanyCreation = (user: User): boolean => {
  return !user.companyId || user.companyId === '00000000-0000-0000-0000-000000000000';
};

export const needsOnboarding = (user: User): boolean => {
  return user.isFirstLogin === true || user.onboardingStatus?.completed === false;
};

export const getOnboardingStep = (user: User): number => {
  return user.onboardingStatus?.currentStep || 1;
};