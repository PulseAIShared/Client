import React from 'react';
import { Link } from 'react-router-dom';
import { LandingLayout } from '@/components/layouts';
import { useWaitlistModal } from '@/hooks/useWaitlistModal';

const UseCasesRoute = () => {
  const { openWaitlistModal } = useWaitlistModal();

  const useCases = [
    {
      title: 'Failed Payment Recovery',
      description:
        'Automatically detect and recover from payment failures before they become involuntary churn.',
      problem: 'Payment failures account for 20-40% of churn, but most teams only react after cancellation.',
      solution:
        'PulseLTV detects payment failures in real-time, triggers smart retry logic via Stripe, and escalates to outreach when needed.',
      outcomes: [
        'Recover failed payments before they lapse',
        'Reduce involuntary churn by targeting the root cause',
        'Track exact revenue saved per recovery',
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      color: 'emerald',
    },
    {
      title: 'Low Engagement Intervention',
      description:
        'Identify customers showing signs of disengagement and intervene before they decide to cancel.',
      problem:
        'By the time a customer reaches out to cancel, their decision is often already made. Early signals get missed.',
      solution:
        'PulseLTV monitors engagement patterns across your stack and flags customers who are trending toward inactivity.',
      outcomes: [
        'Catch at-risk customers weeks before cancellation',
        'Trigger re-engagement campaigns at the right moment',
        'Understand which engagement drops matter most',
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'sky',
    },
    {
      title: 'Support Friction Response',
      description:
        'Turn negative support experiences into retention opportunities instead of cancellation triggers.',
      problem:
        'A bad support experience often precedes cancellation, but retention teams rarely have visibility into support sentiment.',
      solution:
        'PulseLTV monitors support ticket patterns and sentiment, triggering proactive outreach when friction is detected.',
      outcomes: [
        'Escalate high-risk support situations to retention',
        'Follow up on negative experiences proactively',
        'Reduce support-driven churn with targeted intervention',
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
        </svg>
      ),
      color: 'indigo',
    },
    {
      title: 'Win-Back Campaigns',
      description:
        'Re-engage churned customers with targeted offers based on why they left.',
      problem:
        'Generic win-back emails ignore the reason for churn, leading to low conversion rates.',
      solution:
        'PulseLTV tracks churn reasons and enables targeted win-back campaigns based on the actual cause of departure.',
      outcomes: [
        'Personalize win-back offers by churn reason',
        'Time campaigns based on likelihood to return',
        'Track win-back revenue separately from new acquisition',
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      color: 'purple',
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; bgLight: string }> = {
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', bgLight: 'bg-emerald-50' },
    sky: { bg: 'bg-sky-500', text: 'text-sky-600', bgLight: 'bg-sky-50' },
    indigo: { bg: 'bg-indigo-500', text: 'text-indigo-600', bgLight: 'bg-indigo-50' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-600', bgLight: 'bg-purple-50' },
  };

  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Use Cases</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            PulseLTV addresses the most common churn scenarios with targeted playbooks, not generic campaigns.
          </p>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {useCases.map((useCase, index) => {
              const colors = colorClasses[useCase.color];
              return (
                <div
                  key={useCase.title}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  <div className="p-8">
                    <div className="flex items-start gap-6">
                      <div
                        className={`w-16 h-16 rounded-2xl ${colors.bgLight} flex items-center justify-center flex-shrink-0`}
                      >
                        <div className={colors.text}>{useCase.icon}</div>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">
                          {useCase.title}
                        </h2>
                        <p className="text-lg text-slate-600 mb-6">{useCase.description}</p>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                              The Problem
                            </h3>
                            <p className="text-slate-600">{useCase.problem}</p>
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                              <span className={`w-2 h-2 ${colors.bg} rounded-full`}></span>
                              The Solution
                            </h3>
                            <p className="text-slate-600">{useCase.solution}</p>
                          </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100">
                          <h3 className="font-semibold text-slate-900 mb-3">Expected Outcomes</h3>
                          <ul className="grid md:grid-cols-3 gap-3">
                            {useCase.outcomes.map((outcome, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-sm text-slate-700"
                              >
                                <svg
                                  className={`w-5 h-5 flex-shrink-0 ${colors.text}`}
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
                                {outcome}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Not a Fit Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            What PulseLTV is NOT
          </h2>
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-700 mb-3">Not a CRM</h3>
                <p className="text-slate-600 text-sm">
                  We integrate with your CRM (HubSpot, Salesforce). We don't replace it.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 mb-3">Not a CDP</h3>
                <p className="text-slate-600 text-sm">
                  We pull signals from your existing tools. We don't try to be your data warehouse.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 mb-3">Not Marketing Automation</h3>
                <p className="text-slate-600 text-sm">
                  We trigger actions through your existing tools. We don't send emails ourselves.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 mb-3">Not Product Analytics</h3>
                <p className="text-slate-600 text-sm">
                  We focus on churn outcomes, not general product usage analytics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Which use case matters most to you?
          </h2>
          <p className="text-blue-200 mb-8 max-w-2xl mx-auto">
            Book a demo and we'll show you how PulseLTV addresses your specific churn challenges.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/book-demo"
              className="px-8 py-3 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors"
            >
              Book a Demo
            </Link>
            <button
              onClick={() => openWaitlistModal('use-cases-page')}
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

export default UseCasesRoute;
