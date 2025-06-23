import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';
import { useGetRevenueAnalytics } from '@/features/insights/api/insights';

export const AnalyticsOverview = () => {
  const { data, isLoading, error } = useGetRevenueAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* KPI Cards Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg animate-pulse">
              <div className="h-4 bg-surface-secondary rounded mb-3 w-3/4"></div>
              <div className="h-8 bg-surface-secondary rounded mb-2"></div>
              <div className="h-3 bg-surface-secondary rounded w-1/2"></div>
            </div>
          ))}
        </div>

        {/* Chart Loading */}
        <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg animate-pulse">
          <div className="h-6 bg-surface-secondary rounded mb-6 w-1/3"></div>
          <div className="h-80 bg-surface-secondary rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg">
        <div className="text-center py-8">
          <div className="text-error-muted mb-2">Failed to load revenue analytics</div>
          <div className="text-text-muted text-sm">Please try refreshing the page</div>
        </div>
      </div>
    );
  }

  const { revenueData, kpiData } = data;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <div key={index} className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
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

      {/* Revenue Analytics Chart */}
      <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-1">Revenue Analytics</h2>
            <p className="text-sm text-text-muted">Monthly revenue, recovery, and churn trends</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-accent-primary/20 text-accent-primary rounded-lg text-sm border border-accent-primary/30">6M</button>
            <button className="px-3 py-1 bg-surface-secondary/50 text-text-secondary rounded-lg text-sm border border-border-primary/50">1Y</button>
            <button className="px-3 py-1 bg-surface-secondary/50 text-text-secondary rounded-lg text-sm border border-border-primary/50">All</button>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" />
              <XAxis 
                dataKey="month" 
                stroke="rgb(var(--text-muted))"
                fontSize={12}
              />
              <YAxis 
                stroke="rgb(var(--text-muted))"
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(var(--surface-secondary))', 
                  border: '1px solid rgb(var(--border-primary))',
                  borderRadius: '8px',
                  color: 'rgb(var(--text-primary))'
                }}
                formatter={(value: number) => [`${value.toLocaleString()}`, '']}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stackId="1"
                stroke="rgb(var(--success-muted))" 
                fill="rgb(var(--success-muted))"
                fillOpacity={0.3}
                name="Total Revenue"
              />
              <Area 
                type="monotone" 
                dataKey="recovered" 
                stackId="2"
                stroke="rgb(var(--info-muted))" 
                fill="rgb(var(--info-muted))"
                fillOpacity={0.3}
                name="Recovered Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-8 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span className="text-text-secondary">Total Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-info rounded-full"></div>
            <span className="text-text-secondary">Recovered Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-error rounded-full"></div>
            <span className="text-text-secondary">Revenue Lost</span>
          </div>
        </div>
      </div>
    </div>
  );
};