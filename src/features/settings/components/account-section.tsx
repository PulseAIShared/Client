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

export const AccountSection = () => {
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
              <Button variant="outline" size="sm" className="border-border-primary/50 hover:border-accent-primary/50">
                Change Avatar
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              registration={{ name: 'firstName'}}
            />
            <Input
              label="Last Name"
              registration={{ name: 'lastName'}}
            />
            <Input
              label="Email"
              type="email"
              defaultValue="john.doe@company.com"
              registration={{ name: 'email' }}
            />
            <Input
              label="Company"
              registration={{ name: 'company' }}
            />
          </div>
          
          <div className="mt-6 flex gap-3">
            <Button>Save Changes</Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
