// src/components/ui/notifications/notifications-bell.tsx
import React, { useState, useRef } from 'react';

import { NotificationsDropdown } from './notifications-dropdown';
import { useGetUnreadCount } from '../api/notifications';

export const NotificationsBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fetch unread count with polling
  const { data: unreadData } = useGetUnreadCount({
    refetchInterval: 60000, // Refresh every minute
    refetchIntervalInBackground: true,
  });

  const unreadCount = unreadData?.count || 0;

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="relative p-2 rounded-lg bg-slate-800/50 border border-slate-600/50 hover:bg-slate-700/50 transition-all"
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
      >
        <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9a6 6 0 10-12 0v3L8 17h7zM13 21a2 2 0 01-4 0" />
        </svg>
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </div>
        )}
      </button>

      <NotificationsDropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        anchorRef={buttonRef as React.RefObject<HTMLElement>}
      />
    </div>
  );
};