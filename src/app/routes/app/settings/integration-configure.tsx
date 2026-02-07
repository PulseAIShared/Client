import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useGetIntegrationById, useInspectIntegration, useGetConfigurationOptions, useConfigureIntegration, useTriggerSync } from '@/features/settings/api/integrations';
import { IntegrationType, SyncFrequency, IntegrationInspection } from '@/types/api';
import { useNotifications } from '@/components/ui/notifications';
import { AppPageHeader, ContentLayout } from '@/components/layouts';

export const IntegrationConfigureRoute: React.FC = () => {
  const { integrationId = '' } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const { data: integration, isLoading: loadingIntegration } = useGetIntegrationById(integrationId);
  const { data: inspection, isLoading: loadingInspect } = useInspectIntegration(integrationId);
  const { data: configOptions } = useGetConfigurationOptions((integration?.type as IntegrationType) ?? IntegrationType.Stripe, { enabled: !!integration?.type } as any);

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [syncFrequency, setSyncFrequency] = useState<SyncFrequency>(SyncFrequency.Daily);
  const [historicalDays, setHistoricalDays] = useState<number>(configOptions?.defaultHistoricalSyncDays ?? 90);
  const [batchSize, setBatchSize] = useState<number>(configOptions?.defaultBatchSize ?? 500);

  const configureMutation = useConfigureIntegration({
    onSuccess: () => {
      addNotification({ type: 'success', title: 'Configuration saved' });
    },
    onError: (e) => {
      addNotification({ type: 'error', title: 'Failed to save configuration', message: e instanceof Error ? e.message : undefined });
    }
  });

  const triggerMutation = useTriggerSync({
    onSuccess: () => {
      addNotification({ type: 'success', title: 'Sync started' });
      navigate('/app/settings');
    },
    onError: (e) => {
      addNotification({ type: 'error', title: 'Failed to start sync', message: e instanceof Error ? e.message : undefined });
    }
  });

  const capabilities = useMemo<IntegrationInspection['dataTypes']>(() => inspection?.dataTypes ?? [], [inspection]);

  const toggleType = (id: string) => {
    setSelectedTypes((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const saveConfiguration = async () => {
    if (!integration) return;
    await configureMutation.mutateAsync({
      integrationId,
      config: {
        syncEnabled: true,
        syncFrequency,
        dataTypes: selectedTypes,
        customFields: {},
        historicalSyncDays: historicalDays,
        batchSize,
      }
    });
  };

  const startInitialSync = async () => {
    await saveConfiguration();
    await triggerMutation.mutateAsync({ integrationId });
  };

  if (loadingIntegration || loadingInspect) {
    return (
      <ContentLayout>
        <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg">Loading configuration…</div>
      </ContentLayout>
    );
  }

  if (!integration) {
    return (
      <ContentLayout>
        <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg">Integration not found.</div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout>
      <div className="space-y-6">
        <AppPageHeader
          title={`Configure ${integration.name}`}
          description="Choose what to sync and how often. You’ll be able to start the first sync once this is saved."
          compact
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg">
            <h3 className="font-medium mb-4">Data Types</h3>
            <div className="space-y-3">
              {capabilities.map((cap) => (
                <label key={cap.id} className={`flex items-start gap-3 p-3 rounded-lg border ${cap.supported && cap.permissionOk ? 'border-border-primary/50' : 'border-warning/30 bg-warning/5'}`}>
                  <input
                    type="checkbox"
                    className="mt-1"
                    disabled={!cap.supported || !cap.permissionOk}
                    checked={selectedTypes.includes(cap.id)}
                    onChange={() => toggleType(cap.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{cap.label}</span>
                      {!cap.permissionOk && <span className="text-xs text-warning">missing permission</span>}
                      {cap.approxCount != null && <span className="text-xs text-text-muted">~{cap.approxCount.toLocaleString()} records</span>}
                    </div>
                    {cap.notes && <div className="text-xs text-text-muted mt-1">{cap.notes}</div>}
                  </div>
                </label>
              ))}
              {capabilities.length === 0 && (
                <div className="text-text-muted text-sm">No data types detected for this integration.</div>
              )}
            </div>
          </div>

          <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg">
            <h3 className="font-medium mb-4">Sync Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Frequency</label>
                <select
                  value={syncFrequency}
                  onChange={(e) => setSyncFrequency(e.target.value as SyncFrequency)}
                  className="w-full bg-surface-secondary/50 border border-border-primary/50 rounded-lg px-3 py-2"
                >
                  {Object.values(SyncFrequency).map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Historical window (days)</label>
                <input
                  type="number"
                  min={1}
                  max={configOptions?.maxHistoricalSyncDays ?? 365}
                  value={historicalDays}
                  onChange={(e) => setHistoricalDays(Number(e.target.value))}
                  className="w-full bg-surface-secondary/50 border border-border-primary/50 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Batch size</label>
                <input
                  type="number"
                  min={100}
                  max={configOptions?.maxBatchSize ?? 5000}
                  step={100}
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className="w-full bg-surface-secondary/50 border border-border-primary/50 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/app/settings')}>Cancel</Button>
          <Button onClick={saveConfiguration} disabled={selectedTypes.length === 0 || configureMutation.isPending}>
            {configureMutation.isPending ? 'Saving…' : 'Save Configuration'}
          </Button>
          <Button
            onClick={startInitialSync}
            disabled={selectedTypes.length === 0 || configureMutation.isPending || triggerMutation.isPending}
            className="bg-gradient-to-r from-accent-primary to-accent-secondary"
          >
            {triggerMutation.isPending ? 'Starting…' : 'Save & Start Initial Sync'}
          </Button>
        </div>
      </div>
    </ContentLayout>
  );
};

export default IntegrationConfigureRoute;
