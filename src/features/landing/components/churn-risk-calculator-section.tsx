import { ChurnRiskCalculator } from '@/components/calculators';
import { useWaitlistModal } from '@/hooks/useWaitlistModal';
import React from 'react';

export const ChurnRiskCalculatorSection = () => {
    const { openWaitlistModal } = useWaitlistModal();
  return (
    <section className="py-24 bg-gray-50/30 relative overflow-hidden" id="calculator">
      {/* Subtle background elements */}
      <div className="absolute inset-0">
        <div className="absolute w-80 h-80 bg-purple-500/8 rounded-full blur-3xl animate-pulse" 
             style={{ 
               top: '10%', 
               left: '15%', 
               animationDuration: '9s',
               animationDelay: '2s'
             }}></div>
        <div className="absolute w-72 h-72 bg-blue-600/10 rounded-full blur-3xl animate-pulse" 
             style={{ 
               bottom: '20%', 
               right: '10%', 
               animationDuration: '7s'
             }}></div>
        <div className="absolute w-64 h-64 bg-sky-500/6 rounded-full blur-3xl animate-pulse" 
             style={{ 
               top: '70%', 
               left: '60%', 
               animationDuration: '11s',
               animationDelay: '4s'
             }}></div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 animate-fade-in-up">

          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
         See how much you can save with our
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          churn risk calculator
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Calculate your potential revenue recovery and see the impact of better churn prevention
          </p>
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <ChurnRiskCalculator />
        </div>
        </div>
   
    </section>
  );
};