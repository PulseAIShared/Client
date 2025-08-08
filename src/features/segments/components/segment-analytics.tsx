// src/features/segments/components/segment-analytics.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const churnTrendData = [
  { month: 'Jan', enterprise: 2.1, trial: 15.2, basic: 28.4, overall: 12.3 },
  { month: 'Feb', enterprise: 1.8, trial: 14.1, basic: 26.8, overall: 11.8 },
  { month: 'Mar', enterprise: 2.4, trial: 12.9, basic: 24.2, overall: 10.9 },
  { month: 'Apr', enterprise: 1.9, trial: 11.8, basic: 22.1, overall: 9.8 },
  { month: 'May', enterprise: 1.6, trial: 10.5, basic: 20.9, overall: 8.9 },
  { month: 'Jun', enterprise: 1.4, trial: 9.8, basic: 19.6, overall: 8.2 },
];

const revenueBySegmentData = [
  { segment: 'Enterprise', revenue: 450000, customers: 1240, avgRevenue: 363 },
  { segment: 'Pro Users', revenue: 180000, customers: 2890, avgRevenue: 62 },
  { segment: 'Trial Users', revenue: 45000, customers: 890, avgRevenue: 51 },
  { segment: 'Basic', revenue: 78000, customers: 3200, avgRevenue: 24 },
];

const segmentDistributionData = [
  { name: 'Enterprise', value: 15, customers: 1240, color: '#8b5cf6' },
  { name: 'Pro Users', value: 35, customers: 2890, color: '#06b6d4' },
  { name: 'Trial Users', value: 12, customers: 890, color: '#10b981' },
  { name: 'Basic', value: 38, customers: 3200, color: '#f59e0b' },
];

const campaignPerformanceData = [
  { segment: 'High-Value Enterprise', campaigns: 5, success_rate: 78, revenue_recovered: 42000 },
  { segment: 'Payment Failed Recovery', campaigns: 12, success_rate: 67, revenue_recovered: 18500 },
  { segment: 'Trial Power Users', campaigns: 8, success_rate: 45, revenue_recovered: 12800 },
  { segment: 'Young Professionals', campaigns: 6, success_rate: 52, revenue_recovered: 9200 },
  { segment: 'Feature Champions', campaigns: 4, success_rate: 71, revenue_recovered: 15600 },
];

export const SegmentAnalytics = () => {
  return (
    <div className="space-y-8">
      {/* Enhanced Churn Trends by Segment */}
      <div className="bg-surface-primary/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">Churn Trends by Segment</h2>
            <p className="text-sm sm:text-base text-text-muted">6-month churn rate evolution across customer segments</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gradient-to-r from-accent-primary/30 to-accent-secondary/30 text-accent-primary rounded-xl text-sm font-medium border border-accent-primary/30 shadow-lg">
              6M
            </button>
            <button className="px-4 py-2 bg-surface-secondary/50 text-text-secondary rounded-xl text-sm font-medium border border-border-primary/30 hover:bg-surface-secondary/80 transition-colors">
              1Y
            </button>
          </div>
        </div>

        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={churnTrendData}>
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
                tickFormatter={(value) => `${value}%`}
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
              <Line type="monotone" dataKey="enterprise" stroke="#8b5cf6" strokeWidth={3} name="Enterprise" dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }} />
              <Line type="monotone" dataKey="trial" stroke="#06b6d4" strokeWidth={3} name="Trial Users" dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }} />
              <Line type="monotone" dataKey="basic" stroke="#f59e0b" strokeWidth={3} name="Basic" dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }} />
              <Line type="monotone" dataKey="overall" stroke="#10b981" strokeWidth={3} name="Overall" strokeDasharray="5 5" dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-6 sm:gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent-secondary rounded-full shadow-sm"></div>
            <span className="text-text-secondary font-medium">Enterprise</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-info rounded-full shadow-sm"></div>
            <span className="text-text-secondary font-medium">Trial Users</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-warning rounded-full shadow-sm"></div>
            <span className="text-text-secondary font-medium">Basic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success rounded-full border border-success shadow-sm"></div>
            <span className="text-text-secondary font-medium">Overall Trend</span>
          </div>
        </div>
      </div>

      {/* Enhanced Revenue by Segment */}
      <div className="bg-surface-primary/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">Revenue by Segment</h2>
            <p className="text-sm sm:text-base text-text-muted">Monthly revenue breakdown across customer segments</p>
          </div>
        </div>

        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueBySegmentData}>
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
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
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
                formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="url(#revenueGradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {revenueBySegmentData.map((item) => (
            <div key={item.segment} className="text-center p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/30">
              <div className="text-lg sm:text-xl font-bold text-accent-primary">${(item.revenue / 1000).toFixed(0)}k</div>
              <div className="text-sm text-text-muted">{item.segment}</div>
              <div className="text-xs text-text-muted">{item.customers.toLocaleString()} customers</div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Segment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface-primary/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">Segment Distribution</h2>
              <p className="text-sm sm:text-base text-text-muted">Customer distribution across segments</p>
            </div>
          </div>

          <div className="h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segmentDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {segmentDistributionData.map((entry, index) => (
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

          <div className="grid grid-cols-2 gap-4">
            {segmentDistributionData.map((item) => (
              <div key={item.name} className="flex items-center gap-3 p-3 bg-surface-secondary/30 rounded-xl border border-border-primary/30">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <div>
                  <div className="font-medium text-text-primary">{item.name}</div>
                  <div className="text-sm text-text-muted">{item.customers.toLocaleString()} customers</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Campaign Performance */}
        <div className="bg-surface-primary/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">Campaign Performance</h2>
              <p className="text-sm sm:text-base text-text-muted">Recovery campaign success rates by segment</p>
            </div>
          </div>

          <div className="space-y-4">
            {campaignPerformanceData.map((item) => (
              <div key={item.segment} className="p-4 bg-surface-secondary/30 rounded-xl border border-border-primary/30 hover:border-accent-primary/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-text-primary">{item.segment}</h3>
                  <span className="text-sm text-accent-primary font-medium">{item.success_rate}% success</span>
                </div>
                <div className="flex items-center justify-between text-sm text-text-muted">
                  <span>{item.campaigns} campaigns</span>
                  <span className="font-medium text-success">${item.revenue_recovered.toLocaleString()} recovered</span>
                </div>
                <div className="mt-2 w-full bg-surface-primary/50 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-accent-primary to-accent-secondary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${item.success_rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};