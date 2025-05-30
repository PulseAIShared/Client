import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useGetDemographicInsights } from '@/features/insights/api/insights';

export const DemographicInsights = () => {
  const { data, isLoading, error } = useGetDemographicInsights();

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-6 bg-slate-700 rounded w-48"></div>
            <div className="h-4 bg-slate-700 rounded w-32"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="h-48 bg-slate-700 rounded"></div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-12 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-20 bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
        <div className="text-center py-8">
          <div className="text-red-400 mb-2">Failed to load demographic insights</div>
          <div className="text-slate-500 text-sm">Please try refreshing the page</div>
        </div>
      </div>
    );
  }

  const { demographicData, behaviorInsights } = data;

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Demographic Insights</h2>
          <p className="text-sm text-slate-400">Customer behavior patterns by demographics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Demographics Chart */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Customer Distribution</h3>
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
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#f1f5f9'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographics Legend */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">LTV by Segment</h3>
          {demographicData.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-white font-medium">{item.name}</span>
                <span className="text-slate-400">{item.value}%</span>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-semibold">${item.ltv}</div>
                <div className="text-xs text-slate-400">avg LTV</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Behavioral Insights */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Key Behavioral Insights</h3>
        {behaviorInsights.map((insight, index) => (
          <div key={index} className="p-4 bg-gradient-to-r from-slate-700/20 to-slate-600/20 rounded-lg border border-slate-600/30">
            <div className="flex items-start justify-between mb-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                insight.impact === 'High' ? 'bg-red-500/20 text-red-400' :
                insight.impact === 'Medium' ? 'bg-orange-500/20 text-orange-400' : 
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {insight.impact} Impact
              </span>
              <span className="text-blue-400 font-semibold text-sm">{insight.metric}</span>
            </div>
            <p className="text-white mb-2 leading-relaxed">{insight.insight}</p>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-purple-400 text-sm font-medium">{insight.action}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};