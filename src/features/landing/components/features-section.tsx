import React from 'react';

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full mb-6">
            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
            <span className="text-sm font-medium text-purple-700">AI-Powered Platform</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Everything you need to stop churn
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              before it happens
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Pulse AI combines advanced machine learning with automated workflows to predict, prevent, and recover from customer churn.
          </p>
        </div>

        {/* Feature 1 - Churn Prediction */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
          <div className="order-2 md:order-1">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-slate-800">Churn Risk Analysis</h4>
                  <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                    High Risk
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">Sarah Chen</div>
                        <div className="text-sm text-slate-500">Pro Plan • 23 days inactive</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600">92%</div>
                      <div className="text-xs text-slate-500">risk score</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">TechStart Inc</div>
                        <div className="text-sm text-slate-500">Enterprise • Payment failed</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-orange-600">78%</div>
                      <div className="text-xs text-slate-500">risk score</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-red-500 to-orange-500 p-3 rounded-xl">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-slate-900">Predictive Churn Detection</h3>
            </div>
            <p className="text-lg text-slate-600 mb-8">
              Our AI analyzes user behavior, payment patterns, and engagement metrics to identify at-risk customers before they churn. Get ahead of the problem with predictive insights.
            </p>
            <ul className="space-y-4">
              {[
                'AI-powered risk scoring for every customer',
                'Real-time behavior and usage pattern analysis',
                'Payment failure and billing issue detection',
                'Demographic and engagement factor weighting'
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-gradient-to-br from-red-500 to-orange-500"></div>
                  </div>
                  <span className="text-slate-700 leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Feature 2 - AI Recovery */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-3 rounded-xl">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-slate-900">AI-Generated Recovery Messages</h3>
            </div>
            <p className="text-lg text-slate-600 mb-8">
              Automatically generate personalized, on-brand recovery messages that feel natural and human. Our AI adapts tone, content, and timing to maximize re-engagement success.
            </p>
            <ul className="space-y-4">
              {[
                'GPT-powered personalized message generation',
                'A/B testing for optimal message performance',
                'Multi-channel outreach (email, SMS, in-app)',
                'Brand voice and tone customization'
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-gradient-to-br from-purple-500 to-blue-500"></div>
                  </div>
                  <span className="text-slate-700 leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-slate-800">AI Recovery Campaign</h4>
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    Active
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-purple-100">
                    <div className="text-sm text-slate-500 mb-2">Subject: We miss you, Sarah!</div>
                    <div className="text-slate-800 leading-relaxed">
                      "Hi Sarah, I noticed you haven't been using our analytics dashboard lately. 
                      Since you're working on scaling TechStart, I thought you might find our new 
                      customer insights feature helpful..."
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm text-purple-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                      </svg>
                      <span>Personalized for user behavior</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-white px-3 py-2 rounded-lg border text-sm">
                      <span className="text-slate-500">Open Rate:</span>
                      <span className="font-semibold text-green-600 ml-1">84%</span>
                    </div>
                    <div className="bg-white px-3 py-2 rounded-lg border text-sm">
                      <span className="text-slate-500">Click Rate:</span>
                      <span className="font-semibold text-blue-600 ml-1">32%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3 - Revenue Recovery */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-semibold text-slate-800">Revenue Recovery Dashboard</h4>
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                    This Month
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-green-600">$47.2K</div>
                    <div className="text-sm text-slate-500">Revenue Recovered</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600">89%</div>
                    <div className="text-sm text-slate-500">Success Rate</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Failed Payment Recovery</span>
                    <span className="font-semibold text-green-600">+$18.4K</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Win-back Campaigns</span>
                    <span className="font-semibold text-green-600">+$12.8K</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Upgrade Conversions</span>
                    <span className="font-semibold text-green-600">+$16.0K</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-slate-900">Automated Revenue Recovery</h3>
            </div>
            <p className="text-lg text-slate-600 mb-8">
              Turn failed payments and churned customers into recovered revenue. Our automated workflows handle dunning management, payment retries, and win-back campaigns without manual intervention.
            </p>
            <ul className="space-y-4">
              {[
                'Smart payment retry logic and dunning management',
                'Automated win-back sequences for churned customers',
                'Real-time revenue recovery tracking and reporting',
                'Integration with billing systems and payment processors'
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-gradient-to-br from-green-500 to-emerald-500"></div>
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