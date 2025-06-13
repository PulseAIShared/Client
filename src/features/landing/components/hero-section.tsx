import React from 'react';
import './css/hero-section.css'; // Import custom styles
interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: React.ReactNode;
  className?: string;
}

const Link = ({ to, children, className, ...props }: LinkProps) => (
  <a href={to} className={className} {...props}>{children}</a>
);

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #7c3aed 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, #3b82f6 0%, transparent 50%)`,
        }}></div>
      </div>
      
      {/* Floating AI elements */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 2}s`,
            }}
          >
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full blur-sm"></div>
          </div>
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-7xl mx-auto pt-20 sm:pt-0">
        <div className="mb-8 ">   
          <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400">
              PulseAI
            </span>
            <br />
            <span className="text-white text-3xl md:text-4xl font-normal">
              Predict. Prevent. Recover.
            </span>
          </h1>
        </div>
        
        <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-slate-300 font-light leading-relaxed">
          Turn customer data into actionable insights. Identify at-risk customers before they churn, 
          <br className="hidden md:block" />
          create targeted segments, and recover revenue with AI-driven analytics.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <Link 
            to="/auth" 
            className="group px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
          >
            Get Started Free
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link 
            to="#features" 
            className="px-8 py-4 text-lg font-semibold text-white bg-transparent border-2 border-slate-400/30 backdrop-blur-sm rounded-xl hover:bg-white/10 hover:border-white/50 transform hover:-translate-y-1 transition-all duration-300"
          >
            See How It Works
          </Link>
        </div>

        {/* Key capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Churn Prediction</h3>
            <p className="text-slate-400 text-sm">AI analyzes customer behavior to identify at-risk users before they leave</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Segmentation</h3>
            <p className="text-slate-400 text-sm">Group customers by behavior, risk level, and value for targeted strategies</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Actionable Insights</h3>
            <p className="text-slate-400 text-sm">Get real-time dashboards and recommendations to improve retention</p>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="text-center">
          <p className="text-sm text-slate-400 mb-4">Built for modern subscription businesses</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {['SaaS Platforms', 'E-commerce', 'Membership Sites', 'Digital Services'].map((type) => (
              <div key={type} className="text-slate-300 text-sm font-medium">{type}</div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
};