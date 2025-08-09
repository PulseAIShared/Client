import React from 'react';
import { CustomerDetailData } from '@/types/api';

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'login':
      return (
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent-primary/20 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        </div>
      );
    case 'feature':
      return (
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent-secondary/20 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      );
    case 'support':
      return (
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-warning/20 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
          </svg>
        </div>
      );
    case 'billing':
      return (
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-error/20 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-surface-secondary/20 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
  }
};

interface CustomerActivityTabProps {
  customer: CustomerDetailData;
  canEditCustomers: boolean;
}

export const CustomerActivityTab: React.FC<CustomerActivityTabProps> = ({ customer }) => {
  const timeline = customer.activity?.timeline ?? [];
  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <div className="bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
        <h3 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary mb-6 sm:mb-8">Recent Activity Timeline</h3>
        {timeline.length === 0 ? (
          <div className="p-4 sm:p-6 bg-surface-secondary/30 rounded-2xl border border-border-primary/30 text-text-muted">
            No activity yet. See Data Sources tab for recommended data actions to enable activity tracking.
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {timeline.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 sm:gap-6 p-4 sm:p-6 bg-surface-secondary/30 rounded-2xl border border-border-primary/30 hover:bg-surface-secondary/50 transition-all duration-300">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text-primary font-semibold text-base sm:text-lg">{activity.description}</span>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm text-text-muted">
                        {new Date(activity.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      {activity.displayTime && (
                        <div className="text-xs sm:text-sm text-text-muted">{activity.displayTime}</div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm text-text-muted capitalize">{activity.type} activity</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


