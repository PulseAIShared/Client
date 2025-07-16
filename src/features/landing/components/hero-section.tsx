import React from 'react';
import './css/hero-section.css'; // Import custom styles
import { useWaitlistModal } from '@/hooks/useWaitlistModal';
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
import { Button } from '@/components/ui/button';
import { FaArrowRightLong } from 'react-icons/fa6';
interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: React.ReactNode;
  className?: string;
}

const Link = ({ to, children, className, ...props }: LinkProps) => (
  <a href={to} className={className} {...props}>{children}</a>
);

export const HeroSection = () => {
  const { openWaitlistModal } = useWaitlistModal();

  return (
    <>
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-white">
      {/* Enhanced animated background with multiple layers */}
      <div className="absolute inset-0">
        
        {/* Moving solid orbs */}
        <div className="absolute inset-0">
          <div className="absolute w-96 h-96 bg-sky-500/20 rounded-full blur-3xl animate-pulse" 
               style={{ 
                 top: '10%', 
                 left: '10%', 
                 animationDuration: '6s',
                 transform: 'translate(-50%, -50%)'
               }}></div>
          <div className="absolute w-80 h-80 bg-blue-900/15 rounded-full blur-3xl animate-pulse" 
               style={{ 
                 top: '70%', 
                 right: '10%', 
                 animationDuration: '8s',
                 animationDelay: '2s',
                 transform: 'translate(50%, -50%)'
               }}></div>
          <div className="absolute w-64 h-64 bg-slate-400/20 rounded-full blur-3xl animate-pulse" 
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
                className={`bg-sky-400 rounded-full shadow-2xl`}
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
              <div className="w-1 h-1 bg-slate-400 rounded-full shadow-lg"></div>
            </div>
          );
        })}
      </div>
      
      {/* Enhanced animated grid with depth */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-[linear-gradient(rgba(125,211,252,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.3)_1px,transparent_1px)] bg-[size:100px_100px]"
            style={{ animation: 'gridMove 20s linear infinite' }}
          ></div>
          <div 
            className="absolute inset-0 bg-[linear-gradient(rgba(30,58,138,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,58,138,0.2)_1px,transparent_1px)] bg-[size:50px_50px]"
            style={{ animation: 'gridMove 15s linear infinite reverse' }}
          ></div>
        </div>
      </div>
      
      {/* Content with enhanced animations */}
      <div className="relative z-10 text-center text-blue-900 px-4 max-w-7xl mx-auto pt-20 sm:pt-0">
        <div className="mb-6 animate-fade-in-up">   
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            <span className="text-blue-900">
              PulseLTV
            </span>
            <br />
            <span className="text-blue-900 text-3xl md:text-4xl font-normal opacity-0 animate-fade-in-up delay-300">
              Predict. Prevent. Recover.
            </span>
          </h1>
        </div>
        
            <div className="mb-10 opacity-0 animate-fade-in-up delay-600">
          <p className="text-xl md:text-2xl max-w-4xl mx-auto text-slate-700 font-normal leading-relaxed">
            Turn customer data into <span className="text-sky-600 font-semibold">actionable insights</span>. 
            Identify <span className="text-blue-900 font-semibold">at-risk customers</span>, 
            create <span className="text-blue-900 font-semibold">targeted segments</span>, 
            and launch <span className="text-sky-600 font-semibold">personalized campaigns</span> to 
            <span className="relative inline-block">
              <span className="relative z-10 text-blue-900 font-bold">reduce churn</span>
              <span className="absolute bottom-0 left-0 w-full h-2 bg-sky-400/30 -rotate-1"></span>
            </span> and 
            <span className="relative inline-block ml-1">
              <span className="relative z-10 text-blue-900 font-bold">recover revenue</span>
              <span className="absolute bottom-0 left-0 w-full h-2 bg-sky-400/30 rotate-1"></span>
            </span>.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12 opacity-0 animate-fade-in-up delay-900">
          <Button
            size="lg"
            icon={<FaArrowRightLong  className="w-5 h-5" />}
            onClick={() => openWaitlistModal('hero-section')}
            className="text-lg font-semibold text-white bg-sky-500 rounded-xl hover:shadow-2xl hover:shadow-sky-500/25 transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 gap-2 hover:bg-sky-600 px-8"
          >
            Join Waiting List
          </Button>
          <Link 
            to="#features" 
            className="h-12 px-8 py-3 text-base font-semibold text-blue-900 bg-transparent border-2 border-slate-400 backdrop-blur-sm rounded-xl hover:bg-slate-100 hover:border-slate-500 hover:shadow-lg transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 relative overflow-hidden group flex items-center justify-center"
          >
            <span className="relative">See How It Works</span>
          </Link>
        </div>

        {/* Key capabilities with staggered animations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-6 opacity-0 animate-fade-in-up delay-1000">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 border border-slate-300 hover:bg-white hover:border-slate-400 hover:shadow-2xl hover:shadow-sky-500/10 transform hover:-translate-y-2 hover:scale-105 transition-all duration-500 group">
            <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold mb-2 text-blue-900 group-hover:text-sky-700 transition-colors duration-300">Churn Prediction</h3>
            <p className="text-slate-600 text-sm group-hover:text-slate-700 transition-colors duration-300">AI analyzes customer behavior to identify at-risk users before they leave</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 border border-slate-300 hover:bg-white hover:border-slate-400 hover:shadow-2xl hover:shadow-blue-900/10 transform hover:-translate-y-2 hover:scale-105 transition-all duration-500 delay-100 group">
            <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold mb-2 text-blue-900 group-hover:text-blue-700 transition-colors duration-300">Smart Segmentation</h3>
            <p className="text-slate-600 text-sm group-hover:text-slate-700 transition-colors duration-300">Group customers by behavior, risk level, and value for targeted strategies</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 border border-slate-300 hover:bg-white hover:border-slate-400 hover:shadow-2xl hover:shadow-slate-500/10 transform hover:-translate-y-2 hover:scale-105 transition-all duration-500 delay-200 group">
            <div className="w-10 h-10 bg-slate-400 rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold mb-2 text-blue-900 group-hover:text-slate-700 transition-colors duration-300">Targeted Campaigns</h3>
            <p className="text-slate-600 text-sm group-hover:text-slate-700 transition-colors duration-300">Launch personalized retention campaigns based on customer segments</p>
          </div>
        </div>

      </div>
    </section>

    {/* Animated Integration Strip - Outside hero section */}
    <section className="bg-slate-50 border-t border-slate-200 py-4 md:py-6 overflow-hidden">
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
              <span className="text-slate-600 font-medium text-xs md:text-sm hidden sm:block">{integration.name}</span>
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
              <span className="text-slate-600 font-medium text-xs md:text-sm hidden sm:block">{integration.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
};