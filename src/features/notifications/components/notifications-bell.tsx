// src/features/notifications/components/notifications-bell.tsx (updated for backend)
import React, { useState, useRef, useEffect } from 'react';

import { NotificationsDropdown } from './notifications-dropdown';
import { useGetUnreadCount } from '../api/notifications';

export const NotificationsBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fetch unread count with real-time updates
  const { data: unreadData } = useGetUnreadCount({
    refetchInterval: 30000, // Refresh every 30 seconds as fallback
    refetchIntervalInBackground: true,
    staleTime: 10000, // Consider data stale after 10 seconds for more responsive updates
    refetchOnWindowFocus: true, // Refetch when user focuses the window
  });

  const unreadCount = unreadData?.count || 0;

  // Debug logging for unread count changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Unread count updated:', unreadCount);
    }
  }, [unreadCount]);

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
        className="relative p-2 rounded-lg bg-slate-800/50 border border-slate-600/50 hover:bg-slate-700/50 transition-all group"
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
      >
        <svg className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9a6 6 0 10-12 0v3L8 17h7zM13 21a2 2 0 01-4 0" />
        </svg>
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white text-xs font-bold px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </div>
        )}
        
        {/* Pulse animation for new notifications */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-75"></div>
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