import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/components/ui/notifications';
import {
  parseSettingsProblem,
  useCreateBillingPortalSession,
  useGetBillingSummary,
} from '@/features/settings/api/settings';

export const BillingSection = () => {
  const { addNotification } = useNotifications();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data, isLoading } = useGetBillingSummary();
  const createBillingPortalSession = useCreateBillingPortalSession();

  const isUnlimitedSeats = data?.seatLimit === 2_147_483_647;
  const seatLimitLabel = useMemo(() => {
    if (!data) {
      return '--';
    }

    return isUnlimitedSeats ? 'Unlimited' : data.seatLimit.toString();
  }, [data, isUnlimitedSeats]);

  const utilizationLabel =
    data?.seatUtilizationPercentage !== null &&
    data?.seatUtilizationPercentage !== undefined
      ? `${data.seatUtilizationPercentage}%`
      : 'N/A';

  const canManageBilling = Boolean(data?.canManageBilling);
  const isBillingPortalConfigured = Boolean(data?.isBillingPortalConfigured);
  const canOpenPortal = canManageBilling && isBillingPortalConfigured;

  if (isLoading && !data) {
    return (
      <div className="rounded-xl border border-border-primary/40 bg-surface-secondary/20 px-4 py-6 text-sm text-text-muted">
        Loading billing summary...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-xl font-semibold text-text-primary">Current Plan</h3>
        <div className="rounded-xl border border-accent-primary/30 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-text-primary">
                {data?.plan ?? 'Unknown'}
              </h4>
              <p className="text-text-secondary">
                Seat usage: {data?.memberCount ?? '--'} / {seatLimitLabel}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-xl font-semibold text-text-primary">Workspace Summary</h3>
        <div className="rounded-xl border border-border-primary/50 bg-surface-secondary/30 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-primary">
                {data?.memberCount ?? '--'}
              </div>
              <div className="text-sm text-text-muted">Active Teammates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success-muted">{seatLimitLabel}</div>
              <div className="text-sm text-text-muted">Seat Limit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-secondary">
                {data?.pendingInvitationCount ?? '--'}
              </div>
              <div className="text-sm text-text-muted">Pending Invites</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning-muted">{utilizationLabel}</div>
              <div className="text-sm text-text-muted">Seat Utilization</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-xl font-semibold text-text-primary">Billing Management</h3>
        <div className="rounded-xl border border-border-primary/50 bg-surface-secondary/30 p-6">
          <div className="flex flex-col gap-4">
            <Button
              className="w-full justify-start"
              onClick={() =>
                createBillingPortalSession.mutate(undefined, {
                  onSuccess: (session) => {
                    setErrorMessage(null);
                    window.location.assign(session.url);
                  },
                  onError: (error) => {
                    const problem = parseSettingsProblem(error);
                    const trace = problem.traceId ? ` (trace ${problem.traceId})` : '';
                    const message = `${problem.detail ?? 'Unable to start billing portal session.'}${trace}`;
                    setErrorMessage(message);
                    addNotification({
                      type: 'error',
                      title: 'Billing portal unavailable',
                      message,
                    });
                  },
                })
              }
              disabled={!canOpenPortal || createBillingPortalSession.isPending}
              isLoading={createBillingPortalSession.isPending}
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Manage Billing
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download Invoices (Coming soon)
            </Button>
          </div>
        </div>
      </div>

      {!canManageBilling ? (
        <div className="rounded-xl border border-info/30 bg-info/15 px-4 py-3 text-sm text-info-muted">
          Billing management actions require billing permissions.
        </div>
      ) : null}

      {canManageBilling && !isBillingPortalConfigured ? (
        <div className="rounded-xl border border-warning/30 bg-warning/15 px-4 py-3 text-sm text-warning-muted">
          Billing portal is not configured for this environment yet.
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-lg border border-error/40 bg-error/15 px-4 py-3 text-sm text-error-muted">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
};
