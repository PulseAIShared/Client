import React, { useMemo, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';
import { useCustomerProfile } from './customer-profile-context';
import { formatDate } from '@/utils/customer-helpers';

const FEATURE_FILTERS = ['all', 'core', 'advanced'] as const;
type FeatureFilter = (typeof FEATURE_FILTERS)[number];

export const CustomerEngagementTab: React.FC = () => {
  const { engagement } = useCustomerProfile();
  const [featureFilter, setFeatureFilter] = useState<FeatureFilter>('all');

  const heatmapWeeks = useMemo(() => {
    return engagement.weeklyLogins.map((entry) => ({
      week: entry.week,
      count: entry.count,
    }));
  }, [engagement.weeklyLogins]);

  const heatmapMax = useMemo(() => {
    if (heatmapWeeks.length === 0) {
      return 1;
    }
    return Math.max(...heatmapWeeks.map((item) => item.count), 1);
  }, [heatmapWeeks]);

  const radarData = useMemo(() => {
    if (engagement.topFeatures.length === 0) {
      return [];
    }

    return engagement.topFeatures.map((feature) => ({
      category: feature.name,
      usage: feature.usageCount,
    }));
  }, [engagement.topFeatures]);

  const filteredFeatures = useMemo(() => {
    if (featureFilter === 'all') {
      return engagement.topFeatures;
    }
    return engagement.topFeatures.filter((feature) => feature.category?.toLowerCase() === featureFilter);
  }, [engagement.topFeatures, featureFilter]);

  const sessionTrend = useMemo(
    () =>
      engagement.sessions.map((session, index) => ({
        label: formatDate(session.startedAt),
        duration: session.durationMinutes ?? 0,
        index,
      })),
    [engagement.sessions],
  );

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-surface-secondary/40 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Weekly Login Heatmap</h3>
            {heatmapWeeks.length === 0 ? (
              <div className="p-6 bg-surface-primary/70 border border-border-primary/20 rounded-xl text-sm text-text-muted">
                No login telemetry detected. Connect product usage data to populate the heatmap.
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {heatmapWeeks.map((week) => {
                  const intensity = heatmapMax === 0 ? 0 : week.count / heatmapMax;
                  return (
                    <div key={week.week} className="flex flex-col items-center gap-2 text-xs text-text-secondary/70">
                      <div
                        className="w-full aspect-square rounded-xl border border-border-primary/20"
                        style={{
                          backgroundColor: `rgba(var(--accent-primary-rgb), ${Math.min(0.85, intensity + 0.05)})`,
                        }}
                        title={`${week.week}: ${week.count} logins`}
                      ></div>
                      <span className="truncate w-full text-center">{week.week}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-surface-primary/80 border border-border-primary/20 rounded-2xl p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Session Duration Trend</h3>
                <p className="text-xs text-text-secondary/80">Last {sessionTrend.length} sessions (minutes)</p>
              </div>
            </div>
            {sessionTrend.length === 0 ? (
              <div className="p-6 bg-surface-secondary/40 border border-border-primary/20 rounded-xl text-sm text-text-muted">
                No session-level data found. Ingest analytics events to chart duration anomalies.
              </div>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sessionTrend}>
                    <XAxis dataKey="index" stroke="rgb(var(--text-muted))" fontSize={12} />
                    <YAxis stroke="rgb(var(--text-muted))" fontSize={12} />
                    <Tooltip
                      formatter={(value: number, _name, payload) => [`${value} min`, sessionTrend[payload.payload.index]?.label]}
                      contentStyle={{
                        backgroundColor: 'rgb(var(--surface-primary))',
                        border: '1px solid rgb(var(--border-primary))',
                        borderRadius: '12px',
                        color: 'rgb(var(--text-primary))',
                      }}
                    />
                    <Line type="monotone" dataKey="duration" stroke="rgb(var(--accent-secondary))" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface-secondary/40 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Feature Usage Radar</h3>
            <div className="h-64 mt-4">
              {radarData.length === 0 ? (
                <div className="p-6 bg-surface-primary/70 border border-border-primary/20 rounded-xl text-sm text-text-muted h-full flex items-center justify-center text-center">
                  Feature usage distribution unavailable. Map product events to generate a radar view.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgb(var(--border-primary))" />
                    <PolarAngleAxis dataKey="category" stroke="rgb(var(--text-muted))" />
                    <Radar
                      name="Usage"
                      dataKey="usage"
                      stroke="rgb(var(--accent-primary))"
                      fill="rgb(var(--accent-primary))"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary">Feature Usage Breakdown</h3>
            {radarData.length === 0 ? (
              <div className="mt-3 p-4 bg-surface-primary/70 border border-border-primary/20 rounded-xl text-sm text-text-muted">
                No feature breakdown recorded.
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {radarData.slice(0, 5).map((item) => (
                  <div key={item.category} className="p-3 bg-surface-primary/90 border border-border-primary/20 rounded-xl flex items-center justify-between">
                    <span className="text-sm font-semibold text-text-primary">{item.category}</span>
                    <span className="text-sm font-semibold text-accent-primary">{item.usage}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-surface-primary/90 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Most-Used Features</h3>
            <p className="text-xs text-text-secondary/80">Filter by feature grouping to inspect adoption depth.</p>
          </div>
          <div className="flex items-center gap-2">
            {FEATURE_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setFeatureFilter(filter)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  featureFilter === filter
                    ? 'border-accent-primary/60 bg-accent-primary/15 text-accent-primary'
                    : 'border-border-primary/30 text-text-secondary hover:border-accent-primary/40 hover:text-accent-primary'
                }`}
              >
                {filter.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        {filteredFeatures.length === 0 ? (
          <div className="p-6 bg-surface-secondary/40 border border-border-primary/20 rounded-xl text-sm text-text-muted">
            No features match the selected category.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFeatures.map((item) => (
              <div key={item.name} className="p-4 bg-surface-secondary/40 border border-border-primary/20 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-text-primary">{item.name}</div>
                  <div className="text-xs text-text-secondary/80">
                    Category: {item.category ?? 'Unclassified'}
                  </div>
                </div>
                <div className="text-sm font-semibold text-accent-primary">{item.usageCount} interactions</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-surface-primary/90 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
        <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-4">Last 10 Sessions</h3>
        {engagement.sessions.length === 0 ? (
          <div className="p-6 bg-surface-secondary/40 border border-border-primary/20 rounded-xl text-sm text-text-muted">
            No session history recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-text-secondary/70">
                <tr>
                  <th className="text-left py-3 pr-4">Start Time</th>
                  <th className="text-left py-3 pr-4">Duration</th>
                  <th className="text-left py-3 pr-4">Feature Focus</th>
                  <th className="text-left py-3">Flags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary/20">
                {engagement.sessions.map((session) => (
                  <tr key={session.id}>
                    <td className="py-3 pr-4 text-text-primary">{formatDate(session.startedAt)}</td>
                    <td className="py-3 pr-4 text-text-secondary">
                      {session.durationMinutes != null ? `${session.durationMinutes} min` : 'N/A'}
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">{session.feature ?? 'Unknown'}</td>
                    <td className="py-3 text-text-secondary">
                      {session.isAnomaly ? (
                        <span className="px-3 py-1 text-xs font-semibold text-warning bg-warning/10 border border-warning/30 rounded-full">
                          Anomaly detected
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-semibold text-success bg-success/10 border border-success/30 rounded-full">
                          Normal
                        </span>
                      )}
                    </td>
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
