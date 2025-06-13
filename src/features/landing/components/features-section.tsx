import React from 'react';

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-slate-50">
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
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-slate-800">Import Progress</h4>
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    Completed
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-800">customer_data.csv</span>
                      <span className="text-xs text-green-600">✓ Processed</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">1,247</div>
                    <div className="text-sm text-slate-500">customers imported</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-sm text-slate-600 mb-2">Data Quality Score</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full w-[85%]"></div>
                      </div>
                      <span className="text-sm font-semibold text-slate-800">85%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-slate-900">Easy Data Import</h3>
            </div>
            <p className="text-lg text-slate-600 mb-8">
              Get started quickly by importing your customer data via CSV upload or connecting integrations like HubSpot and Stripe. Our platform validates and processes your data automatically.
            </p>
            <ul className="space-y-4">
              {[
                'CSV upload with guided field mapping',
                'Direct integrations with CRM and billing systems',
                'Automatic data validation and quality scoring',
                'Real-time processing with detailed feedback'
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500"></div>
                  </div>
                  <span className="text-slate-700 leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Feature 2 - Churn Analysis */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-xl">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-slate-900">AI-Powered Churn Analysis</h3>
            </div>
            <p className="text-lg text-slate-600 mb-8">
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
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-gradient-to-br from-orange-500 to-red-500"></div>
                  </div>
                  <span className="text-slate-700 leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-slate-800">Analysis Results</h4>
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    Completed
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-lg font-bold text-orange-600">23</div>
                      <div className="text-xs text-slate-500">High Risk</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-lg font-bold text-blue-600">8.2%</div>
                      <div className="text-xs text-slate-500">Avg Risk Score</div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-sm font-medium text-slate-800 mb-2">Key Risk Factors</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Low login frequency</span>
                        <span className="text-red-600 font-medium">High impact</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Payment issues</span>
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
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-semibold text-slate-800">Customer Segments</h4>
                  <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    4 Active
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg border border-red-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium text-slate-800">High Risk Customers</span>
                      </div>
                      <span className="text-sm font-bold text-red-600">23</span>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-orange-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm font-medium text-slate-800">Payment Issues</span>
                      </div>
                      <span className="text-sm font-bold text-orange-600">12</span>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-green-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-slate-800">High Value</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">89</span>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-slate-800">New Customers</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">156</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-purple-500 to-violet-500 p-3 rounded-xl">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-slate-900">Smart Customer Segmentation</h3>
            </div>
            <p className="text-lg text-slate-600 mb-8">
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
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-gradient-to-br from-purple-500 to-violet-500"></div>
                  </div>
                  <span className="text-slate-700 leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};