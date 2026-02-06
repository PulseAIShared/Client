import React, { useState } from 'react';
import { useGetRecoveryData } from '@/features/recovery/api/recovery';
import { useModal } from '@/app/modal-provider';
import { CreateFlowModal } from '@/features/recovery/components';

export const RecoveryFlows = () => {
  const { data: insights, isLoading, error } = useGetRecoveryData();
  const [selectedTab, setSelectedTab] = useState<'active' | 'templates'>('active');
  const [activeFlow, setActiveFlow] = useState<string>('payment-failed');
  const { openModal, closeModal } = useModal();

  const handleCreateFlow = (template?: any) => {
    openModal(
      <CreateFlowModal
        onClose={closeModal}
        template={template}
      />
    );
  };

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

  const { flows, templates } = insights.flows;
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">Recovery Playbooks</h2>
          <p className="text-sm sm:text-base text-text-muted">Automated playbooks to re-engage and recover customers</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTab('active')}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                selectedTab === 'active'
                  ? 'bg-gradient-to-r from-accent-primary/30 to-accent-secondary/30 text-accent-primary border border-accent-primary/30 shadow-lg'
                  : 'bg-surface-secondary/50 text-text-secondary hover:bg-surface-secondary/80 border border-border-primary/30'
              }`}
            >
              Active Playbooks
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
          <button 
            onClick={() => handleCreateFlow()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Flow
          </button>
        </div>
      </div>

      {selectedTab === 'active' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enhanced Flow List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Active Flows ({flows.length})</h3>
              <div className="text-sm text-text-muted">Total recovered: {flows.reduce((sum, f) => sum + parseFloat(f.recoveredRevenue.replace(/[$,]/g, '')), 0).toLocaleString('en-US', {style: 'currency', currency: 'USD'})}</div>
            </div>
            {flows.map((flow) => (
              <div
                key={flow.id}
                onClick={() => setActiveFlow(flow.id)}
                className={`group cursor-pointer p-5 rounded-xl border transition-all duration-200 ${
                  activeFlow === flow.id
                    ? 'bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 border-accent-primary/30 shadow-lg transform scale-[1.02]'
                    : 'bg-surface-secondary/30 border-border-primary/30 hover:border-accent-primary/30 hover:bg-surface-secondary/50 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary mb-1">{flow.name}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      flow.status === 'Active' 
                        ? 'bg-success/20 text-success border border-success/30' 
                        : flow.status === 'Paused'
                        ? 'bg-warning/20 text-warning border border-warning/30'
                        : 'bg-surface-secondary/50 text-text-muted border border-border-primary/30'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-1 ${
                        flow.status === 'Active' ? 'bg-success animate-pulse' : 'bg-warning'
                      }`} />
                      {flow.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-success">{flow.successRate}%</div>
                    <div className="text-xs text-text-muted">success</div>
                  </div>
                </div>
                
                <p className="text-sm text-text-muted mb-4">{flow.trigger}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {flow.channels.map((channel) => (
                      <div key={channel} className="flex items-center gap-1 p-2 bg-surface-primary/50 rounded-lg">
                        {getChannelIcon(channel)}
                        <span className="text-xs text-text-muted">{channel}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm font-semibold text-accent-primary">
                    {flow.recoveredRevenue}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Flow Details */}
          <div className="space-y-4">
            {selectedFlow && (
              <>
                <div className="bg-surface-secondary/30 p-5 rounded-xl border border-border-primary/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-text-primary text-lg">{selectedFlow.name}</h3>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary/50 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary/50 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-text-muted mb-4">{selectedFlow.trigger}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-surface-primary/50 rounded-lg">
                      <div className="text-2xl font-bold text-success">{selectedFlow.successRate}%</div>
                      <div className="text-xs text-text-muted">Success Rate</div>
                    </div>
                    <div className="text-center p-3 bg-surface-primary/50 rounded-lg">
                      <div className="text-2xl font-bold text-accent-primary">{selectedFlow.recoveredRevenue}</div>
                      <div className="text-xs text-text-muted">Revenue Recovered</div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-secondary/30 p-5 rounded-xl border border-border-primary/30">
                  <h4 className="font-semibold text-text-primary mb-4">Flow Steps ({selectedFlow.steps.length})</h4>
                  <div className="space-y-3">
                    {selectedFlow.steps.map((step, index) => (
                      <div key={index} className="relative">
                        {/* Connector line */}
                        {index < selectedFlow.steps.length - 1 && (
                          <div className="absolute left-4 top-12 w-0.5 h-8 bg-gradient-to-b from-accent-primary/30 to-accent-secondary/30"></div>
                        )}
                        
                        <div className="flex items-center gap-4 p-4 bg-surface-primary/50 rounded-lg border border-border-primary/30 hover:border-accent-primary/30 transition-colors">
                          <div className="w-8 h-8 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 rounded-full flex items-center justify-center text-accent-primary font-bold text-sm border border-accent-primary/30">
                            {step.step}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-medium text-text-primary capitalize">{step.type}</div>
                              {getChannelIcon(step.type)}
                            </div>
                            <div className="text-sm text-text-muted">{step.subject}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-text-primary">{step.delay}</div>
                            <div className="text-xs text-text-muted">delay</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="mb-4 md:col-span-2 lg:col-span-3">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Flow Templates</h3>
            <p className="text-sm text-text-muted">Pre-built recovery flows you can customize and activate</p>
          </div>
          {templates.map((template, index) => (
            <div key={index} className="p-5 bg-surface-secondary/30 rounded-xl border border-border-primary/30 hover:border-accent-primary/30 hover:bg-surface-secondary/50 transition-all duration-200 group cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-text-primary group-hover:text-accent-primary transition-colors">{template.name}</h4>
                <span className="text-sm font-semibold text-success">{template.successRate}%</span>
              </div>
              <p className="text-sm text-text-muted mb-4">{template.trigger}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Template</span>
                <button 
                  onClick={() => handleCreateFlow(template)}
                  className="flex items-center gap-1 px-3 py-1 bg-accent-primary/10 text-accent-primary rounded-lg hover:bg-accent-primary/20 transition-colors text-sm font-medium"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}


    </div>
  );
};
