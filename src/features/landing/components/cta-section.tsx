import React from 'react';
import { useWaitlistModal } from '@/hooks/useWaitlistModal';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import './css/hero-section.css';

export const CTASection = () => {
  const { openWaitlistModal } = useWaitlistModal();
  const { elementRef: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { elementRef: buttonsRef, isVisible: buttonsVisible } = useScrollAnimation();
  const { elementRef: featuresRef, isVisible: featuresVisible } = useScrollAnimation();

  return (
    <section className="py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden" id="cta">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div 
            ref={headerRef}
            className={`mb-12 transition-all duration-800 ${
              headerVisible ? 'scroll-animate animate' : 'scroll-animate'
            }`}
          >

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Stop losing customers.
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-300">
                Start recovering revenue.
              </span>
            </h2>
            
            <p className="text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
              Join hundreds of subscription businesses using PulseLTV to predict churn, recover failed payments, and maximize customer lifetime value — all automatically.
            </p>
          </div>
          
          {/* Main CTA Buttons */}
          <div 
            ref={buttonsRef}
            className={`flex flex-col sm:flex-row gap-6 justify-center mb-16 transition-all duration-800 ${
              buttonsVisible ? 'scroll-animate-scale animate' : 'scroll-animate-scale'
            }`}
          >
            <button 
              onClick={() => openWaitlistModal('cta-section')}
              className="group px-8 py-4 text-lg font-semibold text-white bg-sky-500 rounded-xl hover:bg-sky-600 hover:shadow-2xl hover:shadow-sky-500/25 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
            >
              Join Waiting List
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <a 
              href="/book-demo"
              className="px-8 py-4 text-lg font-semibold text-white bg-transparent border-2 border-blue-400/30 backdrop-blur-sm rounded-xl hover:bg-white/10 hover:border-white/50 transform hover:-translate-y-1 transition-all duration-300 text-center inline-block"
            >
              Schedule a Demo
            </a>
          </div>

          {/* Trust indicators and features */}
          <div 
            ref={featuresRef}
            className={`grid md:grid-cols-3 gap-8 mb-16 transition-all duration-800 ${
              featuresVisible ? 'scroll-animate animate' : 'scroll-animate'
            }`}
          >
            <div className="text-center">
              <div className="bg-green-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Free 14-Day Trial</h3>
              <p className="text-blue-300">No credit card required. Full access to all features.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-sky-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">5-Minute Setup</h3>
              <p className="text-blue-300">Connect your existing tools and start predicting churn instantly.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">24/7 Support</h3>
              <p className="text-blue-300">Get help whenever you need it from our expert team.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};