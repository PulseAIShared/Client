// src/components/ui/nav/top-navigation.tsx
import { Link } from 'react-router-dom';
import { useMediaQuery } from '@mantine/hooks';
import { Code } from '@mantine/core';

export const TopNav = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
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
        <button className="relative p-2 rounded-lg bg-slate-800/50 border border-slate-600/50 hover:bg-slate-700/50 transition-all">
          <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9a6 6 0 10-12 0v3L8 17h7zM13 21a2 2 0 01-4 0" />
          </svg>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        </button>

        {/* User Avatar */}
        <div className="relative">
          <button className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 border border-slate-600/50 hover:bg-slate-700/50 transition-all">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
              JD
            </div>
            {!isMobile && (
              <div className="text-sm">
                <div className="text-white font-medium">John Doe</div>
              </div>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};