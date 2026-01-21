import React from 'react';
import { Link } from 'react-router-dom';
import './css/hero-section.css';
import { useWaitlistModal } from '@/hooks/useWaitlistModal';
import {
  SiStripe,
  SiHubspot,
  SiSalesforce,
  SiIntercom,
  SiZendesk,
  SiSlack,
} from 'react-icons/si';
import { Button } from '@/components/ui/button';
import { FaArrowRightLong } from 'react-icons/fa6';

export const HeroSection = () => {
  const { openWaitlistModal } = useWaitlistModal();

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white py-20">
        {/* Enhanced animated background with multiple layers */}
        <div className="absolute inset-0">

          {/* Moving solid orbs */}
          <div className="absolute inset-0">
            <div className="absolute w-96 h-96 bg-sky-500/20 rounded-full blur-3xl animate-pulse"
              style={{
                top: '10%',
                left: '10%',
                animationDuration: '6s',
                transform: 'translate(-50%, -50%)'
              }}></div>
            <div className="absolute w-80 h-80 bg-blue-900/15 rounded-full blur-3xl animate-pulse"
              style={{
                top: '70%',
                right: '10%',
                animationDuration: '8s',
                animationDelay: '2s',
                transform: 'translate(50%, -50%)'
              }}></div>
            <div className="absolute w-64 h-64 bg-slate-400/20 rounded-full blur-3xl animate-pulse"
              style={{
                top: '40%',
                left: '80%',
                animationDuration: '7s',
                animationDelay: '4s',
                transform: 'translate(-50%, -50%)'
              }}></div>
          </div>
        </div>

        {/* Advanced floating elements system */}
        <div className="absolute inset-0">
          {/* Large floating particles */}
          {[...Array(12)].map((_, i) => {
            const size = 3 + Math.random() * 4;
            const delay = Math.random() * 5;
            const duration = 4 + Math.random() * 4;
            return (
              <div
                key={`large-${i}`}
                className="absolute opacity-40"
                style={{
                  top: `${10 + Math.random() * 80}%`,
                  left: `${5 + Math.random() * 90}%`,
                  animation: `float ${duration}s ${delay}s infinite ease-in-out`,
                }}
              >
                <div
                  className={`bg-sky-400 rounded-full shadow-2xl`}
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    filter: 'blur(0.5px)',
                  }}
                ></div>
              </div>
            );
          })}

          {/* Small twinkling particles */}
          {[...Array(20)].map((_, i) => {
            const delay = Math.random() * 3;
            const duration = 2 + Math.random() * 2;
            return (
              <div
                key={`small-${i}`}
                className="absolute opacity-60"
                style={{
                  top: `${5 + Math.random() * 90}%`,
                  left: `${5 + Math.random() * 90}%`,
                  animation: `twinkle ${duration}s ${delay}s infinite ease-in-out`,
                }}
              >
                <div className="w-1 h-1 bg-slate-400 rounded-full shadow-lg"></div>
              </div>
            );
          })}
        </div>

        {/* Enhanced animated grid with depth */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 bg-[linear-gradient(rgba(125,211,252,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.3)_1px,transparent_1px)] bg-[size:100px_100px]"
              style={{ animation: 'gridMove 20s linear infinite' }}
            ></div>
            <div
              className="absolute inset-0 bg-[linear-gradient(rgba(30,58,138,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,58,138,0.2)_1px,transparent_1px)] bg-[size:50px_50px]"
              style={{ animation: 'gridMove 15s linear infinite reverse' }}
            ></div>
          </div>
        </div>

        {/* Content with enhanced animations */}
        <div className="relative z-10 text-center text-blue-900 px-4 max-w-7xl mx-auto">
          {/* Brand name */}
          <div className="mb-6 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900">
              PulseLTV
            </h1>
          </div>

          {/* Tagline */}
          <div className="mb-8 opacity-0 animate-fade-in-up delay-300">
            <p className="text-2xl md:text-4xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600">
              Predict. Prevent. Profit.
            </p>
          </div>

          {/* Description */}
          <div className="mb-10 opacity-0 animate-fade-in-up delay-600">
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-slate-600 leading-relaxed">
              The churn decision platform that{' '}
              <span className="text-sky-600 font-semibold">detects risk</span>,{' '}
              <span className="text-slate-800 font-semibold">explains why</span>,{' '}
              and <span className="text-sky-600 font-semibold">triggers action</span> through your existing tools.{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-slate-800 font-bold">Measure revenue saved</span>
                <span className="absolute bottom-0 left-0 w-full h-2 bg-sky-400/30 -rotate-1"></span>
              </span>{' '}
              instead of just churn prevented.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 opacity-0 animate-fade-in-up delay-900">
            <Link
              to="/book-demo"
              className="h-12 px-8 py-3 text-lg font-semibold text-white bg-sky-500 rounded-xl hover:shadow-2xl hover:shadow-sky-500/25 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 hover:bg-sky-600"
            >
              Book a Demo
              <FaArrowRightLong className="w-5 h-5" />
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() => openWaitlistModal('hero-section')}
              className="text-base font-semibold text-slate-700 bg-white border-2 border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 hover:shadow-md transform hover:-translate-y-1 transition-all duration-300"
            >
              Join Waitlist
            </Button>
          </div>

          {/* Key capabilities - Predict, Prevent, Profit */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto opacity-0 animate-fade-in-up delay-1000">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-slate-200 hover:border-sky-300 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-sky-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Predict</h3>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">Unify payment, support, and usage signals into a live churn score with clear drivers</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Prevent</h3>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">Map each root cause to a playbook and trigger actions through your existing tools</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Profit</h3>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">Measure revenue saved, recovered payments, and fewer cancellations, not just a churn metric</p>
            </div>
          </div>

        </div>
      </section>

      {/* Integration Strip - Outside hero section */}
      <section className="bg-slate-50 border-t border-slate-200 py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Works with your existing tools
          </p>
          <p className="text-center text-xs text-slate-400 mb-6">
            Start with one integration. Confidence increases with more data sources.
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-8 md:gap-x-12">
            {[
              { name: 'Stripe', Icon: SiStripe, color: 'text-[#635bff]' },
              { name: 'HubSpot', Icon: SiHubspot, color: 'text-[#ff7a59]' },
              { name: 'Intercom', Icon: SiIntercom, color: 'text-[#5190e3]' },
              { name: 'Salesforce', Icon: SiSalesforce, color: 'text-[#00a1e0]' },
              { name: 'Slack', Icon: SiSlack, color: 'text-[#4a154b]' },
              { name: 'Zendesk', Icon: SiZendesk, color: 'text-[#03363d]' },
            ].map((integration, index) => (
              <div key={index} className="flex items-center gap-2 group">
                <integration.Icon className={`w-6 h-6 md:w-8 md:h-8 ${integration.color} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />
                <span className="text-slate-500 font-medium text-xs md:text-sm hidden sm:block group-hover:text-slate-700 transition-colors">{integration.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
