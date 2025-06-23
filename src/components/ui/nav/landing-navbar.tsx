import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Code } from '@mantine/core';
import { useTheme } from '@/lib/theme-context';

export const LandingNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const Logo = () => {
    return (
      <Link className="flex items-center gap-2" to="/">
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary">
          PulseLTV
        </span>
        <Code fw={700} className="text-xs bg-accent-secondary/20 text-accent-secondary border border-accent-secondary/30">
          BETA
        </Code>
      </Link>
    );
  };

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Docs', href: '/app/docs/getting-started' },
  ];

  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-surface-primary/95 backdrop-blur-lg border-b border-border-primary/50 shadow-sm">
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
                <a
                  key={link.name}
                  href={link.href}
                  className="text-text-secondary hover:text-text-primary transition-colors duration-200 font-medium"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Right Side - Theme Toggle & CTAs */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
   
            {/* Sign In */}
            <Link
              to="/auth/login"
              className="text-text-secondary hover:text-text-primary font-medium transition-colors duration-200"
            >
              Sign In
            </Link>

            {/* Get Started CTA */}
            <Link
              to="/auth/register"
              className="bg-gradient-to-r from-accent-primary to-accent-secondary text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-accent-primary/25 transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50 transition-all"
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
        <div className="md:hidden bg-surface-primary border-t border-border-primary/50">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50 rounded-lg transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            
            {/* Mobile theme toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 w-full px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50 rounded-lg transition-all"
            >
              {theme === 'dark' ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Light Mode
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  Dark Mode
                </>
              )}
            </button>
            
            {/* Mobile CTAs */}
            <div className="px-3 pt-4 space-y-2">
              <Link
                to="/auth/login"
                className="block w-full text-center px-4 py-2 text-text-secondary hover:text-text-primary border border-border-primary rounded-lg transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/auth/register"
                className="block w-full text-center bg-gradient-to-r from-accent-primary to-accent-secondary text-white px-4 py-2 rounded-lg font-semibold transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};