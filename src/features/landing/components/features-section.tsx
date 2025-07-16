import React from 'react';

export const FeaturesSection = () => {
  return (
    <section  className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full mb-6">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-sm font-medium text-blue-700">Core Platform Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Turn customer data into
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              actionable insights
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Import your customer data, analyze churn risk with AI, create targeted segments, and get actionable recommendations to improve retention.
          </p>
        </div>

        {/* Feature 1 - Data Import & Analysis */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
          <div className="order-2 md:order-1">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-sky-50 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-800">Integration Status</h4>
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    Completed
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-800">HubSpot CRM</span>
                      <span className="text-xs text-green-600">✓ Connected</span>
                    </div>
                    <div className="text-2xl font-bold text-sky-600 mb-1">1,247</div>
                    <div className="text-sm text-gray-500">customers synced</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-sm text-gray-600 mb-2">Data Quality Score</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-sky-500 h-2 rounded-full w-[85%]"></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-800">85%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-sky-500 p-3 rounded-xl">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 011 1v1z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-slate-900">Easy Data Import</h3>
            </div>
            <p className="text-lg text-slate-600 mb-8">
              Get started quickly by importing your customer data via CSV upload or connecting integrations like HubSpot and Stripe. Our platform validates and processes your data automatically.
            </p>
            <ul className="space-y-4">
              {[
                'Direct integrations with 50+ CRM and billing systems',
                'Real-time data syncing and automatic updates',
                'Automatic data validation and quality scoring',
                'Secure API connections with enterprise-grade security'
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-sky-100 flex items-center justify-center mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-sky-500"></div>
                  </div>
                  <span className="text-gray-700 leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Feature 2 - Churn Analysis */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-900 p-3 rounded-xl">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-blue-900">AI-Powered Churn Analysis</h3>
            </div>
            <p className="text-lg text-gray-600 mb-8">
              Run comprehensive churn analysis to identify at-risk customers before they leave. Our AI analyzes behavior patterns, payment history, and engagement metrics to predict churn risk.
            </p>
            <ul className="space-y-4">
              {[
                'Machine learning models analyze customer behavior',
                'Risk scoring from Low to Critical levels',
                'Actionable recommendations for each customer',
                'Historical trend analysis and insights'
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-blue-900"></div>
                  </div>
                  <span className="text-gray-700 leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-blue-50 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-800">Analysis Results</h4>
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    Completed
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-lg font-bold text-blue-900">23</div>
                      <div className="text-xs text-gray-500">High Risk</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-lg font-bold text-sky-600">8.2%</div>
                      <div className="text-xs text-gray-500">Avg Risk Score</div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-sm font-medium text-gray-800 mb-2">Key Risk Factors</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Low login frequency</span>
                        <span className="text-red-600 font-medium">High impact</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Payment issues</span>
                        <span className="text-orange-600 font-medium">Medium impact</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3 - Customer Segmentation */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-semibold text-gray-800">Customer Segments</h4>
                  <div className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-sm font-medium">
                    4 Active
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg border border-red-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-800">High Risk Customers</span>
                      </div>
                      <span className="text-sm font-bold text-red-600">23</span>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-orange-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-800">Payment Issues</span>
                      </div>
                      <span className="text-sm font-bold text-orange-600">12</span>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-green-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-800">High Value</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">89</span>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-sky-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-800">New Customers</span>
                      </div>
                      <span className="text-sm font-bold text-sky-600">156</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gray-500 p-3 rounded-xl">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 215.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-blue-900">Smart Customer Segmentation</h3>
            </div>
            <p className="text-lg text-gray-600 mb-8">
              Create targeted customer segments based on behavior, risk level, subscription value, and engagement patterns. Use these segments to build focused retention strategies.
            </p>
            <ul className="space-y-4">
              {[
                'Automatic segmentation based on churn analysis',
                'Custom segments with flexible criteria',
                'Real-time segment performance tracking',
                'Export segments for targeted campaigns'
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                  </div>
                  <span className="text-gray-700 leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Feature 4 - Campaign Management */}
        <div className="grid md:grid-cols-2 gap-16 items-center mt-32">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-500 p-3 rounded-xl">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-blue-900">Targeted Campaign Management</h3>
            </div>
            <p className="text-lg text-gray-600 mb-8">
              Use your customer segments to launch targeted retention campaigns. Send personalized messages to the right customers at the right time to maximize engagement and reduce churn.
            </p>
            <ul className="space-y-4">
              {[
                'Campaign creation based on customer segments',
                'Multi-channel outreach (email, SMS, in-app)',
                'Automated drip sequences and follow-ups',
                'Real-time campaign performance tracking'
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-gray-700 leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>

          </div>

          <div>
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-green-50 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-semibold text-gray-800">Campaign Dashboard</h4>
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    3 Active
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-800">High-Risk Win-Back</span>
                      <span className="text-xs text-green-600">●  Active</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">Target: High Risk Customers (23 recipients)</div>
                    <div className="flex gap-3 text-xs">
                      <span className="text-gray-600">Open: <strong className="text-green-600">68%</strong></span>
                      <span className="text-gray-600">Click: <strong className="text-sky-600">24%</strong></span>
                      <span className="text-gray-600">Convert: <strong className="text-blue-900">12%</strong></span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-orange-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-800">Payment Recovery</span>
                      <span className="text-xs text-orange-600">●  Running</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">Target: Payment Issues (12 recipients)</div>
                    <div className="flex gap-3 text-xs">
                      <span className="text-gray-600">Open: <strong className="text-green-600">89%</strong></span>
                      <span className="text-gray-600">Response: <strong className="text-sky-600">45%</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};