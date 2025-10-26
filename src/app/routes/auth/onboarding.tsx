import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useProcessOnboardingStep } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Form, Input, Select } from '@/components/ui/form';
import { z } from 'zod';
import '@/features/landing/components/css/hero-section.css'; // Import animations
import { useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '@/components/ui/notifications';
import { parseTeamProblem, teamQueryKeys, useAcceptTeamInvitation } from '@/features/team/api/team';
import { TEAM_INVITATION_TOKEN_KEY } from '@/features/team/constants';

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
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const acceptInvitation = useAcceptTeamInvitation();
  
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [hasAttemptedInviteAccept, setHasAttemptedInviteAccept] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const token = window.sessionStorage.getItem(TEAM_INVITATION_TOKEN_KEY);
      setInviteToken(token);
    } catch (storageError) {
      console.warn('Unable to read invitation token from storage', storageError);
    }
  }, []);
  
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
  const hasInviteToken = Boolean(inviteToken);

  const attemptInviteAccept = useCallback(
    async (options?: { force?: boolean }) => {
      if (!inviteToken) {
        return;
      }
      if (acceptInvitation.isPending) {
        return;
      }
      if (hasAttemptedInviteAccept && !options?.force) {
        return;
      }

      setHasAttemptedInviteAccept(true);
      setInviteError(null);

      try {
        const response = await acceptInvitation.mutateAsync({ token: inviteToken });

        try {
          window.sessionStorage.removeItem(TEAM_INVITATION_TOKEN_KEY);
        } catch (storageError) {
          console.warn('Unable to clear invitation token from storage', storageError);
        }

        setInviteToken(null);

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: teamQueryKeys.summary }),
          queryClient.invalidateQueries({ queryKey: teamQueryKeys.members }),
          queryClient.invalidateQueries({ queryKey: teamQueryKeys.invitations }),
          queryClient.invalidateQueries({ queryKey: ['auth', 'user'] }),
        ]);

        await user.refetch();

        addNotification({
          type: 'success',
          title: response?.companyName ? `Welcome to ${response.companyName}` : 'Invitation accepted',
          message: response?.companyName
            ? `You now have access to ${response.companyName}.`
            : 'Your team access is ready.',
        });

        navigate('/app', { replace: true });
      } catch (error) {
        const problem = parseTeamProblem(error);
        let message = problem.detail ?? 'Unable to accept invitation.';

        switch (problem.code) {
          case 'Users.InvalidOrExpiredInvitation':
            message = 'This invitation is invalid or has expired. Request a new link from your admin.';
            break;
          case 'Users.InvitationAlreadySent':
          case 'Invitation.AcceptFailed':
            message = 'This invitation link has already been used. Ask your team to send another invite.';
            break;
          case 'Users.CompanyUserLimitReached':
            message = 'This team is at capacity. Contact the inviter to free a seat or upgrade the plan.';
            break;
          default:
            break;
        }

        setInviteError(message);
        addNotification({
          type: 'error',
          title: 'Invite could not be completed',
          message: problem.traceId ? `${message} (trace ${problem.traceId})` : message,
        });
      }
    },
    [
      inviteToken,
      acceptInvitation,
      hasAttemptedInviteAccept,
      queryClient,
      user,
      addNotification,
      navigate,
    ],
  );

  useEffect(() => {
    if (!inviteToken) {
      return;
    }
    if (currentStep < 2) {
      return;
    }
    void attemptInviteAccept();
  }, [inviteToken, currentStep, attemptInviteAccept]);

  const handleProfileSubmit = async (values: Record<string, any>) => {
    setError(null);

    try {
      await processStepMutation.mutateAsync({
        step: "1",
        firstName: values.firstName,
        lastName: values.lastName,
        password: values.password,
      });

      if (hasInviteToken) {
        await attemptInviteAccept();
      }
    } catch (submissionError) {
      console.error('Profile update failed:', submissionError);
      // onError handler on the mutation will surface the error
    }
  };

  const handleDiscardInvite = () => {
    try {
      window.sessionStorage.removeItem(TEAM_INVITATION_TOKEN_KEY);
    } catch (storageError) {
      console.warn('Unable to clear invitation token from storage', storageError);
    }
    setInviteToken(null);
    setInviteError(null);
    setHasAttemptedInviteAccept(false);
  };

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

  const renderProgressBar = () => {
    if (displayTotalSteps === 1) {
      return null;
    }

    const steps = hasInviteToken
      ? [
          { label: 'Profile Setup', step: 1 },
          { label: 'Join Your Team', step: 2 },
        ]
      : [
          { label: 'Profile Setup', step: 1 },
          { label: 'Company Details', step: 2 },
        ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-600">
            Step {displayStep} of {displayTotalSteps}
          </span>
          <span className="text-sm font-medium text-blue-900">
            {steps[displayStep - 1]?.label ?? 'Setup'}
          </span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-sky-500 transition-all duration-500 ease-out"
            style={{ width: `${(displayStep / displayTotalSteps) * 100}%` }}
          />
        </div>
      </div>
    );
  };

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
        onSubmit={handleProfileSubmit}
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
              className="w-full bg-sky-500 hover:bg-sky-600 text-white"
            >
              {processStepMutation.isPending ? 'Saving...' : 'Continue'}
            </Button>
          </div>
        )}
      </Form>
    </div>
  );

  const renderCompanyStep = () => {
    if (hasInviteToken) {
      const isProcessingInvite = acceptInvitation.isPending;

      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-blue-900 mb-2">
              Join Your Team
            </h2>
            <p className="text-slate-600">
              {inviteError
                ? 'We couldn’t complete your invite. Review the message below or try again.'
                : isProcessingInvite
                ? 'We’re finalising your access. This should only take a moment.'
                : 'We’re ready to drop you into the workspace you were invited to.'}
            </p>
          </div>

          {inviteError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {inviteError}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              {isProcessingInvite
                ? 'Validating your invitation token and updating your workspace access…'
                : 'Click below to finish connecting this account to your team.'}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              onClick={() => void attemptInviteAccept({ force: true })}
              disabled={isProcessingInvite}
              isLoading={isProcessingInvite}
              className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white"
            >
              {isProcessingInvite ? 'Joining team…' : inviteError ? 'Try again' : 'Finish joining'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleDiscardInvite}
              disabled={isProcessingInvite}
            >
              Start a new workspace instead
            </Button>
          </div>
        </div>
      );
    }

    return (
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
  };

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
