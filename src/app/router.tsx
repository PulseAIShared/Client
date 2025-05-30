import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';

import { Spinner } from '@/components/ui/spinner';
import { AuthLoader, ProtectedRoute } from '@/lib/auth';

import { AppRoot } from './routes/app/root';

export const createAppRouter = (queryClient: QueryClient) =>
  createBrowserRouter([
    {
      path: '/',
      lazy: async () => {
        const { LandingRoute } = await import('./routes/landing');
        return { Component: LandingRoute };
      },
    },
    {
      path: '/auth/register',
      lazy: async () => {
        const { RegisterRoute } = await import('./routes/auth/register');
        return { Component: RegisterRoute };
      },
    },
    {
      path: '/auth/login',
      lazy: async () => {
        const { LoginRoute } = await import('./routes/auth/login');
        return { Component: LoginRoute };
      },
    },
    {
      path: '/auth',
      lazy: async () => {
        const { AuthRoute } = await import('./routes/auth/auth');
        return { Component: AuthRoute };
      },
    },
    {
      path: '/app',
      element: (
        <ProtectedRoute>
          <AuthLoader
            renderLoading={() => (
              <div className="flex h-screen w-screen items-center justify-center">
                <Spinner size="xl" />
              </div>
            )}
          >
            <AppRoot />
          </AuthLoader>
        </ProtectedRoute>
      ),
      children: [
        {
          path: '',
          lazy: async () => {
            const { DashboardRoute } = await import('./routes/app/dashboard/dashboard');
            return { Component: DashboardRoute };
          },
        },
              {
          path: 'subscribers',
          lazy: async () => {
            const { SubscribersRoute } = await import('./routes/app/subscribers/subscribers');
            return { Component: SubscribersRoute };
          },
        },
        {
          path: 'insights',
          lazy: async () => {
            const { InsightsRoute } = await import('./routes/app/insights/insights');
            return { Component: InsightsRoute };
          },
        },
        {
          path: 'settings',
          lazy: async () => {
            const { SettingsRoute } = await import('./routes/app/settings/settings');
            return { Component: SettingsRoute };
          },
        },
      ],
    },
    
    {
      path: '*',
      lazy: async () => {
        const { NotFoundRoute } = await import('./routes/not-found');
        return { Component: NotFoundRoute };
      },
    },
  ]);

export const AppRouter = () => {
  const queryClient = useQueryClient();

  const router = useMemo(() => createAppRouter(queryClient), [queryClient]);

  return <RouterProvider router={router} />;
};
