import React from 'react';
import { CustomerDetailData, formatCurrency } from '@/types/api';
import { calculateTenure, formatDate, getPaymentStatusName, getPlanName, getRiskColor, getSubscriptionStatusName } from '@/utils/customer-helpers';
import { CompanyAuthorization } from '@/lib/authorization';

interface CustomerOverviewTabProps {
  customer: CustomerDetailData;
  canEditCustomers: boolean;
}

const formatValue = (value?: string | number | null, fallback = 'N/A') => {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return fallback;
  }

  return value;
};

const formatPercent = (value?: number | null) => {
  if (value == null || Number.isNaN(value)) {
    return 'N/A';
  }

  return `${value.toFixed(1)}%`;
};

export const CustomerOverviewTab: React.FC<CustomerOverviewTabProps> = ({ customer, canEditCustomers }) => {
  const currency = customer.currency ?? 'USD';
  const planName = customer.display?.planName ?? customer.planDisplay ?? getPlanName(customer.plan);
  const subscriptionStatus = customer.subscriptionStatusDisplay ?? customer.display?.subscriptionStatusName ?? getSubscriptionStatusName(customer.subscriptionStatus);
  const paymentStatus = customer.paymentStatusDisplay ?? customer.display?.paymentStatusName ?? getPaymentStatusName(customer.paymentStatus);
  const tenureMonths = customer.display?.tenureDisplay ?? customer.tenureDisplay ?? `${calculateTenure(customer.subscriptionStartDate)} months`;
  const riskBadge = getRiskColor(customer.churnRiskScore ?? 0);
  const churnRecommendations = customer.churnOverview?.recommendations ?? [];

  const profileRows = [
    { label: 'Email', value: customer.email },
    { label: 'Phone', value: customer.phone },
    { label: 'Company', value: customer.companyName },
    { label: 'Job Title', value: customer.jobTitle },
    { label: 'Location', value: customer.location ?? customer.country },
    { label: 'Time Zone', value: customer.timeZone },
    { label: 'Age', value: customer.age != null ? customer.age.toString() : null },
    { label: 'Gender', value: customer.gender },
  ].filter((row) => row.value);

  const billingRows = [
    { label: 'Plan', value: planName },
    { label: 'Subscription Status', value: subscriptionStatus },
    { label: 'Payment Status', value: paymentStatus },
    { label: 'Payment Method', value: customer.paymentMethodType ? customer.paymentMethodType.toUpperCase() : null },
    { label: 'Monthly Recurring Revenue', value: customer.formattedMRR ?? formatCurrency(customer.monthlyRecurringRevenue, currency) },
    { label: 'Lifetime Value', value: customer.formattedLTV ?? formatCurrency(customer.lifetimeValue, currency) },
    { label: 'Current Balance', value: customer.formattedBalance ?? formatCurrency(customer.currentBalance, currency) },
    { label: 'Subscription Start', value: customer.subscriptionStartDate ? formatDate(customer.subscriptionStartDate) : null },
    { label: 'Subscription End', value: customer.subscriptionEndDate ? formatDate(customer.subscriptionEndDate) : 'Active' },
    { label: 'Trial Window', value: customer.trialStartDate || customer.trialEndDate ? `${customer.trialStartDate ? formatDate(customer.trialStartDate) : 'N/A'} to ${customer.trialEndDate ? formatDate(customer.trialEndDate) : 'N/A'}` : null },
    { label: 'Next Billing', value: customer.nextBillingDisplay ?? (customer.nextBillingDate ? formatDate(customer.nextBillingDate) : 'N/A') },
    { label: 'Last Payment', value: customer.lastPaymentDisplay ?? (customer.lastPaymentDate ? formatDate(customer.lastPaymentDate) : 'No payments') },
    { label: 'Payment Failures', value: customer.paymentFailureCount != null ? customer.paymentFailureCount : null },
  ].filter((row) => row.value !== null && row.value !== undefined);

  const engagementRows = [
    { label: 'Activity Status', value: customer.activityStatus },
    { label: 'Weekly Login Frequency', value: customer.weeklyLoginFrequency != null ? `${customer.weeklyLoginFrequency}x / week` : null },
    { label: 'Feature Usage', value: customer.featureUsagePercentage != null ? formatPercent(customer.featureUsagePercentage) : null },
    { label: 'Last Login', value: customer.lastLoginDisplay ?? (customer.lastLoginDate ? formatDate(customer.lastLoginDate) : 'No logins recorded') },
    { label: 'Engagement Summary', value: customer.engagementSummary },
    { label: 'Support Tickets', value: customer.supportTicketCount != null ? customer.supportTicketCount : null },
    { label: 'Open Tickets', value: customer.openSupportTickets != null ? customer.openSupportTickets : null },
    { label: 'Has Recent Activity', value: customer.hasRecentActivity != null ? (customer.hasRecentActivity ? 'Yes' : 'No') : null },
    { label: 'Needs Attention', value: customer.needsAttention != null ? (customer.needsAttention ? 'Yes' : 'No') : null },
  ].filter((row) => row.value !== null && row.value !== undefined);

  const dataQualityRows = [
    { label: 'Quality Summary', value: customer.qualitySummary },
    { label: 'Data Completeness', value: customer.qualityMetrics?.completenessScore != null ? `${customer.qualityMetrics.completenessScore}%` : customer.quickMetrics?.dataCompletenessScore != null ? `${Math.round(customer.quickMetrics.dataCompletenessScore)}%` : null },
    { label: 'Data Freshness', value: customer.qualityMetrics?.dataFreshness ?? customer.dataSources?.quality?.dataFreshnessDisplay },
    { label: 'Has Multiple Sources', value: customer.quickMetrics?.hasMultipleSources != null ? (customer.quickMetrics.hasMultipleSources ? 'Yes' : 'No') : null },
    { label: 'Total Sources', value: customer.dataSources?.totalSources ?? customer.quickMetrics?.totalDataSources },
    { label: 'Last Data Sync', value: customer.qualityMetrics?.lastDataSync ? formatDate(customer.qualityMetrics.lastDataSync) : customer.quickMetrics?.lastDataSync ? formatDate(customer.quickMetrics.lastDataSync) : null },
    { label: 'Overall Health', value: customer.quickMetrics?.overallHealthScore },
  ].filter((row) => row.value);

  const qualityIssues = customer.dataQuality?.qualityIssues ?? [];
  const missingData = customer.qualityMetrics?.missingFields ?? customer.completeness?.missingDataCategories ?? [];
  const recommendedActions = [
    ...churnRecommendations,
    ...(customer.qualityMetrics?.recommendedActions ?? []),
    ...(customer.completeness?.recommendedActions ?? []),
    ...(customer.dataQuality?.recommendedActions ?? []),
  ];

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="group relative bg-surface-secondary/40 border border-border-primary/30 rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-error/10 via-error/5 to-error/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">Churn Risk</span>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-bold text-text-primary">{customer.churnRiskDisplay ?? formatPercent(customer.churnRiskScore)}</span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${riskBadge}`}>{customer.riskStatus ?? customer.display?.riskLevelName ?? 'Unknown'}</span>
            </div>
            <div className="text-sm text-text-secondary mt-4">
              Prediction {customer.churnPredictionDate ? formatDate(customer.churnPredictionDate) : 'not available'}
            </div>
          </div>
        </div>

        <div className="group relative bg-surface-secondary/40 border border-border-primary/30 rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-success/5 to-success/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">Revenue</span>
            <div className="mt-3 text-2xl sm:text-3xl font-bold text-text-primary">{customer.formattedLTV ?? formatCurrency(customer.lifetimeValue, currency)}</div>
            <div className="text-sm text-text-secondary mt-4">MRR {customer.formattedMRR ?? formatCurrency(customer.monthlyRecurringRevenue, currency)}</div>
          </div>
        </div>

        <div className="group relative bg-surface-secondary/40 border border-border-primary/30 rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-secondary/10 via-accent-secondary/5 to-accent-secondary/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">Subscription</span>
            <div className="mt-3 text-2xl sm:text-3xl font-bold text-text-primary">{planName}</div>
            <div className="text-sm text-text-secondary mt-4">Status {subscriptionStatus}</div>
          </div>
        </div>

        <div className="group relative bg-surface-secondary/40 border border-border-primary/30 rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 via-accent-primary/5 to-accent-primary/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">Engagement</span>
            <div className="mt-3 text-2xl sm:text-3xl font-bold text-text-primary">{customer.engagementSummary ?? `${customer.weeklyLoginFrequency ?? 0}x/week`}</div>
            <div className="text-sm text-text-secondary mt-4">Last login {customer.lastLoginDisplay ?? 'N/A'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-surface-primary/90 backdrop-blur-xl border border-border-primary/30 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-6">Customer Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profileRows.map((row) => (
              <div key={row.label} className="p-4 bg-surface-secondary/40 rounded-xl border border-border-primary/30">
                <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">{row.label}</span>
                <div className="text-lg font-semibold text-text-primary mt-2">{formatValue(row.value)}</div>
              </div>
            ))}
            <div className="p-4 bg-surface-secondary/40 rounded-xl border border-border-primary/30">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">Tenure</span>
              <div className="text-lg font-semibold text-text-primary mt-2">{tenureMonths}</div>
            </div>
          </div>
        </div>

        <div className="bg-surface-primary/90 backdrop-blur-xl border border-border-primary/30 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-6">Billing & Subscription</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {billingRows.map((row) => (
              <div key={row.label} className="p-4 bg-surface-secondary/40 rounded-xl border border-border-primary/30">
                <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">{row.label}</span>
                <div className="text-lg font-semibold text-text-primary mt-2">{formatValue(row.value)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-surface-primary/90 backdrop-blur-xl border border-border-primary/30 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-6">Engagement & Support</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {engagementRows.map((row) => (
              <div key={row.label} className="p-4 bg-surface-secondary/40 rounded-xl border border-border-primary/30">
                <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">{row.label}</span>
                <div className="text-lg font-semibold text-text-primary mt-2">{formatValue(row.value)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-primary/90 backdrop-blur-xl border border-border-primary/30 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-6">Data Quality</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dataQualityRows.map((row) => (
                <div key={row.label} className="p-4 bg-surface-secondary/40 rounded-xl border border-border-primary/30">
                  <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">{row.label}</span>
                  <div className="text-lg font-semibold text-text-primary mt-2">{formatValue(row.value)}</div>
                </div>
              ))}
            </div>
          </div>

          {(qualityIssues.length > 0 || missingData.length > 0) && (
            <div className="p-4 sm:p-6 bg-warning/10 border border-warning/30 rounded-2xl">
              <h4 className="text-lg font-semibold text-warning mb-3">Data Gaps Detected</h4>
              <div className="space-y-2">
                {qualityIssues.map((issue) => (
                  <div key={issue} className="flex items-start gap-2 text-sm text-warning">
                    <span className="mt-1 w-2 h-2 rounded-full bg-warning"></span>
                    <span>{issue}</span>
                  </div>
                ))}
                {missingData.map((missing) => (
                  <div key={missing} className="flex items-start gap-2 text-sm text-warning">
                    <span className="mt-1 w-2 h-2 rounded-full bg-warning"></span>
                    <span>{missing}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <CompanyAuthorization
        policyCheck={canEditCustomers}
        forbiddenFallback={
          <div className="bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl">
            <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-4">AI Recommendations</h3>
            <div className="p-6 bg-surface-secondary/40 border border-border-primary/30 rounded-2xl text-center text-text-muted">
              Staff or Owner permissions are required to view AI-driven recovery recommendations.
            </div>
          </div>
        }
      >
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl">
          <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-4">AI Recommendations</h3>
          {recommendedActions.length === 0 ? (
            <div className="p-6 bg-surface-secondary/40 border border-border-primary/30 rounded-2xl text-text-muted text-sm">
              No AI recommendations available at this time. Re-run churn analysis after additional activity or billing data has been collected.
            </div>
          ) : (
            <div className="space-y-3">
              {recommendedActions.map((action, index) => (
                <div key={`${action}-${index}`} className="flex items-start gap-3 p-4 bg-surface-secondary/40 border border-border-primary/30 rounded-2xl">
                  <div className="mt-1 w-2 h-2 bg-accent-primary rounded-full"></div>
                  <div className="text-sm text-text-secondary">{action}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CompanyAuthorization>
    </div>
  );
};

