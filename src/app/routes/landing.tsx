import React from 'react';
import { LandingLayout } from '@/components/layouts';
import { ChurnRiskCalculatorSection } from '@/features/landing/components/churn-risk-calculator-section';
import { CoreCapabilitiesSection } from '@/features/landing/components/core-capabilities-section';
import { HowItWorksSection } from '@/features/landing/components/howitoworks-section';
import { CTASection } from '@/features/landing/components/cta-section';
import { HeroSection } from '@/features/landing/components/hero-section';
import { SectionTransition } from '@/features/landing/components/section-transition';

export const LandingRoute = () => {

  return (
    <LandingLayout>
      <HeroSection />

      {/* Spacing instead of hard transition */}
      <div className="h-20 bg-gradient-to-b from-white to-slate-50/50" />

      <HowItWorksSection />

      <div className="h-20 bg-gradient-to-b from-slate-50/50 to-slate-50" />

      <CoreCapabilitiesSection />

      <div className="h-20 bg-gradient-to-b from-slate-50 to-white" />

      <ChurnRiskCalculatorSection />

      <CTASection />
    </LandingLayout>
  );
};

