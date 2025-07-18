import React from 'react';
import { useWaitlistModal } from '@/hooks/useWaitlistModal';

export const HowItWorksSection = () => {
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
    <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-blue-500/6 rounded-full blur-3xl animate-pulse" 
             style={{ 
               top: '10%', 
               right: '5%', 
               animationDuration: '8s',
               animationDelay: '1s'
             }}></div>
        <div className="absolute w-72 h-72 bg-sky-400/8 rounded-full blur-3xl animate-pulse" 
             style={{ 
               bottom: '15%', 
               left: '8%', 
               animationDuration: '10s',
               animationDelay: '3s'
             }}></div>
        <div className="absolute w-48 h-48 bg-purple-400/5 rounded-full blur-3xl animate-pulse" 
             style={{ 
               top: '60%', 
               left: '70%', 
               animationDuration: '12s',
               animationDelay: '5s'
             }}></div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20 animate-fade-in-up">

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
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden group animate-fade-in-up"
              style={{ animationDelay: `${index * 0.2}s` }}
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

        {/* Call to action */}
        <div className="text-center mt-20 animate-fade-in-up" style={{ animationDelay: '1.0s' }}>
          <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-2xl p-8 max-w-4xl mx-auto shadow-xl border border-blue-700/50 relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl"></div>
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ready to reduce churn and recover revenue?
              </h3>
              <p className="text-blue-200 mb-6 max-w-2xl mx-auto">
                Join hundreds of subscription businesses using PulseLTV to automatically predict, prevent, and recover from customer churn.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => openWaitlistModal('how-it-works-section')}
                  className="px-6 py-3 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 hover:shadow-lg hover:shadow-sky-500/25 transform hover:-translate-y-1 transition-all duration-200"
                >
                  Join Waiting List
                </button>
                <a 
                  href="/book-demo"
                  className="px-6 py-3 text-white border border-blue-400/50 rounded-lg hover:bg-blue-700/50 transition-colors duration-200 text-center inline-block"
                >
                  Schedule Demo
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};