import { CustomerDetailData, formatCurrency } from "@/types/api";
import { calculateTenure, formatDate, getPaymentStatusName, getPlanName, getRiskColor, getSubscriptionStatusName } from "@/utils/customer-helpers";
import { CompanyAuthorization } from '@/lib/authorization';

interface CustomerOverviewTabProps {
  customer: CustomerDetailData;
  canEditCustomers: boolean;
}

export const CustomerOverviewTab: React.FC<CustomerOverviewTabProps> = ({ customer, canEditCustomers }) => {
  const tenure = calculateTenure(customer.subscriptionStartDate);

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      {/* Enhanced Customer Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="group relative bg-surface-secondary/30 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-border-primary/30 hover:bg-surface-secondary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-accent-primary/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-text-muted uppercase tracking-wider">Tenure</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-text-primary">{tenure}</div>
            <div className="text-sm text-text-muted">months</div>
          </div>
        </div>

        <div className="group relative bg-surface-secondary/30 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-border-primary/30 hover:bg-surface-secondary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-success/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span className="text-sm font-semibold text-text-muted uppercase tracking-wider">Lifetime Value</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-success">{formatCurrency(customer.lifetimeValue)}</div>
            <div className="text-sm text-text-muted">total revenue</div>
          </div>
        </div>

        <div className="group relative bg-surface-secondary/30 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-border-primary/30 hover:bg-surface-secondary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-secondary/5 to-accent-secondary/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span className="text-sm font-semibold text-text-muted uppercase tracking-wider">Plan Type</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-accent-secondary">{customer.display?.planName || (customer as any).planDisplay || getPlanName(customer.plan)}</div>
            <div className="text-sm text-text-muted">subscription</div>
          </div>
        </div>

        <div className="group relative bg-surface-secondary/30 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-border-primary/30 hover:bg-surface-secondary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-warning/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-text-muted uppercase tracking-wider">Monthly Revenue</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-warning">
              {formatCurrency(customer.monthlyRecurringRevenue)}
            </div>
            <div className="text-sm text-text-muted">per month</div>
          </div>
        </div>
      </div>

      {/* Enhanced Customer Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Enhanced Basic Information */}
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
          <h3 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary mb-6 flex items-center gap-3">
            <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Customer Information
          </h3>
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-surface-secondary/30 rounded-xl hover:bg-surface-secondary/50 transition-all duration-300 min-w-0">
                <span className="text-text-secondary font-medium flex-shrink-0 mr-3">Email</span>
                <span className="text-text-primary font-semibold truncate max-w-[60%]" title={customer.email}>{customer.email}</span>
              </div>
              <div className="flex items-center justify-between p-3 sm:p-4 bg-surface-secondary/30 rounded-xl hover:bg-surface-secondary/50 transition-all duration-300">
                <span className="text-text-secondary font-medium">Phone</span>
                <span className="text-text-primary font-semibold">{customer.phone || 'Not provided'}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 sm:p-4 bg-surface-secondary/30 rounded-xl hover:bg-surface-secondary/50 transition-all duration-300">
              <span className="text-text-secondary font-medium">Company</span>
              <span className="text-text-primary font-semibold">{customer.companyName || 'Not provided'}</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-surface-secondary/30 rounded-xl hover:bg-surface-secondary/50 transition-all duration-300">
                <span className="text-text-secondary font-medium">Job Title</span>
                <span className="text-text-primary font-semibold">{customer.jobTitle || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between p-3 sm:p-4 bg-surface-secondary/30 rounded-xl hover:bg-surface-secondary/50 transition-all duration-300">
                <span className="text-text-secondary font-medium">Location</span>
                <span className="text-text-primary font-semibold">{customer.location || customer.country || 'Not provided'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-surface-secondary/30 rounded-xl hover:bg-surface-secondary/50 transition-all duration-300">
                <span className="text-text-secondary font-medium">Subscription Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  customer.subscriptionStatus === 1 
                    ? 'text-success bg-success/20 border-success/30'
                    : customer.subscriptionStatus === 2
                    ? 'text-error bg-error/20 border-error/30'
                    : 'text-warning bg-warning/20 border-warning/30'
                }`}>
                  {getSubscriptionStatusName(customer.subscriptionStatus)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 sm:p-4 bg-surface-secondary/30 rounded-xl hover:bg-surface-secondary/50 transition-all duration-300">
                <span className="text-text-secondary font-medium">Payment Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  customer.paymentStatus === 0
                    ? 'text-success bg-success/20 border-success/30'
                    : 'text-error bg-error/20 border-error/30'
                }`}>
                  {getPaymentStatusName(customer.paymentStatus)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Churn Risk Assessment */}
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
          <h3 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-warning to-error mb-6">Churn Risk Assessment</h3>
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary font-medium">Current Risk Score</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRiskColor(customer.churnRiskScore)}`}>
                {Math.round(customer.churnRiskScore)}%
              </span>
            </div>
            <div className="w-full bg-surface-secondary/50 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 shadow-lg ${
                  customer.churnRiskScore >= 80 ? 'bg-gradient-to-r from-error to-error-muted' :
                  customer.churnRiskScore >= 60 ? 'bg-gradient-to-r from-warning to-warning-muted' :
                  customer.churnRiskScore >= 40 ? 'bg-gradient-to-r from-warning to-warning-muted' :
                  'bg-gradient-to-r from-success to-success-muted'
                }`}
                style={{ width: `${customer.churnRiskScore}%` }}
              />
            </div>
            
            <div className="space-y-3 sm:space-y-4 mt-6">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-surface-secondary/30 rounded-xl hover:bg-surface-secondary/50 transition-all duration-300">
                <span className="text-text-secondary font-medium">Activity Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  customer.quickMetrics?.activityStatus === 'Active'
                    ? 'text-success bg-success/20 border-success/30'
                    : customer.quickMetrics?.activityStatus === 'Low'
                    ? 'text-warning bg-warning/20 border-warning/30'
                    : 'text-error bg-error/20 border-error/30'
                }`}>
                  {customer.quickMetrics?.activityStatus || 'Unknown'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 sm:p-4 bg-surface-secondary/30 rounded-xl hover:bg-surface-secondary/50 transition-all duration-300">
                <span className="text-text-secondary font-medium">Last Activity</span>
                <span className="text-text-secondary font-medium">
                  {customer.lastLoginDate ? formatDate(customer.lastLoginDate) : 'No recent activity'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 sm:p-4 bg-surface-secondary/30 rounded-xl hover:bg-surface-secondary/50 transition-all duration-300">
                <span className="text-text-secondary font-medium">Support Tickets</span>
                <span className="text-text-secondary font-medium">{customer.supportTicketCount} total</span>
              </div>

              <div className="flex items-center justify-between p-3 sm:p-4 bg-surface-secondary/30 rounded-xl hover:bg-surface-secondary/50 transition-all duration-300">
                <span className="text-text-secondary font-medium">Feature Usage</span>
                <span className="text-text-secondary font-medium">{customer.featureUsagePercentage}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced AI Recommendations */}
      <CompanyAuthorization
        policyCheck={canEditCustomers}
        forbiddenFallback={
          <div className="bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary mb-6">AI Recommendations</h3>
            <div className="p-6 bg-surface-secondary/30 rounded-2xl border border-border-primary/30 text-center">
              <p className="text-text-muted text-lg">Staff or Owner permissions required to view AI recommendations</p>
            </div>
          </div>
        }
      >
        <div className="bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
          <h3 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary mb-6">AI Recommendations</h3>
        <div className="space-y-4 sm:space-y-6">
          {customer.churnRiskScore >= 70 ? (
            <>
              <div className="p-4 sm:p-6 bg-error/20 rounded-2xl border border-error/30 hover:bg-error/30 transition-all duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-error font-semibold text-lg">Immediate Action Required</span>
                </div>
                <p className="text-error-muted text-sm sm:text-base">Customer is at critical risk. Recommend personal outreach within 24 hours.</p>
              </div>
              <div className="p-4 sm:p-6 bg-info/20 rounded-2xl border border-blue-500/30 hover:bg-info/30 transition-all duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-accent-primary font-semibold text-lg">Recovery Campaign</span>
                </div>
                <p className="text-info-muted text-sm sm:text-base">Launch personalized re-engagement campaign with special offer.</p>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 sm:p-6 bg-success/20 rounded-2xl border border-success/30 hover:bg-success/30 transition-all duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-success font-semibold text-lg">Upsell Opportunity</span>
                </div>
                <p className="text-success-muted text-sm sm:text-base">Customer shows good engagement and may be ready for premium features.</p>
              </div>
              <div className="p-4 sm:p-6 bg-accent-secondary/20 rounded-2xl border border-accent-secondary/30 hover:bg-accent-secondary/30 transition-all duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-accent-secondary font-semibold text-lg">Feature Adoption</span>
                </div>
                <p className="text-accent-secondary text-sm sm:text-base">Introduce advanced analytics features to increase engagement.</p>
              </div>
            </>
          )}
          

        </div>
        </div>
      </CompanyAuthorization>
    </div>
  );
};