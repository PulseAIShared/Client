import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useGetInsightsData } from '@/features/insights/api/insights';

export const DemographicInsights = () => {
  const { data: insights, isLoading, error } = useGetInsightsData();

  if (isLoading) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-6 bg-surface-secondary/50 rounded-xl w-48"></div>
            <div className="h-4 bg-surface-secondary/50 rounded-xl w-32"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="h-48 bg-surface-secondary/50 rounded-xl"></div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-12 bg-surface-secondary/50 rounded-xl"></div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-20 bg-surface-secondary/50 rounded-xl"></div>
          ))}
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
          <div className="text-error-muted font-medium mb-2">Failed to load demographic insights</div>
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

  const { demographicData, behaviorInsights } = insights.demographicInsights;

  return (
    <div className="bg-surface-primary/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">Demographic Insights</h2>
          <p className="text-sm sm:text-base text-text-muted">Customer behavior patterns by demographics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Enhanced Demographics Chart */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Customer Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demographicData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {demographicData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--surface-primary)', 
                    border: '1px solid var(--border-primary)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enhanced Demographics Legend */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-text-primary">LTV by Segment</h3>
          {demographicData.map((item, index) => (
            <div key={index} className="group bg-surface-secondary/30 p-4 rounded-xl border border-border-primary/30 hover:border-border-secondary transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-text-primary font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-text-primary">{item.value}%</div>
                  <div className="text-sm text-text-muted">${item.ltv}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Behavior Insights */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Behavior Insights</h3>
        {behaviorInsights.map((insight, index) => (
          <div key={index} className="group bg-surface-secondary/30 p-4 rounded-xl border border-border-primary/30 hover:border-border-secondary transition-all duration-200">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-text-primary">{insight.insight}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                insight.impact === 'High' 
                  ? 'bg-error/20 text-error border border-error/30' 
                  : insight.impact === 'Medium'
                  ? 'bg-warning/20 text-warning border border-warning/30'
                  : 'bg-success/20 text-success border border-success/30'
              }`}>
                {insight.impact}
              </span>
            </div>
            <p className="text-sm text-text-muted mb-2">{insight.action}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Metric: {insight.metric}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};