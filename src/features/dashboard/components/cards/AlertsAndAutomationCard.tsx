import React, { useState } from 'react';
import { DashboardAlert } from '@/types/api';


interface AlertsAndAutomationCardProps {
  data?: DashboardAlert[];
  isLoading?: boolean;
  error?: Error | null;
  onConfigureAlert?: (alert: DashboardAlert) => void;
}

export const AlertsAndAutomationCard: React.FC<AlertsAndAutomationCardProps> = ({
  data,
  isLoading,
  error,
  onConfigureAlert,
}) => {
  const [filterType, setFilterType] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg space-y-4">
        <div className="h-6 bg-gradient-to-r from-surface-secondary to-surface-primary rounded-lg w-48" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gradient-to-r from-surface-secondary to-surface-primary rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-muted/5 border border-error-muted/20 p-6 rounded-2xl">
        <div className="text-error-muted text-sm">
          Failed to load alerts
        </div>
      </div>
    );
  }

  const alerts = data || [];
  const filteredAlerts = filterType
    ? alerts.filter(a => a.alertType === filterType)
    : alerts;

  const alertTypes = [
    { type: 'ChurnRisk', label: '⚠️ Churn Risk', count: alerts.filter(a => a.alertType === 'ChurnRisk').length },
    { type: 'RevenueThreshold', label: '💰 Revenue', count: alerts.filter(a => a.alertType === 'RevenueThreshold').length },
    { type: 'Engagement', label: '📊 Engagement', count: alerts.filter(a => a.alertType === 'Engagement').length },
  ];

  const activeAlertCount = alerts.filter(a => a.triggeredCount > 0).length;

  const getAlertColor = (alertType: string) => {
    switch (alertType) {
      case 'ChurnRisk':
        return {
          bg: 'from-red-500/10 to-red-500/5',
          border: 'border-red-500/20',
          icon: '⚠️',
          text: 'text-red-300',
        };
      case 'RevenueThreshold':
        return {
          bg: 'from-yellow-500/10 to-yellow-500/5',
          border: 'border-yellow-500/20',
          icon: '💰',
          text: 'text-yellow-300',
        };
      default:
        return {
          bg: 'from-blue-500/10 to-blue-500/5',
          border: 'border-blue-500/20',
          icon: '📊',
          text: 'text-blue-300',
        };
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Email':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
      case 'Slack':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
      case 'Tag':
        return 'bg-green-500/10 text-green-300 border-green-500/20';
      case 'AutomatedRecovery':
        return 'bg-orange-500/10 text-orange-300 border-orange-500/20';
      default:
        return 'bg-surface-secondary/50 text-text-secondary border-border-primary/10';
    }
  };

  return (
    <div className="bg-surface-primary/80 backdrop-blur-lg rounded-2xl border border-border-primary/30 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-surface-primary to-surface-secondary p-6 border-b border-border-primary/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
              <span className="text-lg">🔔</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Alerts & Automation</h3>
              <p className="text-text-muted text-xs">
                {activeAlertCount} active · {alerts.length} total
              </p>
            </div>
          </div>
          <button className="px-3 py-1.5 text-xs font-semibold bg-accent-primary hover:bg-accent-secondary text-white rounded-lg transition-colors">
            + New Alert
          </button>
        </div>
        <p className="text-text-muted text-sm">Automated notifications and actions</p>
      </div>

      {alerts.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-text-muted mb-2">No alerts configured yet</p>
          <p className="text-text-muted text-sm mb-4">Create alerts to get notified of important customer events</p>
          <button className="px-4 py-2 text-sm font-semibold bg-accent-primary hover:bg-accent-secondary text-white rounded-lg transition-colors">
            Configure Your First Alert
          </button>
        </div>
      ) : (
        <>
          {/* Alert Type Filter */}
          <div className="px-6 py-4 border-b border-border-primary/10 bg-surface-secondary/20">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterType(null)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filterType === null
                    ? 'bg-accent-primary text-white'
                    : 'bg-surface-secondary hover:bg-surface-secondary/80 text-text-secondary'
                }`}
              >
                All ({alerts.length})
              </button>
              {alertTypes.map(type => (
                <button
                  key={type.type}
                  onClick={() => setFilterType(type.type)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    filterType === type.type
                      ? 'bg-accent-primary text-white'
                      : 'bg-surface-secondary hover:bg-surface-secondary/80 text-text-secondary'
                  }`}
                >
                  {type.label} ({type.count})
                </button>
              ))}
            </div>
          </div>

          {/* Alerts List */}
          <div className="divide-y divide-border-primary/10">
            {filteredAlerts.length === 0 ? (
              <div className="p-6 text-center text-text-muted text-sm">
                No alerts of this type
              </div>
            ) : (
              filteredAlerts.map((alert, idx) => {
                const colors = getAlertColor(alert.alertType);
                const isActive = alert.triggeredCount > 0;

                return (
                  <div
                    key={alert.id}
                    className={`bg-gradient-to-r ${colors.bg} border-l-4 ${colors.border} p-4`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="text-xl flex-shrink-0 mt-0.5">{colors.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-text-primary truncate">{alert.name}</h4>
                            {isActive && (
                              <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-red-500/20 text-red-300 rounded-full">
                                🔴 Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-muted mb-1">Condition: {alert.condition}</p>
                          {alert.lastTriggered && (
                            <p className="text-xs text-text-muted">
                              Last triggered: {new Date(alert.lastTriggered).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => onConfigureAlert?.(alert)}
                        className="flex-shrink-0 ml-3 px-3 py-1.5 text-xs font-semibold bg-surface-secondary/50 hover:bg-surface-secondary text-text-primary rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Action & Metrics */}
                    <div className="flex items-center gap-2 pt-2 border-t border-border-primary/10">
                      <div className={`px-2 py-1 text-xs font-semibold rounded border ${getActionColor(alert.action)}`}>
                        {alert.action}
                      </div>
                      {alert.triggeredCount > 0 && (
                        <div className="ml-auto text-xs text-text-muted">
                          Triggered {alert.triggeredCount} time{alert.triggeredCount !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      <div className="px-6 py-4 bg-surface-secondary/50 border-t border-border-primary/10">
        <p className="text-xs text-text-muted">
          Alerts automatically trigger based on your configured conditions and send notifications to your team
        </p>
      </div>
    </div>
  );
};
