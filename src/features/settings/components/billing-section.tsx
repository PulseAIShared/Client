// src/features/settings/components/billing-section.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuthorization, CompanyAuthorization } from '@/lib/authorization';

export const BillingSection = () => {
  const { checkCompanyPolicy } = useAuthorization();
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-text-primary mb-4">Current Plan</h3>
        <div className="bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 p-6 rounded-xl border border-accent-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-text-primary">Pro Plan</h4>
              <p className="text-text-secondary">$99/month • Up to 10,000 customers</p>
            </div>
            <CompanyAuthorization policyCheck={checkCompanyPolicy('company:billing')}>
              <Button variant="outline">Upgrade Plan</Button>
            </CompanyAuthorization>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-text-primary mb-4">Usage This Month</h3>
        <div className="bg-surface-secondary/30 p-6 rounded-xl border border-border-primary/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-primary">7,432</div>
              <div className="text-sm text-text-muted">Customers Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success-muted">124</div>
              <div className="text-sm text-text-muted">Playbook Runs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-secondary">89%</div>
              <div className="text-sm text-text-muted">API Uptime</div>
            </div>
          </div>
        </div>
      </div>

      <CompanyAuthorization 
        policyCheck={checkCompanyPolicy('company:billing')} 
        forbiddenFallback={
          <div className="bg-warning/20 p-4 rounded-xl border border-warning/30">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-warning-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-warning-muted font-medium">Only Company Owners can manage billing settings</span>
            </div>
          </div>
        }
      >
        <div>
          <h3 className="text-xl font-semibold text-text-primary mb-4">Billing Management</h3>
          <div className="bg-surface-secondary/30 p-6 rounded-xl border border-border-primary/50">
            <div className="flex flex-col gap-4">
              <Button variant="outline" className="w-full justify-start">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Update Payment Method
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Invoices
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Billing History
              </Button>
            </div>
          </div>
        </div>
      </CompanyAuthorization>
    </div>
  );
};
