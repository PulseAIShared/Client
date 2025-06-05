import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { mockActivityTimeline, mockChurnRiskTrend, mockEngagementData } from "../../api/mock-data";

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'login':
      return (
        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        </div>
      );
    case 'feature':
      return (
        <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      );
    case 'support':
      return (
        <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
          </svg>
        </div>
      );
    case 'billing':
      return (
        <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 bg-slate-500/20 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
  }
};

interface CustomerAnalyticsTabProps {
  customer: unknown; // We'll use mock data for analytics
}
export const CustomerAnalyticsTab: React.FC<CustomerAnalyticsTabProps> = ({ customer }) => {
  return (
    <div className="space-y-8">
      {/* Activity Timeline */}
      <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-6">Recent Activity Timeline</h3>
        <div className="space-y-4">
          {mockActivityTimeline.map((activity, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
              {getActivityIcon(activity.type)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium">{activity.description}</span>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">
                      {new Date(activity.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-slate-500">{activity.timestamp}</div>
                  </div>
                </div>
                <span className="text-xs text-slate-400 capitalize">{activity.type} activity</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Chart */}
      <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-6">6-Month Engagement Trends</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockEngagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
              <Area type="monotone" dataKey="logins" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} name="Logins" />
              <Area type="monotone" dataKey="feature_usage" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Feature Usage %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Churn Risk Trend */}
      <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-6">Churn Risk Evolution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockChurnRiskTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `${value}%`} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="risk" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                name="Churn Risk %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div>
              <h4 className="text-white font-semibold">Activity Score</h4>
              <p className="text-slate-400 text-sm">Last 30 days</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-400 mb-2">
            {customer?.quickMetrics?.activityStatus === 'Active' ? '85' : 
             customer?.quickMetrics?.activityStatus === 'Low' ? '45' : '25'}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-full bg-slate-700/50 rounded-full h-2 ${
              customer?.quickMetrics?.activityStatus === 'Active' ? 'bg-gradient-to-r from-green-500 to-green-600' :
              customer?.quickMetrics?.activityStatus === 'Low' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
              'bg-gradient-to-r from-red-500 to-red-600'
            }`}>
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${customer?.quickMetrics?.activityStatus === 'Active' ? 85 : 
                  customer?.quickMetrics?.activityStatus === 'Low' ? 45 : 25}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h4 className="text-white font-semibold">Engagement Trend</h4>
              <p className="text-slate-400 text-sm">6 month trend</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-red-400 mb-2">↓ 35%</div>
          <p className="text-red-300 text-sm">Declining engagement pattern detected</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-white font-semibold">Time to Churn</h4>
              <p className="text-slate-400 text-sm">AI prediction</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-orange-400 mb-2">
            {customer?.churnRiskScore >= 70 ? '30 days' : 
             customer?.churnRiskScore >= 40 ? '90 days' : '180+ days'}
          </div>
          <p className="text-orange-300 text-sm">
            {customer?.churnRiskScore >= 70 ? 'High risk - immediate action needed' :
             customer?.churnRiskScore >= 40 ? 'Medium risk - monitor closely' : 'Low risk - maintain engagement'}
          </p>
        </div>
      </div>

      {/* Predictive Insights */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-lg p-6 rounded-2xl border border-purple-500/30 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-600/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-purple-400 font-semibold text-lg mb-2">AI-Powered Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <h5 className="text-white font-medium mb-1">Behavioral Pattern</h5>
                  <p className="text-purple-300 text-sm">
                    Customer shows declining login frequency over past 3 months, typical of pre-churn behavior
                  </p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <h5 className="text-white font-medium mb-1">Feature Usage</h5>
                  <p className="text-purple-300 text-sm">
                    Low adoption of advanced features suggests potential for upselling or need for training
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <h5 className="text-white font-medium mb-1">Intervention Window</h5>
                  <p className="text-purple-300 text-sm">
                    Optimal time for re-engagement campaign is within next 2 weeks based on similar customer patterns
                  </p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <h5 className="text-white font-medium mb-1">Success Probability</h5>
                  <p className="text-purple-300 text-sm">
                    Personal outreach combined with feature training has 73% success rate for this customer profile
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};