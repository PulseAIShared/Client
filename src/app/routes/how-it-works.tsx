import React from 'react';
import { Link } from 'react-router-dom';
import { LandingLayout } from '@/components/layouts';
import { useWaitlistModal } from '@/hooks/useWaitlistModal';

const HowItWorksRoute = () => {
  const { openWaitlistModal } = useWaitlistModal();

  const steps = [
    {
      number: '01',
      title: 'Connect Your Tools',
      description:
        'Link your payment processor (Stripe), CRM (HubSpot, Salesforce), or support tools (Intercom, Zendesk). Start with just one integration — accuracy improves as you add more data sources.',
      details: [
        'OAuth or API key connection — no engineering required',
        'Data syncs automatically in real-time',
        'Works with just one integration to start',
        'Add more sources over time for deeper signals',
      ],
      color: 'sky',
    },
    {
      number: '02',
      title: 'Build Churn Signal',
      description:
        'Pulse analyzes customer behavior across all connected tools to build a unified risk score. More importantly, it explains WHY each customer is at risk — not just that they are.',
      details: [
        'One risk score per customer, updated continuously',
        'Root cause attribution (payment issue, low engagement, support friction)',
        'Historical trend tracking',
        'Confidence level based on available data',
      ],
      color: 'blue',
    },
    {
      number: '03',
      title: 'Choose Action via Playbooks',
      description:
        'Select from pre-built playbooks or create custom rules. Each playbook maps a churn reason to the right intervention — no guessing, no one-size-fits-all campaigns.',
      details: [
        'Pre-built playbooks for payment failures, low engagement, support issues',
        'Custom rules you can configure and audit',
        'Transparent logic — see exactly why an action was chosen',
        'Override capability for manual review',
      ],
      color: 'indigo',
    },
    {
      number: '04',
      title: 'Execute & Track Results',
      description:
        'Actions trigger through your existing tools — Stripe for payment retries, HubSpot for outreach, Slack for team alerts. Track revenue saved, not just "churn reduced".',
      details: [
        'Payment retries via Stripe with optimized timing',
        'Outreach via HubSpot, Intercom, or email',
        'Team alerts via Slack or webhooks',
        'Revenue saved dashboard with clear attribution',
      ],
      color: 'emerald',
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    sky: { bg: 'bg-sky-100', text: 'text-sky-600', border: 'border-sky-200' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200' },
  };

  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            How PulseLTV Works
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            From risk signal to revenue saved in four steps. Detect, decide, act, measure — through your existing tools.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {steps.map((step, index) => {
              const colors = colorClasses[step.color];
              return (
                <div
                  key={step.number}
                  className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-16 h-16 rounded-2xl ${colors.bg} flex items-center justify-center`}
                      >
                        <span className={`text-2xl font-bold ${colors.text}`}>
                          {step.number}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-slate-900 mb-4">
                        {step.title}
                      </h2>
                      <p className="text-slate-600 mb-6 text-lg">
                        {step.description}
                      </p>
                      <ul className="space-y-3">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <svg
                              className={`w-5 h-5 flex-shrink-0 ${colors.text} mt-0.5`}
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
                            <span className="text-slate-700">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Example Flow */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Example: Payment Failure Recovery
          </h2>
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-8 border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Payment Fails</h3>
                <p className="text-sm text-slate-600">Stripe reports a declined card</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Pulse Detects</h3>
                <p className="text-sm text-slate-600">Risk score increases, reason: payment</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Playbook Activates</h3>
                <p className="text-sm text-slate-600">Payment retry sequence selected</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Revenue Recovered</h3>
                <p className="text-sm text-slate-600">Retry succeeds, saved: $XXX</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to close the loop on churn?
          </h2>
          <p className="text-blue-200 mb-8 max-w-2xl mx-auto">
            See how PulseLTV connects detection to action — and measures real revenue impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/book-demo"
              className="px-8 py-3 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors"
            >
              Book a Demo
            </Link>
            <button
              onClick={() => openWaitlistModal('how-it-works-page')}
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

export default HowItWorksRoute;
