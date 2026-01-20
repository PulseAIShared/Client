import React from 'react';
import { LandingLayout } from '@/components/layouts';

const PrivacyRoute = () => {
  const lastUpdated = 'January 2025';

  return (
    <LandingLayout>
      <div className="pt-24 pb-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-slate-500 mb-12">Last updated: {lastUpdated}</p>

          <div className="prose prose-slate max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Introduction</h2>
              <p className="text-slate-600 mb-4">
                PulseLTV ("we," "our," or "us") is committed to protecting your privacy. This Privacy
                Policy explains how we collect, use, disclose, and safeguard your information when you
                use our churn decision platform and related services.
              </p>
              <p className="text-slate-600">
                By using PulseLTV, you agree to the collection and use of information in accordance
                with this policy.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Information We Collect</h2>

              <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">
                Information You Provide
              </h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>
                  <strong>Account Information:</strong> Name, email address, company name, and password
                  when you create an account
                </li>
                <li>
                  <strong>Billing Information:</strong> Payment details processed securely through our
                  payment provider (Stripe)
                </li>
                <li>
                  <strong>Communications:</strong> Information you provide when contacting support or
                  participating in surveys
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">
                Information from Integrations
              </h3>
              <p className="text-slate-600 mb-4">
                When you connect third-party services (such as Stripe, HubSpot, or Intercom), we
                access data necessary to provide our churn detection and prevention services:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Customer subscription and payment data from payment processors</li>
                <li>Customer contact and activity data from CRM systems</li>
                <li>Support ticket and conversation data from helpdesk tools</li>
              </ul>
              <p className="text-slate-600 mt-4">
                We only access data necessary to provide our services and do not sell this data to
                third parties.
              </p>

              <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">
                Automatically Collected Information
              </h3>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Device and browser information</li>
                <li>IP address and general location data</li>
                <li>Usage data and interaction with our platform</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">How We Use Your Information</h2>
              <p className="text-slate-600 mb-4">We use collected information to:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Provide, maintain, and improve our churn decision platform</li>
                <li>Generate churn risk scores and recommendations for your customers</li>
                <li>Execute playbook actions through your connected integrations</li>
                <li>Track and report on revenue saved and churn prevention outcomes</li>
                <li>Send service-related communications and updates</li>
                <li>Respond to support requests and inquiries</li>
                <li>Detect and prevent fraud or security issues</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data Sharing and Disclosure</h2>
              <p className="text-slate-600 mb-4">We may share your information with:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>
                  <strong>Service Providers:</strong> Third-party vendors who assist in operating our
                  platform (hosting, analytics, payment processing)
                </li>
                <li>
                  <strong>Connected Integrations:</strong> When you authorize actions to be executed
                  through your connected tools (Stripe, HubSpot, etc.)
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or to protect our rights
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with a merger, acquisition, or
                  sale of assets
                </li>
              </ul>
              <p className="text-slate-600 mt-4 font-medium">
                We do not sell your personal information or your customers' data to third parties.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data Security</h2>
              <p className="text-slate-600 mb-4">
                We implement appropriate technical and organizational measures to protect your data:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Encryption of data in transit (TLS) and at rest</li>
                <li>Regular security assessments and monitoring</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure cloud infrastructure with SOC 2 compliant providers</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data Retention</h2>
              <p className="text-slate-600">
                We retain your data for as long as your account is active or as needed to provide
                services. You can request deletion of your data at any time by contacting us. Some
                data may be retained longer if required by law or for legitimate business purposes.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Your Rights</h2>
              <p className="text-slate-600 mb-4">Depending on your location, you may have the right to:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to or restrict certain processing</li>
                <li>Data portability</li>
                <li>Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="text-slate-600 mt-4">
                To exercise these rights, please contact us at{' '}
                <a href="mailto:privacy@pulseltv.com" className="text-sky-600 hover:underline">
                  privacy@pulseltv.com
                </a>
                .
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Cookies</h2>
              <p className="text-slate-600">
                We use cookies and similar technologies to maintain sessions, remember preferences,
                and understand how you use our platform. You can control cookie settings through your
                browser, though some features may not function properly if cookies are disabled.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Changes to This Policy</h2>
              <p className="text-slate-600">
                We may update this Privacy Policy from time to time. We will notify you of any
                material changes by posting the new policy on this page and updating the "Last
                updated" date. Your continued use of the platform after changes constitutes acceptance
                of the updated policy.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Contact Us</h2>
              <p className="text-slate-600">
                If you have questions about this Privacy Policy or our data practices, please contact
                us at:
              </p>
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-700 font-medium">PulseLTV</p>
                <p className="text-slate-600">
                  Email:{' '}
                  <a href="mailto:privacy@pulseltv.com" className="text-sky-600 hover:underline">
                    privacy@pulseltv.com
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
};

export default PrivacyRoute;
