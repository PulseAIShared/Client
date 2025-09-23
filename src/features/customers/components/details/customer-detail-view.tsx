// src/features/customers/components/details/customer-detail-view.tsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CompanyAuthorization, useAuthorization } from '@/lib/authorization';
import { CustomerDetailData, formatCurrency } from '@/types/api';
import { calculateTenure, formatDate, getRiskColor } from '@/utils/customer-helpers';
import { CustomerOverviewTab } from './overview-tab';
import { CustomerChurnTab } from './churn-tab';
import { CustomerAnalyticsTab } from './analytics-tab';
import { CustomerActivityTab } from './activity-tab';
import { CustomerDataSourcesTab } from './data-sources-tab';

type CustomerDetailTab = 'overview' | 'churn' | 'analytics' | 'activity' | 'data-sources';

interface CustomerDetailViewProps {
  customer: CustomerDetailData;
}

const statusPillBase = 'px-3 py-1 text-sm font-semibold rounded-full border backdrop-blur shadow-sm';

const metricToneClasses: Record<string, string> = {
  risk: 'from-error/10 via-error/5 to-error/0 text-error border-error/30',
  value: 'from-success/10 via-success/5 to-success/0 text-success border-success/30',
  status: 'from-accent-secondary/10 via-accent-secondary/5 to-accent-secondary/0 text-accent-secondary border-accent-secondary/30',
  engagement: 'from-accent-primary/10 via-accent-primary/5 to-accent-primary/0 text-accent-primary border-accent-primary/30',
};

export const CustomerDetailView: React.FC<CustomerDetailViewProps> = ({ customer }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CustomerDetailTab>('overview');
  const { checkCompanyPolicy } = useAuthorization();

  const canEditCustomers = checkCompanyPolicy('customers:write');

  const fullName = (customer.display?.fullName ?? `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim()) || customer.email;
  const initials = customer.display?.initials ?? fullName.split(/\s+/).filter(Boolean).map((name) => name[0]).join('').slice(0, 2).toUpperCase();
  const dataCompleteness = customer.qualityMetrics?.completenessScore ?? customer.quickMetrics?.dataCompletenessScore ?? null;
  const riskClasses = getRiskColor(customer.churnRiskScore ?? 0);
  const tenureDisplay = customer.display?.tenureDisplay ?? customer.tenureDisplay ?? `${calculateTenure(customer.subscriptionStartDate)} months`;
  const currency = customer.currency ?? 'USD';



  const statusPills = [
    customer.riskStatus || customer.display?.riskLevelName
      ? {
          id: 'risk',
          label: `Risk: ${customer.riskStatus ?? customer.display?.riskLevelName}`,
          className: `${statusPillBase} ${riskClasses}`,
        }
      : null,
    customer.paymentStatusDisplay || customer.display?.paymentStatusName
      ? {
          id: 'payment',
          label: `Payment: ${customer.paymentStatusDisplay ?? customer.display?.paymentStatusName}`,
          className: `${statusPillBase} text-success border-success/30 bg-success/10`,
        }
      : null,
    customer.activityStatus
      ? {
          id: 'activity',
          label: `Activity: ${customer.activityStatus}`,
          className: `${statusPillBase} text-info border-info/30 bg-info/10`,
        }
      : null,
    customer.needsAttention
      ? {
          id: 'attention',
          label: 'Needs Attention',
          className: `${statusPillBase} text-error border-error/30 bg-error/10`,
        }
      : null,
    tenureDisplay
      ? {
          id: 'tenure',
          label: `Tenure: ${tenureDisplay}`,
          className: `${statusPillBase} text-text-secondary border-border-primary/40 bg-surface-secondary/40`,
        }
      : null,
  ].filter((pill): pill is { id: string; label: string; className: string } => Boolean(pill));

  const tabs = [
    {
      id: 'overview' as const,
      label: 'Overview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'churn' as const,
      label: 'Churn Insights',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
        </svg>
      ),
    },
    {
      id: 'analytics' as const,
      label: 'Analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'activity' as const,
      label: 'Activity',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'data-sources' as const,
      label: 'Data Sources',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 via-accent-secondary/10 to-accent-primary/10 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-500"></div>

        <div className="relative bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
            <div className="flex items-start gap-4 sm:gap-6">
              <button
                onClick={() => navigate('/app/customers')}
                className="p-2 sm:p-3 text-text-muted hover:text-text-primary hover:bg-surface-secondary/50 rounded-xl transition-all duration-300 group"
                aria-label="Back to customers"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg">
                  {initials}
                </div>

                <div className="space-y-2">
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary">
                      {fullName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted mt-2">
                      {customer.jobTitle && <span>{customer.jobTitle}</span>}
                      {customer.companyName && (
                        <span className="flex items-center gap-2">
                          <span className="opacity-60">�</span>
                          {customer.companyName}
                        </span>
                      )}
                      {(customer.location || customer.country) && (
                        <span className="flex items-center gap-2">
                          <span className="opacity-60">�</span>
                          {customer.location ?? customer.country}
                        </span>
                      )}
                      {customer.timeZone && (
                        <span className="flex items-center gap-2">
                          <span className="opacity-60">�</span>
                          {customer.timeZone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm text-text-secondary">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0z" />
                      </svg>
                      {customer.email}
                    </span>
                    {customer.phone && (
                      <span className="flex items-center gap-2">
                        <span className="opacity-60">�</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2.28a.75.75 0 01.75.648l.533 3.72a.75.75 0 01-.464.79l-1.71.684a11.05 11.05 0 005.105 5.105l.684-1.71a.75.75 0 01.79-.464l3.72.533a.75.75 0 01.648.75V19a2 2 0 01-2 2h-.5C8.149 21 3 15.851 3 9.5v-.5z" />
                        </svg>
                        {customer.phone}
                      </span>
                    )}
                  </div>

                  {statusPills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {statusPills.map((pill) => (
                        <span key={pill.id} className={pill.className}>
                          {pill.label}
                        </span>
                      ))}
                    </div>
                  )}

                  {dataCompleteness != null && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary pt-2">
                      <span>Data completeness</span>
                      <span className="px-2 py-1 rounded-full bg-accent-primary/10 text-accent-primary font-semibold">
                        {Math.round(dataCompleteness)}%
                      </span>
                      {customer.lastSyncedAt && <span className="opacity-70">� Synced {formatDate(customer.lastSyncedAt)}</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <CompanyAuthorization policyCheck={canEditCustomers} forbiddenFallback={null}>
                <Button
                  variant="outline"
                  className="border-border-primary/30 hover:border-accent-primary/50 hover:text-accent-primary bg-surface-secondary/30 hover:bg-surface-secondary/50 transition-all duration-300"
                >
                  Send Message
                </Button>
                <Button className="bg-gradient-to-r from-accent-primary to-accent-secondary hover:from-accent-primary/80 hover:to-accent-secondary/80 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
                  Launch Campaign
                </Button>
              </CompanyAuthorization>
            </div>
          </div>


        </div>
      </div>

      <div className="bg-surface-primary/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
        <div className="flex flex-wrap border-b border-border-primary/30">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-4 font-semibold text-sm transition-all duration-300 border-b-2 ${
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

        <div className="p-6 sm:p-8">
          {activeTab === 'overview' && <CustomerOverviewTab customer={customer} canEditCustomers={canEditCustomers} />}
          {activeTab === 'churn' && <CustomerChurnTab customer={customer} canEditCustomers={canEditCustomers} />}
          {activeTab === 'analytics' && <CustomerAnalyticsTab customer={customer} canEditCustomers={canEditCustomers} />}
          {activeTab === 'activity' && <CustomerActivityTab customer={customer} canEditCustomers={canEditCustomers} />}
          {activeTab === 'data-sources' && <CustomerDataSourcesTab customer={customer} canEditCustomers={canEditCustomers} />}
        </div>
      </div>
    </div>
  );
};

