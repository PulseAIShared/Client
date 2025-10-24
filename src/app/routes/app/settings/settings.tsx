// src/app/routes/app/settings/settings.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ContentLayout } from '@/components/layouts';
import { 
  AccountSection,
  NotificationSettings,
  BillingSection,
  SecuritySection 
} from '@/features/settings/components';
import { useAuthorization } from '@/lib/authorization';

type SettingsTab = 'account' | 'notifications' | 'billing' | 'security';

export const SettingsRoute = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { checkCompanyPolicy } = useAuthorization();

  const allTabs = [
    { 
      id: 'account' as const, 
      label: 'Account', 
      description: 'Manage your profile and preferences',
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
      description: 'Configure your notification preferences',
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
      description: 'Manage your subscription and billing',
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
      description: 'Security settings and access control',
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

  const initialTabParam = (searchParams.get('tab') as SettingsTab | null) || undefined;
  const initialTab = useMemo(() => {
    if (initialTabParam && tabs.some(tab => tab.id === initialTabParam)) {
      return initialTabParam;
    }
    return tabs.length > 0 ? tabs[0].id : 'account';
  }, [initialTabParam, tabs]);

  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  // Ensure activeTab is one the user can access
  // Keep active tab in sync with URL param (only when param changes via navigation)
  useEffect(() => {
    const param = (searchParams.get('tab') as SettingsTab | null) || undefined;
    if (param && tabs.some(t => t.id === param) && param !== activeTab) {
      setActiveTab(param);
    }
  }, [searchParams, tabs]);

  // Ensure activeTab is permitted; fallback to first available
  useEffect(() => {
    if (tabs.length > 0 && !tabs.some(t => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountSection />;
      case 'notifications':
        return <NotificationSettings />;
      case 'billing':
        return <BillingSection />;
      case 'security':
        return <SecuritySection />;
      default:
        return <AccountSection />;
    }
  };

  return (
    <ContentLayout>
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        {/* Enhanced Header */}
        <div className="relative group">
          {/* Enhanced background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 via-accent-secondary/5 to-accent-primary/5 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
          
          <div className="relative bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
              <div className="flex-1 space-y-3">
 
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary mb-2">
                  Settings
                </h1>
                <p className="text-text-secondary text-base sm:text-lg lg:text-xl max-w-2xl">
                  Configure your PulseLTV workspace preferences, billing, and security controls.
                </p>
              </div>
              
              {/* Enhanced Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-secondary to-accent-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  <svg className="relative w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="relative">Save Changes</span>
                </button>
                <button className="group px-6 sm:px-8 py-3 sm:py-4 bg-surface-secondary/50 text-text-primary rounded-xl hover:bg-surface-primary/50 transition-all duration-200 font-medium text-sm sm:text-base border border-border-primary/30 hover:border-border-secondary hover:shadow-md flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Settings Navigation */}
        <div className="bg-surface-primary/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl overflow-hidden">
          {/* Enhanced Tab Navigation */}
          <div className="flex flex-wrap border-b border-border-primary/30 bg-surface-secondary/20">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchParams({ tab: tab.id }); }}
                className={`group relative flex flex-col sm:flex-row items-center gap-2 sm:gap-3 px-4 sm:px-6 py-4 sm:py-6 font-medium text-sm sm:text-base transition-all duration-300 border-b-2 min-w-[120px] sm:min-w-[140px] ${
                  activeTab === tab.id
                    ? 'border-accent-primary bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 text-accent-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-secondary/30'
                }`}
              >
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 text-accent-primary'
                    : 'bg-surface-secondary/50 text-text-muted group-hover:bg-surface-secondary/80 group-hover:text-text-primary'
                }`}>
                  {tab.icon}
                </div>
                <div className="text-center sm:text-left">
                  <div className="font-semibold">{tab.label}</div>
                  <div className={`text-xs mt-1 transition-colors duration-300 ${
                    activeTab === tab.id ? 'text-accent-primary/70' : 'text-text-muted'
                  }`}>
                    {tab.description}
                  </div>
                </div>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-primary to-accent-secondary"></div>
                )}
              </button>
            ))}
          </div>
          
          {/* Enhanced Content Area */}
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="relative">
              {/* Content background with subtle gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-surface-secondary/20 to-transparent rounded-2xl"></div>
              <div className="relative">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};
