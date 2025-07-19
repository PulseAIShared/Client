import React from 'react';
import { useWaitlistModal } from '@/hooks/useWaitlistModal';
import { useScrollAnimation, useStaggeredAnimation } from '@/hooks/useScrollAnimation';
import './css/hero-section.css';

export const FeatureIconsSection = () => {
  const { elementRef: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { elementRef: gridRef, visibleItems } = useStaggeredAnimation(6);

  const features = [
    {
      name: 'Churn Prediction',
      description: 'AI-powered risk scoring identifies at-risk customers before they churn',
      icon: (
        <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-sky-500 to-sky-600'
    },
    {
      name: 'Smart Recovery',
      description: 'Automated personalized campaigns to re-engage and recover customers',
      icon: (
        <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      color: 'from-blue-800 to-blue-900'
    },
    {
      name: 'Payment Recovery',
      description: 'Intelligent dunning and retry logic to recover failed payments automatically',
      icon: (
        <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'User Segmentation',
      description: 'Advanced analytics to segment customers by behavior and risk factors',
      icon: (
        <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 215.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'from-gray-500 to-gray-600'
    },
    {
      name: 'Revenue Analytics',
      description: 'Real-time dashboards showing recovery metrics and business health',
      icon: (
        <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'from-sky-600 to-blue-800'
    },
    {
      name: 'Multi-channel Outreach',
      description: 'Reach customers via email, SMS, in-app notifications, and more',
      icon: (
        <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
      color: 'from-gray-600 to-gray-700'
    }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="features">
      {/* Enhanced flowing background elements */}
      <div className="absolute inset-0">
        {/* Main flowing orbs */}
        <div className="absolute w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-flow-bg" 
             style={{ 
               top: '15%', 
               left: '5%', 
               animationDelay: '5s'
             }}></div>
        <div className="absolute w-88 h-88 bg-blue-400/12 rounded-full blur-3xl animate-flow-bg" 
             style={{ 
               bottom: '5%', 
               right: '8%', 
               animationDelay: '12s'
             }}></div>
        <div className="absolute w-72 h-72 bg-green-400/8 rounded-full blur-3xl animate-flow-bg" 
             style={{ 
               top: '5%', 
               right: '15%', 
               animationDelay: '18s'
             }}></div>
        <div className="absolute w-80 h-80 bg-purple-500/9 rounded-full blur-3xl animate-flow-bg" 
             style={{ 
               top: '70%', 
               left: '70%', 
               animationDelay: '2s'
             }}></div>
        <div className="absolute w-60 h-60 bg-indigo-400/7 rounded-full blur-3xl animate-flow-bg" 
             style={{ 
               top: '40%', 
               left: '40%', 
               animationDelay: '15s'
             }}></div>

        {/* Feature-themed floating particles */}
        {[...Array(12)].map((_, i) => {
          const size = 1.5 + Math.random() * 3;
          const delay = Math.random() * 8;
          const duration = 6 + Math.random() * 6;
          const colors = ['bg-sky-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-indigo-400'];
          const color = colors[i % colors.length];
          return (
            <div
              key={`feature-particle-${i}`}
              className="absolute opacity-20"
              style={{
                top: `${5 + Math.random() * 90}%`,
                left: `${5 + Math.random() * 90}%`,
                animation: `floatGentle ${duration}s ${delay}s infinite ease-in-out`,
              }}
            >
              <div 
                className={`${color} rounded-full`}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  filter: 'blur(0.5px)',
                }}
              ></div>
            </div>
          );
        })}
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div 
          ref={headerRef}
          className={`text-center mb-16 transition-all duration-800 ${
            headerVisible ? 'scroll-animate animate' : 'scroll-animate'
          }`}
        >

          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
            Everything you need to
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-900">
              maximize subscription revenue
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            PulseLTV combines predictive analytics, automation, and personalization to help subscription businesses retain more customers and recover more revenue.
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            // Create different entrance directions for visual interest
            const animationClass = index % 3 === 0 ? 'scroll-animate-left' : 
                                   index % 3 === 1 ? 'scroll-animate' : 
                                   'scroll-animate-right';
            
            return (
              <div
                key={index}
                className={`group relative bg-gray-50 hover:bg-white p-8 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 ${
                  visibleItems.has(index) ? `${animationClass} animate` : animationClass
                }`}
                style={{ 
                  transitionDelay: `${index * 120}ms`,
                }}
              >
              {/* Gradient background that appears on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
              
              <div className="relative">
                {/* Icon */}
                <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 animate-float-gentle`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-blue-900 mb-3 group-hover:text-blue-800">
                  {feature.name}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700">
                  {feature.description}
                </p>
                
                {/* Arrow that appears on hover */}
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-sky-600">
                    Learn more
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>


      </div>
    </section>
  );
};