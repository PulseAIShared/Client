import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';
import { useGetInsightsData } from '@/features/insights/api/insights';

export const AnalyticsOverview = () => {
  const { data: insights, isLoading, error } = useGetInsightsData();

  if (isLoading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        {/* Enhanced KPI Cards Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg animate-pulse">
              <div className="h-4 bg-surface-secondary/50 rounded-xl mb-3 w-3/4"></div>
              <div className="h-8 bg-surface-secondary/50 rounded-xl mb-2"></div>
              <div className="h-3 bg-surface-secondary/50 rounded-xl w-1/2"></div>
            </div>
          ))}
        </div>

        {/* Enhanced Chart Loading */}
        <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg animate-pulse">
          <div className="h-6 bg-surface-secondary/50 rounded-xl mb-6 w-1/3"></div>
          <div className="h-80 bg-surface-secondary/50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-error/20 to-error-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="text-error-muted font-medium mb-2">Failed to load revenue analytics</div>
          <div className="text-sm text-text-muted mb-4">Please try refreshing the page</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error-muted transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { revenueData, kpiData } = insights.analyticsOverview;

  const isKpiEmpty = !kpiData || kpiData.length === 0;
  const isRevenueEmpty = !revenueData || revenueData.length === 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* KPI Cards or Empty State */}
      {isKpiEmpty ? (
        <div className="bg-surface-primary/80 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 text-center">
          <div className="text-lg font-semibold text-text-primary mb-2">Not enough data yet</div>
          <div className="text-sm text-text-muted mb-4">Connect billing and analytics sources to see KPIs.</div>
          <button className="px-4 py-2 rounded-lg border border-border-primary/30 hover:bg-surface-secondary/50">Connect Data Sources</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {kpiData.map((kpi, index) => (
            <div key={index} className="group bg-surface-primary/80 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">{kpi.metric}</h3>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  kpi.trend === 'up' ? 'text-success-muted' : 'text-error-muted'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d={kpi.trend === 'up' ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                  </svg>
                  <span>{kpi.change}</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-text-primary mb-1">{kpi.value}</div>
              <div className="text-sm text-text-muted">vs previous period</div>
            </div>
          ))}
        </div>
      )}

      {/* Revenue Chart or Empty State */}
      {isRevenueEmpty ? (
        <div className="bg-surface-primary/80 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 text-center">
          <div className="text-lg font-semibold text-text-primary mb-2">No revenue analytics yet</div>
          <div className="text-sm text-text-muted mb-4">Once revenue and recovery data sync, we’ll show trends here.</div>
          <button className="px-4 py-2 rounded-lg border border-border-primary/30 hover:bg-surface-secondary/50">Set up Revenue Tracking</button>
        </div>
      ) : (
        <div className="bg-surface-primary/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">Revenue Analytics</h2>
              <p className="text-sm sm:text-base text-text-muted">Monthly revenue, recovery, and churn trends</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gradient-to-r from-accent-primary/30 to-accent-secondary/30 text-accent-primary rounded-xl text-sm font-medium border border-accent-primary/30 shadow-lg">
                6M
              </button>
              <button className="px-4 py-2 bg-surface-secondary/50 text-text-secondary rounded-xl text-sm font-medium border border-border-primary/30 hover:bg-surface-secondary/80 transition-colors">
                1Y
              </button>
              <button className="px-4 py-2 bg-surface-secondary/50 text-text-secondary rounded-xl text-sm font-medium border border-border-primary/30 hover:bg-surface-secondary/80 transition-colors">
                All
              </button>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  stroke="rgb(var(--text-muted))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="rgb(var(--text-muted))"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--surface-primary)', 
                    border: '1px solid var(--border-primary)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="rgb(var(--accent-primary))" 
                  fill="url(#revenueGradient)"
                  strokeWidth={3}
                  name="Revenue"
                />
                <Area 
                  type="monotone" 
                  dataKey="recovery" 
                  stroke="rgb(var(--success-muted))" 
                  fill="url(#recoveryGradient)"
                  strokeWidth={3}
                  name="Recovery"
                />
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(var(--accent-primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="rgb(var(--accent-primary))" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="recoveryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(var(--success-muted))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="rgb(var(--success-muted))" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};