// src/lib/auth.tsx
import { configureAuth } from 'react-query-auth';
import { Navigate } from 'react-router-dom';
import { z } from 'zod';

import { Spinner } from '@/components/ui/spinner';

import { api, clearToken, setToken} from './api-client';
import { AuthResponse, User } from '@/types/api';

const getUser = async (): Promise<User> => {
  const response = await api.get('/users/me') as AuthResponse;
  console.log(response)
  if (response.token) {
    setToken(response.token);
  }
  
  return response.user;
};

const logout = async (): Promise<void> => {
  try {
    await api.post('/users/logout');
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
  const response = await api.post('/users/login', data) as AuthResponse;
  
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

export type RegisterInput = z.infer<typeof registerInputSchema>;

const registerWithEmailAndPassword = (
  data: RegisterInput,
): Promise<AuthResponse> => {
  return api.post('/users/register', data);
};

const authConfig = {
  userFn: getUser,
  loginFn: async (data: LoginInput) => {
    const response = await loginWithEmailAndPassword(data);
    return response.user;
  },
  registerFn: async (data: RegisterInput) => {
    const response = await registerWithEmailAndPassword(data);
    return response.user;
  },
  logoutFn: logout,
};

export const { useUser, useLogin, useLogout, useRegister, AuthLoader } =
  configureAuth(authConfig);

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useUser();

  console.log(user);

  if (user.isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!user.data) {
    return (
      <Navigate to='/auth/login' replace />
    );
  }

  return children;
};