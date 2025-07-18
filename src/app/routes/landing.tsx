import React from 'react';
import { LandingLayout } from '@/components/layouts';
import { ChurnRiskCalculatorSection } from '@/features/landing/components/churn-risk-calculator-section';
import { FeatureIconsSection } from '@/features/landing/components/features-icon-section';
import { HowItWorksSection } from '@/features/landing/components/howitoworks-section';
import { CTASection } from '@/features/landing/components/cta-section';
import { HeroSection } from '@/features/landing/components/hero-section';
import { ChurnRiskCalculator } from '@/components/calculators';

export const LandingRoute = () => {

  return (
    <LandingLayout>
    <HeroSection/>
      <HowItWorksSection />
      <ChurnRiskCalculatorSection /> 
      <FeatureIconsSection />
      <CTASection />
    </LandingLayout>
  );
};

