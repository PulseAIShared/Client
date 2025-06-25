import { ProtectedRoute } from '@/lib/auth';
import { OnboardingRoute } from './onboarding';

export const ProtectedOnboardingRoute = () => {
  return (
    <ProtectedRoute>
      <OnboardingRoute />
    </ProtectedRoute>
  );
};