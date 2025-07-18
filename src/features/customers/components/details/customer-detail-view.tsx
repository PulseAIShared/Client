// src/features/customers/components/customer-detail-view.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { calculateTenure, getHealthScoreColor } from '@/utils/customer-helpers';
import { CustomerOverviewTab } from './overview-tab';
import { CustomerDetailData } from '@/types/api';
import { CustomerAnalyticsTab } from './analytics-tab';
import { CustomerDataSourcesTab } from './data-sources-tab';
import { useAuthorization, CompanyAuthorization } from '@/lib/authorization';


interface CustomerDetailViewProps {
  customer: CustomerDetailData;
}


export const CustomerDetailView: React.FC<CustomerDetailViewProps> = ({ customer }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'data-sources' | 'analytics'>('overview');
  const { checkCompanyPolicy } = useAuthorization();
  
  // Check if user has write permissions for customers
  const canEditCustomers = checkCompanyPolicy('customers:write');
  const canReadCustomers = checkCompanyPolicy('customers:read');

  const customerName = `${customer.firstName} ${customer.lastName}`.trim();
  const tenure = calculateTenure(customer.subscriptionStartDate);
  console.log(customer);
  const tabs = [
    { 
      id: 'overview' as const, 
      label: 'Overview', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      id: 'data-sources' as const, 
      label: 'Data Sources', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      )
    },
    { 
      id: 'analytics' as const, 
      label: 'Analytics', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gradient-from to-gradient-to rounded-2xl blur-3xl"></div>
        
        <div className="relative bg-surface-primary backdrop-blur-lg p-6 rounded-2xl border border-border-primary shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/app/customers')}
                className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="w-16 h-16 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full flex items-center justify-center text-text-primary font-bold text-xl">
                {customerName.split(' ').map(n => n[0]).join('')}
              </div>
              
              <div>

                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary">
                  {customerName}
                </h1>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-text-secondary">{customer.email}</p>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-text-muted">Data Quality:</span>
                    <span className="text-sm font-medium text-accent-primary">
                      {customer.quickMetrics?.dataCompletenessScore ? Math.round(customer.quickMetrics.dataCompletenessScore) : 'N/A'}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <CompanyAuthorization
                policyCheck={canEditCustomers}
                forbiddenFallback={null}
              >
                <Button 
                  variant="outline"
                  className="border-border-primary hover:border-accent-primary/50 hover:text-accent-primary"
                >
                  Send Message
                </Button>
                <Button 
                  className="bg-gradient-to-r from-accent-primary to-accent-secondary hover:from-accent-primary/80 hover:to-accent-secondary/80"
                >
                  Launch Campaign
                </Button>
              </CompanyAuthorization>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-surface-primary backdrop-blur-lg rounded-2xl border border-border-primary shadow-lg overflow-hidden">
        <div className="flex flex-wrap border-b border-border-primary">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-4 font-medium text-sm transition-all duration-200 border-b-2 ${
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
        
        {/* Content Area - We'll add components for each tab */}
        <div className="p-6">
          {activeTab === 'overview' && <CustomerOverviewTab customer={customer} canEditCustomers={canEditCustomers} />}
          {activeTab === 'data-sources' && <CustomerDataSourcesTab customer={customer} canEditCustomers={canEditCustomers} />}
          {activeTab === 'analytics' && <CustomerAnalyticsTab customer={customer} canEditCustomers={canEditCustomers} />}
        </div>
      </div>
    </div>
  );
};