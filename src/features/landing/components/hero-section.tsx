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
        {[...Array(15)].map((_, i) => (
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
            <div className="w-2 h-2 bg-blue-400 rounded-full blur-sm"></div>
          </div>
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-7xl mx-auto">
        <div className="mb-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-400/30 mb-8">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">AI-Powered Revenue Recovery</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400">
              Pulse AI
            </span>
            <br />
            <span className="text-white text-4xl md:text-5xl">
              Smarter Retention &amp; Recovery
            </span>
          </h1>
        </div>
        
        <p className="text-xl md:text-2xl mb-10 max-w-4xl mx-auto text-slate-300 font-light leading-relaxed animate-fade-in-up delay-300">
          Predict churn before it happens. Recover failed payments automatically. 
          <br className="hidden md:block" />
          Turn subscription challenges into revenue opportunities with AI.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12 animate-fade-in-up delay-600">
          <Link 
            to="/auth/register" 
            className="group px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
          >
            Start Free Trial
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link 
            to="/demo" 
            className="px-8 py-4 text-lg font-semibold text-white bg-transparent border-2 border-slate-400/30 backdrop-blur-sm rounded-xl hover:bg-white/10 hover:border-white/50 transform hover:-translate-y-1 transition-all duration-300"
          >
            Watch Demo
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="text-center animate-fade-in-up delay-900">
          <p className="text-sm text-slate-400 mb-4">Trusted by subscription businesses worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {['SaaS', 'eCommerce', 'EdTech', 'HealthTech', 'Membership'].map((type) => (
              <div key={type} className="text-slate-300 font-medium">{type}</div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Dashboard preview floating at bottom */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-full max-w-5xl px-4 z-10 animate-slide-up delay-1000">
        <div className="bg-slate-800/90 backdrop-blur-lg rounded-t-2xl border border-slate-700/50 p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <div className="text-slate-400 text-sm font-medium">Pulse AI Dashboard</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Churn Risk</div>
              <div className="text-2xl font-bold text-red-400">12.3%</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Recovery Rate</div>
              <div className="text-2xl font-bold text-green-400">78.5%</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-slate-400 text-sm mb-1">Revenue Saved</div>
              <div className="text-2xl font-bold text-blue-400">$24.8K</div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};