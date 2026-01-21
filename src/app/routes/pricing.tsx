import React from 'react';
import { Link } from 'react-router-dom';
import { LandingLayout } from '@/components/layouts';
import { useWaitlistModal } from '@/hooks/useWaitlistModal';

const PricingRoute = () => {
  const { openWaitlistModal } = useWaitlistModal();

  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Pricing</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            PulseLTV is currently in beta. We're onboarding design partners who want to shape the product.
          </p>
        </div>
      </section>

      {/* Design Partner Offering */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-sky-500 to-indigo-500 px-8 py-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  Limited Availability
                </span>
              </div>
              <h2 className="text-2xl font-bold">Design Partner Program</h2>
              <p className="text-sky-100 mt-1">
                Early access for subscription businesses serious about reducing churn
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  What You Get as a Design Partner
                </h3>
                <ul className="space-y-3">
                  {[
                    {
                      title: 'Founder Onboarding',
                      description:
                        "Work directly with our team to configure Pulse for your specific churn challenges. We'll map your customer journey and identify the highest-impact playbooks.",
                    },
                    {
                      title: 'Early Partner Pricing',
                      description:
                        'Lock in discounted rates that will be grandfathered when we launch publicly. Pricing will be based on your customer volume.',
                    },
                    {
                      title: 'Direct Roadmap Input',
                      description:
                        'Your feedback directly shapes what we build. Request integrations, playbooks, and features, and see them prioritized.',
                    },
                    {
                      title: 'Priority Support',
                      description:
                        'Direct Slack/Discord channel with the founding team. Issues get addressed fast.',
                    },
                    {
                      title: 'Full Platform Access',
                      description:
                        'All current and future features included during the design partner period.',
                    },
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <div>
                        <span className="font-medium text-slate-900">{item.title}</span>
                        <span className="text-slate-600">: {item.description}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-slate-200 pt-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">What We're Looking For</h3>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
                    Subscription businesses with recurring revenue
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
                    Using Stripe, HubSpot, or Intercom (or similar tools)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
                    Active churn problem you want to address
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
                    Willing to provide feedback and participate in calls
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-slate-50 px-8 py-6 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-slate-600">
                  <span className="font-semibold text-slate-900">Limited spots available.</span> We're
                  only onboarding a small number of design partners.
                </p>
                <Link
                  to="/book-demo"
                  className="px-6 py-3 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors whitespace-nowrap"
                >
                  Book a Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Future Pricing Note */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            What About Public Pricing?
          </h2>
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
            <p className="text-slate-600 mb-6">
              We're still finalizing our public pricing model. What we can tell you:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Aligned with Outcomes</h3>
                <p className="text-sm text-slate-600">
                  We're exploring pricing models that tie our success to your revenue saved, not just
                  seats or usage.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Scales with Your Business</h3>
                <p className="text-sm text-slate-600">
                  Pricing will be based on your customer volume, not the number of team members using
                  the platform.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">No Surprise Bills</h3>
                <p className="text-sm text-slate-600">
                  We'll always be transparent about costs. No hidden fees for integrations or features.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Design Partner Lock-In</h3>
                <p className="text-sm text-slate-600">
                  Design partners will get grandfathered rates when public pricing launches.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'Is there a free tier or trial?',
                a: "Not currently. During the design partner phase, we're working closely with a small group of businesses. As we launch publicly, we'll introduce options for smaller teams to try the platform.",
              },
              {
                q: 'How long is the design partner commitment?',
                a: "We ask for a 3-month commitment to give the platform time to demonstrate value. You can cancel anytime, but the most value comes from iterating together.",
              },
              {
                q: 'Do I need all the integrations to get started?',
                a: 'No. You can start with just one integration (like Stripe) and add more over time. Each additional data source increases the accuracy of your churn predictions.',
              },
              {
                q: 'What happens after the design partner phase?',
                a: "You'll transition to our standard pricing, but at the discounted rate you locked in as a design partner. No sudden price increases.",
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to join?</h2>
          <p className="text-blue-200 mb-8 max-w-2xl mx-auto">
            Book a demo to see if PulseLTV is a fit for your churn challenges and to learn about
            design partner availability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/book-demo"
              className="px-8 py-3 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors"
            >
              Book a Demo
            </Link>
            <button
              onClick={() => openWaitlistModal('pricing-page')}
              className="px-8 py-3 text-white border border-blue-400/50 rounded-lg hover:bg-white/10 transition-colors"
            >
              Join Waitlist
            </button>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default PricingRoute;
