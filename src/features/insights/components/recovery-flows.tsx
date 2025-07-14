import React, { useState } from 'react';
import { useGetInsightsData } from '@/features/insights/api/insights';

export const RecoveryFlows = () => {
  const { data: insights, isLoading, error } = useGetInsightsData();
  const [selectedTab, setSelectedTab] = useState<'active' | 'templates'>('active');
  const [activeFlow, setActiveFlow] = useState<string>('payment-failed');

  if (isLoading) {
    return (
      <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-6 bg-surface-secondary rounded w-40"></div>
            <div className="h-4 bg-surface-secondary rounded w-64"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-surface-secondary rounded"></div>
            <div className="h-8 w-24 bg-surface-secondary rounded"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-24 bg-surface-secondary rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="h-16 bg-surface-secondary rounded"></div>
            <div className="h-32 bg-surface-secondary rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg">
        <div className="text-center py-8">
          <div className="text-error-muted mb-2">Failed to load recovery flows</div>
          <div className="text-text-muted text-sm">Please try refreshing the page</div>
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
    <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-1">Recovery Flows</h2>
          <p className="text-sm text-text-muted">Automated campaigns to re-engage and recover customers</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTab('active')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              selectedTab === 'active'
                ? 'bg-gradient-to-r from-accent-primary/30 to-accent-secondary/30 text-accent-primary border border-accent-primary/30'
                : 'bg-surface-secondary/50 text-text-secondary hover:bg-surface-secondary/70 border border-border-primary/50'
            }`}
          >
            Active Flows
          </button>
          <button
            onClick={() => setSelectedTab('templates')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              selectedTab === 'templates'
                ? 'bg-gradient-to-r from-accent-primary/30 to-accent-secondary/30 text-accent-primary border border-accent-primary/30'
                : 'bg-surface-secondary/50 text-text-secondary hover:bg-surface-secondary/70 border border-border-primary/50'
            }`}
          >
            Templates
          </button>
        </div>
      </div>

      {selectedTab === 'active' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Flow List */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-text-primary">Active Campaigns</h3>
            {flows.map((flow) => (
              <div
                key={flow.id}
                onClick={() => setActiveFlow(flow.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  activeFlow === flow.id
                    ? 'bg-accent-primary/20 border-accent-primary/50 text-accent-primary'
                    : 'bg-surface-secondary/30 border-border-primary/50 hover:bg-surface-secondary/50 text-text-primary'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{flow.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    flow.status === 'Active' ? 'bg-success/20 text-success-muted' : 'bg-surface-secondary/50 text-text-muted'
                  }`}>
                    {flow.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-text-muted">Success: {flow.success_rate}%</span>
                  <span className="text-success-muted font-semibold">{flow.recovered_revenue}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {flow.channels.map((channel, index) => (
                    <div key={index} className="flex items-center gap-1">
                      {getChannelIcon(channel)}
                      <span className="text-xs text-text-muted">{channel}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Flow Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">{selectedFlow.name}</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-accent-primary/20 text-accent-primary rounded-lg hover:bg-accent-primary/30 transition-colors text-sm border border-accent-primary/30">
                  Edit Flow
                </button>
                <button className="px-3 py-1 bg-surface-secondary/50 text-text-secondary rounded-lg hover:bg-surface-secondary/70 transition-colors text-sm border border-border-primary/50">
                  Analytics
                </button>
              </div>
            </div>

            <div className="bg-surface-secondary/30 p-4 rounded-lg border border-border-primary/50">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-text-muted text-sm">Trigger</div>
                  <div className="text-text-primary font-medium">{selectedFlow.trigger}</div>
                </div>
                <div>
                  <div className="text-text-muted text-sm">Type</div>
                  <div className="text-text-primary font-medium">{selectedFlow.type}</div>
                </div>
                <div>
                  <div className="text-text-muted text-sm">Success Rate</div>
                  <div className="text-success-muted font-semibold">{selectedFlow.success_rate}%</div>
                </div>
                <div>
                  <div className="text-text-muted text-sm">Revenue Recovered</div>
                  <div className="text-success-muted font-semibold">{selectedFlow.recovered_revenue}</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-text-primary font-medium">Flow Steps</h4>
                {selectedFlow.steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-surface-secondary/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-accent-primary/30 rounded-full flex items-center justify-center text-accent-primary font-bold text-sm">
                        {step.step}
                      </div>
                      {getChannelIcon(step.type)}
                    </div>
                    <div className="flex-1">
                      <div className="text-text-primary font-medium">{step.subject}</div>
                      <div className="text-text-muted text-sm">Delay: {step.delay}</div>
                    </div>
                    <div className="text-right">
                      {step.open_rate && (
                        <div className="text-accent-primary text-sm">{step.open_rate}% open</div>
                      )}
                      {step.response_rate && (
                        <div className="text-success-muted text-sm">{step.response_rate}% response</div>
                      )}
                      {step.click_rate && (
                        <div className="text-accent-secondary text-sm">{step.click_rate}% click</div>
                      )}
                      {step.conversion && (
                        <div className="text-success-muted text-sm">{step.conversion}% convert</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Templates View */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary">Flow Templates</h3>
            <button className="px-4 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-text-primary rounded-lg hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm">
              Create Custom Flow
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template, index) => (
              <div key={index} className="bg-surface-secondary/30 p-4 rounded-lg border border-border-primary/50 hover:border-border-primary/70 transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-text-primary font-semibold">{template.name}</h4>
                  <span className="text-success-muted font-semibold text-sm">{template.success_rate}% success</span>
                </div>
                <div className="text-text-muted text-sm mb-4">
                  Trigger: {template.trigger}
                </div>
                <button className="w-full px-3 py-2 bg-accent-primary/20 text-accent-primary rounded-lg hover:bg-accent-primary/30 transition-colors text-sm border border-accent-primary/30">
                  Use Template
                </button>
              </div>
            ))}
          </div>

          {/* AI Flow Builder */}
          <div className="bg-gradient-to-r from-accent-secondary/20 to-accent-primary/20 p-6 rounded-xl border border-accent-secondary/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent-secondary/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">AI Flow Builder</h3>
                <p className="text-accent-secondary text-sm">Let AI create personalized recovery flows based on your data</p>
              </div>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-accent-secondary to-accent-primary text-text-primary rounded-lg hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium">
              Generate AI Flow
            </button>
          </div>
        </div>
      )}
    </div>
  );
};