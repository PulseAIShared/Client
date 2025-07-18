import { useMemo } from 'react';
import {
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';

import { ProtectedRoute } from '@/lib/auth';
import { GlobalLayout } from '@/components/layouts';

import { AppRoot } from './routes/app/root';

export const createAppRouter = () =>
  createBrowserRouter([
    {
      path: '/',
      element: <GlobalLayout />,
      children: [
        {
          index: true,
          lazy: async () => {
            const { LandingRoute } = await import('./routes/landing');
            return { Component: LandingRoute };
          },
        },
        {
          path: 'register',
          lazy: async () => {
            const { RegisterRoute } = await import('./routes/auth/register');
            return { Component: RegisterRoute };
          },
        },
        {
          path: 'login',
          lazy: async () => {
            const { LoginRoute } = await import('./routes/auth/login');
            return { Component: LoginRoute };
          },
        },
        {
          path: 'churn-calculator',
          lazy: async () => {
            const ChurnCalculatorPage = await import('./routes/churn-calculator');
            return { Component: ChurnCalculatorPage.default };
          },
        },
        {
          path: 'book-demo',
          lazy: async () => {
            const BookDemoPage = await import('./routes/book-demo');
            return { Component: BookDemoPage.default };
          },
        },
        {
          path: 'success',
          lazy: async () => {
            const { AuthSuccessRoute } = await import('./routes/auth/success');
            return { Component: AuthSuccessRoute };
          },
        },
        {
          path: 'onboarding',
          lazy: async () => {
            const { ProtectedOnboardingRoute } = await import('./routes/auth/protected-onboarding');
            return { Component: ProtectedOnboardingRoute };
          },
        },
        {
          path: 'app',
          element: (
            <ProtectedRoute>
              <AppRoot />
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
          path: 'customers',
          lazy: async () => {
            const { CustomersRoute } = await import('./routes/app/customers/customers');
            return { Component: CustomersRoute };
          },
        },
              {
          path: 'customers/:customerId',
          lazy: async () => {
            const { CustomerDetailRoute } = await import('./routes/app/customers/customer-detail');
            return { Component: CustomerDetailRoute };
          },
        },
          {
          path: 'notifications',
          lazy: async () => {
            const { NotificationsRoute } = await import('./routes/app/notifications/notifications');
            return { Component: NotificationsRoute };
          },
        },
        {
          path: 'imports/:importJobId',
          lazy: async () => {
            const { ImportDetailRoute } = await import('./routes/app/imports/import-detail');
            return { Component: ImportDetailRoute };
          },
        },
        {
          path: 'segments',
          lazy: async () => {
            const { SegmentsRoute } = await import('./routes/app/segments/segments');
            return { Component: SegmentsRoute };
          },
        },
        {
          path: 'campaigns',
          lazy: async () => {
            const { CampaignsRoute } = await import('./routes/app/campaigns/campaigns');
            return { Component: CampaignsRoute };
          },
        },
        {
          path: 'campaigns/create',
          lazy: async () => {
            const { CampaignCreateRoute } = await import('./routes/app/campaigns/create');
            return { Component: CampaignCreateRoute };
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
        {
          path: 'conversations',
          lazy: async () => {
            const { ConversationsRoute } = await import('./routes/app/conversations/conversations');
            return { Component: ConversationsRoute };
          },
        },
        {
        path: 'analytics/run-churn-analysis',
        lazy: async () => {
          const { RunChurnAnalysisRoute } = await import('./routes/app/analytics/run-churn-analysis');
          return { Component: RunChurnAnalysisRoute };
        },
      },
      {
        path: 'analytics/churn-analysis/:analysisId',
        lazy: async () => {
          const { ChurnAnalysisResultsRoute } = await import('./routes/app/analytics/churn-analysis-results');
          return { Component: ChurnAnalysisResultsRoute };
        },
      },
      {
        path: 'admin/users',
        lazy: async () => {
          const { AdminUsersRoute } = await import('./routes/app/admin/users');
          return { Component: AdminUsersRoute };
        },
      },
      {
        path: 'admin/users/:userId',
        lazy: async () => {
          const { AdminUserDetailRoute } = await import('./routes/app/admin/user-detail');
          return { Component: AdminUserDetailRoute };
        },
      },
      {
        path: 'admin/connection-diagnostics',
        lazy: async () => {
          const { ConnectionDiagnosticsRoute } = await import('./routes/app/admin/connection-diagnostics');
          return { Component: ConnectionDiagnosticsRoute };
        },
      },
      {
        path: 'admin/waiting-list',
        lazy: async () => {
          const { WaitingListAdminRoute } = await import('./routes/app/admin/waiting-list');
          return { Component: WaitingListAdminRoute };
        },
      },
      {
        path: 'admin/support',
        lazy: async () => {
          const AdminSupportPage = await import('./routes/app/admin/support');
          return { Component: AdminSupportPage.default };
        },
      },
      {
        path: 'docs/getting-started',
        lazy: async () => {
          const { GettingStartedDocsRoute } = await import('./routes/app/docs/getting-started');
          return { Component: GettingStartedDocsRoute };
        },
      },
      {
          path: 'oauth/hubspot/callback',
          lazy: async () => {
            const { HubSpotOAuthCallback } = await import('../features/settings/components/hubspot-oauth-callback');
            return { Component: HubSpotOAuthCallback };
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
      ],
    },
  ]);

export const AppRouter = () => {
  const router = useMemo(() => createAppRouter(), []);

  return <RouterProvider router={router} />;
};
