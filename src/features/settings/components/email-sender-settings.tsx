import React, { useMemo, useState } from 'react';
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

  const [form, setForm] = useState<Partial<SenderProfile> & { password?: string; apiKey?: string; host?: string; port?: number; username?: string; useTls?: boolean }>({
    type: 'SMTP',
    isDefault: senders.length === 0,
  });

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

  const canSubmit = useMemo(() => {
    if (!form?.name || !form?.fromName || !form?.fromEmail || !form?.type) return false;
    if (form.type === 'SMTP') {
      return !!form.host && !!form.port && !!form.username && (!!form.password || typeof form.password === 'string');
    }
    return !!form.apiKey;
  }, [form]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-text-primary mb-4">Email Sender Profiles</h3>
        <p className="text-text-muted mb-4">Configure the sender identities used for campaigns.</p>

        {/* Existing senders */}
        <div className="space-y-3 mb-6">
          {isLoading ? (
            <div className="text-text-muted">Loading senders…</div>
          ) : senders.length === 0 ? (
            <div className="text-text-muted">No sender profiles yet. Create one below.</div>
          ) : (
            senders.map((sp) => (
              <div key={sp.id} className="flex items-center justify-between p-4 bg-surface-secondary/30 border border-border-primary/40 rounded-xl">
                <div>
                  <div className="font-medium text-text-primary">{sp.name} {sp.isDefault ? <span className="text-xs text-text-muted">• Default</span> : null}</div>
                  <div className="text-sm text-text-muted">{sp.fromName} &lt;{sp.fromEmail}&gt; — {sp.type}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteSender.mutate(sp.id)}
                    className="px-3 py-2 text-sm rounded-lg bg-surface-secondary/50 border border-border-primary/40 hover:bg-surface-secondary/70"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create sender */}
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
                <label className="block text-sm font-medium text-text-secondary mb-2">Host</label>
                <input className="w-full px-3 py-2 rounded-lg bg-surface-primary/60 border border-border-primary/40" value={form.host || ''} onChange={(e) => setForm({ ...form, host: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Port</label>
                <input type="number" className="w-full px-3 py-2 rounded-lg bg-surface-primary/60 border border-border-primary/40" value={form.port || 587} onChange={(e) => setForm({ ...form, port: Number(e.target.value) })} />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input id="useTls" type="checkbox" checked={!!form.useTls} onChange={(e) => setForm({ ...form, useTls: e.target.checked })} />
                <label htmlFor="useTls" className="text-sm text-text-secondary">Use TLS</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Username</label>
                <input className="w-full px-3 py-2 rounded-lg bg-surface-primary/60 border border-border-primary/40" value={form.username || ''} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
                <input type="password" className="w-full px-3 py-2 rounded-lg bg-surface-primary/60 border border-border-primary/40" value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">API Key</label>
                <input className="w-full px-3 py-2 rounded-lg bg-surface-primary/60 border border-border-primary/40" value={form.apiKey || ''} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} />
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
      </div>
    </div>
  );
};


