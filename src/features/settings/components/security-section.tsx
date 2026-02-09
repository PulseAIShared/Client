import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form';
import { useNotifications } from '@/components/ui/notifications';
import {
  parseSettingsProblem,
  useGetSecuritySessions,
  useRevokeSecuritySession,
  useUpdateSecurityPassword,
} from '@/features/settings/api/settings';
import type { SecuritySessionResponse } from '@/types/api';

type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const EMPTY_FORM: PasswordFormState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const formatExpiry = (value?: string | null): string => {
  if (!value) {
    return 'No expiry';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown expiry';
  }

  return date.toLocaleString();
};

export const SecuritySection = () => {
  const { addNotification } = useNotifications();
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(EMPTY_FORM);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const { data, isLoading } = useGetSecuritySessions();
  const updatePassword = useUpdateSecurityPassword();
  const revokeSession = useRevokeSecuritySession();

  const passwordMismatch =
    passwordForm.confirmPassword.length > 0 &&
    passwordForm.newPassword !== passwordForm.confirmPassword;

  const canSubmitPassword = useMemo(() => {
    if (!data?.capabilities.passwordChangeEnabled || !data.canChangePassword) {
      return false;
    }

    return (
      passwordForm.currentPassword.length > 0 &&
      passwordForm.newPassword.length >= 8 &&
      passwordForm.confirmPassword.length > 0 &&
      !passwordMismatch
    );
  }, [data, passwordForm, passwordMismatch]);

  const companySecurityControls = useMemo(
    () =>
      [
        {
          enabled: data?.capabilities.singleSignOnEnabled ?? false,
          title: 'Single Sign-On (SSO)',
          description: 'Configure SAML/OIDC authentication for your organization',
          cta: 'Configure SSO',
        },
        {
          enabled: data?.capabilities.ipAllowlistEnabled ?? false,
          title: 'IP Allowlist',
          description: 'Restrict access to specific IP addresses',
          cta: 'Configure IPs',
        },
        {
          enabled: data?.capabilities.auditLogsEnabled ?? false,
          title: 'Audit Logs',
          description: 'View security events and user activities',
          cta: 'View Logs',
        },
      ].filter((control) => control.enabled),
    [data],
  );

  if (isLoading && !data) {
    return (
      <div className="rounded-xl border border-border-primary/40 bg-surface-secondary/20 px-4 py-6 text-sm text-text-muted">
        Loading security settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-xl font-semibold text-text-primary">Change Password</h3>
        <div className="rounded-xl border border-border-primary/50 bg-surface-secondary/30 p-6">
          {!data?.capabilities.passwordChangeEnabled ? (
            <div className="rounded-lg border border-info/30 bg-info/15 px-4 py-3 text-sm text-info-muted">
              Password change is disabled for this workspace.
            </div>
          ) : !data.canChangePassword ? (
            <div className="rounded-lg border border-info/30 bg-info/15 px-4 py-3 text-sm text-info-muted">
              {data.isSsoAccount
                ? 'This account uses SSO authentication, so password change is unavailable.'
                : 'Password change is unavailable for this account.'}
            </div>
          ) : (
            <div className="max-w-md space-y-4">
              <Input
                label="Current Password"
                type="password"
                registration={{ name: 'currentPassword' }}
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm((previous) => ({
                    ...previous,
                    currentPassword: event.target.value,
                  }))
                }
                disabled={updatePassword.isPending}
              />
              <Input
                label="New Password"
                type="password"
                registration={{ name: 'newPassword' }}
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((previous) => ({
                    ...previous,
                    newPassword: event.target.value,
                  }))
                }
                disabled={updatePassword.isPending}
              />
              <Input
                label="Confirm New Password"
                type="password"
                registration={{ name: 'confirmPassword' }}
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  setPasswordForm((previous) => ({
                    ...previous,
                    confirmPassword: event.target.value,
                  }))
                }
                disabled={updatePassword.isPending}
              />
              {passwordMismatch ? (
                <div className="text-sm text-error-muted">Passwords do not match.</div>
              ) : null}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    if (passwordMismatch) {
                      setPasswordError('Passwords do not match.');
                      return;
                    }

                    updatePassword.mutate(
                      {
                        currentPassword: passwordForm.currentPassword,
                        newPassword: passwordForm.newPassword,
                      },
                      {
                        onSuccess: (response) => {
                          setPasswordError(null);
                          setPasswordForm(EMPTY_FORM);
                          addNotification({
                            type: 'success',
                            title: 'Password updated',
                            message: response.reauthenticationRequired
                              ? 'Password changed. You may be asked to sign in again when your session expires.'
                              : 'Password changed successfully.',
                          });
                        },
                        onError: (error) => {
                          const problem = parseSettingsProblem(error);
                          const trace = problem.traceId ? ` (trace ${problem.traceId})` : '';
                          const message = `${problem.detail ?? 'Unable to update password.'}${trace}`;
                          setPasswordError(message);
                          addNotification({
                            type: 'error',
                            title: 'Password update failed',
                            message,
                          });
                        },
                      },
                    );
                  }}
                  disabled={!canSubmitPassword}
                  isLoading={updatePassword.isPending}
                >
                  Update Password
                </Button>
                <Button
                  variant="outline"
                  disabled={updatePassword.isPending}
                  onClick={() => {
                    setPasswordForm(EMPTY_FORM);
                    setPasswordError(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
              {passwordError ? (
                <div className="rounded-lg border border-error/40 bg-error/15 px-4 py-3 text-sm text-error-muted">
                  {passwordError}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {data?.capabilities.sessionManagementEnabled ? (
        <div>
          <h3 className="mb-4 text-xl font-semibold text-text-primary">Session Management</h3>
          <div className="rounded-xl border border-border-primary/50 bg-surface-secondary/30 p-6">
            {data.sessions.length === 0 ? (
              <div className="rounded-lg border border-info/30 bg-info/15 px-4 py-3 text-sm text-info-muted">
                No active refresh-token sessions were found.
              </div>
            ) : (
              <div className="space-y-3">
                {data.sessions.map((session: SecuritySessionResponse) => (
                  <div
                    key={session.sessionId}
                    className="flex items-center justify-between rounded-lg border border-border-primary/40 bg-surface-primary/50 px-4 py-3"
                  >
                    <div>
                      <div className="font-medium text-text-primary">{session.label}</div>
                      <div className="text-sm text-text-muted">
                        Expires: {formatExpiry(session.expiresAtUtc)}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      disabled={!session.canRevoke || revokeSession.isPending}
                      isLoading={revokeSession.isPending}
                      onClick={() =>
                        revokeSession.mutate(session.sessionId, {
                          onSuccess: () => {
                            setSessionError(null);
                            addNotification({
                              type: 'success',
                              title: 'Session revoked',
                              message: 'The selected session has been revoked.',
                            });
                          },
                          onError: (error) => {
                            const problem = parseSettingsProblem(error);
                            const trace = problem.traceId ? ` (trace ${problem.traceId})` : '';
                            const message = `${problem.detail ?? 'Unable to revoke session.'}${trace}`;
                            setSessionError(message);
                            addNotification({
                              type: 'error',
                              title: 'Session revoke failed',
                              message,
                            });
                          },
                        })
                      }
                    >
                      Revoke
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {sessionError ? (
              <div className="mt-4 rounded-lg border border-error/40 bg-error/15 px-4 py-3 text-sm text-error-muted">
                {sessionError}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {data?.capabilities.twoFactorEnabled ? (
        <div>
          <h3 className="mb-4 text-xl font-semibold text-text-primary">Two-Factor Authentication</h3>
          <div className="rounded-xl border border-border-primary/50 bg-surface-secondary/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-text-primary">2FA Status</div>
                <div className="text-sm text-text-muted">
                  Add an extra layer of security to your account.
                </div>
              </div>
              <Button variant="outline" disabled>
                Enable 2FA (Coming soon)
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {companySecurityControls.length > 0 ? (
        <div>
          <h3 className="mb-4 text-xl font-semibold text-text-primary">Company Security Settings</h3>
          <div className="rounded-xl border border-border-primary/50 bg-surface-secondary/30 p-6">
            {!data?.canManageCompanySecurity ? (
              <div className="rounded-lg border border-info/30 bg-info/15 px-4 py-3 text-sm text-info-muted">
                Company-level security controls require Owner access.
              </div>
            ) : (
              <div className="space-y-4">
                {companySecurityControls.map((control) => (
                  <div key={control.title} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-text-primary">{control.title}</div>
                      <div className="text-sm text-text-muted">{control.description}</div>
                    </div>
                    <Button variant="outline" disabled>
                      {control.cta} (Coming soon)
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
