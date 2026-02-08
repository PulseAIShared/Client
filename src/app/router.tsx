import { useMemo } from 'react';
import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
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
          path: 'register-invited',
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
          path: 'how-it-works',
          lazy: async () => {
            const HowItWorksPage = await import('./routes/how-it-works');
            return { Component: HowItWorksPage.default };
          },
        },
        {
          path: 'use-cases',
          lazy: async () => {
            const UseCasesPage = await import('./routes/use-cases');
            return { Component: UseCasesPage.default };
          },
        },
        {
          path: 'integrations',
          lazy: async () => {
            const IntegrationsPage = await import('./routes/integrations');
            return { Component: IntegrationsPage.default };
          },
        },
        {
          path: 'pricing',
          lazy: async () => {
            const PricingPage = await import('./routes/pricing');
            return { Component: PricingPage.default };
          },
        },
        {
          path: 'privacy',
          lazy: async () => {
            const PrivacyPage = await import('./routes/privacy');
            return { Component: PrivacyPage.default };
          },
        },
        {
          path: 'terms',
          lazy: async () => {
            const TermsPage = await import('./routes/terms');
            return { Component: TermsPage.default };
          },
        },
        {
          path: 'accept-invite',
          lazy: async () => {
            const { AcceptInviteRoute } = await import('./routes/accept-invite');
            return { Component: AcceptInviteRoute };
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
          path: 'segments',
          lazy: async () => {
            const { SegmentsRoute } = await import('./routes/app/segments/segments');
            return { Component: SegmentsRoute };
          },
        },
        {
          path: 'segments/:segmentId',
          lazy: async () => {
            const { SegmentDetailRoute } = await import('./routes/app/segments/segment-detail');
            return { Component: SegmentDetailRoute };
          },
        },
        {
          path: 'segments/:segmentId/edit',
          lazy: async () => {
            const { SegmentEditRoute } = await import('./routes/app/segments/segment-edit');
            return { Component: SegmentEditRoute };
          },
        },
        {
          path: 'campaigns',
          element: <Navigate to="/app/playbooks" replace />,
        },
        {
          path: 'campaigns/create',
          element: <Navigate to="/app/playbooks/create" replace />,
        },
        {
          path: 'campaigns/*',
          element: <Navigate to="/app/playbooks" replace />,
        },
        {
          path: 'work-queue',
          lazy: async () => {
            const { WorkQueueRoute } = await import('./routes/app/work-queue/work-queue');
            return { Component: WorkQueueRoute };
          },
        },
        {
          path: 'playbooks',
          lazy: async () => {
            const { PlaybooksRoute } = await import('./routes/app/playbooks/playbooks');
            return { Component: PlaybooksRoute };
          },
        },
        {
          path: 'playbooks/create',
          lazy: async () => {
            const { PlaybookCreateRoute } = await import('./routes/app/playbooks/playbook-create');
            return { Component: PlaybookCreateRoute };
          },
        },
        {
          path: 'playbooks/:playbookId',
          lazy: async () => {
            const { PlaybookDetailRoute } = await import('./routes/app/playbooks/playbook-detail');
            return { Component: PlaybookDetailRoute };
          },
        },
        {
          path: 'playbooks/:playbookId/edit',
          lazy: async () => {
            const { PlaybookEditRoute } = await import('./routes/app/playbooks/playbook-edit');
            return { Component: PlaybookEditRoute };
          },
        },
        {
          path: 'playbooks/:playbookId/runs',
          lazy: async () => {
            const { PlaybookRunsRoute } = await import('./routes/app/playbooks/playbook-runs');
            return { Component: PlaybookRunsRoute };
          },
        },
        {
          path: 'impact',
          lazy: async () => {
            const { ImpactRoute } = await import('./routes/app/impact/impact');
            return { Component: ImpactRoute };
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
          path: 'recovery',
          element: <Navigate to="/app/work-queue" replace />,
        },
        {
          path: 'settings',
          lazy: async () => {
            const { SettingsRoute } = await import('./routes/app/settings/settings');
            return { Component: SettingsRoute };
          },
        },
        {
          path: 'integrations',
          lazy: async () => {
            const { IntegrationsRoute } = await import('./routes/app/integrations/integrations');
            return { Component: IntegrationsRoute };
          },
        },
        {
          path: 'team',
          lazy: async () => {
            const { TeamRoute } = await import('./routes/app/team/team');
            return { Component: TeamRoute };
          },
        },
        {
          path: 'settings/integrations/:integrationId/configure',
          lazy: async () => {
            const { IntegrationConfigureRoute } = await import('./routes/app/settings/integration-configure');
            return { Component: IntegrationConfigureRoute };
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
        path: 'admin/testing-lab',
        lazy: async () => {
          const { TestingLabRoute } = await import('./routes/app/admin/testing-lab');
          return { Component: TestingLabRoute };
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
      {
        path: 'oauth/stripe/callback',
        lazy: async () => {
          const { StripeOAuthCallback } = await import('../features/settings/components/stripe-oauth-callback');
          return { Component: StripeOAuthCallback };
        },
      },
      {
        path: 'oauth/posthog/callback',
        lazy: async () => {
          const { PostHogOAuthCallback } = await import('../features/settings/components/posthog-oauth-callback');
          return { Component: PostHogOAuthCallback };
        },
      },
      {
        path: 'oauth/slack/callback',
        lazy: async () => {
          const { SlackOAuthCallback } = await import('../features/settings/components/slack-oauth-callback');
          return { Component: SlackOAuthCallback };
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
