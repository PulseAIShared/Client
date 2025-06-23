// src/features/settings/components/notification-settings.tsx
import React from 'react';
import { Switch } from '@/components/ui/form';

export const NotificationSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-text-primary mb-4">Email Notifications</h3>
        <div className="bg-surface-secondary/30 p-6 rounded-xl border border-border-primary/50 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-text-primary font-medium">Churn Risk Alerts</div>
              <div className="text-sm text-text-muted">Get notified when customers enter high-risk status</div>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-text-primary font-medium">Weekly Reports</div>
              <div className="text-sm text-text-muted">Receive weekly churn prediction summaries</div>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-text-primary font-medium">Integration Status</div>
              <div className="text-sm text-text-muted">Alerts about integration sync issues</div>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
};