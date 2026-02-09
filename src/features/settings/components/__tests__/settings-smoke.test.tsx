import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { AccountSection } from '@/features/settings/components/account-section';
import { BillingSection } from '@/features/settings/components/billing-section';
import { NotificationSettings } from '@/features/settings/components/notification-settings';
import { SecuritySection } from '@/features/settings/components/security-section';
import * as settingsApi from '@/features/settings/api/settings';
import * as integrationsApi from '@/features/settings/api/integrations';

vi.mock('@/components/ui/notifications', () => ({
  useNotifications: () => ({
    addNotification: vi.fn(),
  }),
}));

vi.mock('@/features/settings/api/settings', () => ({
  parseSettingsProblem: vi.fn(() => ({ detail: 'Request failed' })),
  useGetAccountSettings: vi.fn(),
  useUpdateAccountSettings: vi.fn(),
  useGetNotificationSettings: vi.fn(),
  useUpdateNotificationSettings: vi.fn(),
  useGetBillingSummary: vi.fn(),
  useCreateBillingPortalSession: vi.fn(),
  useGetSecuritySessions: vi.fn(),
  useUpdateSecurityPassword: vi.fn(),
  useRevokeSecuritySession: vi.fn(),
}));

vi.mock('@/features/settings/api/integrations', () => ({
  useGetIntegrations: vi.fn(),
}));

const renderWithRouter = (node: React.ReactElement) =>
  render(<MemoryRouter>{node}</MemoryRouter>);

describe('settings tab smoke tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(settingsApi.useGetAccountSettings).mockReturnValue({
      data: {
        userId: 'u-1',
        companyId: 'c-1',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        avatar: null,
        companyName: 'Acme',
        canEdit: true,
      },
      isLoading: false,
    } as never);

    vi.mocked(settingsApi.useUpdateAccountSettings).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    vi.mocked(settingsApi.useGetNotificationSettings).mockReturnValue({
      data: {
        personal: {
          churnRiskAlerts: true,
          weeklyReports: true,
          integrationStatus: true,
        },
        company: {
          defaultNotificationPreferences: true,
          criticalAlertEscalation: true,
          digestFrequency: 'weekly',
        },
        canManageCompanySettings: true,
      },
      isLoading: false,
    } as never);

    vi.mocked(settingsApi.useUpdateNotificationSettings).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    vi.mocked(integrationsApi.useGetIntegrations).mockReturnValue({
      data: [
        {
          id: 'int-slack',
          type: 'Slack',
          name: 'Slack',
          status: 'Connected',
          purpose: 'action_channel',
          supportedActionTypes: [],
          isConnected: true,
          syncedRecordCount: 0,
        },
      ],
      isLoading: false,
    } as never);

    vi.mocked(settingsApi.useGetBillingSummary).mockReturnValue({
      data: {
        companyId: 'c-1',
        companyName: 'Acme',
        plan: 'Starter',
        memberCount: 4,
        seatLimit: 10,
        pendingInvitationCount: 1,
        seatUtilizationPercentage: 40,
        canManageBilling: true,
        isBillingPortalConfigured: true,
      },
      isLoading: false,
    } as never);

    vi.mocked(settingsApi.useCreateBillingPortalSession).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    vi.mocked(settingsApi.useGetSecuritySessions).mockReturnValue({
      data: {
        canManageCompanySecurity: true,
        canChangePassword: true,
        isSsoAccount: false,
        capabilities: {
          passwordChangeEnabled: true,
          sessionManagementEnabled: true,
          twoFactorEnabled: false,
          singleSignOnEnabled: false,
          ipAllowlistEnabled: false,
          auditLogsEnabled: false,
        },
        sessions: [],
      },
      isLoading: false,
    } as never);

    vi.mocked(settingsApi.useUpdateSecurityPassword).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    vi.mocked(settingsApi.useRevokeSecuritySession).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);
  });

  it('account tab loads and triggers save mutation', () => {
    const updateMutation = vi.fn();
    vi.mocked(settingsApi.useUpdateAccountSettings).mockReturnValue({
      mutate: updateMutation,
      isPending: false,
    } as never);

    renderWithRouter(<AccountSection />);

    const firstNameInput = screen.getByDisplayValue('Jane');
    fireEvent.change(firstNameInput, { target: { value: 'Janet' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(updateMutation).toHaveBeenCalledTimes(1);
  });

  it('notifications tab loads and triggers save mutation', () => {
    const updateMutation = vi.fn();
    vi.mocked(settingsApi.useUpdateNotificationSettings).mockReturnValue({
      mutate: updateMutation,
      isPending: false,
    } as never);

    renderWithRouter(<NotificationSettings />);

    const digestSelect = screen.getByRole('combobox');
    fireEvent.change(digestSelect, { target: { value: 'daily' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(updateMutation).toHaveBeenCalledTimes(1);
  });

  it('billing tab loads and triggers portal mutation', () => {
    const portalMutation = vi.fn();
    vi.mocked(settingsApi.useCreateBillingPortalSession).mockReturnValue({
      mutate: portalMutation,
      isPending: false,
    } as never);

    renderWithRouter(<BillingSection />);

    fireEvent.click(screen.getByRole('button', { name: 'Manage Billing' }));

    expect(portalMutation).toHaveBeenCalledTimes(1);
  });

  it('security tab loads and triggers password mutation', () => {
    const passwordMutation = vi.fn();
    vi.mocked(settingsApi.useUpdateSecurityPassword).mockReturnValue({
      mutate: passwordMutation,
      isPending: false,
    } as never);

    const view = renderWithRouter(<SecuritySection />);

    const currentPassword = view.container.querySelector(
      'input[name="currentPassword"]',
    ) as HTMLInputElement;
    const newPassword = view.container.querySelector(
      'input[name="newPassword"]',
    ) as HTMLInputElement;
    const confirmPassword = view.container.querySelector(
      'input[name="confirmPassword"]',
    ) as HTMLInputElement;

    fireEvent.change(currentPassword, { target: { value: 'current-secret' } });
    fireEvent.change(newPassword, { target: { value: 'new-password-123' } });
    fireEvent.change(confirmPassword, { target: { value: 'new-password-123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));

    expect(passwordMutation).toHaveBeenCalledTimes(1);
  });
});
