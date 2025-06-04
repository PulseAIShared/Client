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
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          );
        } else if (type === 'Error' || type === 'Failed') {
          return (
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          );
        }
      }

      if (category === 'Customer') {
        return (
          <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      }

      switch (type) {
        case 'Success':
          return (
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          );
        case 'Error':
        case 'Failed':
          return (
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          );
        case 'Warning':
          return (
            <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          );
        default:
          return (
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      navigate(notification.actionUrl);
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
      <div className="space-y-6">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-3xl"></div>
          
          <div className="relative bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-400/30 mb-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-purple-200">Activity Center</span>
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                  Notifications
                </h1>
                <p className="text-slate-300">
                  Stay updated with real-time notifications and system alerts
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium border border-red-500/30">
                    {unreadCount} unread
                  </span>
                )}
                <Button
                  onClick={() => markAllAsRead.mutate(undefined)}
                  disabled={unreadCount === 0 || markAllAsRead.isPending}
                  variant="outline"
                  className="border-slate-600/50 hover:border-blue-500/50"
                >
                  {markAllAsRead.isPending ? 'Marking...' : 'Mark All Read'}
                </Button>
                <Button
                  onClick={clearAllNotifications}
                  variant="outline"
                  className="border-slate-600/50 hover:border-red-500/50 hover:text-red-400"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All Notifications', count: totalCount },
                { key: 'unread', label: 'Unread', count: unreadCount },
                { key: 'read', label: 'Read', count: totalCount - unreadCount }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => handleFilterChange(filter.key as 'all' | 'unread' | 'read')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    filterType === filter.key
                      ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-400 border border-blue-500/30'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
            
            <div className="text-sm text-slate-400">
              Page {currentPage} of {totalPages} • {totalCount} total
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-400">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="text-red-400 mb-2">Failed to load notifications</div>
              <button 
                onClick={() => refetch()}
                className="text-blue-400 hover:text-blue-300"
              >
                Try again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5v3a6 6 0 10-12 0v3l-5 5h5m7 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-2">No notifications</h3>
              <p className="text-slate-400">
                {filterType === 'unread' 
                  ? "You don't have any unread notifications" 
                  : filterType === 'read'
                  ? "No read notifications found"
                  : "You're all caught up!"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group hover:bg-slate-700/30 transition-all duration-200 ${
                    !notification.isRead ? 'bg-blue-600/5' : ''
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {getNotificationIcon(notification.type, notification.category)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className={`font-medium text-lg ${
                            !notification.isRead ? 'text-white' : 'text-slate-300'
                          }`}>
                            {notification.title}
                          </h3>
                          
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-sm text-slate-400" title={formatDateTime(notification.createdAt)}>
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {!notification.isRead && (
                              <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-slate-400 leading-relaxed mb-3">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {notification.category && (
                              <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded border border-slate-600/50">
                                {notification.category}
                              </span>
                            )}
                            
                            <span className={`text-xs px-2 py-1 rounded border ${
                              notification.type === 'Success' 
                                ? 'text-green-400 bg-green-500/20 border-green-500/30'
                                : notification.type === 'Error' || notification.type === 'Failed'
                                ? 'text-red-400 bg-red-500/20 border-red-500/30'
                                : notification.type === 'Warning'
                                ? 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
                                : 'text-blue-400 bg-blue-500/20 border-blue-500/30'
                            }`}>
                              {notification.type}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead.mutate(notification.id)}
                                disabled={markAsRead.isPending}
                                className="px-3 py-1 text-xs bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition-colors border border-blue-500/30 disabled:opacity-50"
                              >
                                Mark as read
                              </button>
                            )}
                            
                            {notification.actionUrl && notification.actionText && (
                              <button
                                onClick={() => handleNotificationClick(notification)}
                                className="px-3 py-1 text-xs bg-purple-600/20 text-purple-400 rounded hover:bg-purple-600/30 transition-colors border border-purple-500/30"
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
            <div className="flex items-center justify-between p-6 border-t border-slate-700/50">
              <div className="text-sm text-slate-400">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} notifications
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-3 py-1 bg-slate-700/50 text-white rounded hover:bg-slate-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, currentPage - 2) + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded transition-colors ${
                          pageNum === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
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
                  className="px-3 py-1 bg-slate-700/50 text-white rounded hover:bg-slate-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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