import React, { useState } from 'react';
import { ContentLayout } from '@/components/layouts';
import { Spinner } from '@/components/ui/spinner';
import { useNotifications } from '@/components/ui/notifications';
import { 
  useGetConnectionDiagnostics, 
  useGetRawConnectionData,
  useDetectConnectionLeaks,
  useAttemptRecovery,
  useForceConnectionReset,
  LeakDetectionResponse 
} from '@/features/admin/api/connection-diagnostics';

const formatDuration = (minutes: number) => {
  if (minutes < 1) return '<1 min';
  if (minutes < 60) return `${Math.floor(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = Math.floor(minutes % 60);
  return `${hours}h ${remainingMins}m`;
};

const getHealthStatusColor = (status: string) => {
  switch (status) {
    case 'healthy':
      return 'text-green-400 bg-green-500/20 border-green-500/50';
    case 'warning':
      return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
    case 'critical':
      return 'text-red-400 bg-red-500/20 border-red-500/50';
    default:
      return 'text-slate-400 bg-slate-500/20 border-slate-500/50';
  }
};

const ConfirmationModal = ({ 
  title,
  message,
  confirmText,
  confirmButtonClass,
  onClose, 
  onConfirm,
  loading = false
}: { 
  title: string;
  message: string;
  confirmText: string;
  confirmButtonClass: string;
  onClose: () => void; 
  onConfirm: () => void;
  loading?: boolean;
}) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-slate-800/90 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl max-w-md w-full mx-4">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <p className="text-slate-300 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 transition-colors font-medium text-sm border border-slate-600/50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50 ${confirmButtonClass}`}
        >
          {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {confirmText}
        </button>
      </div>
    </div>
  </div>
);

export const ConnectionDiagnosticsRoute = () => {
  const { addNotification } = useNotifications();
  const [showRawData, setShowRawData] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [leakDetectionResult, setLeakDetectionResult] = useState<LeakDetectionResponse | null>(null);

  const { data: diagnostics, isLoading, error, refetch } = useGetConnectionDiagnostics({
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
  
  const { data: rawData, isLoading: rawDataLoading } = useGetRawConnectionData({
    enabled: showRawData,
  });

  const detectLeaksMutation = useDetectConnectionLeaks({
    mutationConfig: {
      onSuccess: (data) => {
        setLeakDetectionResult(data);
        addNotification({
          type: data.has_leaks ? 'warning' : 'success',
          title: 'Leak Detection Complete',
          message: data.has_leaks ? 'Connection leaks detected!' : 'No leaks detected'
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Detection failed',
          message: error instanceof Error ? error.message : 'Failed to detect leaks'
        });
      }
    }
  });

  const recoveryMutation = useAttemptRecovery({
    mutationConfig: {
      onSuccess: (data) => {
        setShowRecoveryModal(false);
        addNotification({
          type: data.success ? 'success' : 'warning',
          title: 'Recovery Complete',
          message: `${data.status}. Connections: ${data.connections_before} → ${data.connections_after}`
        });
      },
      onError: (error) => {
        setShowRecoveryModal(false);
        addNotification({
          type: 'error',
          title: 'Recovery failed',
          message: error instanceof Error ? error.message : 'Failed to attempt recovery'
        });
      }
    }
  });

  const resetMutation = useForceConnectionReset({
    mutationConfig: {
      onSuccess: (data) => {
        setShowResetModal(false);
        addNotification({
          type: data.success ? 'success' : 'error',
          title: 'Emergency Reset Complete',
          message: data.success ? 'Connection pool reset successfully' : 'Reset failed'
        });
      },
      onError: (error) => {
        setShowResetModal(false);
        addNotification({
          type: 'error',
          title: 'Reset failed',
          message: error instanceof Error ? error.message : 'Failed to reset connections'
        });
      }
    }
  });

  const handleRefresh = () => {
    refetch();
    setLeakDetectionResult(null);
  };

  if (isLoading) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Spinner size="xl" />
            <p className="mt-4 text-slate-300">Loading connection diagnostics...</p>
          </div>
        </div>
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center bg-slate-800/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-700/50">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-white mb-2">Error Loading Diagnostics</h2>
            <p className="text-slate-400">
              {error instanceof Error ? error.message : 'Failed to load connection diagnostics'}
            </p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-2xl blur-3xl"></div>
          
          <div className="relative bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-400/30 mb-4">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-200">Connection Monitoring</span>
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
                  Connection Diagnostics
                </h1>
                <p className="text-slate-300">
                  Monitor database connections, detect leaks, and manage connection health
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 transition-colors font-medium text-sm border border-slate-600/50"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Active Connections</h3>
              <div className="text-2xl">🔗</div>
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-2">{diagnostics?.active_connections}</div>
            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getHealthStatusColor(diagnostics?.health_status || 'unknown')}`}>
              {diagnostics?.health_status?.toUpperCase()}
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Long Running</h3>
              <div className="text-2xl">⏱️</div>
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-2">{diagnostics?.long_running_connections?.length || 0}</div>
            <div className="text-xs text-slate-400">Connections running &gt; 5min</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Pool Max Size</h3>
              <div className="text-2xl">🏊</div>
            </div>
            <div className="text-3xl font-bold text-purple-400 mb-2">{diagnostics?.pool_stats?.main_pool_max}</div>
            <div className="text-xs text-slate-400">Main pool maximum</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Last Updated</h3>
              <div className="text-2xl">🕐</div>
            </div>
            <div className="text-sm font-medium text-slate-300 mb-2">
              {diagnostics?.timestamp ? new Date(diagnostics.timestamp).toLocaleTimeString() : 'Unknown'}
            </div>
            <div className="text-xs text-slate-400">Auto-refreshes every 30s</div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-4">Diagnostic Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => detectLeaksMutation.mutate(undefined)}
              disabled={detectLeaksMutation.isPending}
              className="px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {detectLeaksMutation.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Detect Leaks
            </button>

            <button
              onClick={() => setShowRawData(!showRawData)}
              className="px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
            >
              {showRawData ? 'Hide' : 'Show'} Raw Data
            </button>

            <button
              onClick={() => setShowRecoveryModal(true)}
              className="px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
            >
              Attempt Recovery
            </button>

            <button
              onClick={() => setShowResetModal(true)}
              className="px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg hover:shadow-red-500/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
            >
              Emergency Reset
            </button>
          </div>
        </div>

        {/* Connection Details */}
        {diagnostics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Long Running Connections */}
            <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Long Running Connections</h3>
              {diagnostics.long_running_connections?.length > 0 ? (
                <div className="space-y-3">
                  {diagnostics.long_running_connections.map((connection, index) => (
                    <div key={index} className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/30">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-white">{connection.operation}</span>
                        <span className="text-yellow-400 text-sm font-medium">
                          {formatDuration(connection.duration_minutes)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        ID: {connection.connection_id} | Thread: {connection.thread_id}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <div className="text-4xl mb-2">✅</div>
                  <p>No long-running connections</p>
                </div>
              )}
            </div>

            {/* Connections by Operation */}
            <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Connections by Operation</h3>
              {diagnostics.connections_by_operation && Object.keys(diagnostics.connections_by_operation).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(diagnostics.connections_by_operation)
                    .sort(([,a], [,b]) => b - a)
                    .map(([operation, count]) => (
                      <div key={operation} className="flex justify-between items-center bg-slate-700/30 p-3 rounded-lg border border-slate-600/30">
                        <span className="text-white font-medium">{operation}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          count > 5 ? 'bg-red-500/20 text-red-400' : 
                          count > 2 ? 'bg-yellow-500/20 text-yellow-400' : 
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {count}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <div className="text-4xl mb-2">📊</div>
                  <p>No active operations</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Leak Detection Results */}
        {leakDetectionResult && (
          <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Leak Detection Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-slate-300 mb-3">Analysis</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Has Leaks:</span>
                    <span className={leakDetectionResult.has_leaks ? 'text-red-400' : 'text-green-400'}>
                      {leakDetectionResult.has_leaks ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">High Connection Count:</span>
                    <span className={leakDetectionResult.analysis.high_connection_count ? 'text-red-400' : 'text-green-400'}>
                      {leakDetectionResult.analysis.high_connection_count ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Long Running Present:</span>
                    <span className={leakDetectionResult.analysis.long_running_connections ? 'text-yellow-400' : 'text-green-400'}>
                      {leakDetectionResult.analysis.long_running_connections ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-slate-300 mb-3">Recommendations</h4>
                <div className="space-y-1">
                  {leakDetectionResult.recommendations.map((rec, index) => (
                    <div key={index} className="text-slate-300 text-sm bg-slate-700/30 p-2 rounded border border-slate-600/30">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Raw Connection Data */}
        {showRawData && (
          <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Raw Connection Data</h3>
            {rawDataLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : rawData ? (
              <div className="space-y-4">
                {/* Debug info */}
                <div className="text-xs text-slate-500 bg-slate-700/20 p-2 rounded">
                  Debug: {JSON.stringify(rawData, null, 2)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="bg-slate-700/30 p-3 rounded-lg">
                    <div className="text-slate-400">Total Active</div>
                    <div className="text-white font-medium">{rawData.total_active}</div>
                  </div>
                  <div className="bg-slate-700/30 p-3 rounded-lg">
                    <div className="text-slate-400">Main Pool Max</div>
                    <div className="text-white font-medium">{rawData.pool_configuration.mainPoolMaxSize}</div>
                  </div>
                  <div className="bg-slate-700/30 p-3 rounded-lg">
                    <div className="text-slate-400">ReadOnly Pool Max</div>
                    <div className="text-white font-medium">{rawData.pool_configuration.readOnlyPoolMaxSize}</div>
                  </div>
                  <div className="bg-slate-700/30 p-3 rounded-lg">
                    <div className="text-slate-400">Detailed Connections</div>
                    <div className="text-white font-medium">{rawData.detailed_connections?.length || 0}</div>
                  </div>
                </div>

                {rawData.detailed_connections && rawData.detailed_connections.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-600/50">
                          <th className="text-left py-2 px-3 font-medium text-slate-300">Connection ID</th>
                          <th className="text-left py-2 px-3 font-medium text-slate-300">Operation</th>
                          <th className="text-left py-2 px-3 font-medium text-slate-300">Duration</th>
                          <th className="text-left py-2 px-3 font-medium text-slate-300">Thread</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rawData.detailed_connections.map((conn, index) => (
                          <tr key={index} className="border-b border-slate-700/30">
                            <td className="py-2 px-3 text-slate-300 font-mono">{conn.connection_id}</td>
                            <td className="py-2 px-3 text-slate-300">{conn.operation}</td>
                            <td className="py-2 px-3 text-slate-300">{Math.round(conn.duration_ms)}ms</td>
                            <td className="py-2 px-3 text-slate-300">{conn.thread_id}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-400 text-center py-8">Failed to load raw data</div>
            )}
          </div>
        )}

        {/* Recovery Confirmation Modal */}
        {showRecoveryModal && (
          <ConfirmationModal
            title="Attempt Connection Recovery"
            message="This will trigger garbage collection and connection cleanup to resolve potential leak issues. The application may experience a brief performance impact during recovery."
            confirmText="Attempt Recovery"
            confirmButtonClass="bg-green-600 text-white hover:bg-green-700"
            onClose={() => setShowRecoveryModal(false)}
            onConfirm={() => recoveryMutation.mutate(undefined)}
            loading={recoveryMutation.isPending}
          />
        )}

        {/* Force Reset Confirmation Modal */}
        {showResetModal && (
          <ConfirmationModal
            title="Emergency Connection Reset"
            message="⚠️ WARNING: This will forcefully reset all connection pools. This is an emergency procedure that may cause temporary service disruption. Only use if connection recovery has failed."
            confirmText="Force Reset"
            confirmButtonClass="bg-red-600 text-white hover:bg-red-700"
            onClose={() => setShowResetModal(false)}
            onConfirm={() => resetMutation.mutate(undefined)}
            loading={resetMutation.isPending}
          />
        )}
      </div>
    </ContentLayout>
  );
};