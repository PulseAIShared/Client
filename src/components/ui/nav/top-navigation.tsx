// src/components/ui/nav/top-navigation.tsx (updated)
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mantine/hooks';
import { Code } from '@mantine/core';
import { useUser, useLogout } from '@/lib/auth';
import { NotificationsBell } from '@/components/ui/notifications';
import { useTheme } from '@/lib/theme-context';

export const TopNav = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const user = useUser();
  const logout = useLogout();
  const { theme, toggleTheme } = useTheme();
  
  const Logo = () => {
    return (
      <Link className="flex items-center gap-2" to="/app">
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary">
          PulseLTV
        </span>
        <Code fw={700} className="text-xs bg-accent-secondary/20 text-accent-secondary border border-accent-secondary/30">
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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout.mutateAsync({});
      navigate('/login');
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

  return (
    <nav className="fixed inset-x-0 top-0 z-30 flex h-14 sm:h-16 items-center justify-between bg-surface-primary/95 backdrop-blur-lg px-4 sm:px-6 text-text-primary border-b border-border-primary/50 shadow-lg">
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
            className="bg-surface-secondary/50 border border-border-primary/50 rounded-lg px-4 py-2 pl-10 w-64 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 transition-all"
          />
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-surface-secondary/50 border border-border-primary/50 hover:bg-surface-tertiary/50 transition-all"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Notifications Bell Component */}
        <NotificationsBell />

        {/* User Avatar Dropdown */}
        <div className="relative" ref={userDropdownRef}>
          <button 
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-2 p-2 rounded-lg bg-surface-secondary/50 border border-border-primary/50 hover:bg-surface-tertiary/50 transition-all"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full flex items-center justify-center text-white font-medium text-sm">
              {getUserInitials()}
            </div>
            {!isMobile && (
              <div className="text-sm">
                <div className="text-text-primary font-medium">{getUserDisplayName()}</div>
              </div>
            )}
            <svg className={`w-4 h-4 text-text-muted transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isUserDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-surface-primary/95 backdrop-blur-lg border border-border-primary/50 rounded-xl shadow-xl py-2 z-50">
              {/* User Info Section */}
              <div className="px-4 py-3 border-b border-border-primary/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full flex items-center justify-center text-white font-medium">
                    {getUserInitials()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-text-primary font-medium truncate">{getUserDisplayName()}</div>
                    <div className="text-text-secondary text-sm truncate">{user.data?.email}</div>
                    <div className="text-text-tertiary text-xs mt-2">
                      {user.data?.role && (
                        <span className="px-2 py-0.5 bg-accent-primary/20 text-accent-primary rounded-full text-xs font-medium border border-accent-primary/30">
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
                  className="flex items-center gap-3 px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50 transition-all duration-200"
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
                  className="flex items-center gap-3 px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 7 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Dashboard</span>
                </Link>

                  <Link
                  to="docs/getting-started"
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>Documentation</span>
                </Link>

                <button
                  onClick={() => setIsUserDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50 transition-all duration-200 w-full text-left"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                  </svg>
                  <span>Help & Support</span>
                </button>
              </div>

              {/* Logout Section */}
              <div className="border-t border-border-primary/50 pt-2">
                <button
                  onClick={handleLogout}
                  disabled={logout.isPending}
                  className="flex items-center gap-3 px-4 py-2 text-error-muted hover:text-error hover:bg-error/10 transition-all duration-200 w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
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