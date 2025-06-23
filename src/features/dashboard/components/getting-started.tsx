import React from 'react';
import { Link } from 'react-router-dom';

export const GettingStarted = () => {
  return (
    <div className="space-y-8">
      {/* Main welcome card */}
      <div className="relative bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 backdrop-blur-lg p-8 rounded-2xl border border-accent-primary/30 shadow-xl overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgb(var(--accent-secondary)) 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, rgb(var(--accent-primary)) 0%, transparent 50%)`,
          }}></div>
        </div>

        <div className="relative text-center">
          <div className="inline-flex items-center gap-2 bg-accent-primary/20 backdrop-blur-sm px-4 py-2 rounded-full border border-accent-primary/30 mb-6">
            <div className="w-2 h-2 bg-success-muted rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-accent-primary">Welcome to PulseLTV</span>
          </div>

          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Ready to predict and prevent churn?
          </h1>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            Get started by importing your customer data or connecting your integrations to unlock powerful AI-driven insights.
          </p>
        </div>
      </div>

      {/* Action cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import customers card */}
        <Link 
          to="/app/customers"
          className="group block"
        >
          <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg hover:shadow-xl hover:border-accent-primary/50 transition-all duration-300 h-full">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-accent-primary to-info rounded-xl">
                <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-text-primary mb-2 group-hover:text-accent-primary transition-colors">
                  Import Customer Data
                </h3>
                <p className="text-text-muted text-sm mb-4">
                  Upload CSV files with your customer information to get started with churn analysis.
                </p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-3 text-text-secondary text-sm">
                <div className="w-1.5 h-1.5 bg-accent-primary rounded-full"></div>
                <span>CSV upload with guided mapping</span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary text-sm">
                <div className="w-1.5 h-1.5 bg-info-muted rounded-full"></div>
                <span>Automatic data validation</span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary text-sm">
                <div className="w-1.5 h-1.5 bg-success-muted rounded-full"></div>
                <span>Sample template provided</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-accent-primary font-medium group-hover:text-accent-primary/80 transition-colors">
                Get Started →
              </span>
              <div className="text-xs text-text-muted">Recommended</div>
            </div>
          </div>
        </Link>

        {/* Connect integrations card */}
        <Link 
          to="/app/settings"
          className="group block"
        >
          <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg hover:shadow-xl hover:border-success/50 transition-all duration-300 h-full">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-success-bg to-success rounded-xl">
                <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-text-primary mb-2 group-hover:text-success-muted transition-colors">
                  Connect Integrations
                </h3>
                <p className="text-text-muted text-sm mb-4">
                  Sync data automatically from HubSpot, Stripe, and other platforms.
                </p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-3 text-text-secondary text-sm">
                <div className="w-1.5 h-1.5 bg-success-muted rounded-full"></div>
                <span>Real-time data synchronization</span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary text-sm">
                <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
                <span>Multiple platform support</span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary text-sm">
                <div className="w-1.5 h-1.5 bg-accent-primary rounded-full"></div>
                <span>Automated data mapping</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-success-muted font-medium group-hover:text-success transition-colors">
                Setup Now →
              </span>
              <div className="text-xs text-text-muted">Advanced</div>
            </div>
          </div>
        </Link>
      </div>

      {/* What's next section */}
      <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-gradient-to-r from-accent-secondary to-accent-secondary rounded-xl">
            <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-text-primary mb-2">What happens next?</h3>
            <p className="text-text-muted text-sm mb-6">
              Once you have customer data in PulseLTV, you'll unlock powerful features for retention and growth.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-surface-primary/50 p-4 rounded-xl border border-border-primary/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-warning/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-warning-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-text-primary text-sm">Run Churn Analysis</h4>
            </div>
            <p className="text-xs text-text-muted">
              AI analyzes customer behavior to identify at-risk users with actionable insights.
            </p>
          </div>

          <div className="bg-surface-primary/50 p-4 rounded-xl border border-border-primary/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-accent-secondary/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-text-primary text-sm">Create Segments</h4>
            </div>
            <p className="text-xs text-text-muted">
              Group customers by behavior, risk level, and value for targeted strategies.
            </p>
          </div>

          <div className="bg-surface-primary/50 p-4 rounded-xl border border-border-primary/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-success-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-text-primary text-sm">Launch Campaigns</h4>
            </div>
            <p className="text-xs text-text-muted">
              Execute targeted retention campaigns based on customer segments and risk scores.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border-primary/50">
          <Link 
            to="/app/docs/getting-started"
            className="inline-flex items-center gap-2 text-sm text-accent-primary hover:text-accent-primary/80 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            View Complete Setup Guide
          </Link>
          <div className="text-xs text-text-muted">
            Take the full tour →
          </div>
        </div>
      </div>
    </div>
  );
};