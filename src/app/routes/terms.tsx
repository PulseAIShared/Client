import React from 'react';
import { LandingLayout } from '@/components/layouts';

const TermsRoute = () => {
  const lastUpdated = 'January 2025';

  return (
    <LandingLayout>
      <div className="pt-24 pb-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms of Service</h1>
          <p className="text-slate-500 mb-12">Last updated: {lastUpdated}</p>

          <div className="prose prose-slate max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-600 mb-4">
                By accessing or using PulseLTV ("the Service"), you agree to be bound by these Terms
                of Service ("Terms"). If you are using the Service on behalf of an organization, you
                represent that you have authority to bind that organization to these Terms.
              </p>
              <p className="text-slate-600">
                If you do not agree to these Terms, you may not access or use the Service.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Description of Service</h2>
              <p className="text-slate-600 mb-4">
                PulseLTV is a churn decision platform that helps subscription businesses:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Detect churn risk from customer signals across connected integrations</li>
                <li>Understand the root causes behind customer churn risk</li>
                <li>Decide on appropriate actions using configurable playbooks</li>
                <li>Execute actions through connected third-party tools</li>
                <li>Measure outcomes including revenue saved and churn prevented</li>
              </ul>
              <p className="text-slate-600 mt-4">
                The Service is currently in beta and features may change without notice.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. Account Registration</h2>
              <p className="text-slate-600 mb-4">To use the Service, you must:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Promptly notify us of any unauthorized access</li>
                <li>Be at least 18 years old or the age of majority in your jurisdiction</li>
              </ul>
              <p className="text-slate-600 mt-4">
                You are responsible for all activities that occur under your account.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Integrations and Data Access</h2>
              <p className="text-slate-600 mb-4">
                The Service connects to third-party platforms (such as Stripe, HubSpot, Intercom) to
                access customer data. By connecting an integration, you:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>
                  Authorize us to access data from that platform as necessary to provide the Service
                </li>
                <li>
                  Confirm you have the right to grant this access and to use the data in this manner
                </li>
                <li>
                  Agree to comply with the third party's terms of service regarding data access
                </li>
                <li>
                  Understand that we may execute actions (like payment retries or sending messages)
                  through these integrations based on your configured playbooks
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Acceptable Use</h2>
              <p className="text-slate-600 mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Use the Service for any unlawful purpose</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on the rights of others</li>
                <li>
                  Attempt to gain unauthorized access to the Service or related systems
                </li>
                <li>Interfere with or disrupt the Service</li>
                <li>Reverse engineer or attempt to extract the source code of the Service</li>
                <li>
                  Use the Service to send spam or unsolicited communications to your customers
                </li>
                <li>Misrepresent your identity or affiliation</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Your Data</h2>
              <p className="text-slate-600 mb-4">
                You retain ownership of all data you provide to the Service ("Your Data"). By using
                the Service, you grant us a limited license to use Your Data solely to provide and
                improve the Service.
              </p>
              <p className="text-slate-600 mb-4">You represent and warrant that:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>You have the right to provide Your Data to us</li>
                <li>
                  Your Data does not violate any third party's privacy rights, intellectual property
                  rights, or other rights
                </li>
                <li>
                  You have obtained necessary consents to share customer data with us for the
                  purposes described
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Fees and Payment</h2>
              <p className="text-slate-600 mb-4">
                During the beta/design partner phase, pricing will be agreed upon individually. For
                general availability:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Fees will be as specified in your subscription agreement</li>
                <li>
                  Payment is due according to the billing cycle specified in your plan
                </li>
                <li>
                  All fees are non-refundable except as expressly stated otherwise
                </li>
                <li>
                  We may change pricing with 30 days' notice; existing subscriptions will be
                  honored until renewal
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Intellectual Property</h2>
              <p className="text-slate-600 mb-4">
                The Service, including all content, features, and functionality, is owned by PulseLTV
                and protected by intellectual property laws. You may not copy, modify, distribute, or
                create derivative works without our express permission.
              </p>
              <p className="text-slate-600">
                We may use feedback you provide to improve the Service without any obligation to you.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Disclaimer of Warranties</h2>
              <p className="text-slate-600 mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
                EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>The Service will be uninterrupted or error-free</li>
                <li>The Service will meet your specific requirements</li>
                <li>
                  Churn predictions or risk scores will be accurate in all cases
                </li>
                <li>
                  Actions executed through integrations will achieve desired outcomes
                </li>
              </ul>
              <p className="text-slate-600 mt-4">
                Churn prevention outcomes depend on many factors beyond our control. We provide tools
                and recommendations, but cannot guarantee specific results.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Limitation of Liability</h2>
              <p className="text-slate-600 mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, PULSELTV SHALL NOT BE LIABLE FOR ANY
                INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT
                LIMITED TO:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Loss of revenue or profits</li>
                <li>Loss of data</li>
                <li>Loss of customers or business opportunities</li>
                <li>Damages arising from actions executed through integrations</li>
              </ul>
              <p className="text-slate-600 mt-4">
                Our total liability shall not exceed the fees paid by you in the twelve (12) months
                preceding the claim.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. Indemnification</h2>
              <p className="text-slate-600">
                You agree to indemnify and hold harmless PulseLTV and its officers, directors,
                employees, and agents from any claims, damages, losses, or expenses (including
                reasonable attorneys' fees) arising from your use of the Service, your violation of
                these Terms, or your violation of any third party's rights.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">12. Termination</h2>
              <p className="text-slate-600 mb-4">
                Either party may terminate this agreement at any time:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>You may cancel your account at any time through the Service settings</li>
                <li>
                  We may suspend or terminate your account for violation of these Terms or for any
                  other reason with notice
                </li>
                <li>
                  Upon termination, your right to use the Service will immediately cease
                </li>
                <li>
                  You may request export of Your Data within 30 days of termination
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">13. Changes to Terms</h2>
              <p className="text-slate-600">
                We may modify these Terms at any time. We will provide notice of material changes
                through the Service or by email. Your continued use of the Service after changes
                become effective constitutes acceptance of the modified Terms. If you do not agree to
                the modified Terms, you must stop using the Service.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">14. General Provisions</h2>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>
                  <strong>Governing Law:</strong> These Terms are governed by the laws of the State
                  of Delaware, without regard to conflict of law principles.
                </li>
                <li>
                  <strong>Dispute Resolution:</strong> Any disputes shall be resolved through binding
                  arbitration, except that either party may seek injunctive relief in court.
                </li>
                <li>
                  <strong>Severability:</strong> If any provision is found unenforceable, the
                  remaining provisions will continue in effect.
                </li>
                <li>
                  <strong>Entire Agreement:</strong> These Terms constitute the entire agreement
                  between you and PulseLTV regarding the Service.
                </li>
                <li>
                  <strong>No Waiver:</strong> Failure to enforce any right does not constitute a
                  waiver of that right.
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">15. Contact Us</h2>
              <p className="text-slate-600">
                If you have questions about these Terms, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-700 font-medium">PulseLTV</p>
                <p className="text-slate-600">
                  Email:{' '}
                  <a href="mailto:legal@pulseltv.com" className="text-sky-600 hover:underline">
                    legal@pulseltv.com
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

export default TermsRoute;
