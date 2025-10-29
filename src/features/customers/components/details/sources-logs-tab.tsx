import React, { useMemo, useState } from 'react';
import { useCustomerProfile } from './customer-profile-context';
import { formatDate } from '@/utils/customer-helpers';
import { Button } from '@/components/ui/button';

const STATUS_FILTERS = ['all', 'success', 'warning', 'error'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

export const CustomerSourcesLogsTab: React.FC = () => {
  const { sourcesLogs } = useCustomerProfile();
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [activeSource, setActiveSource] = useState<string | null>(null);

  const filteredSyncHistory = useMemo(() => {
    if (filter === 'all') {
      return sourcesLogs.syncHistory;
    }
    return sourcesLogs.syncHistory.filter((entry) => entry.status.toLowerCase().includes(filter));
  }, [filter, sourcesLogs.syncHistory]);

  const activeSourceDetails = useMemo(() => sourcesLogs.sources.find((source) => source.id === activeSource), [activeSource, sourcesLogs.sources]);

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10 relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {sourcesLogs.sources.length === 0 ? (
          <div className="lg:col-span-3 p-6 bg-surface-secondary/40 border border-border-primary/20 rounded-2xl text-sm text-text-muted">
            No data sources connected. Add CRM, billing, marketing, support, and engagement sources to complete this profile.
          </div>
        ) : (
          sourcesLogs.sources.map((source, index) => (
            <div key={`${source.id}-${index}`} className="p-6 bg-surface-secondary/40 border border-border-primary/30 rounded-2xl shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-text-primary">{source.name}</div>
                  <div className="text-xs text-text-secondary/70">{source.type}</div>
                </div>
                {source.isPrimary && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent-primary/15 text-accent-primary border border-accent-primary/30">
                    Primary
                  </span>
                )}
              </div>
              <div className="text-xs text-text-secondary/70">
                Last sync: {source.lastSync ? formatDate(source.lastSync) : 'Never'}
              </div>
              <div className="text-xs text-text-secondary/70">
                Records: {source.recordCount != null ? source.recordCount.toLocaleString() : 'N/A'}
              </div>
              <Button
                variant="outline"
                className="w-full border-border-primary/40 hover:border-accent-primary/60 hover:text-accent-primary"
                onClick={() => setActiveSource(source.id)}
              >
                Raw Record Explorer
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="bg-surface-primary/90 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Sync History</h3>
            <p className="text-xs text-text-secondary/80">Monitor recent ingest jobs with status filters.</p>
          </div>
          <div className="flex items-center gap-2">
            {STATUS_FILTERS.map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  filter === option
                    ? 'border-accent-primary/60 bg-accent-primary/15 text-accent-primary'
                    : 'border-border-primary/30 text-text-secondary hover:border-accent-primary/40 hover:text-accent-primary'
                }`}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        {filteredSyncHistory.length === 0 ? (
          <div className="p-6 bg-surface-secondary/40 border border-border-primary/20 rounded-xl text-sm text-text-muted">
            No sync records match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-text-secondary/70">
                <tr>
                  <th className="text-left py-3 pr-4">Source</th>
                  <th className="text-left py-3 pr-4">Date</th>
                  <th className="text-left py-3 pr-4">Status</th>
                  <th className="text-left py-3">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary/20">
                {filteredSyncHistory.map((entry, index) => (
                  <tr key={`${entry.id}-${index}`}>
                    <td className="py-3 pr-4 text-text-primary">{entry.source}</td>
                    <td className="py-3 pr-4 text-text-secondary">{formatDate(entry.date)}</td>
                    <td className="py-3 pr-4 text-text-secondary">{entry.status}</td>
                    <td className="py-3 text-text-secondary">
                      {entry.durationSeconds != null ? `${entry.durationSeconds}s` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-surface-primary/90 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
        <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-4">Import Job History</h3>
        {sourcesLogs.jobLogs.length === 0 ? (
          <div className="p-6 bg-surface-secondary/40 border border-border-primary/20 rounded-xl text-sm text-text-muted">
            No import jobs tracked.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-text-secondary/70">
                <tr>
                  <th className="text-left py-3 pr-4">Job Type</th>
                  <th className="text-left py-3 pr-4">Started</th>
                  <th className="text-left py-3 pr-4">Status</th>
                  <th className="text-left py-3 pr-4">Processed</th>
                  <th className="text-left py-3">Errors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary/20">
                {sourcesLogs.jobLogs.map((job, index) => (
                  <tr key={`${job.id}-${index}`}>
                    <td className="py-3 pr-4 text-text-primary">{job.jobType}</td>
                    <td className="py-3 pr-4 text-text-secondary">{formatDate(job.startedAt)}</td>
                    <td className="py-3 pr-4 text-text-secondary">{job.status}</td>
                    <td className="py-3 pr-4 text-text-secondary">{job.recordsProcessed ?? 'N/A'}</td>
                    <td className="py-3 text-text-secondary">{job.errors ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-surface-primary/90 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
        <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-4">Anomalies</h3>
        {sourcesLogs.anomalies.length === 0 ? (
          <div className="p-6 bg-surface-secondary/40 border border-border-primary/20 rounded-xl text-sm text-text-muted">
            No anomalies captured. Great data hygiene!
          </div>
        ) : (
          <div className="space-y-3">
            {sourcesLogs.anomalies.map((anomaly) => (
              <div key={anomaly.id} className="p-4 bg-warning/10 border border-warning/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-warning">{anomaly.summary}</div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-warning/80">{anomaly.severity}</span>
                </div>
                <div className="text-xs text-warning/70 mt-1">{formatDate(anomaly.detectedAt)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeSourceDetails && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-surface-primary/95 border border-border-primary/40 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">{activeSourceDetails.name} Explorer</h3>
                <p className="text-xs text-text-secondary/80">Preview representative records and download full dataset.</p>
              </div>
              <button
                className="text-text-secondary hover:text-text-primary"
                onClick={() => setActiveSource(null)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 bg-surface-secondary/40 border border-border-primary/20 rounded-xl text-sm text-text-secondary">
              Raw data preview not available in this environment. Use the CSV download to inspect full records offline.
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setActiveSource(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  // Placeholder download handler
                  setActiveSource(null);
                }}
              >
                Download CSV
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
