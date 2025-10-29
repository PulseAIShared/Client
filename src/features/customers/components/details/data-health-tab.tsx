import React from 'react';
import { useCustomerProfile } from './customer-profile-context';
import { formatDate } from '@/utils/customer-helpers';

export const CustomerDataHealthTab: React.FC = () => {
  const { dataHealth } = useCustomerProfile();

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-surface-secondary/40 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Completeness by Domain</h3>
          {dataHealth.completenessByDomain.length === 0 ? (
            <div className="p-6 bg-surface-primary/70 border border-border-primary/20 rounded-xl text-sm text-text-muted">
              Completeness scores unavailable. Run data integrity checks to populate this view.
            </div>
          ) : (
            <div className="space-y-4">
              {dataHealth.completenessByDomain.map((entry, index) => (
                <div key={`${entry.domain}-${index}`}>
                  <div className="flex items-center justify-between text-sm font-semibold text-text-primary">
                    <span>{entry.domain}</span>
                    <span>{entry.score.toFixed(0)}%</span>
                  </div>
                  <div className="mt-2 h-3 bg-border-primary/30 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-primary" style={{ width: `${Math.min(100, entry.score)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface-secondary/40 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Last Sync Times</h3>
          {dataHealth.lastSyncTimes.length === 0 ? (
            <div className="p-6 bg-surface-primary/70 border border-border-primary/20 rounded-xl text-sm text-text-muted">
              No sync metadata available.
            </div>
          ) : (
            <div className="space-y-3">
              {dataHealth.lastSyncTimes.map((source, index) => (
                <div key={`${source.source}-${index}`} className="flex items-center justify-between p-4 bg-surface-primary/90 border border-border-primary/20 rounded-xl">
                  <div>
                    <div className="text-sm font-semibold text-text-primary">{source.source}</div>
                    <div className="text-xs text-text-secondary/70">
                      {source.lastSync ? formatDate(source.lastSync) : 'Never synced'}
                    </div>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary/80">
                    {source.status ?? 'Unknown'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface-primary/90 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
        <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-4">Missing Field Callouts</h3>
        {dataHealth.missingFields.length === 0 ? (
          <div className="p-6 bg-surface-secondary/40 border border-border-primary/20 rounded-xl text-sm text-text-muted">
            No missing fields detected in the latest sync.
          </div>
        ) : (
          <div className="space-y-2">
            {dataHealth.missingFields.map((field, index) => (
              <div key={`${field}-${index}`} className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/30 rounded-xl text-sm text-warning">
                <span className="mt-1 w-2 h-2 rounded-full bg-warning"></span>
                <span>{field}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-surface-primary/90 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
        <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-4">Import History</h3>
        {dataHealth.importHistory.length === 0 ? (
          <div className="p-6 bg-surface-secondary/40 border border-border-primary/20 rounded-xl text-sm text-text-muted">
            No import jobs logged for this customer.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-text-secondary/70">
                <tr>
                  <th className="text-left py-3 pr-4">Batch</th>
                  <th className="text-left py-3 pr-4">Source</th>
                  <th className="text-left py-3 pr-4">Records</th>
                  <th className="text-left py-3">Imported At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary/20">
                {dataHealth.importHistory.map((job, index) => (
                  <tr key={`${job.id}-${index}`}>
                    <td className="py-3 pr-4 text-text-primary">{job.id}</td>
                    <td className="py-3 pr-4 text-text-secondary">{job.source}</td>
                    <td className="py-3 pr-4 text-text-secondary">{job.records ?? 'N/A'}</td>
                    <td className="py-3 text-text-secondary">{job.importedAt ? formatDate(job.importedAt) : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
