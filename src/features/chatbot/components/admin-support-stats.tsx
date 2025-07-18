import React from 'react';
import type { SupportSession } from '../api/chatbot';

interface AdminSupportStatsProps {
  sessions: SupportSession[];
}

export const AdminSupportStats: React.FC<AdminSupportStatsProps> = ({ sessions }) => {
  const sessionArray = sessions || [];
  const totalSessions = sessionArray.length;

  return (
    <div className="bg-surface-primary border border-border-primary rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-text-primary">Support Sessions</h3>
          <p className="text-sm text-text-muted">Active sessions requiring attention</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-text-primary">{totalSessions}</p>
          <p className="text-sm text-text-muted">Total Active</p>
        </div>
      </div>
    </div>
  );
};