import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code } from '@mantine/core';

import { useWaitlistModal } from '@/hooks/useWaitlistModal';
import { navigateToSection } from '@/utils/navigation';

export const LandingNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { openWaitlistModal } = useWaitlistModal();

  const Logo = () => {
    const handleLogoClick = (e: React.MouseEvent) => {
      e.preventDefault();
      
      // If we're already on the landing page, scroll to top
      if (window.location.pathname === '/') {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      } else {
        // If we're on a different page, navigate to landing page
        navigate('/');
      }
    };

    return (
      <button 
        onClick={handleLogoClick}
        className="flex items-center gap-2"
      >
        <span className="text-xl font-bold bg-clip-text text-transparent bg-black">
          PulseLTV
        </span>
        <Code fw={700} className="text-xs bg-blue-500">
          BETA
        </Code>
      </button>
    );
  };

  const navLinks: { name: string; sectionId: string }[] = [
    { name: 'How It Works', sectionId: '#how-it-works' },
    { name: 'Features', sectionId: '#features' },
    { name: 'Churn Calculator', sectionId: '#calculator' },
  ];

  const handleNavClick = (sectionId: string) => {
    navigateToSection(sectionId);
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-white backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.sectionId)}
                  className="text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium"
                >
                  {link.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right Side - Theme Toggle & CTAs */}
          <div className="hidden md:flex items-center space-x-4">
   
            {/* Sign In */}
            <Link
              to="/login"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
            >
              Sign In
            </Link>

            {/* Get Started CTA */}
            <Link
              to="/book-demo"
              className="bg-sky-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-sky-600 hover:shadow-lg hover:shadow-sky-500/25 transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Book Demo
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => {
                  handleNavClick(link.sectionId);
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
              >
                {link.name}
              </button>
            ))}
            

            
            {/* Mobile CTAs */}
            <div className="px-3 pt-4 space-y-2">
              <Link
                to="/login"
                className="block w-full text-center px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openWaitlistModal('navbar-mobile');
                }}
                className="block w-full text-center bg-sky-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-600 transition-all"
              >
                Join Waiting List
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};