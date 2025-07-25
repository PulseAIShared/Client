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
      {/* Churn Trends by Segment */}
      <div className="bg-surface-primary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-1">Churn Trends by Segment</h2>
            <p className="text-sm text-text-muted">6-month churn rate evolution across customer segments</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-accent-primary/20 text-accent-primary rounded-lg text-sm border border-accent-primary/30">6M</button>
            <button className="px-3 py-1 bg-surface-secondary/50 text-text-secondary rounded-lg text-sm border border-border-primary/50">1Y</button>
          </div>
        </div>

        <div className="h-80 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={churnTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis 
                dataKey="month" 
                stroke="var(--text-muted)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--text-muted)"
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--surface-primary)', 
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}
              />
              <Line type="monotone" dataKey="enterprise" stroke="#8b5cf6" strokeWidth={3} name="Enterprise" />
              <Line type="monotone" dataKey="trial" stroke="#06b6d4" strokeWidth={3} name="Trial Users" />
              <Line type="monotone" dataKey="basic" stroke="#f59e0b" strokeWidth={3} name="Basic" />
              <Line type="monotone" dataKey="overall" stroke="#10b981" strokeWidth={3} name="Overall" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent-secondary rounded-full"></div>
            <span className="text-text-secondary">Enterprise</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-info rounded-full"></div>
            <span className="text-text-secondary">Trial Users</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-warning rounded-full"></div>
            <span className="text-text-secondary">Basic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-success rounded-full border border-success"></div>
            <span className="text-text-secondary">Overall Trend</span>
          </div>
        </div>
      </div>

      {/* Revenue by Segment and Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Revenue by Segment */}
        <div className="bg-surface-primary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-text-primary mb-1">Revenue by Segment</h2>
              <p className="text-sm text-text-muted">Monthly recurring revenue breakdown</p>
            </div>
          </div>

          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueBySegmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                <XAxis 
                  dataKey="segment" 
                  stroke="var(--text-muted)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--text-muted)"
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--surface-primary)', 
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)'
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="var(--success)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {revenueBySegmentData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">{item.segment}</span>
                <div className="flex items-center gap-4">
                  <span className="text-text-muted">{item.customers} customers</span>
                  <span className="text-success font-semibold">${item.avgRevenue}/mo avg</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Distribution */}
        <div className="bg-surface-primary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-text-primary mb-1">Customer Distribution</h2>
              <p className="text-sm text-text-muted">Percentage breakdown by segment</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="h-48 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={segmentDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
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
                      borderRadius: '8px',
                      color: 'var(--text-primary)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="ml-6 space-y-3">
              {segmentDistributionData.map((item, index) => (
                <div key={index} className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-text-secondary font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-text-primary font-semibold">{item.value}%</div>
                    <div className="text-xs text-text-muted">{item.customers.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Performance by Segment */}
      <div className="bg-surface-primary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-1">Campaign Performance by Segment</h2>
            <p className="text-sm text-text-muted">Recovery campaign effectiveness across segments</p>
          </div>
          <div className="bg-success/20 text-success px-3 py-1 rounded-full text-sm font-medium border border-success/30">
            Overall: 63% Success Rate
          </div>
        </div>

        <div className="space-y-4">
          {campaignPerformanceData.map((segment, index) => (
            <div key={index} className="group p-4 bg-surface-secondary/30 rounded-lg hover:bg-surface-secondary/50 transition-all duration-200 border border-border-primary/30 hover:border-border-primary/50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-text-primary font-semibold group-hover:text-accent-primary transition-colors">{segment.segment}</h3>
                  <div className="text-sm text-text-muted">{segment.campaigns} campaigns launched</div>
                </div>
                <div className="text-right">
                  <div className="text-success font-bold text-lg">${segment.revenue_recovered.toLocaleString()}</div>
                  <div className="text-xs text-text-muted">revenue recovered</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-muted">Success Rate</span>
                    <span className="text-text-primary font-semibold">{segment.success_rate}%</span>
                  </div>
                  <div className="w-full bg-surface-secondary/50 rounded-full h-2">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        segment.success_rate >= 70 ? 'bg-success' :
                        segment.success_rate >= 50 ? 'bg-warning' : 'bg-warning-muted'
                      }`}
                      style={{ width: `${segment.success_rate}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-accent-primary/20 text-accent-primary rounded-lg hover:bg-accent-primary/30 transition-colors text-sm border border-accent-primary/30">
                    View Details
                  </button>
                  <button className="px-3 py-1 bg-success/20 text-success rounded-lg hover:bg-success/30 transition-colors text-sm border border-success/30">
                    New Campaign
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border-primary/50">
          <button className="w-full px-4 py-2 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 text-accent-primary rounded-lg hover:from-accent-primary/30 hover:to-accent-secondary/30 transition-all duration-200 font-medium text-sm border border-accent-primary/30">
            Generate Comprehensive Analytics Report
          </button>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="bg-gradient-to-r from-accent-secondary/20 to-accent-primary/20 backdrop-blur-lg p-8 rounded-2xl border border-accent-secondary/30 shadow-xl">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-text-primary mb-4">
            AI-Powered Segment Insights
          </h3>
          <p className="text-accent-secondary max-w-3xl mx-auto">
            Based on your segmentation performance, here are key insights and recommendations to optimize your retention strategy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-primary/50 p-6 rounded-xl border border-border-primary/50">
            <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-text-primary mb-2">Enterprise Success</h4>
            <p className="text-text-secondary text-sm mb-3">Enterprise segment shows 87% lower churn than average. Consider premium features for other segments.</p>
            <button className="px-4 py-2 bg-success/20 text-success rounded-lg hover:bg-success/30 transition-colors text-sm border border-success/30 w-full">
              Expand Enterprise Features
            </button>
          </div>

          <div className="bg-surface-primary/50 p-6 rounded-xl border border-border-primary/50">
            <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-text-primary mb-2">Trial Optimization</h4>
            <p className="text-text-secondary text-sm mb-3">Trial users have high engagement but moderate conversion. Focus on value demonstration.</p>
            <button className="px-4 py-2 bg-warning/20 text-warning rounded-lg hover:bg-warning/30 transition-colors text-sm border border-warning/30 w-full">
              Optimize Trial Experience
            </button>
          </div>

          <div className="bg-surface-primary/50 p-6 rounded-xl border border-border-primary/50">
            <div className="w-12 h-12 bg-accent-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-text-primary mb-2">Basic Segment Risk</h4>
            <p className="text-text-secondary text-sm mb-3">Basic tier shows highest churn potential. Implement proactive engagement campaigns.</p>
            <button className="px-4 py-2 bg-accent-primary/20 text-accent-primary rounded-lg hover:bg-accent-primary/30 transition-colors text-sm border border-accent-primary/30 w-full">
              Create Retention Campaign
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button className="px-6 py-3 bg-gradient-to-r from-accent-secondary to-accent-primary text-text-primary rounded-lg hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-semibold">
            Generate AI Segment Recommendations
          </button>
          <button className="px-6 py-3 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-secondary/60 transition-colors font-medium border border-border-primary/50">
            Schedule Analytics Review
          </button>
        </div>
      </div>
    </div>
  );
};