// components/layouts/top-navigation.tsx
import { Link } from 'react-router-dom';
import { useMediaQuery } from '@mantine/hooks';
import { Code } from '@mantine/core';

export const TopNav = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const Logo = () => {
    return (
      <Link className="flex items-center" to="/app">

        <span className="text-lg sm:text-xl font-bold text-black">BodyLedger</span>
      </Link>
    );
  };
  
  return (
    <nav className="fixed inset-x-0 top-0 z-20 flex h-14 sm:h-16 items-center justify-between bg-white px-4 sm:px-6 text-black border-b border-gray-200 shadow-sm">
      <div className="flex items-center">
        {/* Logo positioning - adjusted to account for mobile burger menu */}
        <Link 
          to="/app" 
          className={`flex items-center ${isMobile ? 'ml-8' : ''}`}
        >
              <Logo />
              <Code fw={700}>BETA</Code>
        </Link>
      </div>

    </nav>
  );
};