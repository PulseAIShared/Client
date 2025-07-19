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
      {/* Enhanced flowing background elements */}
      <div className="absolute inset-0">
        {/* Main flowing orbs continuing the theme */}
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-flow-bg" 
             style={{ 
               top: '5%', 
               left: '10%', 
               animationDelay: '3s'
             }}></div>
        <div className="absolute w-88 h-88 bg-blue-600/12 rounded-full blur-3xl animate-flow-bg" 
             style={{ 
               bottom: '10%', 
               right: '8%', 
               animationDelay: '10s'
             }}></div>
        <div className="absolute w-72 h-72 bg-sky-500/8 rounded-full blur-3xl animate-flow-bg" 
             style={{ 
               top: '60%', 
               left: '70%', 
               animationDelay: '16s'
             }}></div>
        <div className="absolute w-60 h-60 bg-indigo-500/6 rounded-full blur-3xl animate-flow-bg" 
             style={{ 
               top: '30%', 
               right: '20%', 
               animationDelay: '8s'
             }}></div>

        {/* Additional floating particles */}
        {[...Array(10)].map((_, i) => {
          const size = 2 + Math.random() * 4;
          const delay = Math.random() * 6;
          const duration = 5 + Math.random() * 5;
          return (
            <div
              key={`calc-particle-${i}`}
              className="absolute opacity-25"
              style={{
                top: `${10 + Math.random() * 80}%`,
                left: `${5 + Math.random() * 90}%`,
                animation: `floatGentle ${duration}s ${delay}s infinite ease-in-out`,
              }}
            >
              <div 
                className="bg-purple-400 rounded-full"
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
        {/* Section Header */}
        <div 
          ref={headerRef}
          className={`text-center mb-20 transition-all duration-800 ${
            headerVisible ? 'scroll-animate animate' : 'scroll-animate'
          }`}
        >

          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
         See how much you can save with our
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-blue-900">
          churn risk calculator
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Calculate your potential revenue recovery and see the impact of better churn prevention
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