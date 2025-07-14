import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useGetInsightsData } from '@/features/insights/api/insights';

export const DemographicInsights = () => {
  const { data: insights, isLoading, error } = useGetInsightsData();

  if (isLoading) {
    return (
      <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-6 bg-surface-secondary rounded w-48"></div>
            <div className="h-4 bg-surface-secondary rounded w-32"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="h-48 bg-surface-secondary rounded"></div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-12 bg-surface-secondary rounded"></div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-20 bg-surface-secondary rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg">
        <div className="text-center py-8">
          <div className="text-error-muted mb-2">Failed to load demographic insights</div>
          <div className="text-text-muted text-sm">Please try refreshing the page</div>
        </div>
      </div>
    );
  }

  const { demographicData, behaviorInsights } = insights.demographicInsights;

  return (
    <div className="bg-surface-secondary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-1">Demographic Insights</h2>
          <p className="text-sm text-text-muted">Customer behavior patterns by demographics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Demographics Chart */}
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
                    backgroundColor: 'rgb(var(--surface-secondary))', 
                    border: '1px solid rgb(var(--border-primary))',
                    borderRadius: '8px',
                    color: 'rgb(var(--text-primary))'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographics Legend */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-text-primary">LTV by Segment</h3>
          {demographicData.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-surface-secondary/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-text-primary font-medium">{item.name}</span>
                <span className="text-text-muted">{item.value}%</span>
              </div>
              <div className="text-right">
                <div className="text-success-muted font-semibold">${item.ltv}</div>
                <div className="text-xs text-text-muted">avg LTV</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Behavioral Insights */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">Key Behavioral Insights</h3>
        {behaviorInsights.map((insight, index) => (
          <div key={index} className="p-4 bg-gradient-to-r from-surface-secondary/20 to-surface-secondary/30 rounded-lg border border-border-primary/30">
            <div className="flex items-start justify-between mb-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                insight.impact === 'High' ? 'bg-error/20 text-error-muted' :
                insight.impact === 'Medium' ? 'bg-warning/20 text-warning-muted' : 
                'bg-warning-muted/20 text-warning-muted'
              }`}>
                {insight.impact} Impact
              </span>
              <span className="text-accent-primary font-semibold text-sm">{insight.metric}</span>
            </div>
            <p className="text-text-primary mb-2 leading-relaxed">{insight.insight}</p>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-accent-secondary text-sm font-medium">{insight.action}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};