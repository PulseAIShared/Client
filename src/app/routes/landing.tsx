import React from 'react';
import { useNavigate } from 'react-router';
import { LandingLayout } from '@/components/layouts';
import { Link } from '@/components/ui/link';
import { StatsSection } from '@/features/landing/components/stats-section';
import { FeaturesSection } from '@/features/landing/components/features-section';
import { FeatureIconsSection } from '@/features/landing/components/features-icon-section';
import { TestimonialsSection } from '@/features/landing/components/testimonials-section';
import { CTASection } from '@/features/landing/components/cta-section';
import { HeroSection } from '@/features/landing/components/hero-section';

export const LandingRoute = () => {
  const navigate = useNavigate();

  return (
    <LandingLayout>
    <HeroSection/>
      <StatsSection />
      <FeaturesSection />
      <FeatureIconsSection />
      <TestimonialsSection />
      <CTASection />
    </LandingLayout>
  );
};

