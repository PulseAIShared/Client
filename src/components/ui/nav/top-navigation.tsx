// components/layouts/top-navigation.tsx
import { Link } from 'react-router-dom';
import { useMediaQuery } from '@mantine/hooks';
import { Code } from '@mantine/core';

export const TopNav = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const Logo = () => {
    return (
      <Link className="flex items-center gap-3" to="/app">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">P</span>
        </div>
        <span className="text-lg sm:text-xl font-bold text-slate-900">Pulse AI</span>
      </Link>
    );
  };
  
  return (
    <nav className="fixed inset-x-0 top-0 z-20 flex h-14 sm:h-16 items-center justify-between bg-white/95 backdrop-blur-sm px-4 sm:px-6 text-slate-900 border-b border-slate-200 shadow-sm">
      <div className="flex items-center gap-4">
        <Link 
          to="/app" 
          className={`flex items-center ${isMobile ? 'ml-8' : ''}`}
        >
          <Logo />
        </Link>
        <Code fw={700} className="bg-blue-100 text-blue-700">BETA</Code>
      </div>

      {/* User menu placeholder */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5h-5l5-5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7V3h6v4" />
          </svg>
        </button>
        <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-medium text-sm">U</span>
        </div>
      </div>
    </nav>
  );
};