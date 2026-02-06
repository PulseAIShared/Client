import React from 'react';
import { Link } from 'react-router-dom';
import { ContentLayout } from '@/components/layouts';
import { CompanyAuthorization, useAuthorization } from '@/lib/authorization';
import { useGetDashboardData } from '@/features/dashboard/api/dashboard';
import { useGetPlaybooks } from '@/features/playbooks/api/playbooks';
import { Spinner } from '@/components/ui/spinner';
import { TrendingUp, DollarSign, CheckCircle, XCircle } from 'lucide-react';

export const ImpactRoute = () => {
  const { checkCompanyPolicy } = useAuthorization();
  const canViewAnalytics = checkCompanyPolicy('analytics:read');

  const { data: dashboardData, isLoading: dashboardLoading } = useGetDashboardData();
  const { data: playbooks, isLoading: playbooksLoading } = useGetPlaybooks();

  const isLoading = dashboardLoading || playbooksLoading;
  const kpis = dashboardData?.recoveryAnalytics?.kpis;
  const workQueue = dashboardData?.workQueueSummary;

  const totalRuns = playbooks?.reduce((sum, pb) => sum + pb.totalRunCount, 0) ?? 0;
  const activeRuns = playbooks?.reduce((sum, pb) => sum + pb.activeRunCount, 0) ?? 0;
  const activePlaybooks = playbooks?.filter((pb) => {
    const s = pb.status;
    return s === 1 || s === 'Active';
  }).length ?? 0;

  return (
    <CompanyAuthorization
      policyCheck={canViewAnalytics}
      forbiddenFallback={
        <ContentLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center bg-surface-primary/80 backdrop-blur-xl p-8 rounded-3xl border border-border-primary/50 shadow-2xl max-w-md">
              <h2 className="text-xl font-semibold text-text-primary mb-2">Access Restricted</h2>
              <p className="text-text-muted">You need analytics read permissions to view impact data.</p>
            </div>
          </div>
        </ContentLayout>
      }
    >
      <ContentLayout>
        <div className="space-y-6 sm:space-y-8 lg:space-y-10">
          {/* Header */}
          <div className="bg-surface-primary/80 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-border-primary/30 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Impact</h1>
                <p className="text-text-muted text-sm sm:text-base">
                  Measure the outcomes of your playbook actions and recovered revenue.
                </p>
              </div>
              <Link
                to="/app/insights"
                className="px-4 py-2.5 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-secondary transition-colors font-medium text-sm border border-border-primary/50 self-start"
              >
                Deep-dive analytics
              </Link>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Spinner size="xl" />
            </div>
          )}

          {!isLoading && (
            <>
              {/* Recovery KPIs */}
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-4">Revenue Recovery</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <KpiCard
                    label="Missed Amount"
                    value={`$${(kpis?.missedAmount ?? 0).toLocaleString()}`}
                    icon={<XCircle className="w-5 h-5 text-error" />}
                  />
                  <KpiCard
                    label="Recovered Amount"
                    value={`$${(kpis?.recoveredAmount ?? 0).toLocaleString()}`}
                    icon={<DollarSign className="w-5 h-5 text-success" />}
                    highlight
                  />
                  <KpiCard
                    label="Recovery Rate"
                    value={`${Math.round(kpis?.recoveryRate ?? 0)}%`}
                    icon={<TrendingUp className="w-5 h-5 text-accent-primary" />}
                  />
                  <KpiCard
                    label="Avg Days to Recover"
                    value={(kpis?.averageDaysToRecover ?? 0).toFixed(1)}
                    icon={<CheckCircle className="w-5 h-5 text-info-muted" />}
                  />
                </div>
              </div>

              {/* Playbook Health */}
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-4">Playbook Health</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <KpiCard label="Active Playbooks" value={String(activePlaybooks)} />
                  <KpiCard label="Active Runs" value={String(activeRuns)} />
                  <KpiCard label="Total Runs" value={String(totalRuns)} />
                  <KpiCard
                    label="Revenue Saved (7d)"
                    value={`$${(workQueue?.revenueSavedLast7d ?? 0).toLocaleString()}`}
                    highlight
                  />
                </div>
              </div>

              {/* Work Queue Summary */}
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-4">Operational Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg text-center">
                    <div className="text-3xl font-bold text-accent-primary">{workQueue?.pendingApprovals ?? 0}</div>
                    <div className="text-sm text-text-muted mt-1">Pending Approvals</div>
                    <Link
                      to="/app/work-queue"
                      className="text-xs text-accent-primary hover:underline mt-2 inline-block"
                    >
                      Go to work queue
                    </Link>
                  </div>
                  <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg text-center">
                    <div className="text-3xl font-bold text-warning">{workQueue?.highValueCount ?? 0}</div>
                    <div className="text-sm text-text-muted mt-1">High Value Items</div>
                  </div>
                  <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg text-center">
                    <div className="text-3xl font-bold text-text-primary">{dashboardData?.stats?.recoveredRevenue ?? '$0'}</div>
                    <div className="text-sm text-text-muted mt-1">Total Recovered Revenue</div>
                  </div>
                </div>
              </div>

              {/* Playbook Success Rates */}
              {playbooks && playbooks.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-4">Playbook Performance</h2>
                  <div className="bg-surface-primary/80 backdrop-blur-lg rounded-2xl border border-border-primary/30 shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border-primary/30">
                            <th className="text-left px-6 py-4 text-text-secondary font-medium">Playbook</th>
                            <th className="text-center px-4 py-4 text-text-secondary font-medium">Status</th>
                            <th className="text-center px-4 py-4 text-text-secondary font-medium">Priority</th>
                            <th className="text-center px-4 py-4 text-text-secondary font-medium">Active Runs</th>
                            <th className="text-center px-4 py-4 text-text-secondary font-medium">Total Runs</th>
                            <th className="text-right px-6 py-4 text-text-secondary font-medium"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {playbooks.map((pb) => {
                            const statusStr = typeof pb.status === 'number'
                              ? ['Draft', 'Active', 'Paused', 'Archived'][pb.status] ?? String(pb.status)
                              : String(pb.status);

                            return (
                              <tr key={pb.id} className="border-b border-border-primary/10 hover:bg-surface-secondary/20 transition-colors">
                                <td className="px-6 py-4 font-medium text-text-primary">{pb.name}</td>
                                <td className="text-center px-4 py-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                                    statusStr === 'Active' ? 'bg-success/10 text-success border-success/30' : 'bg-surface-secondary/60 text-text-secondary border-border-primary/30'
                                  }`}>
                                    {statusStr}
                                  </span>
                                </td>
                                <td className="text-center px-4 py-4 text-text-secondary">{pb.priority}</td>
                                <td className="text-center px-4 py-4 text-text-primary font-medium">{pb.activeRunCount}</td>
                                <td className="text-center px-4 py-4 text-text-secondary">{pb.totalRunCount}</td>
                                <td className="text-right px-6 py-4">
                                  <Link to={`/app/playbooks/${pb.id}`} className="text-accent-primary hover:underline text-xs font-medium">
                                    View
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ContentLayout>
    </CompanyAuthorization>
  );
};

const KpiCard: React.FC<{
  label: string;
  value: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}> = ({ label, value, icon, highlight }) => (
  <div className="bg-surface-primary/80 backdrop-blur-lg p-5 rounded-2xl border border-border-primary/30 shadow-lg text-center">
    {icon && <div className="flex justify-center mb-2">{icon}</div>}
    <div className={`text-2xl font-bold ${highlight ? 'text-success' : 'text-text-primary'}`}>{value}</div>
    <div className="text-xs text-text-muted mt-1">{label}</div>
  </div>
);
