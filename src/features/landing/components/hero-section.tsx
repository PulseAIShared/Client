import React from 'react';
import './css/hero-section.css'; // Import custom styles
import { 
  SiStripe, 
  SiHubspot, 
  SiSalesforce, 
  SiShopify, 
  SiMailchimp, 
  SiIntercom, 
  SiZendesk, 
  SiSlack,
  SiSquare,
  SiPaypal,
  SiTwilio,
  SiGoogle
} from 'react-icons/si';
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
    <>
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Enhanced animated background with multiple layers */}
      <div className="absolute inset-0">
        {/* Base gradient layer */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #7c3aed 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, #3b82f6 0%, transparent 50%)`,
        }}></div>
        
        {/* Moving gradient orbs */}
        <div className="absolute inset-0">
          <div className="absolute w-96 h-96 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-full blur-3xl animate-pulse" 
               style={{ 
                 top: '10%', 
                 left: '10%', 
                 animationDuration: '6s',
                 transform: 'translate(-50%, -50%)'
               }}></div>
          <div className="absolute w-80 h-80 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse" 
               style={{ 
                 top: '70%', 
                 right: '10%', 
                 animationDuration: '8s',
                 animationDelay: '2s',
                 transform: 'translate(50%, -50%)'
               }}></div>
          <div className="absolute w-64 h-64 bg-gradient-to-r from-cyan-600/25 to-blue-600/25 rounded-full blur-3xl animate-pulse" 
               style={{ 
                 top: '40%', 
                 left: '80%', 
                 animationDuration: '7s',
                 animationDelay: '4s',
                 transform: 'translate(-50%, -50%)'
               }}></div>
        </div>
      </div>
      
      {/* Advanced floating elements system */}
      <div className="absolute inset-0">
        {/* Large floating particles */}
        {[...Array(12)].map((_, i) => {
          const size = 3 + Math.random() * 4;
          const delay = Math.random() * 5;
          const duration = 4 + Math.random() * 4;
          return (
            <div
              key={`large-${i}`}
              className="absolute opacity-40"
              style={{
                top: `${10 + Math.random() * 80}%`,
                left: `${5 + Math.random() * 90}%`,
                animation: `float ${duration}s ${delay}s infinite ease-in-out`,
              }}
            >
              <div 
                className={`bg-gradient-to-r from-blue-400 to-purple-400 rounded-full shadow-2xl`}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  filter: 'blur(0.5px)',
                }}
              ></div>
            </div>
          );
        })}
        
        {/* Small twinkling particles */}
        {[...Array(20)].map((_, i) => {
          const delay = Math.random() * 3;
          const duration = 2 + Math.random() * 2;
          return (
            <div
              key={`small-${i}`}
              className="absolute opacity-60"
              style={{
                top: `${5 + Math.random() * 90}%`,
                left: `${5 + Math.random() * 90}%`,
                animation: `twinkle ${duration}s ${delay}s infinite ease-in-out`,
              }}
            >
              <div className="w-1 h-1 bg-white rounded-full shadow-lg"></div>
            </div>
          );
        })}
      </div>
      
      {/* Enhanced animated grid with depth */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.3)_1px,transparent_1px)] bg-[size:100px_100px]"
            style={{ animation: 'gridMove 20s linear infinite' }}
          ></div>
          <div 
            className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.2)_1px,transparent_1px)] bg-[size:50px_50px]"
            style={{ animation: 'gridMove 15s linear infinite reverse' }}
          ></div>
        </div>
      </div>
      
      {/* Content with enhanced animations */}
      <div className="relative z-10 text-center text-white px-4 max-w-7xl mx-auto pt-20 sm:pt-0">
        <div className="mb-8 animate-fade-in-up">   
          <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 animate-gradient">
              PulseAI
            </span>
            <br />
            <span className="text-white text-3xl md:text-4xl font-normal opacity-0 animate-fade-in-up delay-300">
              Predict. Prevent. Recover.
            </span>
          </h1>
        </div>
        
        <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-slate-300 font-light leading-relaxed opacity-0 animate-fade-in-up delay-600">
          Turn customer data into actionable insights. Identify at-risk customers, create targeted segments, 
          <br className="hidden md:block" />
          and launch personalized campaigns to reduce churn and recover revenue.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 opacity-0 animate-fade-in-up delay-900">
          <Link 
            to="/auth" 
            className="group px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative">Get Started Free</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link 
            to="#features" 
            className="px-8 py-4 text-lg font-semibold text-white bg-transparent border-2 border-slate-400/30 backdrop-blur-sm rounded-xl hover:bg-white/10 hover:border-white/50 hover:shadow-lg transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative">See How It Works</span>
          </Link>
        </div>

        {/* Key capabilities with staggered animations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16 opacity-0 animate-fade-in-up delay-1000">
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50 hover:bg-slate-800/70 hover:border-slate-600/50 hover:shadow-2xl hover:shadow-red-500/10 transform hover:-translate-y-2 hover:scale-105 transition-all duration-500 group">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-red-300 transition-colors duration-300">Churn Prediction</h3>
            <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors duration-300">AI analyzes customer behavior to identify at-risk users before they leave</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50 hover:bg-slate-800/70 hover:border-slate-600/50 hover:shadow-2xl hover:shadow-purple-500/10 transform hover:-translate-y-2 hover:scale-105 transition-all duration-500 delay-100 group">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-300 transition-colors duration-300">Smart Segmentation</h3>
            <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors duration-300">Group customers by behavior, risk level, and value for targeted strategies</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50 hover:bg-slate-800/70 hover:border-slate-600/50 hover:shadow-2xl hover:shadow-green-500/10 transform hover:-translate-y-2 hover:scale-105 transition-all duration-500 delay-200 group">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-green-300 transition-colors duration-300">Targeted Campaigns</h3>
            <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors duration-300">Launch personalized retention campaigns based on customer segments</p>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="text-center mb-8 md:mb-16">
          <p className="text-sm text-slate-400 mb-4">Trusted by modern subscription businesses</p>
        </div>
      </div>
    </section>

    {/* Animated Integration Strip - Moved outside hero section */}
    <section className="bg-slate-900 border-t border-slate-800 py-4 md:py-6 overflow-hidden">
      <div className="relative">
        <div className="flex items-center gap-8 md:gap-12 animate-scroll-mobile md:animate-scroll whitespace-nowrap">
          {/* First set of logos */}
          {[
            { name: 'Stripe', Icon: SiStripe, color: 'text-[#635bff]' },
            { name: 'HubSpot', Icon: SiHubspot, color: 'text-[#ff7a59]' },
            { name: 'Salesforce', Icon: SiSalesforce, color: 'text-[#00a1e0]' },
            { name: 'Shopify', Icon: SiShopify, color: 'text-[#96bf47]' },
            { name: 'Mailchimp', Icon: SiMailchimp, color: 'text-[#ffe01b]' },
            { name: 'Intercom', Icon: SiIntercom, color: 'text-[#5190e3]' },
            { name: 'Zendesk', Icon: SiZendesk, color: 'text-[#03363d]' },
            { name: 'Slack', Icon: SiSlack, color: 'text-[#4a154b]' },
            { name: 'Square', Icon: SiSquare, color: 'text-[#3e4348]' },
            { name: 'PayPal', Icon: SiPaypal, color: 'text-[#003087]' },
            { name: 'Twilio', Icon: SiTwilio, color: 'text-[#f22f46]' },
            { name: 'Google', Icon: SiGoogle, color: 'text-[#4285f4]' },
          ].map((integration, index) => (
            <div key={`first-${integration.name}-${index}`} className="flex items-center gap-2 md:gap-3 px-3 md:px-4 flex-shrink-0">
              <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center">
                <integration.Icon className={`w-full h-full ${integration.color} opacity-70 hover:opacity-100 transition-opacity duration-300`} />
              </div>
              <span className="text-slate-400 font-medium text-xs md:text-sm hidden sm:block">{integration.name}</span>
            </div>
          ))}
          
          {/* Duplicate set for seamless loop */}
          {[
            { name: 'Stripe', Icon: SiStripe, color: 'text-[#635bff]' },
            { name: 'HubSpot', Icon: SiHubspot, color: 'text-[#ff7a59]' },
            { name: 'Salesforce', Icon: SiSalesforce, color: 'text-[#00a1e0]' },
            { name: 'Shopify', Icon: SiShopify, color: 'text-[#96bf47]' },
            { name: 'Mailchimp', Icon: SiMailchimp, color: 'text-[#ffe01b]' },
            { name: 'Intercom', Icon: SiIntercom, color: 'text-[#5190e3]' },
            { name: 'Zendesk', Icon: SiZendesk, color: 'text-[#03363d]' },
            { name: 'Slack', Icon: SiSlack, color: 'text-[#4a154b]' },
            { name: 'Square', Icon: SiSquare, color: 'text-[#3e4348]' },
            { name: 'PayPal', Icon: SiPaypal, color: 'text-[#003087]' },
            { name: 'Twilio', Icon: SiTwilio, color: 'text-[#f22f46]' },
            { name: 'Google', Icon: SiGoogle, color: 'text-[#4285f4]' },
          ].map((integration, index) => (
            <div key={`second-${integration.name}-${index}`} className="flex items-center gap-2 md:gap-3 px-3 md:px-4 flex-shrink-0">
              <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center">
                <integration.Icon className={`w-full h-full ${integration.color} opacity-70 hover:opacity-100 transition-opacity duration-300`} />
              </div>
              <span className="text-slate-400 font-medium text-xs md:text-sm hidden sm:block">{integration.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
};