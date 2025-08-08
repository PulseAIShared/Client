// src/features/notifications/components/notifications-dropdown.tsx (complete fixed version)
import React, { useRef, useEffect } from 'react';
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
  
  // Fetch notifications (first page, 10 items) - minimal polling, rely on SignalR
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
    refetchInterval: false, // No polling - SignalR handles real-time updates
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    refetchOnWindowFocus: false, // Don't refetch on focus
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
  }, [isOpen, onClose, anchorRef]);

  const getNotificationIcon = (type: string, category: string) => {
    // Enhanced icon mapping based on your backend types and categories
    const getIconForTypeAndCategory = (type: string, category: string) => {
      // Handle Import category specifically
      if (category === 'Import') {
        if (type === 'Success') {
          return (
            <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-success-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          );
        } else if (type === 'Error' || type === 'Failed') {
          return (
            <div className="w-8 h-8 bg-error/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          );
        } else if (type === 'Information' || type === 'Info') {
          return (
            <div className="w-8 h-8 bg-info/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-info-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          );
        }
      }

      // Handle Customer category
      if (category === 'Customer') {
        return (
          <div className="w-8 h-8 bg-accent-secondary/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      }

      // Handle System category
      if (category === 'System') {
        return (
          <div className="w-8 h-8 bg-surface-secondary/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-success-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          );
        case 'Error':
        case 'Failed':
          return (
            <div className="w-8 h-8 bg-error/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          );
        case 'Warning':
          return (
            <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-warning-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          );
        case 'Info':
        case 'Information':
          return (
            <div className="w-8 h-8 bg-info/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-info-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          );
        default:
          return (
            <div className="w-8 h-8 bg-info/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-info-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
    return notificationDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: notificationDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  const handleNotificationClick = async (notification: NotificationResponse) => {
    if (!notification.isRead) {
      try {
        await markAsRead.mutateAsync(notification.id);
        queryClient.setQueryData(['notifications', 'unread-count'], (oldData: { count: number } | undefined) => {
          const currentCount = oldData?.count || 0;
          return { count: Math.max(0, currentCount - 1) };
        });
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    
    if (notification.actionUrl) {
      navigate(`/app${notification.actionUrl}`);
    }
    
    onClose();
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      // Call mutate without parameters since markAllNotificationsAsRead takes no arguments
      markAllAsRead.mutate(undefined);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-3 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-surface-primary/95 backdrop-blur-xl border border-border-primary/30 rounded-2xl shadow-2xl z-50 flex flex-col max-h-96 overflow-hidden"
    >
      {/* Enhanced Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border-primary/30 flex-shrink-0 bg-gradient-to-r from-surface-primary/50 to-surface-secondary/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-text-primary font-semibold text-base sm:text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-gradient-to-r from-error/20 to-error-muted/20 text-error-muted rounded-full text-xs font-medium border border-error/30">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => refetch()}
              className="p-2 text-text-muted hover:text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-all duration-300"
              title="Refresh notifications"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button 
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || markAllAsRead.isPending}
              className="px-3 py-1 text-xs sm:text-sm text-text-muted hover:text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <span className="hidden sm:inline">{markAllAsRead.isPending ? 'Marking...' : 'Mark all read'}</span>
              <span className="sm:hidden">Mark all</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Content - Scrollable area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-3">
              <div className="relative">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mx-auto"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 rounded-full blur-xl animate-pulse"></div>
              </div>
              <p className="text-text-muted text-sm">Loading notifications...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-error/20 to-error-muted/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="text-error-muted text-sm">Failed to load notifications</div>
              <button 
                onClick={() => refetch()}
                className="text-accent-primary hover:text-accent-secondary text-sm font-medium transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-surface-secondary/50 to-surface-secondary rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5v3a6 6 0 10-12 0v3l-5 5h5m7 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="text-text-muted text-sm">No notifications</div>
              <div className="text-text-muted text-xs">You're all caught up!</div>
            </div>
          </div>
        ) : (
          <div className="py-2">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                disabled={markAsRead.isPending}
                className={`w-full px-4 sm:px-6 py-3 sm:py-4 hover:bg-surface-secondary/30 transition-all duration-300 text-left border-l-2 disabled:opacity-50 disabled:cursor-not-allowed group ${
                  !notification.isRead 
                    ? 'border-accent-primary bg-gradient-to-r from-accent-primary/5 to-accent-secondary/5' 
                    : 'border-transparent hover:border-accent-primary/30'
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {getNotificationIcon(notification.type, notification.category)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`text-sm sm:text-base font-semibold leading-tight ${
                        !notification.isRead ? 'text-text-primary' : 'text-text-secondary'
                      }`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-text-muted ml-2 sm:ml-3 flex-shrink-0">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-text-muted text-sm leading-relaxed line-clamp-2 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {notification.category && (
                        <span className="text-xs text-text-muted bg-surface-secondary/50 px-2 py-1 rounded-lg border border-border-primary/30">
                          {notification.category}
                        </span>
                      )}
                      {notification.actionText && (
                        <span className="text-xs text-accent-primary font-medium bg-accent-primary/10 px-2 py-1 rounded-lg border border-accent-primary/30">
                          {notification.actionText}
                        </span>
                      )}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-accent-primary rounded-full flex-shrink-0 mt-2 animate-pulse"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Footer - Always visible */}
      {notifications.length > 0 && (
        <div className="border-t border-border-primary/30 flex-shrink-0 bg-gradient-to-r from-surface-primary/50 to-surface-secondary/50">
          <button
            onClick={() => {
              navigate('/app/notifications');
              onClose();
            }}
            className="block w-full px-4 sm:px-6 py-3 sm:py-4 text-center text-text-muted hover:text-accent-primary hover:bg-accent-primary/10 transition-all duration-300 text-sm font-medium"
          >
            View All Notifications ({totalCount})
          </button>
        </div>
      )}
    </div>
  );
};