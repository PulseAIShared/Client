import React from 'react';
import { useNavigate } from 'react-router';
import { LandingLayout } from '@/components/layouts';
import { FeaturesSection } from '@/features/landing/components/features-section';
import { FeatureIconsSection } from '@/features/landing/components/features-icon-section';
import { TestimonialsSection } from '@/features/landing/components/testimonials-section';
import { CTASection } from '@/features/landing/components/cta-section';
import { HeroSection } from '@/features/landing/components/hero-section';

export const LandingRoute = () => {

  return (
    <LandingLayout>
    <HeroSection/>
      <FeaturesSection />
      <FeatureIconsSection />
      <TestimonialsSection />
      <CTASection />
    </LandingLayout>
  );
};

