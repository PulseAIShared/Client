import React from 'react';
import { useWaitlistModal } from '@/hooks/useWaitlistModal';
import { useScrollAnimation, useStaggeredAnimation } from '@/hooks/useScrollAnimation';
import './css/hero-section.css';

export const HowItWorksSection = () => {
  const { openWaitlistModal } = useWaitlistModal();
  const { elementRef: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { elementRef: gridRef, visibleItems } = useStaggeredAnimation(4);
  const { elementRef: ctaRef, isVisible: ctaVisible } = useScrollAnimation();

  const steps = [
    {
      number: "01",
      title: "Connect Your Tools",
      description: "Link your payment processor, CRM, or support tools. Start with just one integration. Accuracy improves as you add more data sources.",
      icon: "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 011 1v1z",
      color: "from-sky-500 to-sky-600"
    },
    {
      number: "02",
      title: "Build Churn Signal",
      description: "Pulse analyzes customer behavior to build a unified risk score and, crucially, explains why each customer is at risk (payment issue, low engagement, support friction, etc.).",
      icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
      color: "from-blue-800 to-blue-900"
    },
    {
      number: "03",
      title: "Choose Action via Playbooks",
      description: "Select from pre-built playbooks or create your own rules. Each playbook maps a root cause to the right intervention, so there's no guessing required.",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      number: "04",
      title: "Execute & Track Results",
      description: "Actions trigger through your existing tools (Stripe retry, HubSpot outreach, Intercom message). Track revenue saved, recovered payments, and churn avoided in one dashboard.",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      color: "from-emerald-500 to-emerald-600"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
      {/* Subtle background elements - reduced motion */}
      <div className="absolute inset-0 motion-safe:block motion-reduce:hidden">
        {/* Soft ambient orbs - fewer and more subtle */}
        <div className="absolute w-96 h-96 bg-sky-500/5 rounded-full blur-3xl"
          style={{
            top: '10%',
            right: '5%',
          }}></div>
        <div className="absolute w-80 h-80 bg-blue-600/5 rounded-full blur-3xl"
          style={{
            bottom: '15%',
            left: '8%',
          }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          ref={headerRef}
          className={`text-center mb-20 transition-all duration-800 ${headerVisible ? 'scroll-animate animate' : 'scroll-animate'
            }`}
        >

          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
            From risk signal to revenue saved in four steps
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            PulseLTV closes the loop on churn: detect, decide, act, measure. No marketing automation suite, just precise intervention through your existing tools.
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`bg-white/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-200 hover:shadow-xl transition-all duration-500 relative overflow-hidden group hover:-translate-y-1 ${visibleItems.has(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                }`}
              style={{
                transitionDelay: `${index * 100}ms`,
              }}
            >
              {/* Gradient background that appears on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

              <div className="relative">
                {/* Step number and icon */}
                <div className="flex items-start justify-between mb-8">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                    </svg>
                  </div>
                  <span className="text-6xl font-bold text-slate-100 select-none group-hover:text-slate-200 transition-colors duration-300">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-4">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {step.description}
                </p>

                {/* Hover accent line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${step.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-full origin-left mt-8`} />

              </div>
            </div>
          ))}
        </div>

        {/* Concrete Example Flow */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-6 md:p-8 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">
              Example: Payment failure recovery
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 shadow-sm border border-slate-100">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-slate-700">Stripe payment fails</span>
              </div>
              <svg className="w-5 h-5 text-slate-400 rotate-90 md:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 shadow-sm border border-slate-100">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <span className="text-slate-700">Pulse detects &amp; selects retry playbook</span>
              </div>
              <svg className="w-5 h-5 text-slate-400 rotate-90 md:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 shadow-sm border border-slate-100">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-700">Stripe retry succeeds → revenue recovered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div
          ref={ctaRef}
          className={`text-center mt-16 transition-all duration-800 ${ctaVisible ? 'scroll-animate animate' : 'scroll-animate'
            }`}
        >
          <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-2xl p-8 max-w-4xl mx-auto shadow-xl border border-blue-700/50 relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl"></div>
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ready to close the loop on churn?
              </h3>
              <p className="text-blue-200 mb-6 max-w-2xl mx-auto">
                See how PulseLTV connects detection to action and measures real revenue impact.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/book-demo"
                  className="px-6 py-3 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 hover:shadow-lg hover:shadow-sky-500/25 transform hover:-translate-y-1 transition-all duration-200 text-center inline-block"
                >
                  Book a Demo
                </a>
                <button
                  onClick={() => openWaitlistModal('how-it-works-section')}
                  className="px-6 py-3 text-white border border-blue-400/50 rounded-lg hover:bg-blue-700/50 transition-colors duration-200"
                >
                  Join Waitlist
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};