import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useProcessOnboardingStep } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Form, Input, Select } from '@/components/ui/form';
import { z } from 'zod';
import '@/features/landing/components/css/hero-section.css'; // Import animations

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
      setError(null);
      
      // Always refresh user data to get updated step from server
      await user.refetch();
      
      // Company step navigation is handled separately in handleCreateCompany
      // Profile step will automatically show next step after refetch
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

  const handleCreateCompany = async (values: Record<string, any>) => {
    setError(null);
    
    try {
      const result = await processStepMutation.mutateAsync({
        step: "2", // Company step
        companyName: values.companyName,
        companyDomain: values.companyDomain,
        companyCountry: values.country,
        companySize: values.companySize,
        companyIndustry: values.industry,
      });
      
      // Refresh user data
      await user.refetch();
      
      // Navigate to app after successful company creation
      navigate('/app');
    } catch (error) {
      console.error('Company creation failed:', error);
      setError('Failed to create company. Please try again.');
    }
  };

  const renderProgressBar = () => (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-blue-900">
          Step {displayStep} of {displayTotalSteps}
        </span>
        <span className="text-sm text-slate-600">
          {Math.round((displayStep / displayTotalSteps) * 100)}% complete
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-sky-500 to-blue-900 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(displayStep / displayTotalSteps) * 100}%` }}
        />
      </div>
    </div>
  );

  const renderProfileStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">
          Complete Your Profile
        </h2>
        <p className="text-slate-600">
          Let's set up your account with a name and secure password
        </p>
      </div>
      
      <Form
        schema={profileStepSchema}
        onSubmit={(values) => {
          setError(null);
          processStepMutation.mutate({
            step: "1", // Profile step
            firstName: values.firstName,
            lastName: values.lastName,
            password: values.password,
          });
        }}
      >
        {({ register, formState }) => (
          <div className="space-y-4 [&_label]:!text-blue-900 [&_label]:!font-medium">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                registration={register('firstName')}
                error={formState.errors.firstName as any}
                className="bg-white border-slate-300 text-blue-900 placeholder-slate-500 focus:border-sky-500"
              />
              <Input
                label="Last Name"
                registration={register('lastName')}
                error={formState.errors.lastName as any}
                className="bg-white border-slate-300 text-blue-900 placeholder-slate-500 focus:border-sky-500"
              />
            </div>
            <Input
              type="password"
              label="Create Password"
              registration={register('password')}
              error={formState.errors.password as any}
              className="bg-white border-slate-300 text-blue-900 placeholder-slate-500 focus:border-sky-500"
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
        <h2 className="text-2xl font-bold text-blue-900 mb-2">
          Tell Us About Your Company
        </h2>
        <p className="text-slate-600">
          Help us customize your experience
        </p>
      </div>
      
      <Form
        schema={companyStepSchema}
        onSubmit={handleCreateCompany}
      >
        {({ register, formState }) => (
          <div className="space-y-4 [&_label]:!text-blue-900 [&_label]:!font-medium">
            <Input
              label="Company Name"
              registration={register('companyName')}
              error={formState.errors.companyName as any}
              className="bg-white border-slate-300 text-blue-900 placeholder-slate-500 focus:border-sky-500"
            />
            <Input
              label="Company Domain"
              registration={register('companyDomain')}
              error={formState.errors.companyDomain as any}
              placeholder="yourcompany.com"
              className="bg-white border-slate-300 text-blue-900 placeholder-slate-500 focus:border-sky-500"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Industry"
                options={INDUSTRY_OPTIONS}
                registration={register('industry')}
                error={formState.errors.industry as any}
                defaultValue=""
                className="bg-white border-slate-300 text-blue-900 focus:border-sky-500"
              />
              <Select
                label="Company Size"
                options={COMPANY_SIZE_OPTIONS}
                registration={register('companySize')}
                error={formState.errors.companySize as any}
                defaultValue=""
                className="bg-white border-slate-300 text-blue-900 focus:border-sky-500"
              />
            </div>
            <Select
              label="Country"
              options={COUNTRY_OPTIONS}
              registration={register('country')}
              error={formState.errors.country as any}
              defaultValue=""
              className="bg-white border-slate-300 text-blue-900 focus:border-sky-500"
            />
            <Button 
              type="submit" 
              isLoading={processStepMutation.isPending}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white"
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4 overflow-hidden">
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

        <div className="relative z-10 w-full max-w-2xl">
          <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-slate-300">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-blue-900 mb-2">
                Let's Get You Started
              </h1>
              <p className="text-slate-600">
                Set up your account in just a few steps
              </p>
            </div>

            {/* Progress Bar */}
            {renderProgressBar()}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
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