// src/features/settings/components/index.ts
export * from './integrations-section';
export * from './account-section';
export * from './notification-settings';
export * from './billing-section';
export * from './security-section';

// src/features/settings/components/account-section.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form';
import { useAuthorization, CompanyAuthorization } from '@/lib/authorization';

export const AccountSection = () => {
  const { checkCompanyPolicy } = useAuthorization();
  const canEdit = checkCompanyPolicy('settings:write');
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-text-primary mb-4">Profile Information</h3>
        <div className="bg-surface-secondary/30 p-6 rounded-xl border border-border-primary/50">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full flex items-center justify-center text-text-primary text-2xl font-bold">
              JD
            </div>
            <div>
              <CompanyAuthorization policyCheck={canEdit}>
                <Button variant="outline" size="sm" className="border-border-primary/50 hover:border-accent-primary/50">
                  Change Avatar
                </Button>
              </CompanyAuthorization>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              registration={{ name: 'firstName'}}
              disabled={!canEdit}
            />
            <Input
              label="Last Name"
              registration={{ name: 'lastName'}}
              disabled={!canEdit}
            />
            <Input
              label="Email"
              type="email"
              defaultValue="john.doe@company.com"
              registration={{ name: 'email' }}
              disabled={!canEdit}
            />
            <Input
              label="Company"
              registration={{ name: 'company' }}
              disabled={!canEdit}
            />
          </div>
          
          <CompanyAuthorization 
            policyCheck={canEdit}
            forbiddenFallback={
              <div className="mt-6 bg-info/20 p-4 rounded-xl border border-info/30">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-info-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-info-muted font-medium">You have read-only access to account settings</span>
                </div>
              </div>
            }
          >
            <div className="mt-6 flex gap-3">
              <Button>Save Changes</Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </CompanyAuthorization>
        </div>
      </div>
    </div>
  );
};
