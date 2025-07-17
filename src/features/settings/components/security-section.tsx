// src/features/settings/components/security-section.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form';
import { useAuthorization, CompanyAuthorization } from '@/lib/authorization';

export const SecuritySection = () => {
  const { checkCompanyPolicy } = useAuthorization();
  const canManageCompany = checkCompanyPolicy('company:manage');
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-text-primary mb-4">Change Password</h3>
        <div className="bg-surface-secondary/30 p-6 rounded-xl border border-border-primary/50">
          <div className="space-y-4 max-w-md">
            <Input
              label="Current Password"
              type="password"
              registration={{ name: 'currentPassword' }}
            />
            <Input
              label="New Password"
              type="password"
              registration={{ name: 'newPassword' }}
            />
            <Input
              label="Confirm New Password"
              type="password"
              registration={{ name: 'confirmPassword' }}
            />
            <Button>Update Password</Button>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-text-primary mb-4">Two-Factor Authentication</h3>
        <div className="bg-surface-secondary/30 p-6 rounded-xl border border-border-primary/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-text-primary font-medium">2FA Status</div>
              <div className="text-sm text-text-muted">Add an extra layer of security to your account</div>
            </div>
            <Button variant="outline">Enable 2FA</Button>
          </div>
        </div>
      </div>

      <CompanyAuthorization 
        policyCheck={canManageCompany}
        forbiddenFallback={
          <div className="bg-warning/20 p-4 rounded-xl border border-warning/30">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-warning-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-warning-muted font-medium">Only Company Owners can manage company security settings</span>
            </div>
          </div>
        }
      >
        <div>
          <h3 className="text-xl font-semibold text-text-primary mb-4">Company Security Settings</h3>
          <div className="bg-surface-secondary/30 p-6 rounded-xl border border-border-primary/50">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-text-primary font-medium">Single Sign-On (SSO)</div>
                  <div className="text-sm text-text-muted">Configure SAML/OIDC authentication for your organization</div>
                </div>
                <Button variant="outline">Configure SSO</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-text-primary font-medium">Session Management</div>
                  <div className="text-sm text-text-muted">Control session timeouts and concurrent sessions</div>
                </div>
                <Button variant="outline">Manage Sessions</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-text-primary font-medium">IP Allowlist</div>
                  <div className="text-sm text-text-muted">Restrict access to specific IP addresses</div>
                </div>
                <Button variant="outline">Configure IPs</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-text-primary font-medium">Audit Logs</div>
                  <div className="text-sm text-text-muted">View security events and user activities</div>
                </div>
                <Button variant="outline">View Logs</Button>
              </div>
            </div>
          </div>
        </div>
      </CompanyAuthorization>
    </div>
  );
};