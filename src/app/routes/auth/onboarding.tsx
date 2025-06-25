import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useProcessOnboardingStep } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Form, Input, Select } from '@/components/ui/form';
import { z } from 'zod';

// Step schemas
const profileStepSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const companyStepSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  companyDomain: z.string().min(1, 'Company domain is required'),
  industry: z.string().min(1, 'Industry is required'),
  companySize: z.enum(['startup', 'smb', 'enterprise']),
  country: z.string().min(1, 'Country is required'),
});

// Country options with codes
const COUNTRY_OPTIONS = [
  { label: "United States", value: "US" },
  { label: "Canada", value: "CA" },
  { label: "United Kingdom", value: "GB" },
  { label: "Germany", value: "DE" },
  { label: "France", value: "FR" },
  { label: "Australia", value: "AU" },
  { label: "Japan", value: "JP" },
  { label: "Singapore", value: "SG" },
  { label: "Netherlands", value: "NL" },
  { label: "Sweden", value: "SE" },
  { label: "Denmark", value: "DK" },
  { label: "Norway", value: "NO" },
  { label: "Switzerland", value: "CH" },
  { label: "Austria", value: "AT" },
  { label: "Belgium", value: "BE" },
  { label: "Ireland", value: "IE" },
  { label: "New Zealand", value: "NZ" },
  { label: "Finland", value: "FI" },
  { label: "Spain", value: "ES" },
  { label: "Italy", value: "IT" },
  { label: "Portugal", value: "PT" },
].sort((a, b) => a.label.localeCompare(b.label));

// Company size options
const COMPANY_SIZE_OPTIONS = [
  { label: "Startup (1-10 employees)", value: "startup" },
  { label: "SMB (11-500 employees)", value: "smb" },
  { label: "Enterprise (500+ employees)", value: "enterprise" },
];

// Industry options
const INDUSTRY_OPTIONS = [
  { label: "Technology", value: "Technology" },
  { label: "Software as a Service (SaaS)", value: "SaaS" },
  { label: "E-commerce", value: "E-commerce" },
  { label: "Financial Services", value: "Financial Services" },
  { label: "Healthcare", value: "Healthcare" },
  { label: "Education", value: "Education" },
  { label: "Manufacturing", value: "Manufacturing" },
  { label: "Retail", value: "Retail" },
  { label: "Real Estate", value: "Real Estate" },
  { label: "Marketing & Advertising", value: "Marketing & Advertising" },
  { label: "Media & Entertainment", value: "Media & Entertainment" },
  { label: "Consulting", value: "Consulting" },
  { label: "Non-Profit", value: "Non-Profit" },
  { label: "Government", value: "Government" },
  { label: "Other", value: "Other" },
].sort((a, b) => a.label.localeCompare(b.label));

type OnboardingStep = 1 | 2;

export const OnboardingRoute = () => {
  const user = useUser();
  const navigate = useNavigate();
  
  // Server is the only source of truth for current step
  const serverStep = user.data?.onboardingCurrentStep || 1;
  const currentStep = Math.min(serverStep, 2) as OnboardingStep;
  
  const [error, setError] = useState<string | null>(null);
  
  // Single dynamic onboarding hook
  const processStepMutation = useProcessOnboardingStep({
    onSuccess: async (data) => {
      console.log('Onboarding step processed:', data);
      setError(null);
      
      // If onboarding was completed (step 2), navigate to app
      if (data.onboardingCompleted) {
        navigate('/app');
      } else {
        // Otherwise, refresh user data to get updated step from server
        await user.refetch();
      }
    },
    onError: (error) => {
      console.error('Failed to process onboarding step:', error);
      setError(error.message || 'Failed to process step. Please try again.');
    }
  });

  // Determine if user needs profile setup (email users vs SSO users)
  const needsProfileSetup = !user.data?.firstName || !user.data?.lastName;
  const totalSteps = needsProfileSetup ? 2 : 1; // Only profile (step 1) and company (step 2) steps

  // For SSO users who skip profile setup, map currentStep to display step
  const displayStep = needsProfileSetup ? currentStep : (currentStep === 2 ? 1 : currentStep);
  const displayTotalSteps = totalSteps;

  const handleCreateCompany = (values: Record<string, any>) => {
    setError(null); // Clear any existing errors
    processStepMutation.mutate({
      step: "2", // Company step
      companyName: values.companyName,
      companyDomain: values.companyDomain,
      companyCountry: values.country,
      companySize: values.companySize,
      companyIndustry: values.industry,
    });
  };

  const renderProgressBar = () => (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white">
          Step {displayStep} of {displayTotalSteps}
        </span>
        <span className="text-sm text-slate-300">
          {Math.round((displayStep / displayTotalSteps) * 100)}% complete
        </span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(displayStep / displayTotalSteps) * 100}%` }}
        />
      </div>
    </div>
  );

  const renderProfileStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Complete Your Profile
        </h2>
        <p className="text-slate-400">
          Let's set up your account with a name and secure password
        </p>
      </div>
      
      <Form
        schema={profileStepSchema}
        onSubmit={(values) => {
          console.log('Profile data:', values);
          setError(null); // Clear any existing errors
          processStepMutation.mutate({
            step: "1", // Profile step
            firstName: values.firstName,
            lastName: values.lastName,
            password: values.password,
          });
        }}
      >
        {({ register, formState }) => (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                registration={register('firstName')}
                error={formState.errors.firstName as any}
              />
              <Input
                label="Last Name"
                registration={register('lastName')}
                error={formState.errors.lastName as any}
              />
            </div>
            <Input
              type="password"
              label="Create Password"
              registration={register('password')}
              error={formState.errors.password as any}
            />
            <Button 
              type="submit" 
              isLoading={processStepMutation.isPending}
              className="w-full"
            >
              {processStepMutation.isPending ? 'Updating Profile...' : 'Continue'}
            </Button>
          </div>
        )}
      </Form>
    </div>
  );

  const renderCompanyStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Tell Us About Your Company
        </h2>
        <p className="text-slate-200">
          Help us customize your experience
        </p>
      </div>
      
      <Form
        schema={companyStepSchema}
        onSubmit={handleCreateCompany}
      >
        {({ register, formState }) => (
          <div className="space-y-4 [&_label]:!text-white [&_label]:!font-medium">
            <Input
              label="Company Name"
              registration={register('companyName')}
              error={formState.errors.companyName as any}
              className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
            />
            <Input
              label="Company Domain"
              registration={register('companyDomain')}
              error={formState.errors.companyDomain as any}
              placeholder="yourcompany.com"
              className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Industry"
                options={INDUSTRY_OPTIONS}
                registration={register('industry')}
                error={formState.errors.industry as any}
                defaultValue=""
                className="bg-slate-800 border-slate-600 text-white focus:border-blue-500"
              />
              <Select
                label="Company Size"
                options={COMPANY_SIZE_OPTIONS}
                registration={register('companySize')}
                error={formState.errors.companySize as any}
                defaultValue=""
                className="bg-slate-800 border-slate-600 text-white focus:border-blue-500"
              />
            </div>
            <Select
              label="Country"
              options={COUNTRY_OPTIONS}
              registration={register('country')}
              error={formState.errors.country as any}
              defaultValue=""
              className="bg-slate-800 border-slate-600 text-white focus:border-blue-500"
            />
            <Button 
              type="submit" 
              isLoading={processStepMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {processStepMutation.isPending ? 'Creating Company & Completing Setup...' : 'Complete Setup'}
            </Button>
          </div>
        )}
      </Form>
    </div>
  );

  const renderStepContent = () => {
    // Server determines what step to show based on user's onboarding progress
    if (needsProfileSetup) {
      // Email users: 1=profile, 2=company
      switch (currentStep) {
        case 1:
          return renderProfileStep();
        case 2:
          return renderCompanyStep();
        default:
          return renderProfileStep();
      }
    } else {
      // SSO users: 2=company only (server should never put them on step 1)
      switch (currentStep) {
        case 2:
          return renderCompanyStep();
        default:
          // Fallback - should not happen if server is working correctly
          return renderCompanyStep();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #7c3aed 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, #3b82f6 0%, transparent 50%)`,
          }}></div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 2}s`,
              }}
            >
              <div className="w-2 h-2 bg-blue-400 rounded-full blur-sm"></div>
            </div>
          ))}
        </div>

        <div className="relative z-10 w-full max-w-2xl">
          <div className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-100/10 px-4 py-2 rounded-full mb-4">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-sm font-medium text-blue-300">Welcome to PulseLTV</span>
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-2">
                Let's Get You Started
              </h1>
              <p className="text-slate-300">
                Set up your account in just a few steps
              </p>
            </div>

            {/* Progress Bar */}
            {renderProgressBar()}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Step Content */}
            {renderStepContent()}

            {/* Navigation removed - server controls step flow */}
          </div>
        </div>
      </div>
  );
};