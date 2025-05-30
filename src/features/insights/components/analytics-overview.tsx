import { Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 45000, recovered: 8200, churn: 12000 },
  { month: 'Feb', revenue: 48000, recovered: 9100, churn: 11200 },
  { month: 'Mar', revenue: 52000, recovered: 10800, churn: 9800 },
  { month: 'Apr', revenue: 49000, recovered: 12400, churn: 13500 },
  { month: 'May', revenue: 55000, recovered: 11600, churn: 10100 },
  { month: 'Jun', revenue: 58000, recovered: 13200, churn: 9400 },
];

const kpiData = [
  { metric: 'Monthly Recurring Revenue', value: '$58,000', change: '+12.3%', trend: 'up' },
  { metric: 'Churn Rate', value: '8.2%', change: '-2.1%', trend: 'down' },
  { metric: 'Recovery Rate', value: '73%', change: '+8.5%', trend: 'up' },
  { metric: 'Customer Acquisition Cost', value: '$89', change: '-15.2%', trend: 'down' },
];

export const AnalyticsOverview = () => {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <div key={index} className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">{kpi.metric}</h3>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                kpi.trend === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d={kpi.trend === 'up' ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                </svg>
                <span>{kpi.change}</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{kpi.value}</div>
            <div className="text-sm text-slate-400">vs previous period</div>
          </div>
        ))}
      </div>

      {/* Revenue Analytics Chart */}
      <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Revenue Analytics</h2>
            <p className="text-sm text-slate-400">Monthly revenue, recovery, and churn trends</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-sm border border-blue-500/30">6M</button>
            <button className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-sm border border-slate-600/50">1Y</button>
            <button className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-sm border border-slate-600/50">All</button>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
                formatter={(value: number) => [`${value.toLocaleString()}`, '']}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stackId="1"
                stroke="#10b981" 
                fill="#10b981"
                fillOpacity={0.3}
                name="Total Revenue"
              />
              <Area 
                type="monotone" 
                dataKey="recovered" 
                stackId="2"
                stroke="#06b6d4" 
                fill="#06b6d4"
                fillOpacity={0.3}
                name="Recovered Revenue"
              />
              <Line 
                type="monotone" 
                dataKey="churn" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                name="Revenue Lost to Churn"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-8 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-slate-300">Total Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
            <span className="text-slate-300">Recovered Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-slate-300">Revenue Lost</span>
          </div>
        </div>
      </div>
    </div>
  );
};