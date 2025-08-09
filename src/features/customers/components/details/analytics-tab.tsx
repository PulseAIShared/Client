import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CustomerDetailData } from "@/types/api";

interface CustomerAnalyticsTabProps {
  customer: CustomerDetailData;
  canEditCustomers: boolean;
}

export const CustomerAnalyticsTab: React.FC<CustomerAnalyticsTabProps> = ({ customer, canEditCustomers }) => {
  const engagementTrends = customer.analytics?.engagementTrends ?? [];
  const churnRiskTrend = customer.analytics?.churnRiskTrend ?? [];
  const keyMetrics = customer.analytics?.keyMetrics;
  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      {/* Enhanced Engagement Chart */}
      <div className="bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
        <h3 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-success to-success-muted mb-6 sm:mb-8">6-Month Engagement Trends</h3>
        {engagementTrends.length === 0 ? (
          <div className="p-4 sm:p-6 bg-surface-secondary/30 rounded-2xl border border-border-primary/30 text-text-muted">
            No engagement data yet. See Data Sources tab for recommended data actions to enable engagement analytics.
          </div>
        ) : (
          <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={engagementTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" />
              <XAxis dataKey="month" stroke="rgb(var(--text-muted))" fontSize={12} />
              <YAxis stroke="rgb(var(--text-muted))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(var(--surface-primary))', 
                  border: '1px solid rgb(var(--border-primary))',
                  borderRadius: '12px',
                  color: 'rgb(var(--text-primary))'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="engagement" 
                stroke="rgb(var(--accent-primary))" 
                fill="rgb(var(--accent-primary))" 
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Enhanced Churn Risk Trend */}
      <div className="bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
        <h3 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-warning to-error mb-6 sm:mb-8">Churn Risk Trend</h3>
        {churnRiskTrend.length === 0 ? (
          <div className="p-4 sm:p-6 bg-surface-secondary/30 rounded-2xl border border-border-primary/30 text-text-muted">
            No churn risk trend yet. See Data Sources tab for recommended data actions to enable churn analytics.
          </div>
        ) : (
          <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={churnRiskTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" />
              <XAxis dataKey="month" stroke="rgb(var(--text-muted))" fontSize={12} />
              <YAxis stroke="rgb(var(--text-muted))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(var(--surface-primary))', 
                  border: '1px solid rgb(var(--border-primary))',
                  borderRadius: '12px',
                  color: 'rgb(var(--text-primary))'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="riskScore" 
                stroke="rgb(var(--error))" 
                strokeWidth={3}
                dot={{ fill: 'rgb(var(--error))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'rgb(var(--error))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="group relative bg-surface-secondary/30 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-border-primary/30 hover:bg-surface-secondary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-accent-primary/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-text-muted uppercase tracking-wider">Login Frequency</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-accent-primary">{keyMetrics?.loginFrequencyPerMonth ?? '—'}</div>
            <div className="text-sm text-text-muted">logins per month</div>
          </div>
        </div>

        <div className="group relative bg-surface-secondary/30 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-border-primary/30 hover:bg-surface-secondary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-success/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-semibold text-text-muted uppercase tracking-wider">Feature Usage</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-success">{keyMetrics?.featureUsagePercent != null ? `${keyMetrics.featureUsagePercent}%` : '—'}</div>
            <div className="text-sm text-text-muted">of available features</div>
          </div>
        </div>

        <div className="group relative bg-surface-secondary/30 backdrop-blur-lg p-4 sm:p-6 rounded-2xl border border-border-primary/30 hover:bg-surface-secondary/50 transition-all duration-300 shadow-lg hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-warning/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
              </svg>
              <span className="text-sm font-semibold text-text-muted uppercase tracking-wider">Support Tickets</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-warning">{keyMetrics?.supportTicketsLast30Days ?? '—'}</div>
            <div className="text-sm text-text-muted">in last 30 days</div>
          </div>
        </div>
      </div>
    </div>
  );
};