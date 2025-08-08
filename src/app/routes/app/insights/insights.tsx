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
import { CompanyAuthorization, useAuthorization } from '@/lib/authorization';

export const InsightsRoute = () => {
  const { checkCompanyPolicy } = useAuthorization();
  const canViewAnalytics = checkCompanyPolicy('analytics:read');
  const canManageRecoveryFlows = checkCompanyPolicy('company:write');

  return (
    <CompanyAuthorization
      policyCheck={canViewAnalytics}
      forbiddenFallback={
        <ContentLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center bg-surface-primary/80 backdrop-blur-xl p-8 rounded-3xl border border-border-primary/50 shadow-2xl max-w-md">
              <div className="w-16 h-16 bg-gradient-to-br from-warning/20 to-warning-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-warning-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">Access Restricted</h2>
              <p className="text-text-muted">
                You need analytics read permissions to view insights. Please contact your company owner.
              </p>
            </div>
          </div>
        </ContentLayout>
      }
    >
      <ContentLayout>
        <div className="space-y-6 sm:space-y-8 lg:space-y-10">
          <InsightsHeader />
          <AnalyticsOverview />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
            <ChurnPredictionCard />
            <LTVAnalytics />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:gap-10">
            <DemographicInsights />
            <RecoveryFlows />
          </div>

          {/* Enhanced AI-Powered Recommendations */}
          <div className="bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 backdrop-blur-xl p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-accent-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="text-center">
   
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary mb-3 sm:mb-4">
                AI-Powered Recommendations
              </h3>
              <p className="text-text-secondary text-sm sm:text-base mb-6 sm:mb-8 max-w-3xl mx-auto">
                Based on your customer data and behavior patterns, our AI has identified key opportunities to reduce churn and increase lifetime value.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10">
                <div className="group bg-surface-primary/80 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-error/20 to-error-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold text-text-primary mb-2 sm:mb-3 text-center">High-Risk Alert</h4>
                  <p className="text-text-secondary text-sm sm:text-base mb-4 sm:mb-6 text-center">23 customers entering critical churn risk zone</p>
                  <CompanyAuthorization
                    policyCheck={canManageRecoveryFlows}
                    forbiddenFallback={
                      <div className="px-4 sm:px-6 py-2 sm:py-3 bg-surface-secondary/50 text-text-muted rounded-xl text-sm sm:text-base border border-border-primary/30 w-full cursor-not-allowed text-center">
                        View Only Access
                      </div>
                    }
                  >
                    <button className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-error/20 to-error-muted/20 text-error-muted rounded-xl hover:bg-error/30 transition-all duration-200 text-sm sm:text-base border border-error/30 font-medium hover:shadow-lg hover:shadow-error/25 transform hover:-translate-y-0.5">
                      Launch Intervention
                    </button>
                  </CompanyAuthorization>
                </div>

                <div className="group bg-surface-primary/80 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-success/20 to-success-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-success-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold text-text-primary mb-2 sm:mb-3 text-center">Upsell Opportunity</h4>
                  <p className="text-text-secondary text-sm sm:text-base mb-4 sm:mb-6 text-center">156 customers ready for premium upgrade</p>
                  <CompanyAuthorization
                    policyCheck={canManageRecoveryFlows}
                    forbiddenFallback={
                      <div className="px-4 sm:px-6 py-2 sm:py-3 bg-surface-secondary/50 text-text-muted rounded-xl text-sm sm:text-base border border-border-primary/30 w-full cursor-not-allowed text-center">
                        View Only Access
                      </div>
                    }
                  >
                    <button className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-success/20 to-success-muted/20 text-success-muted rounded-xl hover:bg-success/30 transition-all duration-200 text-sm sm:text-base border border-success/30 font-medium hover:shadow-lg hover:shadow-success/25 transform hover:-translate-y-0.5">
                      Create Campaign
                    </button>
                  </CompanyAuthorization>
                </div>

                <div className="group bg-surface-primary/80 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold text-text-primary mb-2 sm:mb-3 text-center">Feature Adoption</h4>
                  <p className="text-text-secondary text-sm sm:text-base mb-4 sm:mb-6 text-center">Push analytics feature to boost engagement</p>
                  <CompanyAuthorization
                    policyCheck={canManageRecoveryFlows}
                    forbiddenFallback={
                      <div className="px-4 sm:px-6 py-2 sm:py-3 bg-surface-secondary/50 text-text-muted rounded-xl text-sm sm:text-base border border-border-primary/30 w-full cursor-not-allowed text-center">
                        View Only Access
                      </div>
                    }
                  >
                    <button className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 text-accent-primary rounded-xl hover:bg-accent-primary/30 transition-all duration-200 text-sm sm:text-base border border-accent-primary/30 font-medium hover:shadow-lg hover:shadow-accent-primary/25 transform hover:-translate-y-0.5">
                      Send Tutorials
                    </button>
                  </CompanyAuthorization>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="group px-8 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-semibold flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate Full Report
                </button>
                <CompanyAuthorization
                  policyCheck={canManageRecoveryFlows}
                  forbiddenFallback={
                    <div className="px-8 py-3 bg-surface-secondary/50 text-text-muted rounded-xl font-medium border border-border-primary/30 cursor-not-allowed flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Schedule Weekly Review (Staff+ Only)
                    </div>
                  }
                >
                  <button className="group px-8 py-3 bg-surface-secondary/50 text-text-primary rounded-xl hover:bg-surface-primary/50 transition-all duration-200 font-medium border border-border-primary/30 hover:border-border-secondary hover:shadow-md flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Schedule Weekly Review
                  </button>
                </CompanyAuthorization>
              </div>
            </div>
          </div>
        </div>
      </ContentLayout>
    </CompanyAuthorization>
  );
};