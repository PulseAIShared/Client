// src/features/settings/components/billing-section.tsx
import React from 'react';
import { Button } from '@/components/ui/button';

export const BillingSection = () => {
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
            <Button variant="outline">Upgrade Plan</Button>
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
              <div className="text-sm text-text-muted">Campaigns Sent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-secondary">89%</div>
              <div className="text-sm text-text-muted">API Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};