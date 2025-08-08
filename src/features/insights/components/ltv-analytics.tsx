import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { useGetInsightsData } from '@/features/insights/api/insights';

export const LTVAnalytics = () => {
  const { data: insights, isLoading, error } = useGetInsightsData();

  if (isLoading) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-6 bg-surface-secondary/50 rounded-xl w-48"></div>
            <div className="h-4 bg-surface-secondary/50 rounded-xl w-32"></div>
          </div>
          <div className="text-right space-y-2">
            <div className="h-8 bg-surface-secondary/50 rounded-xl w-16"></div>
            <div className="h-4 bg-surface-secondary/50 rounded-xl w-20"></div>
          </div>
        </div>

        <div className="h-64 bg-surface-secondary/50 rounded-xl mb-6"></div>

        <div className="space-y-3 mb-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-12 bg-surface-secondary/50 rounded-xl"></div>
          ))}
        </div>

        <div className="pt-4 border-t border-border-primary/30">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-8 bg-surface-secondary/50 rounded-xl"></div>
            ))}
          </div>
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
          <div className="text-error-muted font-medium mb-2">Failed to load LTV analytics</div>
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

  const { ltvData, cohortData } = insights.ltvAnalytics;

  return (
    <div className="bg-surface-primary/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">Lifetime Value Analytics</h2>
          <p className="text-sm sm:text-base text-text-muted">Customer value trends and optimization opportunities</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-success-muted">$156</div>
          <div className="text-sm text-text-muted">Average LTV</div>
        </div>
      </div>

      {/* Enhanced LTV by Segment Chart */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">LTV by Customer Segment</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ltvData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-primary))" opacity={0.3} />
              <XAxis 
                dataKey="segment" 
                stroke="rgb(var(--text-muted))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="rgb(var(--text-muted))"
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--surface-primary)', 
                  border: '1px solid var(--border-primary)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="current" fill="url(#ltvGradient)" name="Current LTV" radius={[4, 4, 0, 0]} />
              <Bar dataKey="previous" fill="url(#previousGradient)" name="Previous Period" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="ltvGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(var(--success-muted))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="rgb(var(--success-muted))" stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="previousGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(var(--text-muted))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="rgb(var(--text-muted))" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Enhanced Growth Indicators */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Segment Performance</h3>
        {ltvData.map((segment, index) => (
          <div key={index} className="group bg-surface-secondary/30 p-4 rounded-xl border border-border-primary/30 hover:border-border-secondary transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-text-primary">{segment.segment}</span>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                segment.growth > 0 ? 'text-success-muted' : 'text-error-muted'
              }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d={segment.growth > 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                </svg>
                <span>{Math.abs(segment.growth)}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-muted">Current: ${segment.current}</div>
              <div className="text-sm text-text-muted">Previous: ${segment.previous}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Cohort Analysis */}
      <div className="pt-6 border-t border-border-primary/30">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Cohort Analysis</h3>
        <div className="space-y-3">
          {cohortData.slice(0, 5).map((cohort, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-surface-secondary/30 rounded-xl border border-border-primary/30">
              <div>
                <div className="font-medium text-text-primary">{cohort.month}</div>
                <div className="text-sm text-text-muted">Cohort</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-text-primary">{cohort.retention}%</div>
                <div className="text-sm text-text-muted">Retention</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-success-muted">${cohort.ltv}</div>
                <div className="text-sm text-text-muted">LTV</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};