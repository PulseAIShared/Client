// src/features/notifications/components/notifications-bell.tsx (fixed TypeScript error)
import React, { useState, useRef, useEffect } from 'react';

import { NotificationsDropdown } from './notifications-dropdown';
import { useGetUnreadCount } from '../api/notifications';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';

export const NotificationsBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Set up real-time notifications
  const { connectionState, isAuthenticated } = useRealTimeNotifications();

  // Fetch unread count - rely primarily on SignalR with minimal fallback polling
  const { data: unreadData } = useGetUnreadCount({
    refetchInterval: 5 * 60 * 1000, // Fallback refresh every 5 minutes only
    refetchIntervalInBackground: false, // Don't poll in background
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    refetchOnWindowFocus: false, // Don't refetch on focus - SignalR handles real-time updates
    refetchOnMount: true, // Only refetch on component mount
  });

  const unreadCount = unreadData?.count || 0;
  const isConnected = connectionState === 'Connected';

  // Debug logging for unread count changes
  useEffect(() => {
    // Use import.meta.env instead of process.env for Vite
    if (import.meta.env.DEV) {
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
        className="relative p-2 rounded-lg bg-surface-secondary/50 border border-border-primary/50 hover:bg-surface-secondary/70 transition-all group"
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        title={isConnected ? 'Real-time notifications active' : 'Real-time notifications connecting...'}
      >
        <svg className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9a6 6 0 10-12 0v3L8 17h7zM13 21a2 2 0 01-4 0" />
        </svg>
        
        {/* SignalR connection status indicator */}
        {isAuthenticated && (
          <div className={`absolute -top-0.5 -left-0.5 w-2 h-2 rounded-full transition-colors ${
            isConnected ? 'bg-success-muted' : 'bg-warning-muted animate-pulse'
          }`} />
        )}
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-error rounded-full flex items-center justify-center animate-pulse">
            <span className="text-text-primary text-xs font-bold px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </div>
        )}
        
        {/* Pulse animation for new notifications */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-error rounded-full animate-ping opacity-75"></div>
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