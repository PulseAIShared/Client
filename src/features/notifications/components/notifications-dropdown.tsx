// src/features/notifications/components/notifications-dropdown.tsx (updated for backend)
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { 
  useGetNotifications, 
  useMarkNotificationAsRead, 
  useMarkAllNotificationsAsRead,
  type NotificationResponse 
} from '@/features/notifications/api/notifications';
import { useNotifications } from '@/components/ui/notifications/notifications-store';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement>;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ 
  isOpen, 
  onClose, 
  anchorRef 
}) => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();
  
  // Fetch notifications (first page, 10 items)
  const { 
    data: notificationsData, 
    isLoading, 
    error,
    refetch 
  } = useGetNotifications({ 
    page: 1, 
    pageSize: 10 
  }, {
    enabled: isOpen, // Only fetch when dropdown is open
    refetchInterval: isOpen ? 30000 : false, // Refetch every 30 seconds when open
  });

  const markAsRead = useMarkNotificationAsRead({
    mutationConfig: {
      onSuccess: () => {
        refetch(); // Refresh notifications after marking as read
        
        // Update unread count immediately
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      },
      onError: () => {
        addNotification({
          type: 'error',
          title: 'Failed to mark notification as read',
        });
      }
    }
  });

  const markAllAsRead = useMarkAllNotificationsAsRead({
    mutationConfig: {
      onSuccess: () => {
        refetch(); // Refresh notifications after marking all as read
        
        // Update unread count to 0 immediately
        queryClient.setQueryData(['notifications', 'unread-count'], { count: 0 });
        
        addNotification({
          type: 'success',
          title: 'All notifications marked as read',
        });
      },
      onError: () => {
        addNotification({
          type: 'error',
          title: 'Failed to mark all notifications as read',
        });
      }
    }
  });

  const notifications = notificationsData?.notifications || [];
  const totalCount = notificationsData?.totalCount || 0;
  
  // Calculate unread count from the notifications
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  const getNotificationIcon = (type: string, category: string) => {
    // Enhanced icon mapping based on your backend types and categories
    const getIconForTypeAndCategory = (type: string, category: string) => {
      // Handle Import category specifically
      if (category === 'Import') {
        if (type === 'Success') {
          return (
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          );
        } else if (type === 'Error' || type === 'Failed') {
          return (
            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          );
        } else if (type === 'Information' || type === 'Info') {
          return (
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          );
        }
      }

      // Handle Customer category
      if (category === 'Customer') {
        return (
          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      }

      // Handle System category
      if (category === 'System') {
        return (
          <div className="w-8 h-8 bg-gray-500/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        );
      }

      // Handle other categories by type
      switch (type) {
        case 'Success':
          return (
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          );
        case 'Error':
        case 'Failed':
          return (
            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          );
        case 'Warning':
          return (
            <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          );
        case 'Info':
        case 'Information':
          return (
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          );
        default:
          return (
            <div className="w-8 h-8 bg-slate-500/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5v3a6 6 0 10-12 0v3l-5 5h5m7 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          );
      }
    };

    return getIconForTypeAndCategory(type, category);
  };

  const formatTimeAgo = (createdAt: string) => {
    const now = new Date();
    const notificationDate = new Date(createdAt);
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationDate.toLocaleDateString();
  };

  const handleNotificationClick = async (notification: NotificationResponse) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      try {
        await markAsRead.mutateAsync(notification.id);
        
        // Update unread count immediately by decreasing it by 1
        queryClient.setQueryData(['notifications', 'unread-count'], (oldData: { count: number } | undefined) => {
          const currentCount = oldData?.count || 0;
          return { count: Math.max(0, currentCount - 1) };
        });
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    
    // Navigate to action URL if provided
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    
    onClose();
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsRead.mutate();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-slate-800/95 backdrop-blur-lg border border-slate-700/50 rounded-xl shadow-xl py-2 z-50 max-h-96 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium border border-red-500/30">
                {unreadCount} new
              </span>
            )}
            <button 
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || markAllAsRead.isPending}
              className="text-slate-400 hover:text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {markAllAsRead.isPending ? 'Marking...' : 'Mark all read'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="px-4 py-8 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-slate-400 text-sm mt-2">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="px-4 py-8 text-center">
            <div className="text-red-400 mb-2">Failed to load notifications</div>
            <button 
              onClick={() => refetch()}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Try again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="text-slate-400 mb-2">No notifications</div>
            <div className="text-slate-500 text-sm">You're all caught up!</div>
          </div>
        ) : (
          <div className="py-2">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                disabled={markAsRead.isPending}
                className={`w-full px-4 py-3 hover:bg-slate-700/50 transition-all duration-200 text-left border-l-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  !notification.isRead 
                    ? 'border-blue-500 bg-blue-600/5' 
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type, notification.category)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-sm font-medium truncate ${
                        !notification.isRead ? 'text-white' : 'text-slate-300'
                      }`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {notification.message}
                    </p>
                    {notification.actionText && (
                      <div className="mt-2">
                        <span className="text-xs text-blue-400 font-medium">
                          {notification.actionText}
                        </span>
                      </div>
                    )}
                    {notification.category && (
                      <div className="mt-1">
                        <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded">
                          {notification.category}
                        </span>
                      </div>
                    )}
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-slate-700/50 pt-2">
          <button
            onClick={() => {
              navigate('/app/notifications');
              onClose();
            }}
            className="block w-full px-4 py-2 text-center text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200 text-sm"
          >
            View All Notifications ({totalCount})
          </button>
        </div>
      )}
    </div>
  );
};