import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form';
import { useNotifications } from '@/components/ui/notifications';
import {
  parseSettingsProblem,
  useGetAccountSettings,
  useUpdateAccountSettings,
} from '@/features/settings/api/settings';

type AccountFormState = {
  firstName: string;
  lastName: string;
};

const EMPTY_FORM: AccountFormState = {
  firstName: '',
  lastName: '',
};

export const AccountSection = () => {
  const { addNotification } = useNotifications();
  const [form, setForm] = useState<AccountFormState>(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data, isLoading } = useGetAccountSettings();

  useEffect(() => {
    if (!data) {
      return;
    }

    setForm({
      firstName: data.firstName,
      lastName: data.lastName,
    });
  }, [data]);

  const canEdit = data?.canEdit ?? false;

  const isDirty = useMemo(() => {
    if (!data) {
      return false;
    }

    return (
      form.firstName.trim() !== data.firstName.trim() ||
      form.lastName.trim() !== data.lastName.trim()
    );
  }, [data, form.firstName, form.lastName]);

  const updateAccount = useUpdateAccountSettings();

  const firstName = data?.firstName ?? '';
  const lastName = data?.lastName ?? '';
  const email = data?.email ?? '';
  const companyName = data?.companyName ?? '';

  const avatarInitials = `${(form.firstName || firstName).slice(0, 1)}${(form.lastName || lastName).slice(0, 1)}`
    .trim()
    .toUpperCase() || email.slice(0, 2).toUpperCase() || '--';

  if (isLoading && !data) {
    return (
      <div className="rounded-xl border border-border-primary/40 bg-surface-secondary/20 px-4 py-6 text-sm text-text-muted">
        Loading account settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-xl font-semibold text-text-primary">Profile Information</h3>
        <div className="rounded-xl border border-border-primary/50 bg-surface-secondary/30 p-6">
          <div className="mb-6 flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary text-2xl font-bold text-text-primary">
              {avatarInitials}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="First Name"
              registration={{ name: 'firstName' }}
              value={form.firstName}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, firstName: event.target.value }))
              }
              disabled={!canEdit || updateAccount.isPending}
            />
            <Input
              label="Last Name"
              registration={{ name: 'lastName' }}
              value={form.lastName}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, lastName: event.target.value }))
              }
              disabled={!canEdit || updateAccount.isPending}
            />
            <Input
              label="Email"
              type="email"
              registration={{ name: 'email' }}
              value={email}
              readOnly
              disabled
            />
            <Input
              label="Company"
              registration={{ name: 'company' }}
              value={companyName}
              readOnly
              disabled
            />
          </div>

          {errorMessage ? (
            <div className="mt-4 rounded-lg border border-error/40 bg-error/15 px-4 py-3 text-sm text-error-muted">
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-6 flex gap-3">
            <Button
              onClick={() =>
                updateAccount.mutate(
                  {
                    firstName: form.firstName.trim(),
                    lastName: form.lastName.trim(),
                  },
                  {
                    onSuccess: () => {
                      setErrorMessage(null);
                      addNotification({
                        type: 'success',
                        title: 'Account updated',
                        message: 'Your profile changes have been saved.',
                      });
                    },
                    onError: (error) => {
                      const problem = parseSettingsProblem(error);
                      const trace = problem.traceId ? ` (trace ${problem.traceId})` : '';
                      const message = `${problem.detail ?? 'Failed to update account settings.'}${trace}`;
                      setErrorMessage(message);
                      addNotification({
                        type: 'error',
                        title: 'Unable to save account settings',
                        message,
                      });
                    },
                  },
                )
              }
              disabled={!canEdit || !isDirty}
              isLoading={updateAccount.isPending}
            >
              Save Changes
            </Button>
            <Button
              variant="outline"
              disabled={!canEdit || !isDirty || updateAccount.isPending}
              onClick={() =>
                setForm({
                  firstName,
                  lastName,
                })
              }
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
