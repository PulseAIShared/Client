import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { useGetLTVAnalytics } from '@/features/insights/api/insights';

export const LTVAnalytics = () => {
  const { data, isLoading, error } = useGetLTVAnalytics();

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-6 bg-slate-700 rounded w-48"></div>
            <div className="h-4 bg-slate-700 rounded w-32"></div>
          </div>
          <div className="text-right space-y-2">
            <div className="h-8 bg-slate-700 rounded w-16"></div>
            <div className="h-4 bg-slate-700 rounded w-20"></div>
          </div>
        </div>

        <div className="h-64 bg-slate-700 rounded mb-6"></div>

        <div className="space-y-3 mb-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-12 bg-slate-700 rounded"></div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-700/50">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-8 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
        <div className="text-center py-8">
          <div className="text-red-400 mb-2">Failed to load LTV analytics</div>
          <div className="text-slate-500 text-sm">Please try refreshing the page</div>
        </div>
      </div>
    );
  }

  const { ltvData, cohortData } = data;

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Lifetime Value Analytics</h2>
          <p className="text-sm text-slate-400">Customer value trends and optimization opportunities</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-green-400">$156</div>
          <div className="text-sm text-slate-400">Average LTV</div>
        </div>
      </div>

      {/* LTV by Segment Chart */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">LTV by Customer Segment</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ltvData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="segment" 
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
              <Bar dataKey="current" fill="#10b981" name="Current LTV" />
              <Bar dataKey="previous" fill="#6b7280" name="Previous Period" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Growth Indicators */}
      <div className="space-y-3 mb-6">
        <h3 className="text-lg font-semibold text-white">Segment Performance</h3>
        {ltvData.map((segment, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-white font-medium">{segment.segment}</span>
              <span className="text-slate-400">${segment.current}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${
                segment.growth > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {segment.growth > 0 ? '+' : ''}{segment.growth}%
              </span>
              <svg className={`w-4 h-4 ${segment.growth > 0 ? 'text-green-400' : 'text-red-400'}`} 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d={segment.growth > 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Cohort Analysis */}
      <div className="pt-4 border-t border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-3">Cohort Analysis</h3>
        <div className="space-y-2">
          {cohortData.map((cohort, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-slate-700/20 rounded-lg">
              <span className="text-slate-300">{cohort.month}</span>
              <div className="flex items-center gap-4">
                <span className="text-blue-400">{cohort.retention}% retained</span>
                <span className="text-green-400 font-semibold">${cohort.ltv}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};