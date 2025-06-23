import React from 'react';
import { Link } from 'react-router-dom';
import { ContentLayout } from '@/components/layouts';

export const GettingStartedDocsRoute = () => {
  return (
    <ContentLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 px-4 py-2 bg-surface-secondary/50 text-text-secondary rounded-lg hover:bg-surface-tertiary/50 transition-colors border border-border-primary/50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Getting Started with PulseLTV</h1>
            <p className="text-slate-400 text-lg">Complete setup guide to unlock powerful customer analytics</p>
          </div>
        </div>

        {/* Overview */}
        <div className="relative bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 backdrop-blur-lg p-8 rounded-2xl border border-accent-primary/30 shadow-xl overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #7c3aed 0%, transparent 50%), 
                               radial-gradient(circle at 75% 75%, #3b82f6 0%, transparent 50%)`,
            }}></div>
          </div>
          
          <div className="relative">
            <h2 className="text-2xl font-bold text-text-primary mb-4">Welcome to PulseLTV! 🚀</h2>
            <p className="text-text-primary mb-6 text-lg">
              PulseLTV is your intelligent customer analytics platform that helps you predict churn, understand customer behavior, 
              and take proactive actions to improve retention. Follow this guide to get the most out of your setup.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-accent-primary/20 border border-accent-primary/30 rounded-full text-accent-primary text-sm font-medium">
                Customer Analytics
              </span>
              <span className="px-4 py-2 bg-success/20 border border-success/30 rounded-full text-success text-sm font-medium">
                Churn Prediction
              </span>
              <span className="px-4 py-2 bg-accent-secondary/20 border border-accent-secondary/30 rounded-full text-accent-secondary text-sm font-medium">
                Automated Campaigns
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Data Setup */}
        <div className="bg-surface-primary/50 backdrop-blur-lg p-8 rounded-2xl border border-border-primary/50 shadow-lg">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl">
              <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">Step 1: Import Your Customer Data</h3>
              <p className="text-slate-400">Get your customer information into PulseLTV</p>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-text-primary mb-2">Option 1: CSV Upload</h4>
                <p className="text-slate-400 text-sm mb-3">
                  Upload your customer data via CSV file. Include fields like name, email, subscription info, 
                  revenue, and activity data for best results.
                </p>
                <Link
                  to="/app/customers"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-text-primary rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium"
                >
                  Import Customers
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <svg className="w-5 h-5 text-success-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-text-primary mb-2">Option 2: Connect Integrations</h4>
                <p className="text-slate-400 text-sm mb-3">
                  Sync data automatically from HubSpot, Stripe, and other platforms. 
                  This keeps your data fresh and reduces manual work.
                </p>
                <Link
                  to="/app/settings"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-success text-text-primary rounded-lg hover:bg-success/80 transition-colors text-sm font-medium"
                >
                  Setup Integrations
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-surface-secondary/50 p-4 rounded-xl border border-border-primary/30">
            <div className="flex items-start gap-3">
              <div className="text-xl">💡</div>
              <div>
                <h5 className="font-semibold text-text-primary text-sm mb-1">Pro Tip:</h5>
                <p className="text-slate-400 text-sm">
                  For best churn prediction accuracy, include data like: subscription dates, payment history, 
                  login frequency, feature usage, support tickets, and customer lifetime value.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Run Analysis */}
        <div className="bg-surface-primary/50 backdrop-blur-lg p-8 rounded-2xl border border-border-primary/50 shadow-lg">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-warning to-error rounded-xl">
              <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">Step 2: Run Your First Churn Analysis</h3>
              <p className="text-slate-400">Let AI analyze your customer data for churn risk</p>
            </div>
          </div>

          <p className="text-slate-400 mb-6">
            Once you have customer data in the system, run a churn analysis to identify at-risk customers. 
            Our AI model evaluates multiple factors to predict which customers are likely to churn.
          </p>

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-text-primary">AI analyzes customer behavior patterns</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-text-primary">Assigns risk scores (Low, Medium, High, Critical)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-text-primary">Provides actionable recommendations</span>
            </div>
          </div>

          <Link
            to="/app/analytics/run-churn-analysis"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-warning to-error text-text-primary rounded-lg hover:shadow-lg hover:shadow-warning/25 transform hover:-translate-y-0.5 transition-all duration-200 font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Run Churn Analysis
          </Link>
        </div>

        {/* Step 3: Create Segments */}
        <div className="bg-surface-primary/50 backdrop-blur-lg p-8 rounded-2xl border border-border-primary/50 shadow-lg">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-accent-secondary to-accent-primary rounded-xl">
              <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">Step 3: Create Customer Segments</h3>
              <p className="text-slate-400">Group customers by behavior and risk levels</p>
            </div>
          </div>

          <p className="text-slate-400 mb-6">
            Use segmentation to group customers with similar characteristics. This allows you to create 
            targeted retention strategies for different customer types.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-surface-secondary/50 p-4 rounded-xl border border-border-primary/30">
              <h5 className="font-semibold text-text-primary text-sm mb-1">High-Risk Customers</h5>
              <p className="text-slate-400 text-xs">Target with immediate intervention campaigns</p>
            </div>
            <div className="bg-surface-secondary/50 p-4 rounded-xl border border-border-primary/30">
              <h5 className="font-semibold text-text-primary text-sm mb-1">Low-Engagement Users</h5>
              <p className="text-slate-400 text-xs">Re-engage with feature education and onboarding</p>
            </div>
            <div className="bg-surface-secondary/50 p-4 rounded-xl border border-border-primary/30">
              <h5 className="font-semibold text-text-primary text-sm mb-1">High-Value Customers</h5>
              <p className="text-slate-400 text-xs">Nurture with premium support and upselling</p>
            </div>
            <div className="bg-surface-secondary/50 p-4 rounded-xl border border-border-primary/30">
              <h5 className="font-semibold text-text-primary text-sm mb-1">New Customers</h5>
              <p className="text-slate-400 text-xs">Optimize onboarding and early experience</p>
            </div>
          </div>

          <Link
            to="/app/segments"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-secondary to-accent-primary text-text-primary rounded-lg hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Create Segments
          </Link>
        </div>

        {/* Step 4: Launch Campaigns */}
        <div className="bg-surface-primary/50 backdrop-blur-lg p-8 rounded-2xl border border-border-primary/50 shadow-lg">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl">
              <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">Step 4: Launch Retention Campaigns</h3>
              <p className="text-slate-400">Take action with targeted customer outreach</p>
            </div>
          </div>

          <p className="text-slate-400 mb-6">
            With your customer segments defined, create targeted campaigns to improve retention. 
            PulseLTV helps you identify the right message for the right customer at the right time.
          </p>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <svg className="w-5 h-5 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h5 className="font-semibold text-text-primary text-sm mb-1">Win-Back Campaigns</h5>
                <p className="text-slate-400 text-xs">Re-engage churned or at-risk customers</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h5 className="font-semibold text-text-primary text-sm mb-1">Upsell Opportunities</h5>
                <p className="text-slate-400 text-xs">Identify customers ready for plan upgrades</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <svg className="w-5 h-5 text-success-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h5 className="font-semibold text-text-primary text-sm mb-1">Loyalty Programs</h5>
                <p className="text-slate-400 text-xs">Reward and retain your best customers</p>
              </div>
            </div>
          </div>

          <div className="bg-warning/10 border border-warning/30 p-4 rounded-xl mb-6">
            <p className="text-warning text-sm">
              <strong>Coming Soon:</strong> Campaign management features will be available in the next release. 
              For now, use the insights from PulseLTV to inform your manual outreach efforts.
            </p>
          </div>
        </div>

        {/* What's Next */}
        <div className="relative bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 backdrop-blur-lg p-8 rounded-2xl border border-accent-primary/30 shadow-xl overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #7c3aed 0%, transparent 50%), 
                               radial-gradient(circle at 75% 75%, #3b82f6 0%, transparent 50%)`,
            }}></div>
          </div>
          
          <div className="relative">
            <h2 className="text-2xl font-bold text-text-primary mb-6">🎯 What's Next?</h2>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                <p className="text-slate-300">
                  <strong className="text-text-primary">Monitor regularly:</strong> Check your dashboard weekly for new at-risk customers
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2"></div>
                <p className="text-slate-300">
                  <strong className="text-text-primary">Refine segments:</strong> Update your customer segments as you learn more about behavior patterns
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2"></div>
                <p className="text-slate-300">
                  <strong className="text-text-primary">Track results:</strong> Monitor how your retention efforts impact churn rates over time
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2"></div>
                <p className="text-slate-300">
                  <strong className="text-text-primary">Stay updated:</strong> New features and integrations are added regularly
                </p>
              </div>
            </div>

            <div className="border-t border-border-primary/50 pt-6">
              <p className="text-slate-400">
                Need help? Check our documentation or contact support for personalized assistance with your setup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};