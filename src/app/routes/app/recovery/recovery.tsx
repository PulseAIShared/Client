import React, { useMemo, useState } from 'react';
import { ContentLayout } from '@/components/layouts';
import { RecoveryKpis, MissedPaymentsTable } from '@/features/insights/components';
import { useGetInsightsData } from '@/features/insights/api/insights';
import { useEnrollInFlow, useRetryPayment } from '@/features/recovery/api/recovery';

export const RecoveryRoute: React.FC = () => {
  const { data } = useGetInsightsData();
  const retryMutation = useRetryPayment();
  const enrollMutation = useEnrollInFlow();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const flows = useMemo(() => data?.recoveryFlows?.templates || [], [data]);

  return (
    <ContentLayout>
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-2xl blur-3xl"></div>
          <div className="relative bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Recovery</h1>
                <p className="text-text-secondary">Recover missed payments with playbooks and smart queues</p>
              </div>
            </div>
          </div>
        </div>

        <RecoveryKpis />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          <div className="lg:col-span-2 space-y-6">
            {/* Minimal selectable table (reuse existing for now) */}
            <MissedPaymentsTable />
          </div>
          <div className="space-y-6">
            <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Recovery Playbooks</h3>
              </div>
              <div className="space-y-3">
                {flows.map((f: any) => (
                  <button
                    key={f.name}
                    onClick={() => {
                      // For now, if there were selections, enroll the first one
                      const first = selectedIds[0];
                      if (first) enrollMutation.mutate({ paymentId: first, flowId: f.name });
                    }}
                    className="w-full text-left p-4 rounded-xl border border-border-primary/30 bg-surface-secondary/30 hover:border-accent-primary/30"
                  >
                    <div className="font-medium text-text-primary">{f.name}</div>
                    <div className="text-xs text-text-muted">Trigger: {f.trigger}</div>
                    <div className="text-xs text-text-muted">Success rate: {f.success_rate}%</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};


