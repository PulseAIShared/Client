import { configureAuth } from 'react-query-auth';
import { Navigate } from 'react-router-dom';
import { z } from 'zod';

import { Spinner } from '@/components/ui/spinner';


import { api, clearToken, setToken} from './api-client';
import { AuthResponse, User } from '@/types/api';



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

export const registerInputSchema = z.object({
  email: z.string().min(1, 'Required'),
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  password: z.string().min(1, 'Required'),
});

export type RegisterInput = z.infer<typeof registerInputSchema>;

const registerWithEmailAndPassword = (
  data: RegisterInput,
): Promise<AuthResponse> => {
  return api.post('/auth/register', data);
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
      <Navigate to='/login' replace />
    );
  }


  return children;
};
