// src/app/routes/app/settings/settings.tsx
import React, { useState } from 'react';
import { ContentLayout } from '@/components/layouts';
import { 
  IntegrationsSection,
  AccountSection,
  NotificationSettings,
  BillingSection,
  SecuritySection 
} from '@/features/settings/components';
import { useAuthorization, CompanyAuthorization } from '@/lib/authorization';
import { CompanyRole } from '@/types/api';

type SettingsTab = 'integrations' | 'account' | 'notifications' | 'billing' | 'security';

export const SettingsRoute = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('integrations');
  const { checkCompanyPolicy } = useAuthorization();

  const allTabs = [
    { 
      id: 'integrations' as const, 
      label: 'Integrations', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      requiredPolicy: 'integrations:read' as const
    },
    { 
      id: 'account' as const, 
      label: 'Account', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      requiredPolicy: 'settings:read' as const
    },
    { 
      id: 'notifications' as const, 
      label: 'Notifications', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5v3a6 6 0 10-12 0v3l-5 5h5m7 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      requiredPolicy: 'settings:read' as const
    },
    { 
      id: 'billing' as const, 
      label: 'Billing', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      requiredPolicy: 'company:billing' as const
    },
    { 
      id: 'security' as const, 
      label: 'Security', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      requiredPolicy: 'company:manage' as const
    }
  ];

  // Filter tabs based on user permissions
  const tabs = allTabs.filter(tab => checkCompanyPolicy(tab.requiredPolicy));

  // Ensure activeTab is one the user can access
  React.useEffect(() => {
    if (tabs.length > 0 && !tabs.find(tab => tab.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'integrations':
        return <IntegrationsSection />;
      case 'account':
        return <AccountSection />;
      case 'notifications':
        return <NotificationSettings />;
      case 'billing':
        return <BillingSection />;
      case 'security':
        return <SecuritySection />;
      default:
        return <IntegrationsSection />;
    }
  };

  return (
    <ContentLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-2xl blur-3xl"></div>
          
          <div className="relative bg-surface-secondary/50 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-border-primary/50 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-accent-secondary/20 backdrop-blur-sm px-4 py-2 rounded-full border border-accent-secondary/30 mb-4">
                  <div className="w-2 h-2 bg-success-muted rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-accent-secondary">Configuration</span>
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary mb-2">
                  Settings
                </h1>
                <p className="text-text-secondary">
                  Configure your PulseLTV workspace and integrations
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <button className="px-3 sm:px-4 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-text-primary rounded-lg hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-xs sm:text-sm">
                  Save Changes
                </button>
                <button className="px-3 sm:px-4 py-2 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-secondary/70 transition-colors font-medium text-xs sm:text-sm border border-border-primary/50">
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Navigation */}
        <div className="bg-surface-secondary/50 backdrop-blur-lg rounded-2xl border border-border-primary/50 shadow-lg overflow-hidden">
          <div className="flex flex-wrap border-b border-border-primary/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 font-medium text-xs sm:text-sm transition-all duration-200 border-b-2 ${
                  activeTab === tab.id
                    ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-secondary/30'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Content Area */}
          <div className="p-4 sm:p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};