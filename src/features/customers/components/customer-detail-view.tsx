// src/features/customers/components/customer-detail-view.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {  CustomerDisplayData } from '@/types/api';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';

interface CustomerDetailViewProps {
  customer: CustomerDisplayData;
}

// Mock data for customer timeline and engagement
const mockEngagementData = [
  { month: 'Jan', logins: 15, feature_usage: 68, support_tickets: 2 },
  { month: 'Feb', logins: 22, feature_usage: 72, support_tickets: 1 },
  { month: 'Mar', logins: 18, feature_usage: 65, support_tickets: 3 },
  { month: 'Apr', logins: 25, feature_usage: 78, support_tickets: 0 },
  { month: 'May', logins: 12, feature_usage: 45, support_tickets: 4 },
  { month: 'Jun', logins: 8, feature_usage: 32, support_tickets: 2 },
];

const mockChurnRiskTrend = [
  { month: 'Jan', risk: 15 },
  { month: 'Feb', risk: 12 },
  { month: 'Mar', risk: 18 },
  { month: 'Apr', risk: 8 },
  { month: 'May', risk: 45 },
  { month: 'Jun', risk: 85 },
];

const mockActivityTimeline = [
  { date: '2024-06-01', type: 'login', description: 'Last login to dashboard' },
  { date: '2024-05-28', type: 'feature', description: 'Used analytics export feature' },
  { date: '2024-05-25', type: 'support', description: 'Created support ticket: "Payment issue"' },
  { date: '2024-05-20', type: 'billing', description: 'Payment failed - card expired' },
  { date: '2024-05-15', type: 'login', description: 'Logged in from mobile app' },
  { date: '2024-05-10', type: 'feature', description: 'Created new dashboard report' },
];

const getRiskColor = (risk: number) => {
  if (risk >= 80) return 'text-red-400 bg-red-500/20 border-red-500/30';
  if (risk >= 60) return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
  if (risk >= 40) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
  return 'text-green-400 bg-green-500/20 border-green-500/30';
};

const getActivityColor = (frequency: string) => {
  if (frequency === 'High') return 'text-green-400 bg-green-500/20 border-green-500/30';
  if (frequency === 'Medium') return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
  return 'text-red-400 bg-red-500/20 border-red-500/30';
};

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

export const CustomerDetailView: React.FC<CustomerDetailViewProps> = ({ customer }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'analytics'>('overview');

  const tabs = [
    { 
      id: 'overview' as const, 
      label: 'Overview', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      id: 'activity' as const, 
      label: 'Activity Timeline', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 'analytics' as const, 
      label: 'Analytics', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Customer Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-700/30 backdrop-blur-lg p-6 rounded-xl border border-slate-600/50">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-slate-400">Subscription Duration</span>
                </div>
                <div className="text-2xl font-bold text-white">{customer.monthsSubbed}</div>
                <div className="text-sm text-slate-400">months</div>
              </div>

              <div className="bg-slate-700/30 backdrop-blur-lg p-6 rounded-xl border border-slate-600/50">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span className="text-sm font-medium text-slate-400">Lifetime Value</span>
                </div>
                <div className="text-2xl font-bold text-green-400">{customer.ltv}</div>
                <div className="text-sm text-slate-400">total revenue</div>
              </div>

              <div className="bg-slate-700/30 backdrop-blur-lg p-6 rounded-xl border border-slate-600/50">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span className="text-sm font-medium text-slate-400">Plan Type</span>
                </div>
                <div className="text-2xl font-bold text-purple-400">{customer.plan}</div>
                <div className="text-sm text-slate-400">subscription</div>
              </div>

              <div className="bg-slate-700/30 backdrop-blur-lg p-6 rounded-xl border border-slate-600/50">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-slate-400">Last Active</span>
                </div>
                <div className="text-2xl font-bold text-orange-400">
                  {new Date(customer.lastActivity).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-sm text-slate-400">
                  {Math.floor((Date.now() - new Date(customer.lastActivity).getTime()) / (1000 * 60 * 60 * 24))} days ago
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
                <h3 className="text-xl font-semibold text-white mb-4">Churn Risk Assessment</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Current Risk Score</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(customer.churnRisk)}`}>
                      {customer.churnRisk}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        customer.churnRisk >= 80 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                        customer.churnRisk >= 60 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                        customer.churnRisk >= 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                        'bg-gradient-to-r from-green-500 to-green-600'
                      }`}
                      style={{ width: `${customer.churnRisk}%` }}
                    />
                  </div>
                  
                  <div className="space-y-3 mt-6">
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">Activity Level</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getActivityColor(customer.activityFrequency)}`}>
                        {customer.activityFrequency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">Payment Status</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                        Current
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-slate-300">Support Tickets</span>
                      <span className="text-slate-300">2 this month</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
                <h3 className="text-xl font-semibold text-white mb-4">AI Recommendations</h3>
                <div className="space-y-4">
                  {customer.churnRisk >= 70 ? (
                    <>
                      <div className="p-4 bg-red-600/20 rounded-lg border border-red-500/30">
                        <div className="flex items-center gap-3 mb-2">
                          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-red-400 font-medium">Immediate Action Required</span>
                        </div>
                        <p className="text-red-300 text-sm">Customer is at critical risk. Recommend personal outreach within 24 hours.</p>
                      </div>
                      <div className="p-4 bg-blue-600/20 rounded-lg border border-blue-500/30">
                        <div className="flex items-center gap-3 mb-2">
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="text-blue-400 font-medium">Recovery Campaign</span>
                        </div>
                        <p className="text-blue-300 text-sm">Launch personalized re-engagement campaign with special offer.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-green-600/20 rounded-lg border border-green-500/30">
                        <div className="flex items-center gap-3 mb-2">
                          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-green-400 font-medium">Upsell Opportunity</span>
                        </div>
                        <p className="text-green-300 text-sm">Customer is engaged and may be ready for premium features.</p>
                      </div>
                      <div className="p-4 bg-purple-600/20 rounded-lg border border-purple-500/30">
                        <div className="flex items-center gap-3 mb-2">
                          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="text-purple-400 font-medium">Feature Adoption</span>
                        </div>
                        <p className="text-purple-300 text-sm">Introduce advanced analytics features to increase engagement.</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'activity':
        return (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-6">Recent Activity Timeline</h3>
              <div className="space-y-4">
                {mockActivityTimeline.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium">{activity.description}</span>
                        <span className="text-xs text-slate-400">
                          {new Date(activity.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 capitalize">{activity.type} activity</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-8">
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
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-3xl"></div>
        
        <div className="relative bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/app/customers')}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {customer.name.split(' ').map(n => n[0]).join('')}
              </div>
              
              <div>
                <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-400/30 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-purple-200">Customer Profile</span>
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  {customer.name}
                </h1>
                <p className="text-slate-300">{customer.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                className="border-slate-600/50 hover:border-blue-500/50 hover:text-blue-400"
              >
                Send Message
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Launch Campaign
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden">
        <div className="flex flex-wrap border-b border-slate-700/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-4 font-medium text-sm transition-all duration-200 border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 bg-blue-600/10 text-blue-400'
                  : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-700/30'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Content Area */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};