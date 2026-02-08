import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';

type SenderType = 'SMTP' | 'SendGrid' | 'Postmark' | 'SES';
type SenderStatus = 'Connected' | 'NotConnected' | 'Error';
type SenderSectionTab = 'profiles' | 'add' | 'help';

type SenderProfile = {
  id: string;
  name: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  type: SenderType;
  isDefault?: boolean;
  status?: SenderStatus;
};

type CreateSenderPayload = {
  type: SenderType;
  name: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  isDefault: boolean;
  smtp?: {
    host: string;
    port: number;
    username: string;
    password: string;
    useTls: boolean;
  };
  sendGrid?: {
    apiKey: string;
  };
  postmark?: {
    apiKey: string;
  };
  ses?: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  };
};

type EmailSenderSettingsProps = {
  context?: 'settings' | 'integrations';
};

type SenderFormState = {
  type: SenderType;
  name: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  isDefault: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpUseTls: boolean;
  apiKey: string;
  sesAccessKeyId: string;
  sesSecretAccessKey: string;
  sesRegion: string;
};

const EMPTY_FORM: SenderFormState = {
  type: 'SMTP',
  name: '',
  fromName: '',
  fromEmail: '',
  replyTo: '',
  isDefault: false,
  smtpHost: '',
  smtpPort: 587,
  smtpUsername: '',
  smtpPassword: '',
  smtpUseTls: true,
  apiKey: '',
  sesAccessKeyId: '',
  sesSecretAccessKey: '',
  sesRegion: '',
};

const statusBadgeClass = (status: SenderStatus | undefined) => {
  if (status === 'Connected') {
    return 'bg-green-500/15 text-green-600';
  }

  if (status === 'Error') {
    return 'bg-red-500/15 text-red-600';
  }

  return 'bg-yellow-500/15 text-yellow-700';
};

const buildCreatePayload = (form: SenderFormState): CreateSenderPayload => {
  const payload: CreateSenderPayload = {
    type: form.type,
    name: form.name.trim(),
    fromName: form.fromName.trim(),
    fromEmail: form.fromEmail.trim(),
    replyTo: form.replyTo.trim() || undefined,
    isDefault: form.isDefault,
  };

  if (form.type === 'SMTP') {
    payload.smtp = {
      host: form.smtpHost.trim(),
      port: form.smtpPort,
      username: form.smtpUsername.trim(),
      password: form.smtpPassword,
      useTls: form.smtpUseTls,
    };
  } else if (form.type === 'SendGrid') {
    payload.sendGrid = { apiKey: form.apiKey.trim() };
  } else if (form.type === 'Postmark') {
    payload.postmark = { apiKey: form.apiKey.trim() };
  } else if (form.type === 'SES') {
    payload.ses = {
      accessKeyId: form.sesAccessKeyId.trim(),
      secretAccessKey: form.sesSecretAccessKey,
      region: form.sesRegion.trim(),
    };
  }

  return payload;
};

export const EmailSenderSettings: React.FC<EmailSenderSettingsProps> = ({
  context = 'integrations',
}) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SenderSectionTab>('profiles');
  const [form, setForm] = useState<SenderFormState>(EMPTY_FORM);

  const { data: senderProfiles = [], isLoading } = useQuery({
    queryKey: ['email', 'senders'],
    queryFn: async () => {
      try {
        const response = await api.get('/email/senders');
        return Array.isArray(response) ? (response as SenderProfile[]) : [];
      } catch {
        return [] as SenderProfile[];
      }
    },
    staleTime: 60_000,
    retry: false,
  });

  const createSender = useMutation({
    mutationFn: async (payload: CreateSenderPayload) =>
      api.post('/email/senders', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email', 'senders'] });
      setForm((previous) => ({
        ...EMPTY_FORM,
        isDefault: previous.isDefault && senderProfiles.length === 0,
      }));
      setActiveTab('profiles');
    },
  });

  const deleteSender = useMutation({
    mutationFn: async (id: string) => api.delete(`/email/senders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email', 'senders'] });
    },
  });

  const canSubmit = useMemo(() => {
    if (!form.name.trim() || !form.fromName.trim() || !form.fromEmail.trim()) {
      return false;
    }

    if (form.type === 'SMTP') {
      return (
        !!form.smtpHost.trim() &&
        Number.isFinite(form.smtpPort) &&
        !!form.smtpUsername.trim() &&
        !!form.smtpPassword
      );
    }

    if (form.type === 'SES') {
      return (
        !!form.sesAccessKeyId.trim() &&
        !!form.sesSecretAccessKey &&
        !!form.sesRegion.trim()
      );
    }

    return !!form.apiKey.trim();
  }, [form]);

  const isIntegrationsContext = context === 'integrations';

  return (
    <div className="space-y-6 rounded-2xl border border-border-primary/40 bg-surface-primary/80 p-6 shadow-xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Email Action Channel Providers
          </h2>
          <p className="text-sm text-text-secondary">
            Connect and manage sender profiles used by playbook email actions.
          </p>
        </div>

        {isIntegrationsContext ? (
          <Link
            to="/app/settings?tab=account"
            className="text-sm font-medium text-accent-primary hover:underline"
          >
            Configure email defaults in Settings
          </Link>
        ) : (
          <Link
            to="/app/integrations?capability=action_channel"
            className="text-sm font-medium text-accent-primary hover:underline"
          >
            Manage provider connections in Integrations
          </Link>
        )}
      </div>

      <div className="inline-flex overflow-hidden rounded-xl border border-border-primary/40">
        {([
          { id: 'profiles', label: 'Profiles' },
          { id: 'add', label: 'Add Profile' },
          { id: 'help', label: 'Help' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-accent-primary/10 text-accent-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profiles' && (
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-sm text-text-muted">Loading sender profiles...</div>
          ) : senderProfiles.length === 0 ? (
            <div className="rounded-xl border border-border-primary/40 bg-surface-secondary/40 p-4 text-sm text-text-muted">
              No sender profiles yet. Add a profile to enable the email action channel.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {senderProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="space-y-3 rounded-xl border border-border-primary/40 bg-surface-secondary/40 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-text-primary">{profile.name}</h3>
                        {profile.isDefault && (
                          <span className="rounded-full bg-accent-primary/10 px-2 py-0.5 text-[11px] text-accent-primary">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-muted">
                        {profile.fromName} {'<'}
                        {profile.fromEmail}
                        {'>'} ({profile.type})
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${statusBadgeClass(
                        profile.status
                      )}`}
                    >
                      {profile.status ?? 'NotConnected'}
                    </span>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      className="border-red-500/30 text-red-600 hover:bg-red-500/10"
                      onClick={() => deleteSender.mutate(profile.id)}
                      isLoading={deleteSender.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'add' && (
        <div className="space-y-4 rounded-xl border border-border-primary/40 bg-surface-secondary/30 p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-text-secondary">
                Profile name
              </label>
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, name: event.target.value }))
                }
                className="w-full rounded-lg border border-border-primary/40 bg-surface-primary/60 px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-text-secondary">
                Provider
              </label>
              <select
                value={form.type}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    type: event.target.value as SenderType,
                  }))
                }
                className="w-full rounded-lg border border-border-primary/40 bg-surface-primary/60 px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
              >
                <option value="SMTP">SMTP</option>
                <option value="SendGrid">SendGrid</option>
                <option value="Postmark">Postmark</option>
                <option value="SES">Amazon SES</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-text-secondary">
                From name
              </label>
              <input
                value={form.fromName}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, fromName: event.target.value }))
                }
                className="w-full rounded-lg border border-border-primary/40 bg-surface-primary/60 px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-text-secondary">
                From email
              </label>
              <input
                type="email"
                value={form.fromEmail}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, fromEmail: event.target.value }))
                }
                className="w-full rounded-lg border border-border-primary/40 bg-surface-primary/60 px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-text-secondary">
                Reply-to
              </label>
              <input
                type="email"
                value={form.replyTo}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, replyTo: event.target.value }))
                }
                className="w-full rounded-lg border border-border-primary/40 bg-surface-primary/60 px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 pt-7">
              <input
                id="email-sender-default"
                type="checkbox"
                checked={form.isDefault}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, isDefault: event.target.checked }))
                }
              />
              <label htmlFor="email-sender-default" className="text-sm text-text-secondary">
                Set as default
              </label>
            </div>
          </div>

          {form.type === 'SMTP' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">
                  Host
                </label>
                <input
                  placeholder="smtp.yourprovider.com"
                  value={form.smtpHost}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, smtpHost: event.target.value }))
                  }
                  className="w-full rounded-lg border border-border-primary/40 bg-surface-primary/60 px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">
                  Port
                </label>
                <input
                  type="number"
                  value={form.smtpPort}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      smtpPort: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-border-primary/40 bg-surface-primary/60 px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 pt-7">
                <input
                  id="email-sender-tls"
                  type="checkbox"
                  checked={form.smtpUseTls}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      smtpUseTls: event.target.checked,
                    }))
                  }
                />
                <label htmlFor="email-sender-tls" className="text-sm text-text-secondary">
                  Use TLS
                </label>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">
                  Username
                </label>
                <input
                  value={form.smtpUsername}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      smtpUsername: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-border-primary/40 bg-surface-primary/60 px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">
                  Password
                </label>
                <input
                  type="password"
                  value={form.smtpPassword}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      smtpPassword: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-border-primary/40 bg-surface-primary/60 px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
            </div>
          )}

          {(form.type === 'SendGrid' || form.type === 'Postmark') && (
            <div>
              <label className="mb-2 block text-sm font-medium text-text-secondary">
                API key
              </label>
              <input
                value={form.apiKey}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, apiKey: event.target.value }))
                }
                className="w-full rounded-lg border border-border-primary/40 bg-surface-primary/60 px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
              />
            </div>
          )}

          {form.type === 'SES' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">
                  Access key id
                </label>
                <input
                  value={form.sesAccessKeyId}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      sesAccessKeyId: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-border-primary/40 bg-surface-primary/60 px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">
                  Secret access key
                </label>
                <input
                  type="password"
                  value={form.sesSecretAccessKey}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      sesSecretAccessKey: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-border-primary/40 bg-surface-primary/60 px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">
                  Region
                </label>
                <input
                  placeholder="eu-west-1"
                  value={form.sesRegion}
                  onChange={(event) =>
                    setForm((previous) => ({ ...previous, sesRegion: event.target.value }))
                  }
                  className="w-full rounded-lg border border-border-primary/40 bg-surface-primary/60 px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              onClick={() => createSender.mutate(buildCreatePayload(form))}
              disabled={!canSubmit}
              isLoading={createSender.isPending}
            >
              Save sender profile
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'help' && (
        <div className="rounded-xl border border-border-primary/40 bg-surface-secondary/30 p-5 text-sm text-text-secondary">
          <p className="font-medium text-text-primary">Provider setup guidance</p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>SMTP: host, port, username, and password are required.</li>
            <li>SendGrid/Postmark: create an API key with send permissions.</li>
            <li>SES: provide IAM credentials and the target SES region.</li>
            <li>
              Webhook actions remain available without an integration; email actions require
              a connected sender profile.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
