import React from 'react';
import { Link } from 'react-router-dom';
import { ContentLayout } from '@/components/layouts';

export const GettingStartedDocsRoute = () => {
  return (
    <ContentLayout>
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 lg:space-y-10">
        {/* Enhanced Header */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 via-accent-secondary/10 to-accent-primary/10 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
          
          <div className="relative bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <Link
                    to="/app"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-surface-secondary/50 text-text-secondary rounded-xl hover:bg-surface-secondary/70 transition-all duration-300 border border-border-primary/30 hover:border-accent-primary/50 group"
                  >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                  </Link>
            
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary mb-2">
                    Getting Started with PulseLTV
                  </h1>
                  <p className="text-text-secondary text-lg sm:text-xl lg:text-2xl max-w-2xl">
                    Complete setup guide to unlock powerful customer analytics
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Overview */}
        <div className="relative bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 backdrop-blur-xl p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-accent-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #7c3aed 0%, transparent 50%), 
                               radial-gradient(circle at 75% 75%, #3b82f6 0%, transparent 50%)`,
            }}></div>
          </div>
          
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary mb-4 sm:mb-6">
              Welcome to PulseLTV! 🚀
            </h2>
            <p className="text-text-primary mb-6 sm:mb-8 text-lg sm:text-xl leading-relaxed">
              PulseLTV is your intelligent customer analytics platform that helps you predict churn, understand customer behavior, 
              and take proactive actions to improve retention. Follow this guide to get the most out of your setup.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <span className="px-4 py-2 bg-accent-primary/20 border border-accent-primary/30 rounded-full text-accent-primary text-sm font-semibold hover:bg-accent-primary/30 transition-all duration-300">
                Customer Analytics
              </span>
              <span className="px-4 py-2 bg-success/20 border border-success/30 rounded-full text-success text-sm font-semibold hover:bg-success/30 transition-all duration-300">
                Churn Prediction
              </span>
              <span className="px-4 py-2 bg-accent-secondary/20 border border-accent-secondary/30 rounded-full text-accent-secondary text-sm font-semibold hover:bg-accent-secondary/30 transition-all duration-300">
                Automated Playbooks
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Step 1: Data Setup */}
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-xl shadow-lg">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary mb-2">
                Step 1: Import Your Customer Data
              </h3>
              <p className="text-text-secondary text-lg">Get your customer information into PulseLTV</p>
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-10">
            <div className="flex items-start gap-4 sm:gap-6 p-4 sm:p-6 bg-surface-secondary/30 rounded-2xl border border-border-primary/30 hover:bg-surface-secondary/50 transition-all duration-300">
              <div className="p-2 sm:p-3 bg-accent-primary/20 rounded-xl">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-text-primary mb-2 text-lg">Option 1: CSV Upload</h4>
                <p className="text-text-secondary text-sm sm:text-base mb-4 leading-relaxed">
                  Upload your customer data via CSV file. Include fields like name, email, subscription info, 
                  revenue, and activity data for best results.
                </p>
                <Link
                  to="/app/customers"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl hover:shadow-lg hover:shadow-accent-primary/25 transform hover:-translate-y-0.5 transition-all duration-300 text-sm font-semibold"
                >
                  Import Customers
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-4 sm:gap-6 p-4 sm:p-6 bg-surface-secondary/30 rounded-2xl border border-border-primary/30 hover:bg-surface-secondary/50 transition-all duration-300">
              <div className="p-2 sm:p-3 bg-success/20 rounded-xl">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-success-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-text-primary mb-2 text-lg">Option 2: Connect Integrations</h4>
                <p className="text-text-secondary text-sm sm:text-base mb-4 leading-relaxed">
                  Sync data automatically from HubSpot, Stripe, and other platforms. 
                  This keeps your data fresh and reduces manual work.
                </p>
                <Link
                  to="/app/settings"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-success to-success-muted text-white rounded-xl hover:shadow-lg hover:shadow-success/25 transform hover:-translate-y-0.5 transition-all duration-300 text-sm font-semibold"
                >
                  Setup Integrations
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-surface-secondary/50 p-4 sm:p-6 rounded-2xl border border-border-primary/30 hover:bg-surface-secondary/70 transition-all duration-300">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="text-2xl sm:text-3xl">💡</div>
              <div>
                <h5 className="font-semibold text-text-primary text-sm sm:text-base mb-2">Pro Tip:</h5>
                <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                  For best churn prediction accuracy, include data like: subscription dates, payment history, 
                  login frequency, feature usage, support tickets, and customer lifetime value.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Step 2: Run Analysis */}
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-warning to-error rounded-xl shadow-lg">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-warning to-error mb-2">
                Step 2: Run Your First Churn Analysis
              </h3>
              <p className="text-text-secondary text-lg">Let AI analyze your customer data for churn risk</p>
            </div>
          </div>

          <p className="text-text-secondary mb-6 sm:mb-8 text-lg leading-relaxed">
            Once you have customer data in the system, run a churn analysis to identify at-risk customers. 
            Our AI model evaluates multiple factors to predict which customers are likely to churn.
          </p>

          <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-surface-secondary/30 rounded-xl hover:bg-surface-secondary/50 transition-all duration-300">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-accent-primary rounded-full"></div>
              <span className="text-text-primary font-medium">AI analyzes customer behavior patterns</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-surface-secondary/30 rounded-xl hover:bg-surface-secondary/50 transition-all duration-300">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-success rounded-full"></div>
              <span className="text-text-primary font-medium">Assigns risk scores (Low, Medium, High, Critical)</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-surface-secondary/30 rounded-xl hover:bg-surface-secondary/50 transition-all duration-300">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-accent-secondary rounded-full"></div>
              <span className="text-text-primary font-medium">Provides actionable recommendations</span>
            </div>
          </div>

          <Link
            to="/app/analytics/run-churn-analysis"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-warning to-error text-white rounded-xl hover:shadow-lg hover:shadow-warning/25 transform hover:-translate-y-0.5 transition-all duration-300 font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Run Churn Analysis
          </Link>
        </div>

        {/* Enhanced Step 3: Create Segments */}
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-accent-secondary to-accent-primary rounded-xl shadow-lg">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-secondary to-accent-primary mb-2">
                Step 3: Create Customer Segments
              </h3>
              <p className="text-text-secondary text-lg">Group customers by behavior and risk levels</p>
            </div>
          </div>

          <p className="text-text-secondary mb-6 sm:mb-8 text-lg leading-relaxed">
            Use segmentation to group customers with similar characteristics. This allows you to create 
            targeted retention strategies for different customer types.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10">
            <div className="bg-surface-secondary/50 p-4 sm:p-6 rounded-2xl border border-border-primary/30 hover:bg-surface-secondary/70 transition-all duration-300">
              <h5 className="font-semibold text-text-primary text-sm sm:text-base mb-2">High-Risk Customers</h5>
              <p className="text-text-secondary text-xs sm:text-sm">Target with immediate intervention playbooks</p>
            </div>
            <div className="bg-surface-secondary/50 p-4 sm:p-6 rounded-2xl border border-border-primary/30 hover:bg-surface-secondary/70 transition-all duration-300">
              <h5 className="font-semibold text-text-primary text-sm sm:text-base mb-2">Low-Engagement Users</h5>
              <p className="text-text-secondary text-xs sm:text-sm">Re-engage with feature education and onboarding</p>
            </div>
            <div className="bg-surface-secondary/50 p-4 sm:p-6 rounded-2xl border border-border-primary/30 hover:bg-surface-secondary/70 transition-all duration-300">
              <h5 className="font-semibold text-text-primary text-sm sm:text-base mb-2">High-Value Customers</h5>
              <p className="text-text-secondary text-xs sm:text-sm">Nurture with premium support and upselling</p>
            </div>
            <div className="bg-surface-secondary/50 p-4 sm:p-6 rounded-2xl border border-border-primary/30 hover:bg-surface-secondary/70 transition-all duration-300">
              <h5 className="font-semibold text-text-primary text-sm sm:text-base mb-2">New Customers</h5>
              <p className="text-text-secondary text-xs sm:text-sm">Optimize onboarding and early experience</p>
            </div>
          </div>

          <Link
            to="/app/segments"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-secondary to-accent-primary text-white rounded-xl hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-300 font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Create Segments
          </Link>
        </div>

        {/* Enhanced Step 4: Activate Playbooks */}
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-success to-success-muted rounded-xl shadow-lg">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-success to-success-muted mb-2">
                Step 4: Activate Retention Playbooks
              </h3>
              <p className="text-text-secondary text-lg">Take action with playbook-driven intervention</p>
            </div>
          </div>

          <p className="text-text-secondary mb-6 sm:mb-8 text-lg leading-relaxed">
            With your customer segments defined, create targeted playbooks to improve retention. 
            PulseLTV surfaces the right action for the right customer at the right time.
          </p>

          <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
            <div className="flex items-start gap-4 sm:gap-6 p-4 sm:p-6 bg-surface-secondary/30 rounded-2xl border border-border-primary/30 hover:bg-surface-secondary/50 transition-all duration-300">
              <div className="p-2 sm:p-3 bg-error/20 rounded-xl">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h5 className="font-semibold text-text-primary text-sm sm:text-base mb-1">Win-Back Playbooks</h5>
                <p className="text-text-secondary text-xs sm:text-sm">Re-engage churned or at-risk customers</p>
              </div>
            </div>
            <div className="flex items-start gap-4 sm:gap-6 p-4 sm:p-6 bg-surface-secondary/30 rounded-2xl border border-border-primary/30 hover:bg-surface-secondary/50 transition-all duration-300">
              <div className="p-2 sm:p-3 bg-accent-primary/20 rounded-xl">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h5 className="font-semibold text-text-primary text-sm sm:text-base mb-1">Upsell Opportunities</h5>
                <p className="text-text-secondary text-xs sm:text-sm">Trigger playbooks for customers ready to expand</p>
              </div>
            </div>
            <div className="flex items-start gap-4 sm:gap-6 p-4 sm:p-6 bg-surface-secondary/30 rounded-2xl border border-border-primary/30 hover:bg-surface-secondary/50 transition-all duration-300">
              <div className="p-2 sm:p-3 bg-success/20 rounded-xl">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-success-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h5 className="font-semibold text-text-primary text-sm sm:text-base mb-1">Loyalty Programs</h5>
                <p className="text-text-secondary text-xs sm:text-sm">Reward and retain your best customers</p>
              </div>
            </div>
          </div>

          <div className="bg-warning/10 border border-warning/30 p-4 sm:p-6 rounded-2xl mb-6 sm:mb-8">
            <p className="text-warning text-sm sm:text-base">
              <strong>Tip:</strong> Review playbook runs weekly to understand what actions worked and where
              to iterate.
            </p>
          </div>
        </div>

        {/* Enhanced What's Next */}
        <div className="relative bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 backdrop-blur-xl p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-accent-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #7c3aed 0%, transparent 50%), 
                               radial-gradient(circle at 75% 75%, #3b82f6 0%, transparent 50%)`,
            }}></div>
          </div>
          
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary mb-6 sm:mb-8">
              🎯 What's Next?
            </h2>
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-surface-secondary/30 rounded-xl hover:bg-surface-secondary/50 transition-all duration-300">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent-primary rounded-full mt-2"></div>
                <p className="text-text-secondary text-sm sm:text-base">
                  <strong className="text-text-primary">Monitor regularly:</strong> Check your dashboard weekly for new at-risk customers
                </p>
              </div>
              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-surface-secondary/30 rounded-xl hover:bg-surface-secondary/50 transition-all duration-300">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent-secondary rounded-full mt-2"></div>
                <p className="text-text-secondary text-sm sm:text-base">
                  <strong className="text-text-primary">Refine segments:</strong> Update your customer segments as you learn more about behavior patterns
                </p>
              </div>
              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-surface-secondary/30 rounded-xl hover:bg-surface-secondary/50 transition-all duration-300">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-success rounded-full mt-2"></div>
                <p className="text-text-secondary text-sm sm:text-base">
                  <strong className="text-text-primary">Track results:</strong> Monitor how your retention efforts impact churn rates over time
                </p>
              </div>
              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-surface-secondary/30 rounded-xl hover:bg-surface-secondary/50 transition-all duration-300">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-info rounded-full mt-2"></div>
                <p className="text-text-secondary text-sm sm:text-base">
                  <strong className="text-text-primary">Stay updated:</strong> New features and integrations are added regularly
                </p>
              </div>
            </div>

            <div className="border-t border-border-primary/50 pt-6 sm:pt-8">
              <p className="text-text-secondary text-sm sm:text-base">
                Need help? Check our documentation or contact support for personalized assistance with your setup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};
