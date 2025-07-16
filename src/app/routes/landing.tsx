import React from 'react';
import { useNavigate } from 'react-router';
import { LandingLayout } from '@/components/layouts';
import { FeaturesSection } from '@/features/landing/components/features-section';
import { FeatureIconsSection } from '@/features/landing/components/features-icon-section';
import { HowItWorksSection } from '@/features/landing/components/howitoworks-section';
import { CTASection } from '@/features/landing/components/cta-section';
import { HeroSection } from '@/features/landing/components/hero-section';

export const LandingRoute = () => {

  return (
    <LandingLayout>
    <HeroSection/>
      <HowItWorksSection />
      <FeaturesSection />
      <FeatureIconsSection />
      <CTASection />
    </LandingLayout>
  );
};

