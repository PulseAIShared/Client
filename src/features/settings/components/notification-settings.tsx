// src/features/settings/components/notification-settings.tsx
import React from 'react';
import { Switch } from '@/components/ui/form';

export const NotificationSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Email Notifications</h3>
        <div className="bg-slate-700/30 p-6 rounded-xl border border-slate-600/50 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Churn Risk Alerts</div>
              <div className="text-sm text-slate-400">Get notified when customers enter high-risk status</div>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Weekly Reports</div>
              <div className="text-sm text-slate-400">Receive weekly churn prediction summaries</div>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">Integration Status</div>
              <div className="text-sm text-slate-400">Alerts about integration sync issues</div>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
};