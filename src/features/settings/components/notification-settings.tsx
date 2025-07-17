// src/features/settings/components/notification-settings.tsx
import React from 'react';
import { Switch } from '@/components/ui/form';
import { useAuthorization, CompanyAuthorization } from '@/lib/authorization';

export const NotificationSettings = () => {
  const { checkCompanyPolicy } = useAuthorization();
  const canEdit = checkCompanyPolicy('settings:write');
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-text-primary mb-4">Personal Notifications</h3>
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

      <CompanyAuthorization 
        policyCheck={canEdit}
        forbiddenFallback={
          <div className="bg-info/20 p-4 rounded-xl border border-info/30">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-info-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-info-muted font-medium">You need Staff or Owner role to manage company notification settings</span>
            </div>
          </div>
        }
      >
        <div>
          <h3 className="text-xl font-semibold text-text-primary mb-4">Company Notification Settings</h3>
          <div className="bg-surface-secondary/30 p-6 rounded-xl border border-border-primary/50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-text-primary font-medium">Default Notification Preferences</div>
                <div className="text-sm text-text-muted">Set default notification preferences for new team members</div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-text-primary font-medium">Slack Integration</div>
                <div className="text-sm text-text-muted">Send notifications to Slack channels</div>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-text-primary font-medium">Critical Alert Escalation</div>
                <div className="text-sm text-text-muted">Automatically escalate critical alerts to owners</div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-text-primary font-medium">Digest Frequency</div>
                <div className="text-sm text-text-muted">How often to send summary emails</div>
              </div>
              <select className="bg-surface-secondary/50 border border-border-primary/50 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </div>
      </CompanyAuthorization>
    </div>
  );
};