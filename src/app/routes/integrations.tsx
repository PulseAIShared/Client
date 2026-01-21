import React from 'react';
import { Link } from 'react-router-dom';
import { LandingLayout } from '@/components/layouts';
import { useWaitlistModal } from '@/hooks/useWaitlistModal';
import {
  SiStripe,
  SiHubspot,
  SiSalesforce,
  SiIntercom,
  SiZendesk,
  SiSlack,
} from 'react-icons/si';

const IntegrationsRoute = () => {
  const { openWaitlistModal } = useWaitlistModal();

  const integrations = [
    {
      name: 'Stripe',
      category: 'Payments',
      description: 'Monitor payment failures, subscription changes, and revenue metrics in real-time.',
      signals: ['Payment failures', 'Subscription cancellations', 'Plan downgrades', 'Invoice aging'],
      actions: ['Smart payment retries', 'Dunning management'],
      Icon: SiStripe,
      color: '#635bff',
      status: 'available',
    },
    {
      name: 'HubSpot',
      category: 'CRM',
      description: 'Pull customer lifecycle data and trigger targeted outreach through HubSpot workflows.',
      signals: ['Deal stage changes', 'Contact activity', 'Email engagement'],
      actions: ['Create tasks', 'Trigger workflows', 'Update properties'],
      Icon: SiHubspot,
      color: '#ff7a59',
      status: 'available',
    },
    {
      name: 'Intercom',
      category: 'Support',
      description: 'Monitor support conversations and trigger proactive outreach based on sentiment.',
      signals: ['Conversation volume', 'Response times', 'Unresolved tickets'],
      actions: ['Send messages', 'Create conversations', 'Tag users'],
      Icon: SiIntercom,
      color: '#5190e3',
      status: 'available',
    },
    {
      name: 'Salesforce',
      category: 'CRM',
      description: 'Sync opportunity and account data for enterprise customer health tracking.',
      signals: ['Opportunity changes', 'Account health scores', 'Activity history'],
      actions: ['Create tasks', 'Update records', 'Trigger flows'],
      Icon: SiSalesforce,
      color: '#00a1e0',
      status: 'coming-soon',
    },
    {
      name: 'Zendesk',
      category: 'Support',
      description: 'Track support ticket patterns and escalate at-risk customers proactively.',
      signals: ['Ticket volume', 'CSAT scores', 'Resolution times'],
      actions: ['Create tickets', 'Update users', 'Trigger automations'],
      Icon: SiZendesk,
      color: '#03363d',
      status: 'coming-soon',
    },
    {
      name: 'Slack',
      category: 'Notifications',
      description: 'Get real-time alerts when customers hit risk thresholds or actions complete.',
      signals: [],
      actions: ['Send alerts', 'Channel notifications', 'DMs to CSMs'],
      Icon: SiSlack,
      color: '#4a154b',
      status: 'available',
    },
  ];

  const categories = [
    { name: 'Payments', description: 'Track payment health and revenue signals' },
    { name: 'CRM', description: 'Sync customer lifecycle data' },
    { name: 'Support', description: 'Monitor support friction and sentiment' },
    { name: 'Notifications', description: 'Alert teams when action is needed' },
  ];

  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Integrations</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Connect your existing tools to build a unified churn signal. Start with one integration. Accuracy improves as you add more.
          </p>
        </div>
      </section>

      {/* Categories Overview */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div
                key={category.name}
                className="bg-white rounded-xl p-5 border border-slate-200 text-center"
              >
                <h3 className="font-semibold text-slate-900 mb-1">{category.name}</h3>
                <p className="text-sm text-slate-600">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${integration.color}15` }}
                  >
                    <integration.Icon
                      className="w-8 h-8"
                      style={{ color: integration.color }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-slate-900">{integration.name}</h3>
                      {integration.status === 'coming-soon' && (
                        <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mb-3">{integration.category}</p>
                    <p className="text-slate-600 mb-4">{integration.description}</p>

                    <div className="grid grid-cols-2 gap-4">
                      {integration.signals.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 mb-2">Signals</h4>
                          <ul className="space-y-1">
                            {integration.signals.map((signal, idx) => (
                              <li key={idx} className="text-sm text-slate-600 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-sky-400 rounded-full"></span>
                                {signal}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {integration.actions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 mb-2">Actions</h4>
                          <ul className="space-y-1">
                            {integration.actions.map((action, idx) => (
                              <li key={idx} className="text-sm text-slate-600 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Flow Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            How Data Flows Through PulseLTV
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-sky-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Signals In</h3>
                <p className="text-sm text-slate-600">
                  Data flows from your connected tools into PulseLTV via secure OAuth or API connections.
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-indigo-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Analysis</h3>
                <p className="text-sm text-slate-600">
                  Pulse builds a unified risk score and identifies the root cause of churn risk.
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-emerald-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Actions Out</h3>
                <p className="text-sm text-slate-600">
                  Playbook-driven actions trigger through your existing tools, not a separate system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* One Integration Messaging */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Start with just one integration
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-8">
            You don't need to connect everything at once. Start with your payment provider (like Stripe) to detect payment-related churn. Add more integrations over time to increase signal accuracy and unlock additional playbooks.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-700 rounded-lg text-sm font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            More data sources = higher confidence in risk scores
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to connect your stack?
          </h2>
          <p className="text-blue-200 mb-8 max-w-2xl mx-auto">
            Book a demo and we'll help you identify which integrations will have the biggest impact on your churn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/book-demo"
              className="px-8 py-3 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors"
            >
              Book a Demo
            </Link>
            <button
              onClick={() => openWaitlistModal('integrations-page')}
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

export default IntegrationsRoute;
