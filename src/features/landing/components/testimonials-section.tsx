import React from 'react';
import { useWaitlistModal } from '@/hooks/useWaitlistModal';

export const TestimonialsSection = () => {
  const { openWaitlistModal } = useWaitlistModal();
  const steps = [
    {
      number: "01",
      title: "Connect Your Tools",
      description: "Connect integrations like HubSpot, Stripe, and Salesforce. Our platform automatically syncs and validates your data in real-time.",
      icon: "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 011 1v1z",
      color: "from-sky-500 to-sky-600"
    },
    {
      number: "02", 
      title: "Run Churn Analysis",
      description: "AI analyzes customer behavior, payment patterns, and engagement to identify at-risk customers and assign risk scores.",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      color: "from-blue-800 to-blue-900"
    },
    {
      number: "03",
      title: "Create Segments",
      description: "Group customers by risk level, behavior, and value. Build targeted segments for focused retention strategies.",
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      color: "from-gray-500 to-gray-600"
    },
    {
      number: "04",
      title: "Launch Campaigns",
      description: "Create targeted retention campaigns using your customer segments. Send personalized messages to high-risk customers, payment failures, and other specific groups.",
      icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      color: "from-green-500 to-green-600"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-sky-100 px-4 py-2 rounded-full mb-6">
            <div className="w-2 h-2 bg-sky-600 rounded-full"></div>
            <span className="text-sm font-medium text-sky-700">How It Works</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
            From data to insights in four simple steps
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            PulseLTV makes it easy to turn your customer data into actionable retention strategies. Here's how it works.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
            >
              {/* Gradient background that appears on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              <div className="relative">
                {/* Step number and icon */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                    </svg>
                  </div>
                  <div>
                    <div className={`text-sm font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                      STEP {step.number}
                    </div>
                    <h3 className="text-xl font-bold text-blue-900">{step.title}</h3>
                  </div>
                </div>
                
                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-blue-900 rounded-2xl p-12 max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to start reducing churn?
            </h3>
            <p className="text-blue-200 mb-8 text-lg">
              Join subscription businesses using PulseLTV to turn customer insights into revenue growth.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => openWaitlistModal('testimonials-section')}
                className="px-8 py-4 bg-sky-500 text-white font-semibold rounded-xl hover:bg-sky-600 hover:shadow-lg hover:shadow-sky-500/25 transform hover:-translate-y-1 transition-all duration-200"
              >
                Join Waiting List
              </button>
              <a
                href="#features"
                className="px-8 py-4 text-white border border-blue-600 rounded-xl hover:bg-blue-800 transition-colors duration-200"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};