import React from 'react';
import { motion } from 'framer-motion';
import { ChurnRiskCalculator } from '@/components/calculators/churn-risk-calculator';
import { LandingLayout } from '@/components/layouts';
import { useWaitlistModal } from '@/hooks/useWaitlistModal';

export default function ChurnCalculatorPage() {
  const { openWaitlistModal } = useWaitlistModal();

  return (
    <LandingLayout>

      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6">
              Stop Losing Revenue to
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Churn</span>
            </h1>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Calculate exactly how much revenue you're losing to customer churn and discover the potential savings with AI-powered retention strategies.
            </p>
          </motion.div>

          {/* Calculator Component */}
          <ChurnRiskCalculator />

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-20"
          >
            <h2 className="text-3xl font-bold text-text-primary text-center mb-12">
              Why Churn Matters More Than You Think
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-surface-primary rounded-xl p-6 border border-border-primary">
                <div className="w-12 h-12 bg-error/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">Hidden Revenue Loss</h3>
                <p className="text-text-secondary">
                  Most businesses underestimate their churn impact. A 5% monthly churn rate means losing 60% of customers annually.
                </p>
              </div>

              <div className="bg-surface-primary rounded-xl p-6 border border-border-primary">
                <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">Acquisition vs Retention</h3>
                <p className="text-text-secondary">
                  Acquiring new customers costs 5-25x more than retaining existing ones. Retention is your growth multiplier.
                </p>
              </div>

              <div className="bg-surface-primary rounded-xl p-6 border border-border-primary">
                <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">Predictable Prevention</h3>
                <p className="text-text-secondary">
                  AI-powered analytics can predict which customers will churn, allowing proactive retention campaigns.
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-20 text-center"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Stop the Revenue Leak?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join hundreds of companies using PulseLTV to reduce churn by up to 65% with predictive analytics and automated retention campaigns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => openWaitlistModal('churn-calculator-cta')}
                  className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Join Waiting List
                </button>
                <a 
                  href="/book-demo"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors duration-200 text-center"
                >
                  Book Demo
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </LandingLayout>
  );
}