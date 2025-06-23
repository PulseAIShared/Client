// src/features/settings/components/security-section.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form';

export const SecuritySection = () => {
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
    </div>
  );
};