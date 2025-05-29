import React from 'react';

export const CTASection = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-400/30 mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-purple-200">Ready to Get Started?</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Stop losing customers.
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Start recovering revenue.
              </span>
            </h2>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Join hundreds of subscription businesses using Pulse AI to predict churn, recover failed payments, and maximize customer lifetime value — all automatically.
            </p>
          </div>
          
          {/* Main CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <button className="group px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3">
              Start Free 14-Day Trial
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button className="px-8 py-4 text-lg font-semibold text-white bg-transparent border-2 border-slate-400/30 backdrop-blur-sm rounded-xl hover:bg-white/10 hover:border-white/50 transform hover:-translate-y-1 transition-all duration-300">
              Schedule a Demo
            </button>
          </div>

          {/* Trust indicators and features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="bg-green-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Free 14-Day Trial</h3>
              <p className="text-slate-400">No credit card required. Full access to all features.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">5-Minute Setup</h3>
              <p className="text-slate-400">Connect your existing tools and start predicting churn instantly.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">24/7 Support</h3>
              <p className="text-slate-400">Get help whenever you need it from our expert team.</p>
            </div>
          </div>

          {/* Social proof */}
          <div className="border-t border-slate-700 pt-12">
            <p className="text-sm text-slate-400 mb-8">Trusted by subscription businesses of all sizes</p>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center max-w-4xl mx-auto opacity-60">
              <div className="text-center">
                <div className="bg-slate-800 rounded-lg px-4 py-3 border border-slate-700">
                  <div className="font-bold text-slate-300 text-sm">TechFlow SaaS</div>
                  <div className="text-xs text-slate-500">-52% churn</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-slate-800 rounded-lg px-4 py-3 border border-slate-700">
                  <div className="font-bold text-slate-300 text-sm">LearnHub Pro</div>
                  <div className="text-xs text-slate-500">+$180K recovered</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-slate-800 rounded-lg px-4 py-3 border border-slate-700">
                  <div className="font-bold text-slate-300 text-sm">FitnessPro</div>
                  <div className="text-xs text-slate-500">78% recovery rate</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-slate-800 rounded-lg px-4 py-3 border border-slate-700">
                  <div className="font-bold text-slate-300 text-sm">StreamMax</div>
                  <div className="text-xs text-slate-500">-41% churn</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-slate-800 rounded-lg px-4 py-3 border border-slate-700">
                  <div className="font-bold text-slate-300 text-sm">CloudStore</div>
                  <div className="text-xs text-slate-500">+$320K saved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};