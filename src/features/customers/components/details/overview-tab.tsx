import { CustomerDetailData, formatCurrency } from "@/types/api";
import { calculateTenure, formatDate, getPaymentStatusName, getPlanName, getRiskColor, getSubscriptionStatusName } from "@/utils/customer-helpers";


interface CustomerOverviewTabProps {
  customer: CustomerDetailData;
}

export const CustomerOverviewTab: React.FC<CustomerOverviewTabProps> = ({ customer }) => {
  const tenure = calculateTenure(customer.subscriptionStartDate);

  return (
    <div className="space-y-8">
      {/* Customer Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-700/30 backdrop-blur-lg p-6 rounded-xl border border-slate-600/50">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-slate-400">Tenure</span>
          </div>
          <div className="text-2xl font-bold text-white">{tenure}</div>
          <div className="text-sm text-slate-400">months</div>
        </div>

        <div className="bg-slate-700/30 backdrop-blur-lg p-6 rounded-xl border border-slate-600/50">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span className="text-sm font-medium text-slate-400">Lifetime Value</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{formatCurrency(customer.lifetimeValue)}</div>
          <div className="text-sm text-slate-400">total revenue</div>
        </div>

        <div className="bg-slate-700/30 backdrop-blur-lg p-6 rounded-xl border border-slate-600/50">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span className="text-sm font-medium text-slate-400">Plan Type</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">{getPlanName(customer.plan)}</div>
          <div className="text-sm text-slate-400">subscription</div>
        </div>

        <div className="bg-slate-700/30 backdrop-blur-lg p-6 rounded-xl border border-slate-600/50">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-slate-400">Monthly Revenue</span>
          </div>
          <div className="text-2xl font-bold text-orange-400">
            {formatCurrency(customer.monthlyRecurringRevenue)}
          </div>
          <div className="text-sm text-slate-400">per month</div>
        </div>
      </div>

      {/* Customer Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Customer Information
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">Email</span>
                <span className="text-white font-medium">{customer.email}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">Phone</span>
                <span className="text-white font-medium">{customer.phone || 'Not provided'}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <span className="text-slate-300">Company</span>
              <span className="text-white font-medium">{customer.companyName || 'Not provided'}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">Job Title</span>
                <span className="text-white font-medium">{customer.jobTitle || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">Location</span>
                <span className="text-white font-medium">{customer.location || customer.country || 'Not provided'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">Subscription Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                  customer.subscriptionStatus === 1 
                    ? 'text-green-400 bg-green-500/20 border-green-500/30'
                    : customer.subscriptionStatus === 2
                    ? 'text-red-400 bg-red-500/20 border-red-500/30'
                    : 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
                }`}>
                  {getSubscriptionStatusName(customer.subscriptionStatus)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">Payment Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                  customer.paymentStatus === 0
                    ? 'text-green-400 bg-green-500/20 border-green-500/30'
                    : 'text-red-400 bg-red-500/20 border-red-500/30'
                }`}>
                  {getPaymentStatusName(customer.paymentStatus)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Churn Risk Assessment */}
        <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-4">Churn Risk Assessment</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Current Risk Score</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(customer.churnRiskScore)}`}>
                {Math.round(customer.churnRiskScore)}%
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  customer.churnRiskScore >= 80 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                  customer.churnRiskScore >= 60 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                  customer.churnRiskScore >= 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                  'bg-gradient-to-r from-green-500 to-green-600'
                }`}
                style={{ width: `${customer.churnRiskScore}%` }}
              />
            </div>
            
            <div className="space-y-3 mt-6">
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">Activity Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                  customer.quickMetrics.activityStatus === 'Active'
                    ? 'text-green-400 bg-green-500/20 border-green-500/30'
                    : customer.quickMetrics.activityStatus === 'Low'
                    ? 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
                    : 'text-red-400 bg-red-500/20 border-red-500/30'
                }`}>
                  {customer.quickMetrics.activityStatus}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">Last Activity</span>
                <span className="text-slate-300">
                  {customer.lastLoginDate ? formatDate(customer.lastLoginDate) : 'No recent activity'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">Support Tickets</span>
                <span className="text-slate-300">{customer.supportTicketCount} total</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <span className="text-slate-300">Feature Usage</span>
                <span className="text-slate-300">{customer.featureUsagePercentage}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-4">AI Recommendations</h3>
        <div className="space-y-4">
          {customer.churnRiskScore >= 70 ? (
            <>
              <div className="p-4 bg-red-600/20 rounded-lg border border-red-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-400 font-medium">Immediate Action Required</span>
                </div>
                <p className="text-red-300 text-sm">Customer is at critical risk. Recommend personal outreach within 24 hours.</p>
              </div>
              <div className="p-4 bg-blue-600/20 rounded-lg border border-blue-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-blue-400 font-medium">Recovery Campaign</span>
                </div>
                <p className="text-blue-300 text-sm">Launch personalized re-engagement campaign with special offer.</p>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 bg-green-600/20 rounded-lg border border-green-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-400 font-medium">Upsell Opportunity</span>
                </div>
                <p className="text-green-300 text-sm">Customer shows good engagement and may be ready for premium features.</p>
              </div>
              <div className="p-4 bg-purple-600/20 rounded-lg border border-purple-500/30">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-purple-400 font-medium">Feature Adoption</span>
                </div>
                <p className="text-purple-300 text-sm">Introduce advanced analytics features to increase engagement.</p>
              </div>
            </>
          )}
          
          {/* Recommended Actions from Data Quality */}
          {customer.dataQuality.recommendedActions && customer.dataQuality.recommendedActions.length > 0 && (
            <div className="p-4 bg-yellow-600/20 rounded-lg border border-yellow-500/30">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-yellow-400 font-medium">Data Quality Recommendations</span>
              </div>
              <div className="space-y-1">
                {customer.dataQuality.recommendedActions.map((action, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-yellow-300 text-sm">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};