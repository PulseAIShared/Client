// src/features/settings/components/billing-section.tsx
import React from 'react';
import { Button } from '@/components/ui/button';

export const BillingSection = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Current Plan</h3>
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 rounded-xl border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-white">Pro Plan</h4>
              <p className="text-slate-300">$99/month • Up to 10,000 customers</p>
            </div>
            <Button variant="outline">Upgrade Plan</Button>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Usage This Month</h3>
        <div className="bg-slate-700/30 p-6 rounded-xl border border-slate-600/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">7,432</div>
              <div className="text-sm text-slate-400">Customers Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">124</div>
              <div className="text-sm text-slate-400">Campaigns Sent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">89%</div>
              <div className="text-sm text-slate-400">API Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};