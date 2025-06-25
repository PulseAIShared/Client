import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Code } from '@mantine/core';
import { useTheme } from '@/lib/theme-context';

export const LandingNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toggleTheme } = useTheme();

  const Logo = () => {
    return (
      <Link className="flex items-center gap-2" to="/">
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          PulseLTV
        </span>
        <Code fw={700} className="text-xs bg-purple-400/20 text-purple-400 border border-purple-400/30">
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
    <nav className="fixed inset-x-0 top-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700/50 shadow-sm">
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
                  className="text-slate-200 hover:text-white transition-colors duration-200 font-medium"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Right Side - Theme Toggle & CTAs */}
          <div className="hidden md:flex items-center space-x-4">
   
            {/* Sign In */}
            <Link
              to="/login"
              className="text-slate-200 hover:text-white font-medium transition-colors duration-200"
            >
              Sign In
            </Link>

            {/* Get Started CTA */}
            <Link
              to="/book-demo"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Book Demo
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800/50 transition-all"
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
            

            
            {/* Mobile CTAs */}
            <div className="px-3 pt-4 space-y-2">
              <Link
                to="/login"
                className="block w-full text-center px-4 py-2 text-text-secondary hover:text-text-primary border border-border-primary rounded-lg transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/register"
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