import React from 'react';

export const TestimonialsSection = () => {
  const testimonials = [
    {
      content: "Pulse AI reduced our churn rate by 47% in just 3 months. The AI-generated recovery messages feel so natural, our customers don't even realize they're automated. It's like having a customer success team that never sleeps.",
      name: "Sarah Chen",
      role: "Head of Growth",
      company: "TechFlow SaaS",
      stats: "47% churn reduction",
      avatar: "SC",
      color: "from-blue-500 to-purple-500"
    },
    {
      content: "We were manually handling payment failures and losing thousands in revenue. Pulse AI's automated dunning management recovered $180K for us last quarter alone. The ROI is incredible.",
      name: "Marcus Rodriguez",
      role: "VP of Revenue",
      company: "LearnHub Pro",
      stats: "$180K recovered",
      avatar: "MR",
      color: "from-green-500 to-emerald-500"
    },
    {
      content: "The predictive analytics are game-changing. We can now see which customers are likely to churn weeks before it happens and take proactive action. Our customer lifetime value has increased by 35%.",
      name: "Emily Foster",
      role: "Customer Success Director",
      company: "FitnessPro",
      stats: "35% LTV increase",
      avatar: "EF",
      color: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-6">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <span className="text-sm font-medium text-green-700">Customer Success Stories</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Real results from real businesses
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            See how subscription businesses are using Pulse AI to reduce churn, recover revenue, and grow their customer lifetime value.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="group bg-white p-8 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all duration-300 relative overflow-hidden"
            >
              {/* Gradient background that appears on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              <div className="relative">
                {/* Quote icon */}
                <div className="mb-6">
                  <svg className="w-10 h-10 text-slate-300 group-hover:text-slate-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm12 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z"/>
                  </svg>
                </div>
                
                {/* Testimonial content */}
                <blockquote className="text-slate-700 leading-relaxed mb-8 text-lg">
                  "{testimonial.content}"
                </blockquote>
                
                {/* Stats highlight */}
                <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${testimonial.color} text-white px-4 py-2 rounded-full text-sm font-semibold mb-6`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  {testimonial.stats}
                </div>
                
                {/* Author info */}
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white font-bold`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                    <div className="text-slate-600 text-sm">{testimonial.role}</div>
                    <div className="text-slate-500 text-sm">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional social proof */}
        <div className="mt-20 text-center">
          <div className="bg-slate-900 rounded-2xl p-12 max-w-5xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-8">
              Join 500+ subscription businesses growing with Pulse AI
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">$2.4M+</div>
                <div className="text-slate-400 text-sm">Revenue Recovered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">47%</div>
                <div className="text-slate-400 text-sm">Avg. Churn Reduction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">73%</div>
                <div className="text-slate-400 text-sm">Recovery Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400 mb-2">20hrs</div>
                <div className="text-slate-400 text-sm">Weekly Time Saved</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-1 transition-all duration-200">
                Start Your Free Trial
              </button>
              <button className="px-6 py-3 text-white border border-slate-600 rounded-lg hover:bg-slate-800 transition-colors duration-200">
                Schedule a Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};