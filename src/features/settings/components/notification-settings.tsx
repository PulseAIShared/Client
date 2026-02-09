import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/form';
import { useNotifications } from '@/components/ui/notifications';
import { IntegrationType } from '@/types/api';
import type {
  CompanyNotificationSettingsResponse,
  PersonalNotificationSettingsResponse,
} from '@/types/api';
import { useGetIntegrations } from '@/features/settings/api/integrations';
import {
  parseSettingsProblem,
  useGetNotificationSettings,
  useUpdateNotificationSettings,
} from '@/features/settings/api/settings';

const DEFAULT_PERSONAL: PersonalNotificationSettingsResponse = {
  churnRiskAlerts: true,
  weeklyReports: true,
  integrationStatus: true,
};

const DEFAULT_COMPANY: CompanyNotificationSettingsResponse = {
  defaultNotificationPreferences: true,
  criticalAlertEscalation: true,
  digestFrequency: 'weekly',
};

export const NotificationSettings = () => {
  const { addNotification } = useNotifications();
  const [personal, setPersonal] = useState<PersonalNotificationSettingsResponse>(
    DEFAULT_PERSONAL,
  );
  const [company, setCompany] =
    useState<CompanyNotificationSettingsResponse>(DEFAULT_COMPANY);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data, isLoading } = useGetNotificationSettings();
  const { data: slackIntegrations, isLoading: isLoadingSlackIntegrations } =
    useGetIntegrations({
      type: IntegrationType.Slack,
    });

  useEffect(() => {
    if (!data) {
      return;
    }

    setPersonal(data.personal);
    setCompany(data.company);
  }, [data]);

  const slackIntegration = useMemo(() => {
    if (!slackIntegrations || slackIntegrations.length === 0) {
      return null;
    }

    return (
      slackIntegrations.find((integration) => integration.isConnected) ??
      slackIntegrations[0]
    );
  }, [slackIntegrations]);

  const isDirty = useMemo(() => {
    if (!data) {
      return false;
    }

    return (
      personal.churnRiskAlerts !== data.personal.churnRiskAlerts ||
      personal.weeklyReports !== data.personal.weeklyReports ||
      personal.integrationStatus !== data.personal.integrationStatus ||
      company.defaultNotificationPreferences !==
        data.company.defaultNotificationPreferences ||
      company.criticalAlertEscalation !== data.company.criticalAlertEscalation ||
      company.digestFrequency !== data.company.digestFrequency
    );
  }, [company, data, personal]);

  const updateNotificationSettings = useUpdateNotificationSettings();

  if (isLoading && !data) {
    return (
      <div className="rounded-xl border border-border-primary/40 bg-surface-secondary/20 px-4 py-6 text-sm text-text-muted">
        Loading notification settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-xl font-semibold text-text-primary">
          Personal Notifications
        </h3>
        <div className="space-y-4 rounded-xl border border-border-primary/50 bg-surface-secondary/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-text-primary">Churn Risk Alerts</div>
              <div className="text-sm text-text-muted">
                Get notified when customers enter high-risk status
              </div>
            </div>
            <Switch
              checked={personal.churnRiskAlerts}
              onCheckedChange={(checked) =>
                setPersonal((previous) => ({ ...previous, churnRiskAlerts: checked }))
              }
              disabled={updateNotificationSettings.isPending}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-text-primary">Weekly Reports</div>
              <div className="text-sm text-text-muted">
                Receive weekly churn prediction summaries
              </div>
            </div>
            <Switch
              checked={personal.weeklyReports}
              onCheckedChange={(checked) =>
                setPersonal((previous) => ({ ...previous, weeklyReports: checked }))
              }
              disabled={updateNotificationSettings.isPending}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-text-primary">Integration Status</div>
              <div className="text-sm text-text-muted">
                Alerts about integration sync issues
              </div>
            </div>
            <Switch
              checked={personal.integrationStatus}
              onCheckedChange={(checked) =>
                setPersonal((previous) => ({ ...previous, integrationStatus: checked }))
              }
              disabled={updateNotificationSettings.isPending}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-xl font-semibold text-text-primary">
          Company Notification Settings
        </h3>
        <div className="space-y-4 rounded-xl border border-border-primary/50 bg-surface-secondary/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-text-primary">
                Default Notification Preferences
              </div>
              <div className="text-sm text-text-muted">
                Set default notification preferences for new team members
              </div>
            </div>
            <Switch
              checked={company.defaultNotificationPreferences}
              onCheckedChange={(checked) =>
                setCompany((previous) => ({
                  ...previous,
                  defaultNotificationPreferences: checked,
                }))
              }
              disabled={updateNotificationSettings.isPending || !data?.canManageCompanySettings}
            />
          </div>
          <div className="rounded-xl border border-border-primary/50 bg-surface-secondary/40 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="font-medium text-text-primary">
                  Slack delivery integration
                </div>
                <div className="text-sm text-text-muted">
                  Notification delivery to Slack is managed in Integrations.
                </div>
                <div className="mt-1 text-xs text-text-muted/80">
                  {slackIntegration?.id
                    ? `Integration ID: ${slackIntegration.id}`
                    : 'No Slack integration configured yet.'}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                    slackIntegration?.isConnected
                      ? 'border-success/40 bg-success/15 text-success'
                      : 'border-border-primary/60 bg-surface-secondary/60 text-text-muted'
                  }`}
                >
                  {isLoadingSlackIntegrations
                    ? 'Checking'
                    : slackIntegration?.isConnected
                      ? 'Connected'
                      : 'Not connected'}
                </span>
                <Button asChild variant="outline">
                  <Link to="/app/integrations">Manage in Integrations</Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-text-primary">
                Critical Alert Escalation
              </div>
              <div className="text-sm text-text-muted">
                Automatically escalate critical alerts to owners
              </div>
            </div>
            <Switch
              checked={company.criticalAlertEscalation}
              onCheckedChange={(checked) =>
                setCompany((previous) => ({
                  ...previous,
                  criticalAlertEscalation: checked,
                }))
              }
              disabled={updateNotificationSettings.isPending || !data?.canManageCompanySettings}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-text-primary">Digest Frequency</div>
              <div className="text-sm text-text-muted">
                How often to send summary emails
              </div>
            </div>
            <select
              className="rounded-lg border border-border-primary/50 bg-surface-secondary/50 px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 disabled:cursor-not-allowed disabled:opacity-70"
              value={company.digestFrequency}
              onChange={(event) =>
                setCompany((previous) => ({
                  ...previous,
                  digestFrequency: event.target.value as CompanyNotificationSettingsResponse['digestFrequency'],
                }))
              }
              disabled={updateNotificationSettings.isPending || !data?.canManageCompanySettings}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      {!data?.canManageCompanySettings ? (
        <div className="rounded-lg border border-info/30 bg-info/15 px-4 py-3 text-sm text-info-muted">
          Company notification defaults require Staff or Owner access.
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-lg border border-error/40 bg-error/15 px-4 py-3 text-sm text-error-muted">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex gap-3">
        <Button
          onClick={() =>
            updateNotificationSettings.mutate(
              {
                personal,
                company: data?.canManageCompanySettings ? company : undefined,
              },
              {
                onSuccess: () => {
                  setErrorMessage(null);
                  addNotification({
                    type: 'success',
                    title: 'Notification settings updated',
                    message: 'Your notification preferences have been saved.',
                  });
                },
                onError: (error) => {
                  const problem = parseSettingsProblem(error);
                  const trace = problem.traceId ? ` (trace ${problem.traceId})` : '';
                  const message = `${problem.detail ?? 'Unable to update notification settings.'}${trace}`;
                  setErrorMessage(message);
                  addNotification({
                    type: 'error',
                    title: 'Save failed',
                    message,
                  });
                },
              },
            )
          }
          disabled={!isDirty}
          isLoading={updateNotificationSettings.isPending}
        >
          Save Changes
        </Button>
        <Button
          variant="outline"
          disabled={!isDirty || updateNotificationSettings.isPending}
          onClick={() => {
            if (!data) {
              return;
            }

            setPersonal(data.personal);
            setCompany(data.company);
            setErrorMessage(null);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
