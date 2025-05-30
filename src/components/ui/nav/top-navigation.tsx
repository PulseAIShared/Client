import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mantine/hooks';
import { Code } from '@mantine/core';
import { useUser, useLogout } from '@/lib/auth';


const mockNotifications = [
  {
    id: '1',
    type: 'churn_alert' as const,
    title: 'High Churn Risk Detected',
    message: '23 customers entered critical churn risk zone in the last hour',
    timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    isRead: false,
    actionUrl: '/app/subscribers?filter=high-risk',
    priority: 'high' as const
  },
  {
    id: '2',
    type: 'campaign_success' as const,
    title: 'Recovery Campaign Success',
    message: 'Payment recovery campaign achieved 73% success rate, recovering $18.5K',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    actionUrl: '/app/insights',
    priority: 'medium' as const
  },
  {
    id: '3',
    type: 'integration_sync' as const,
    title: 'Salesforce Sync Complete',
    message: 'Successfully synced 1,247 customer records from Salesforce',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    isRead: true,
    actionUrl: '/app/settings',
    priority: 'low' as const
  },
  {
    id: '4',
    type: 'payment_failed' as const,
    title: 'Payment Failures Spike',
    message: '12 new payment failures detected. Auto-recovery initiated.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    isRead: false,
    actionUrl: '/app/segments',
    priority: 'high' as const
  },
  {
    id: '5',
    type: 'ai_insight' as const,
    title: 'AI Insight: New Segment Opportunity',
    message: 'AI identified potential new segment: "Mobile-First Users" with 34% higher retention potential',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    isRead: true,
    actionUrl: '/app/segments?tab=create',
    priority: 'medium' as const
  },
  {
    id: '6',
    type: 'weekly_report' as const,
    title: 'Weekly Churn Report Ready',
    message: 'Your weekly churn analysis shows 15% improvement. View detailed insights.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isRead: true,
    actionUrl: '/app/insights',
    priority: 'low' as const
  }
];

export const TopNav = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const user = useUser();
  const logout = useLogout();
  
  const Logo = () => {
    return (
      <Link className="flex items-center gap-2" to="/app">
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Pulse AI
        </span>
        <Code fw={700} className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
          BETA
        </Code>
      </Link>
    );
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout.mutateAsync({});
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setIsUserDropdownOpen(false);
  };

  const getUserInitials = () => {
    if (!user.data) return 'U';
    const firstName = user.data.firstName || '';
    const lastName = user.data.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  };

  const getUserDisplayName = () => {
    if (!user.data) return 'User';
    return `${user.data.firstName || ''} ${user.data.lastName || ''}`.trim() || user.data.email || 'User';
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'churn_alert':
        return (
          <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'campaign_success':
        return (
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        );
      case 'payment_failed':
        return (
          <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        );
      case 'ai_insight':
        return (
          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        );
      case 'integration_sync':
        return (
          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        );
      case 'weekly_report':
        return (
          <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return timestamp.toLocaleDateString();
  };

  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notification: typeof mockNotifications[0]) => {
    // Mark as read (in real app, this would be an API call)
    setIsNotificationsOpen(false);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };
  
  return (
    <nav className="fixed inset-x-0 top-0 z-30 flex h-14 sm:h-16 items-center justify-between bg-slate-900/95 backdrop-blur-lg px-4 sm:px-6 text-white border-b border-slate-700/50 shadow-lg">
      <div className="flex items-center">
        <Link 
          to="/app" 
          className={`flex items-center ${isMobile ? 'ml-12' : ''}`}
        >
          <Logo />
        </Link>
      </div>

      {/* Right side - User menu and actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:block relative">
          <input 
            type="text" 
            placeholder="Search..."
            className="bg-slate-800/50 border border-slate-600/50 rounded-lg px-4 py-2 pl-10 w-64 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-lg bg-slate-800/50 border border-slate-600/50 hover:bg-slate-700/50 transition-all"
          >
            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9a6 6 0 10-12 0v3L8 17h7zM13 21a2 2 0 01-4 0" />
            </svg>
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
              </div>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-96 bg-slate-800/95 backdrop-blur-lg border border-slate-700/50 rounded-xl shadow-xl py-2 z-50 max-h-96 overflow-hidden">
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
                    <button className="text-slate-400 hover:text-white text-sm">
                      Mark all read
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {mockNotifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <div className="text-slate-400 mb-2">No notifications</div>
                    <div className="text-slate-500 text-sm">You're all caught up!</div>
                  </div>
                ) : (
                  <div className="py-2">
                    {mockNotifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full px-4 py-3 hover:bg-slate-700/50 transition-all duration-200 text-left border-l-2 ${
                          !notification.isRead 
                            ? 'border-blue-500 bg-blue-600/5' 
                            : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`text-sm font-medium truncate ${
                                !notification.isRead ? 'text-white' : 'text-slate-300'
                              }`}>
                                {notification.title}
                              </h4>
                              <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                              {notification.message}
                            </p>
                            {notification.priority === 'high' && (
                              <div className="mt-2">
                                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs font-medium border border-red-500/30">
                                  High Priority
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
              {mockNotifications.length > 0 && (
                <div className="border-t border-slate-700/50 pt-2">
                  <Link
                    to="/app/notifications"
                    onClick={() => setIsNotificationsOpen(false)}
                    className="block px-4 py-2 text-center text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200 text-sm"
                  >
                    View All Notifications
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Avatar Dropdown */}
        <div className="relative" ref={userDropdownRef}>
          <button 
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 border border-slate-600/50 hover:bg-slate-700/50 transition-all"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {getUserInitials()}
            </div>
            {!isMobile && (
              <div className="text-sm">
                <div className="text-white font-medium">{getUserDisplayName()}</div>
              </div>
            )}
            <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isUserDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-800/95 backdrop-blur-lg border border-slate-700/50 rounded-xl shadow-xl py-2 z-50">
              {/* User Info Section */}
              <div className="px-4 py-3 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                    {getUserInitials()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{getUserDisplayName()}</div>
                    <div className="text-slate-400 text-sm truncate">{user.data?.email}</div>
                    <div className="text-slate-500 text-x mt-2">
                      {user.data?.role && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium border border-blue-500/30">
                          {user.data.role}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <Link
                  to="/app/settings"
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Account Settings</span>
                </Link>

                <Link
                  to="/app"
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Dashboard</span>
                </Link>

                <button
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 w-full text-left"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>Documentation</span>
                </button>

                <button
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 w-full text-left"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                  </svg>
                  <span>Help & Support</span>
                </button>
              </div>

              {/* Logout Section */}
              <div className="border-t border-slate-700/50 pt-2">
                <button
                  onClick={handleLogout}
                  disabled={logout.isPending}
                  className="flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-600/10 transition-all duration-200 w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {logout.isPending ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  )}
                  <span>{logout.isPending ? 'Signing out...' : 'Sign Out'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};