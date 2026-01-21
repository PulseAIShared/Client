import { ChurnRiskCalculator } from '@/components/calculators';
import { useWaitlistModal } from '@/hooks/useWaitlistModal';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import React from 'react';
import './css/hero-section.css';

export const ChurnRiskCalculatorSection = () => {
  const { openWaitlistModal } = useWaitlistModal();
  const { elementRef: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { elementRef: calculatorRef, isVisible: calculatorVisible } = useScrollAnimation();
  
  return (
    <section className="py-24 bg-white relative overflow-hidden" id="calculator">
      {/* Subtle background elements - reduced motion */}
      <div className="absolute inset-0 motion-safe:block motion-reduce:hidden">
        {/* Soft ambient orbs - fewer and more subtle */}
        <div className="absolute w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
             style={{
               top: '5%',
               left: '10%',
             }}></div>
        <div className="absolute w-80 h-80 bg-blue-600/5 rounded-full blur-3xl"
             style={{
               bottom: '10%',
               right: '8%',
             }}></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`text-center mb-12 transition-all duration-800 ${
            headerVisible ? 'scroll-animate animate' : 'scroll-animate'
          }`}
        >

          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
            Estimate your recoverable
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-900">
              revenue opportunity
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Enter your metrics to see what revenue could be at stake and what a churn reduction strategy might recover.
          </p>
        </div>

        {/* What You'll Learn Block */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Revenue at Risk</h3>
              <p className="text-sm text-slate-600">See how much MRR is tied to customers likely to churn this quarter</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Recovery Potential</h3>
              <p className="text-sm text-slate-600">Estimate how much you could save with proactive intervention</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Annual Impact</h3>
              <p className="text-sm text-slate-600">Project the 12-month value of reducing your churn rate</p>
            </div>
          </div>
          <p className="text-center text-sm text-slate-500 mt-4">
            <span className="font-medium">More inputs = more accuracy:</span> Connect payment, engagement, and support data for precise risk scoring.
          </p>
        </div>

        <div
          ref={calculatorRef}
          className={`transition-all duration-800 ${
            calculatorVisible ? 'scroll-animate-scale animate' : 'scroll-animate-scale'
          }`}
        >
          <ChurnRiskCalculator />
        </div>
        </div>
   
    </section>
  );
};