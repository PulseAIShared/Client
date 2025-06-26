// src/app/routes/app/notifications/notifications.tsx
import React, { useState } from 'react';
import { ContentLayout } from '@/components/layouts';
import { 
  useGetNotifications, 
  useMarkNotificationAsRead, 
  useMarkAllNotificationsAsRead,
  type NotificationResponse 
} from '@/features/notifications/api/notifications';
import { useNotifications } from '@/components/ui/notifications/notifications-store';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const NotificationsRoute = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  const pageSize = 20;
  
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();

  // Fetch notifications based on current filters
  const { 
    data: notificationsData, 
    isLoading, 
    error,
    refetch 
  } = useGetNotifications({ 
    page: currentPage, 
    pageSize,
    unreadOnly: filterType === 'unread' ? true : undefined,
  });

  const markAsRead = useMarkNotificationAsRead({
    mutationConfig: {
      onSuccess: () => {
        refetch();
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
        refetch();
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

  // Clear all notifications mutation (you'll need to implement this API endpoint)
  const clearAllNotifications = async () => {
    try {
      // This would be a new API endpoint to delete all notifications
      // await api.delete('/notifications/clear-all');
      
      // For now, we'll just mark them all as read and show a message
      await markAllAsRead.mutateAsync(undefined);
      addNotification({
        type: 'info',
        title: 'Clear All Notifications',
        message: 'All notifications have been marked as read. Clear functionality requires backend implementation.',
      });
    } catch {
      addNotification({
        type: 'error',
        title: 'Failed to clear notifications',
      });
    }
  };

  const notifications = notificationsData?.notifications || [];
  const totalCount = notificationsData?.totalCount || 0;
  const totalPages = notificationsData?.totalPages || 1;
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string, category: string) => {
    // Enhanced icon mapping
    const getIconForTypeAndCategory = (type: string, category: string) => {
      if (category === 'Import') {
        if (type === 'Success') {
          return (
            <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-success-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          );
        } else if (type === 'Error' || type === 'Failed') {
          return (
            <div className="w-10 h-10 bg-error/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          );
        }
      }

      if (category === 'Customer') {
        return (
          <div className="w-10 h-10 bg-accent-secondary/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      }

      switch (type) {
        case 'Success':
          return (
            <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-success-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          );
        case 'Error':
        case 'Failed':
          return (
            <div className="w-10 h-10 bg-error/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          );
        case 'Warning':
          return (
            <div className="w-10 h-10 bg-warning/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-warning-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          );
        default:
          return (
            <div className="w-10 h-10 bg-info/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-info-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  const formatDateTime = (createdAt: string) => {
    const date = new Date(createdAt);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleFilterChange = (newFilter: 'all' | 'unread' | 'read') => {
    setFilterType(newFilter);
    setCurrentPage(1); // Reset to first page when changing filters
  };

  return (
    <ContentLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-2xl blur-3xl"></div>
          
          <div className="relative bg-surface-primary/50 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-border-primary/50 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-accent-secondary/20 backdrop-blur-sm px-4 py-2 rounded-full border border-accent-secondary/30 mb-4">
                  <div className="w-2 h-2 bg-success-muted rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-accent-secondary">Activity Center</span>
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary mb-2">
                  Notifications
                </h1>
                <p className="text-text-secondary">
                  Stay updated with real-time notifications and system alerts
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                {unreadCount > 0 && (
                  <span className="px-3 py-1 bg-error/20 text-error-muted rounded-full text-sm font-medium border border-error/30">
                    {unreadCount} unread
                  </span>
                )}
                <Button
                  onClick={() => markAllAsRead.mutate(undefined)}
                  disabled={unreadCount === 0 || markAllAsRead.isPending}
                  variant="outline"
                  className="border-border-primary/50 hover:border-accent-primary/50"
                >
                  {markAllAsRead.isPending ? 'Marking...' : 'Mark All Read'}
                </Button>
                <Button
                  onClick={clearAllNotifications}
                  variant="outline"
                  className="border-border-primary/50 hover:border-error/50 hover:text-error-muted"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface-primary/50 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-border-primary/50 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Notifications', count: totalCount },
                { key: 'unread', label: 'Unread', count: unreadCount },
                { key: 'read', label: 'Read', count: totalCount - unreadCount }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => handleFilterChange(filter.key as 'all' | 'unread' | 'read')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${
                    filterType === filter.key
                      ? 'bg-gradient-to-r from-accent-primary/30 to-accent-secondary/30 text-accent-primary border border-accent-primary/30'
                      : 'bg-surface-secondary/50 text-text-secondary hover:bg-surface-secondary/70 border border-border-primary/50'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
            
            <div className="text-xs sm:text-sm text-text-muted">
              Page {currentPage} of {totalPages} • {totalCount} total
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-surface-primary/50 backdrop-blur-lg rounded-2xl border border-border-primary/50 shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mx-auto mb-4"></div>
              <p className="text-text-muted">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="text-error-muted mb-2">Failed to load notifications</div>
              <button 
                onClick={() => refetch()}
                className="text-accent-primary hover:text-accent-primary"
              >
                Try again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-surface-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5v3a6 6 0 10-12 0v3l-5 5h5m7 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-text-primary font-medium mb-2">No notifications</h3>
              <p className="text-text-muted">
                {filterType === 'unread' 
                  ? "You don't have any unread notifications" 
                  : filterType === 'read'
                  ? "No read notifications found"
                  : "You're all caught up!"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border-primary/50">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group hover:bg-surface-secondary/30 transition-all duration-200 ${
                    !notification.isRead ? 'bg-accent-primary/5' : ''
                  }`}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      {getNotificationIcon(notification.type, notification.category)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-2">
                          <h3 className={`font-medium text-lg ${
                            !notification.isRead ? 'text-text-primary' : 'text-text-secondary'
                          }`}>
                            {notification.title}
                          </h3>
                          
                          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            <span className="text-sm text-text-muted" title={formatDateTime(notification.createdAt)}>
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {!notification.isRead && (
                              <div className="w-3 h-3 bg-accent-primary rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-text-muted leading-relaxed mb-3">
                          {notification.message}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            {notification.category && (
                              <span className="text-xs text-text-muted bg-surface-secondary/50 px-2 py-1 rounded border border-border-primary/50">
                                {notification.category}
                              </span>
                            )}
                            
                            <span className={`text-xs px-2 py-1 rounded border ${
                              notification.type === 'Success' 
                                ? 'text-success-muted bg-success/20 border-success/30'
                                : notification.type === 'Error' || notification.type === 'Failed'
                                ? 'text-error-muted bg-error/20 border-error/30'
                                : notification.type === 'Warning'
                                ? 'text-warning-muted bg-warning/20 border-warning/30'
                                : 'text-info-muted bg-info/20 border-info/30'
                            }`}>
                              {notification.type}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead.mutate(notification.id)}
                                disabled={markAsRead.isPending}
                                className="px-3 py-1 text-xs bg-accent-primary/20 text-accent-primary rounded hover:bg-accent-primary/30 transition-colors border border-accent-primary/30 disabled:opacity-50"
                              >
                                Mark as read
                              </button>
                            )}
                            
                            {notification.actionUrl && notification.actionText && (
                              <button
                                onClick={() => handleNotificationClick(notification)}
                                className="px-3 py-1 text-xs bg-accent-secondary/20 text-accent-secondary rounded hover:bg-accent-secondary/30 transition-colors border border-accent-secondary/30"
                              >
                                {notification.actionText}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 border-t border-border-primary/50">
              <div className="text-xs sm:text-sm text-text-muted">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} notifications
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-2 sm:px-3 py-1 bg-surface-secondary/50 text-text-primary rounded hover:bg-surface-secondary/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  Previous
                </button>
                
                <div className="flex flex-wrap items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, currentPage - 2) + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-2 sm:px-3 py-1 rounded transition-colors text-xs sm:text-sm ${
                          pageNum === currentPage
                            ? 'bg-accent-primary text-text-primary'
                            : 'bg-surface-secondary/50 text-text-secondary hover:bg-surface-secondary/70'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-2 sm:px-3 py-1 bg-surface-secondary/50 text-text-primary rounded hover:bg-surface-secondary/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ContentLayout>
  );
};