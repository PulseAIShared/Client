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
    <section className="py-32 bg-slate-900 relative overflow-hidden" id="cta">
      {/* Background elements - reduced motion */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
        <div className="motion-safe:block motion-reduce:hidden">
          <div className="absolute top-10 right-10 w-72 h-72 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div
            ref={headerRef}
            className={`mb-12 transition-all duration-800 ${headerVisible ? 'scroll-animate animate' : 'scroll-animate'
              }`}
          >

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Become a design partner.
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-300">
                Shape the future of churn prevention.
              </span>
            </h2>

            <p className="text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
              We're onboarding a small group of design partners who want to close the loop on churn — detect, decide, act, and measure real revenue outcomes.
            </p>
          </div>

          {/* Main CTA Buttons */}
          <div
            ref={buttonsRef}
            className={`flex flex-col sm:flex-row gap-6 justify-center mb-16 transition-all duration-800 ${buttonsVisible ? 'scroll-animate-scale animate' : 'scroll-animate-scale'
              }`}
          >
            <a
              href="/book-demo"
              className="group px-8 py-4 text-lg font-semibold text-white bg-sky-500 rounded-xl hover:bg-sky-600 hover:shadow-2xl hover:shadow-sky-500/25 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
            >
              Book a Demo
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <button
              onClick={() => openWaitlistModal('cta-section')}
              className="px-8 py-4 text-lg font-semibold text-white bg-transparent border-2 border-blue-400/30 backdrop-blur-sm rounded-xl hover:bg-white/10 hover:border-white/50 transform hover:-translate-y-1 transition-all duration-300"
            >
              Join Waitlist
            </button>
          </div>

          {/* Design Partner Benefits */}
          <div
            ref={featuresRef}
            className={`grid md:grid-cols-3 gap-8 mb-16 transition-all duration-800 ${featuresVisible ? 'scroll-animate animate' : 'scroll-animate'
              }`}
          >
            <div className="text-center">
              <div className="bg-sky-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Founder Onboarding</h3>
              <p className="text-blue-300">Work directly with our team to configure Pulse for your specific churn challenges.</p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Early Partner Pricing</h3>
              <p className="text-blue-300">Lock in discounted rates as a design partner — before general availability.</p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Direct Roadmap Input</h3>
              <p className="text-blue-300">Your feedback shapes what we build next. Request features, integrations, and playbooks.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};