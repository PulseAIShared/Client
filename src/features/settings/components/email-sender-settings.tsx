import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

type SenderProfile = {
  id: string;
  name: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  type: 'SMTP' | 'SendGrid' | 'Postmark' | 'SES';
  isDefault?: boolean;
  status?: 'Connected' | 'NotConnected' | 'Error';
};

export const EmailSenderSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: senders = [], isLoading } = useQuery({
    queryKey: ['email', 'senders'],
    queryFn: async () => {
      try {
        const result = await api.get('/email/senders');
        return (Array.isArray(result) ? result : []) as SenderProfile[];
      } catch (e) {
        return [] as SenderProfile[];
      }
    },
    staleTime: 60_000,
    retry: false,
  });

  type SubTab = 'profiles' | 'add' | 'help';
  const [activeTab, setActiveTab] = useState<SubTab>('profiles');

  const [form, setForm] = useState<
    Partial<SenderProfile> & {
      password?: string;
      apiKey?: string;
      host?: string;
      port?: number;
      username?: string;
      useTls?: boolean;
    }
  >({
    type: 'SMTP',
    isDefault: senders.length === 0,
    port: 587,
    useTls: true,
  });

  // Track if port has been manually edited so we don't overwrite user choice when toggling TLS
  const [isPortEdited, setIsPortEdited] = useState(false);

  const createSender = useMutation({
    mutationFn: async (payload: any) => api.post('/email/senders', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email', 'senders'] });
    },
  });

  const deleteSender = useMutation({
    mutationFn: async (id: string) => api.delete(`/email/senders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email', 'senders'] });
    },
  });

  const updateSender = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SenderProfile> }) =>
      api.patch(`/email/senders/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email', 'senders'] });
    },
  });

  const canSubmit = useMemo(() => {
    if (!form?.name || !form?.fromName || !form?.fromEmail || !form?.type) return false;
    if (form.type === 'SMTP') {
      // Require explicit values; allow default prefilled port
      return !!form.host && form.port !== undefined && !!form.username && !!form.password;
    }
    return !!form.apiKey;
  }, [form]);

  // Ensure default flag is set when senders load for the first time
  useEffect(() => {
    setForm((prev) => ({ ...prev, isDefault: prev.isDefault ?? senders.length === 0 }));
  }, [senders.length]);

  // When switching type, reset auth-specific fields and sensible defaults
  useEffect(() => {
    if (form.type === 'SMTP') {
      setForm((prev) => ({
        ...prev,
        apiKey: undefined,
        host: prev.host ?? '',
        port: prev.port ?? 587,
        useTls: prev.useTls ?? true,
      }));
    } else if (form.type) {
      setForm((prev) => ({
        ...prev,
        host: undefined,
        port: undefined,
        username: undefined,
        password: undefined,
        useTls: undefined,
      }));
    }
  }, [form.type]);

  const recommendedPort = (useTls?: boolean) => (useTls ? 587 : 25);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-text-primary mb-4">Email Sender Profiles</h3>
        <p className="text-text-muted mb-4">Configure sender identities for campaigns, with guided help for SMTP and API-based providers.</p>

        {/* Sub tabs */}
        <div className="mb-6 inline-flex rounded-xl border border-border-primary/40 overflow-hidden">
          {([
            { id: 'profiles', label: 'Profiles' },
            { id: 'add', label: 'Add Profile' },
            { id: 'help', label: 'Help & Docs' },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? 'bg-accent-primary/10 text-accent-primary'
                  : 'bg-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'profiles' && (
          <div className="space-y-3 mb-6">
            {isLoading ? (
              <div className="text-text-muted">Loading senders…</div>
            ) : senders.length === 0 ? (
              <div className="text-text-muted">No sender profiles yet. Use "Add Profile" to create one.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {senders.map((sp) => (
                  <div key={sp.id} className="p-4 bg-surface-secondary/30 border border-border-primary/40 rounded-xl flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-text-primary flex items-center gap-2">
                          {sp.name}
                          {sp.isDefault && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent-primary/10 text-accent-primary">Default</span>
                          )}
                        </div>
                        <div className="text-sm text-text-muted">{sp.fromName} &lt;{sp.fromEmail}&gt; — {sp.type}</div>
                      </div>
                      <div className="text-xs">
                        <span className={`px-2 py-1 rounded-full ${
                          sp.status === 'Connected'
                            ? 'bg-green-500/15 text-green-600'
                            : sp.status === 'Error'
                            ? 'bg-red-500/15 text-red-600'
                            : 'bg-yellow-500/15 text-yellow-700'
                        }`}>
                          {sp.status ?? 'NotConnected'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      {!sp.isDefault && (
                        <button
                          onClick={() => updateSender.mutate({ id: sp.id, data: { isDefault: true } })}
                          className="px-3 py-2 text-sm rounded-lg bg-surface-secondary/50 border border-border-primary/40 hover:bg-surface-secondary/70"
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        onClick={() => deleteSender.mutate(sp.id)}
                        className="px-3 py-2 text-sm rounded-lg bg-red-500/10 text-red-600 border border-red-500/30 hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'add' && (
        <div className="p-6 bg-surface-secondary/30 border border-border-primary/40 rounded-2xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Profile Name</label>
              <input className="w-full px-3 py-2 rounded-lg bg-surface-primary/60 border border-border-primary/40" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Type</label>
              <select className="w-full px-3 py-2 rounded-lg bg-surface-primary/60 border border-border-primary/40" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })}>
                <option value="SMTP">SMTP</option>
                <option value="SendGrid">SendGrid</option>
                <option value="Postmark">Postmark</option>
                <option value="SES">Amazon SES</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">From Name</label>
              <input className="w-full px-3 py-2 rounded-lg bg-surface-primary/60 border border-border-primary/40" value={form.fromName || ''} onChange={(e) => setForm({ ...form, fromName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">From Email</label>
              <input type="email" className="w-full px-3 py-2 rounded-lg bg-surface-primary/60 border border-border-primary/40" value={form.fromEmail || ''} onChange={(e) => setForm({ ...form, fromEmail: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Reply-To</label>
              <input type="email" className="w-full px-3 py-2 rounded-lg bg-surface-primary/60 border border-border-primary/40" value={form.replyTo || ''} onChange={(e) => setForm({ ...form, replyTo: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <input id="isDefault" type="checkbox" checked={!!form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
              <label htmlFor="isDefault" className="text-sm text-text-secondary">Set as default</label>
            </div>
          </div>

          {/* Auth fields depend on type */}
          {form.type === 'SMTP' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
                  Host
                  <span className="text-text-muted text-xs" title="This is your SMTP server address. Examples: smtp.gmail.com, smtp.office365.com, smtp.sendgrid.net.">?
                  </span>
                </label>
                <input placeholder="e.g. smtp.yourprovider.com" className="w-full px-3 py-2 rounded-lg bg-surface-primary/60 border border-border-primary/40" value={form.host || ''} onChange={(e) => setForm({ ...form, host: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
                  Port
                  <span className="text-text-muted text-xs" title="Common ports: 587 (TLS/STARTTLS), 465 (SSL), 25 (legacy). Your provider docs list the correct port.">?
                  </span>
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-lg bg-surface-primary/60 border border-border-primary/40"
                  value={form.port ?? recommendedPort(form.useTls)}
                  onChange={(e) => {
                    setIsPortEdited(true);
                    setForm({ ...form, port: Number(e.target.value) });
                  }}
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input
                  id="useTls"
                  type="checkbox"
                  checked={!!form.useTls}
                  onChange={(e) => {
                    const nextUseTls = e.target.checked;
                    setForm((prev) => ({
                      ...prev,
                      useTls: nextUseTls,
                      port: isPortEdited ? prev.port : recommendedPort(nextUseTls),
                    }));
                  }}
                />
                <label htmlFor="useTls" className="text-sm text-text-secondary">Use TLS</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
                  Username
                  <span className="text-text-muted text-xs" title="Often your full email address, or a username supplied by your SMTP provider.">?
                  </span>
                </label>
                <input placeholder="e.g. you@yourdomain.com" className="w-full px-3 py-2 rounded-lg bg-surface-primary/60 border border-border-primary/40" value={form.username || ''} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
                  Password
                  <span className="text-text-muted text-xs" title="Use an app password if your provider requires it (e.g., Google Workspace, Microsoft 365).">?
                  </span>
                </label>
                <input type="password" placeholder="Your SMTP password or app password" className="w-full px-3 py-2 rounded-lg bg-surface-primary/60 border border-border-primary/40" value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="md:col-span-3 text-xs text-text-muted bg-surface-primary/50 border border-border-primary/30 rounded-lg p-3">
                <div className="font-medium text-text-secondary mb-1">Where to find your SMTP settings</div>
                <ul className="list-disc ml-4 space-y-1">
                  <li>
                    Gmail / Google Workspace: Host <code>smtp.gmail.com</code>, Port <code>587</code> (TLS). Docs: <a className="underline" href="https://support.google.com/a/answer/176600" target="_blank" rel="noreferrer">Google guide</a>.
                  </li>
                  <li>
                    Outlook / Microsoft 365: Host <code>smtp.office365.com</code>, Port <code>587</code> (TLS). Docs: <a className="underline" href="https://learn.microsoft.com/exchange/clients-and-mobile-in-exchange-online/authenticated-client-smtp-submission" target="_blank" rel="noreferrer">Microsoft guide</a>.
                  </li>
                  <li>
                    SendGrid SMTP: Host <code>smtp.sendgrid.net</code>, Port <code>587</code> (TLS), Username <code>apikey</code>, Password = your API key. Docs: <a className="underline" href="https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api" target="_blank" rel="noreferrer">SendGrid SMTP</a>.
                  </li>
                  <li>
                    Postmark SMTP: Host <code>smtp.postmarkapp.com</code>, Port <code>587</code> (TLS). Docs: <a className="underline" href="https://postmarkapp.com/support/category/smtp" target="_blank" rel="noreferrer">Postmark SMTP</a>.
                  </li>
                  <li>
                    Amazon SES SMTP: Region host (e.g., <code>email-smtp.us-east-1.amazonaws.com</code>). Docs: <a className="underline" href="https://docs.aws.amazon.com/ses/latest/dg/smtp-credentials.html" target="_blank" rel="noreferrer">SES SMTP</a>.
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
                  API Key
                  <span className="text-text-muted text-xs" title="Create or copy a restricted API key from your provider's dashboard.">?
                  </span>
                </label>
                <input placeholder="Paste your API key" className="w-full px-3 py-2 rounded-lg bg-surface-primary/60 border border-border-primary/40" value={form.apiKey || ''} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} />
              </div>
              <div className="text-xs text-text-muted bg-surface-primary/50 border border-border-primary/30 rounded-lg p-3">
                {form.type === 'SendGrid' && (
                  <div>
                    Find or create keys under Settings → API Keys. Link: <a className="underline" href="https://app.sendgrid.com/settings/api_keys" target="_blank" rel="noreferrer">SendGrid API Keys</a>.
                  </div>
                )}
                {form.type === 'Postmark' && (
                  <div>
                    Use your Server Token from the Postmark console. Link: <a className="underline" href="https://account.postmarkapp.com/servers" target="_blank" rel="noreferrer">Postmark Servers</a>.
                  </div>
                )}
                {form.type === 'SES' && (
                  <div>
                    Use an IAM user access key with SES permissions, or SMTP credentials. Docs: <a className="underline" href="https://docs.aws.amazon.com/ses/latest/dg/send-email-concepts-credentials.html" target="_blank" rel="noreferrer">SES Credentials</a>.
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              disabled={!canSubmit || createSender.isPending}
              onClick={(e) => {
                e.preventDefault();
                const payload: any = {
                  type: form.type,
                  name: form.name,
                  fromName: form.fromName,
                  fromEmail: form.fromEmail,
                  replyTo: form.replyTo,
                  isDefault: form.isDefault,
                };
                if (form.type === 'SMTP') {
                  payload.smtp = {
                    host: form.host,
                    port: form.port,
                    username: form.username,
                    password: form.password,
                    useTls: !!form.useTls,
                  };
                } else if (form.type) {
                  const key = (form.type as string).toLowerCase();
                  payload[key] = {
                    apiKey: form.apiKey,
                  };
                }
                createSender.mutate(payload);
              }}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-semibold disabled:opacity-50"
            >
              {createSender.isPending ? 'Saving…' : 'Save Sender'}
            </button>
          </div>
        </div>
        )}

        {activeTab === 'help' && (
          <div className="p-6 bg-surface-secondary/30 border border-border-primary/40 rounded-2xl space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-text-secondary">Use this guide to find the exact values required by your email provider.</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-surface-primary/60 border border-border-primary/40 rounded-xl p-4">
                  <div className="font-medium mb-2">SMTP quick reference</div>
                  <ul className="list-disc ml-4 space-y-1 text-text-muted">
                    <li>Host: Your SMTP server address (e.g., smtp.yourprovider.com)</li>
                    <li>Port: 587 (TLS), 465 (SSL), or 25 (legacy)</li>
                    <li>Username: Often your full email address</li>
                    <li>Password: May require an app password</li>
                  </ul>
                </div>
                <div className="bg-surface-primary/60 border border-border-primary/40 rounded-xl p-4">
                  <div className="font-medium mb-2">Provider docs</div>
                  <ul className="list-disc ml-4 space-y-1 text-text-muted">
                    <li><a className="underline" href="https://support.google.com/a/answer/176600" target="_blank" rel="noreferrer">Google Workspace SMTP</a></li>
                    <li><a className="underline" href="https://learn.microsoft.com/exchange/clients-and-mobile-in-exchange-online/authenticated-client-smtp-submission" target="_blank" rel="noreferrer">Microsoft 365 SMTP</a></li>
                    <li><a className="underline" href="https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api" target="_blank" rel="noreferrer">SendGrid SMTP</a></li>
                    <li><a className="underline" href="https://postmarkapp.com/support/category/smtp" target="_blank" rel="noreferrer">Postmark SMTP</a></li>
                    <li><a className="underline" href="https://docs.aws.amazon.com/ses/latest/dg/smtp-credentials.html" target="_blank" rel="noreferrer">Amazon SES SMTP</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


