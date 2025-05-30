// src/features/settings/components/security-section.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form';

export const SecuritySection = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Change Password</h3>
        <div className="bg-slate-700/30 p-6 rounded-xl border border-slate-600/50">
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
        <h3 className="text-xl font-semibold text-white mb-4">Two-Factor Authentication</h3>
        <div className="bg-slate-700/30 p-6 rounded-xl border border-slate-600/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">2FA Status</div>
              <div className="text-sm text-slate-400">Add an extra layer of security to your account</div>
            </div>
            <Button variant="outline">Enable 2FA</Button>
          </div>
        </div>
      </div>
    </div>
  );
};