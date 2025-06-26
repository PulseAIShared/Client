// src/app/routes/app/insights/insights.tsx
import React from 'react';
import { ContentLayout } from '@/components/layouts';
import {
  InsightsHeader,
  ChurnPredictionCard,
  AnalyticsOverview,
  LTVAnalytics,
  DemographicInsights,
  RecoveryFlows
} from '@/features/insights/components';

export const InsightsRoute = () => {
  return (
    <ContentLayout>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <InsightsHeader />
        <AnalyticsOverview />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <ChurnPredictionCard />
          <LTVAnalytics />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
          <DemographicInsights />
          <RecoveryFlows />
        </div>

        <div className="bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-accent-primary/30 shadow-xl">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-text-primary mb-3 sm:mb-4">
              AI-Powered Recommendations
            </h3>
            <p className="text-text-secondary text-sm sm:text-base mb-4 sm:mb-6 max-w-3xl mx-auto">
              Based on your customer data and behavior patterns, our AI has identified key opportunities to reduce churn and increase lifetime value.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              <div className="bg-surface-secondary/50 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-border-primary/50">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-error/20 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-text-primary mb-1 sm:mb-2">High-Risk Alert</h4>
                <p className="text-text-secondary text-xs sm:text-sm mb-2 sm:mb-3">23 customers entering critical churn risk zone</p>
                <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-error/20 text-error-muted rounded-lg hover:bg-error/30 transition-colors text-xs sm:text-sm border border-error/30 w-full">
                  Launch Intervention
                </button>
              </div>

              <div className="bg-surface-secondary/50 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-border-primary/50">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-success/20 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-success-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-text-primary mb-1 sm:mb-2">Upsell Opportunity</h4>
                <p className="text-text-secondary text-xs sm:text-sm mb-2 sm:mb-3">156 customers ready for premium upgrade</p>
                <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-success/20 text-success-muted rounded-lg hover:bg-success/30 transition-colors text-xs sm:text-sm border border-success/30 w-full">
                  Create Campaign
                </button>
              </div>

              <div className="bg-surface-secondary/50 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-border-primary/50">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-text-primary mb-1 sm:mb-2">Feature Adoption</h4>
                <p className="text-text-secondary text-xs sm:text-sm mb-2 sm:mb-3">Push analytics feature to boost engagement</p>
                <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-accent-primary/20 text-accent-primary rounded-lg hover:bg-accent-primary/30 transition-colors text-xs sm:text-sm border border-accent-primary/30 w-full">
                  Send Tutorials
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-text-primary rounded-lg hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-semibold">
                Generate Full Report
              </button>
              <button className="px-6 py-3 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-secondary/70 transition-colors font-medium border border-border-primary/50">
                Schedule Weekly Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};