import React, { useState } from 'react';
import { useGetInsightsData } from '@/features/insights/api/insights';

export const RecoveryFlows = () => {
  const { data: insights, isLoading, error } = useGetInsightsData();
  const [selectedTab, setSelectedTab] = useState<'active' | 'templates'>('active');
  const [activeFlow, setActiveFlow] = useState<string>('payment-failed');

  if (isLoading) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-6 bg-surface-secondary/50 rounded-xl w-40"></div>
            <div className="h-4 bg-surface-secondary/50 rounded-xl w-64"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-surface-secondary/50 rounded-xl"></div>
            <div className="h-8 w-24 bg-surface-secondary/50 rounded-xl"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-24 bg-surface-secondary/50 rounded-xl"></div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="h-16 bg-surface-secondary/50 rounded-xl"></div>
            <div className="h-32 bg-surface-secondary/50 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-error/20 to-error-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="text-error-muted font-medium mb-2">Failed to load recovery flows</div>
          <div className="text-sm text-text-muted mb-4">Please try refreshing the page</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error-muted transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { flows, templates } = insights.recoveryFlows;
  const selectedFlow = flows.find(f => f.id === activeFlow) || flows[0];

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'email':
        return (
          <svg className="w-4 h-4 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'sms':
        return (
          <svg className="w-4 h-4 text-success-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'phone':
        return (
          <svg className="w-4 h-4 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        );
      case 'in-app':
        return (
          <svg className="w-4 h-4 text-warning-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5v3a6 6 0 10-12 0v3l-5 5h5m7 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-surface-primary/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">Recovery Flows</h2>
          <p className="text-sm sm:text-base text-text-muted">Automated campaigns to re-engage and recover customers</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTab('active')}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
              selectedTab === 'active'
                ? 'bg-gradient-to-r from-accent-primary/30 to-accent-secondary/30 text-accent-primary border border-accent-primary/30 shadow-lg'
                : 'bg-surface-secondary/50 text-text-secondary hover:bg-surface-secondary/80 border border-border-primary/30'
            }`}
          >
            Active Flows
          </button>
          <button
            onClick={() => setSelectedTab('templates')}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
              selectedTab === 'templates'
                ? 'bg-gradient-to-r from-accent-primary/30 to-accent-secondary/30 text-accent-primary border border-accent-primary/30 shadow-lg'
                : 'bg-surface-secondary/50 text-text-secondary hover:bg-surface-secondary/80 border border-border-primary/30'
            }`}
          >
            Templates
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Flow List */}
        <div className="space-y-3">
          {flows.map((flow) => (
            <div
              key={flow.id}
              onClick={() => setActiveFlow(flow.id)}
              className={`group cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
                activeFlow === flow.id
                  ? 'bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 border-accent-primary/30 shadow-lg'
                  : 'bg-surface-secondary/30 border-border-primary/30 hover:border-accent-primary/30 hover:bg-surface-secondary/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-text-primary">{flow.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  flow.status === 'Active' 
                    ? 'bg-success/20 text-success border border-success/30' 
                    : flow.status === 'Paused'
                    ? 'bg-warning/20 text-warning border border-warning/30'
                    : 'bg-surface-secondary/50 text-text-muted border border-border-primary/30'
                }`}>
                  {flow.status}
                </span>
              </div>
              <p className="text-sm text-text-muted mb-3">{flow.trigger}</p>
              <div className="flex items-center gap-2">
                {flow.channels.map((channel) => (
                  <div key={channel} className="p-1 bg-surface-primary/50 rounded-lg">
                    {getChannelIcon(channel)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Flow Details */}
        <div className="space-y-4">
          {selectedFlow && (
            <>
              <div className="bg-surface-secondary/30 p-4 rounded-xl border border-border-primary/30">
                <h3 className="font-semibold text-text-primary mb-2">{selectedFlow.name}</h3>
                <p className="text-sm text-text-muted mb-3">{selectedFlow.trigger}</p>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success-muted">{selectedFlow.success_rate}%</div>
                    <div className="text-xs text-text-muted">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent-primary">{selectedFlow.recovered_revenue}</div>
                    <div className="text-xs text-text-muted">Revenue Recovered</div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-secondary/30 p-4 rounded-xl border border-border-primary/30">
                <h4 className="font-semibold text-text-primary mb-3">Flow Steps</h4>
                <div className="space-y-3">
                  {selectedFlow.steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-surface-primary/50 rounded-lg border border-border-primary/30">
                      <div className="w-8 h-8 bg-accent-primary/20 rounded-full flex items-center justify-center text-accent-primary font-semibold text-sm">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-text-primary">{step.type}</div>
                        <div className="text-sm text-text-muted">{step.subject}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-text-primary">{step.delay}</div>
                        <div className="text-xs text-text-muted">Delay</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};