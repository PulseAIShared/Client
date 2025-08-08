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
import { Spinner } from '@/components/ui/spinner';

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
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        {/* Enhanced Header */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 via-accent-secondary/10 to-accent-primary/10 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
          
          <div className="relative bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 mb-2">
    
                  {unreadCount > 0 && (
                    <span className="px-3 py-1 bg-error/20 text-error-muted rounded-full text-sm font-medium border border-error/30">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary">
                  Notifications
                </h1>
                <p className="text-text-secondary text-base sm:text-lg lg:text-xl max-w-2xl">
                  Stay updated with real-time notifications and system alerts
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button
                  onClick={() => markAllAsRead.mutate(undefined)}
                  disabled={unreadCount === 0 || markAllAsRead.isPending}
                  variant="outline"
                  className="border-border-primary/50 hover:border-accent-primary/50 hover:text-accent-primary bg-surface-primary/50 backdrop-blur-sm"
                >
                  {markAllAsRead.isPending ? 'Marking...' : 'Mark All Read'}
                </Button>
                <Button
                  onClick={clearAllNotifications}
                  variant="outline"
                  className="border-border-primary/50 hover:border-error/50 hover:text-error-muted bg-surface-primary/50 backdrop-blur-sm"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-surface-primary/80 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'all', label: 'All Notifications', count: totalCount },
                { key: 'unread', label: 'Unread', count: unreadCount },
                { key: 'read', label: 'Read', count: totalCount - unreadCount }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => handleFilterChange(filter.key as 'all' | 'unread' | 'read')}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 ${
                    filterType === filter.key
                      ? 'bg-gradient-to-r from-accent-primary/30 to-accent-secondary/30 text-accent-primary border border-accent-primary/30 shadow-lg'
                      : 'bg-surface-secondary/50 text-text-secondary hover:bg-surface-secondary/70 border border-border-primary/50 hover:border-accent-primary/50 hover:text-accent-primary'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
            
            <div className="text-sm sm:text-base text-text-muted">
              Page {currentPage} of {totalPages} • {totalCount} total
            </div>
          </div>
        </div>

        {/* Enhanced Notifications List */}
        <div className="bg-surface-primary/80 backdrop-blur-lg rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="relative">
                  <Spinner size="xl" />
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 rounded-full blur-xl animate-pulse"></div>
                </div>
                <p className="text-text-secondary font-medium">Loading notifications...</p>
                <p className="text-text-muted text-sm">Preparing your activity feed</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center bg-surface-primary/80 backdrop-blur-xl p-8 rounded-3xl border border-border-primary/50 shadow-2xl max-w-md">
                <div className="w-16 h-16 bg-gradient-to-br from-error/20 to-error-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-text-primary mb-2">Failed to Load Notifications</h2>
                <p className="text-text-muted mb-4">
                  {error instanceof Error ? error.message : 'Unable to load notifications'}
                </p>
                <button 
                  onClick={() => refetch()} 
                  className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-surface-secondary/50 to-surface-secondary rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5v3a6 6 0 10-12 0v3l-5 5h5m7 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-text-primary">No notifications</h3>
                <p className="text-text-muted">
                  {filterType === 'unread' 
                    ? "You don't have any unread notifications" 
                    : filterType === 'read'
                    ? "No read notifications found"
                    : "You're all caught up!"}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border-primary/50">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group hover:bg-surface-secondary/30 transition-all duration-300 ${
                    !notification.isRead ? 'bg-accent-primary/5' : ''
                  }`}
                >
                  <div className="p-6 sm:p-8">
                    <div className="flex items-start gap-4 sm:gap-6">
                      {getNotificationIcon(notification.type, notification.category)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-3">
                          <h3 className={`font-semibold text-lg sm:text-xl ${
                            !notification.isRead ? 'text-text-primary' : 'text-text-secondary'
                          }`}>
                            {notification.title}
                          </h3>
                          
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-sm text-text-muted" title={formatDateTime(notification.createdAt)}>
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {!notification.isRead && (
                              <div className="w-3 h-3 bg-accent-primary rounded-full flex-shrink-0 animate-pulse"></div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-text-muted leading-relaxed mb-4 text-base">
                          {notification.message}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex flex-wrap items-center gap-3">
                            {notification.category && (
                              <span className="text-sm text-text-muted bg-surface-secondary/50 px-3 py-1 rounded-lg border border-border-primary/50">
                                {notification.category}
                              </span>
                            )}
                            
                            <span className={`text-sm px-3 py-1 rounded-lg border ${
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
                          
                          <div className="flex flex-wrap items-center gap-3 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead.mutate(notification.id)}
                                disabled={markAsRead.isPending}
                                className="px-4 py-2 text-sm bg-accent-primary/20 text-accent-primary rounded-lg hover:bg-accent-primary/30 transition-colors border border-accent-primary/30 disabled:opacity-50"
                              >
                                Mark as read
                              </button>
                            )}
                            
                            {notification.actionUrl && notification.actionText && (
                              <button
                                onClick={() => handleNotificationClick(notification)}
                                className="px-4 py-2 text-sm bg-accent-secondary/20 text-accent-secondary rounded-lg hover:bg-accent-secondary/30 transition-colors border border-accent-secondary/30"
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

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 border-t border-border-primary/50">
              <div className="text-sm sm:text-base text-text-muted">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} notifications
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-secondary/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Previous
                </button>
                
                <div className="flex flex-wrap items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, currentPage - 2) + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                          pageNum === currentPage
                            ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-text-primary shadow-lg'
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
                  className="px-4 py-2 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-secondary/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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