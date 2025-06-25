// src/features/auth/components/register-form.tsx
import { FieldError } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { registerInputSchema, useRegister } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Form, Input, Select } from "@/components/ui/form";
import { useState, useEffect } from "react";

// Country codes data
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
  { label: "Poland", value: "PL" },
  { label: "Czech Republic", value: "CZ" },
  { label: "Hungary", value: "HU" },
  { label: "Estonia", value: "EE" },
  { label: "Latvia", value: "LV" },
  { label: "Lithuania", value: "LT" },
  { label: "Slovenia", value: "SI" },
  { label: "Slovakia", value: "SK" },
  { label: "Croatia", value: "HR" },
  { label: "South Korea", value: "KR" },
  { label: "Hong Kong", value: "HK" },
  { label: "Taiwan", value: "TW" },
  { label: "Israel", value: "IL" },
  { label: "United Arab Emirates", value: "AE" },
  { label: "Saudi Arabia", value: "SA" },
  { label: "South Africa", value: "ZA" },
  { label: "Brazil", value: "BR" },
  { label: "Mexico", value: "MX" },
  { label: "Argentina", value: "AR" },
  { label: "Chile", value: "CL" },
  { label: "Colombia", value: "CO" },
  { label: "Peru", value: "PE" },
  { label: "India", value: "IN" },
  { label: "China", value: "CN" },
  { label: "Thailand", value: "TH" },
  { label: "Malaysia", value: "MY" },
  { label: "Indonesia", value: "ID" },
  { label: "Philippines", value: "PH" },
  { label: "Vietnam", value: "VN" },
].sort((a, b) => a.label.localeCompare(b.label));

// Company size options - using numeric values to match C# enum (0, 1, 2)
const COMPANY_SIZE_OPTIONS = [
  { label: "Startup (1-10 employees)", value: 0 },
  { label: "SMB (11-500 employees)", value: 1 },
  { label: "Enterprise (500+ employees)", value: 2 },
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
  { label: "Transportation & Logistics", value: "Transportation & Logistics" },
  { label: "Energy & Utilities", value: "Energy & Utilities" },
  { label: "Food & Beverage", value: "Food & Beverage" },
  { label: "Travel & Hospitality", value: "Travel & Hospitality" },
  { label: "Construction", value: "Construction" },
  { label: "Agriculture", value: "Agriculture" },
  { label: "Telecommunications", value: "Telecommunications" },
  { label: "Insurance", value: "Insurance" },
  { label: "Legal Services", value: "Legal Services" },
  { label: "Other", value: "Other" },
].sort((a, b) => a.label.localeCompare(b.label));

type RegisterFormProps = {
  onSuccess?: () => void;
};

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const navigate = useNavigate();
  
  const handleSuccess = () => {
    // If custom onSuccess provided, use it
    if (onSuccess) {
      onSuccess();
      return;
    }
    
    // Default behavior: redirect based on onboarding status
    // The ProtectedRoute will handle the actual onboarding check
    navigate('/app');
  };
  
  const registering = useRegister({ onSuccess: handleSuccess });
  const [invitationToken, setInvitationToken] = useState<string | null>(null);

  // Check for invitation token in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('invitation') || urlParams.get('token');
    setInvitationToken(token);
  }, []);

  const hasInvitation = Boolean(invitationToken);

  return (
    <div>
      <Form
        onSubmit={(values: z.infer<typeof registerInputSchema>) => {
          // Validate company fields if no invitation token
          if (!invitationToken) {
            const errors: string[] = [];
            
            if (!values.companyName?.trim()) errors.push('Company name is required');
            if (!values.companyDomain?.trim()) errors.push('Company domain is required');
            if (!values.companyCountry?.trim()) errors.push('Country is required');
            if (values.companySize === undefined) errors.push('Company size is required');
            if (!values.companyIndustry?.trim()) errors.push('Industry is required');
            
            if (errors.length > 0) {
              console.error('Validation errors:', errors);
              return; // Don't submit if validation fails
            }
          }

          // Clean up the data before submission
          const submissionData = {
            email: values.email,
            firstName: values.firstName,
            lastName: values.lastName,
            password: values.password,
            // Only include company fields if they have values or if no invitation
            ...(invitationToken ? {
              invitationToken: invitationToken
            } : {
              companyName: values.companyName || undefined,
              companyDomain: values.companyDomain || undefined,
              companyCountry: values.companyCountry || undefined,
              companySize: values.companySize !== undefined ? values.companySize : undefined,
              companyIndustry: values.companyIndustry || undefined,
            })
          };
          
          console.log('Submitting registration data:', submissionData);
          registering.mutate(submissionData);
        }}
        schema={registerInputSchema}
        options={{ shouldUnregister: true }}
      >
        {({ register, formState }) => (
          <>
            {/* Personal Information Section */}
            <div className="space-y-4 mb-6">
              <div className="border-b border-slate-700/50 pb-2 mb-4">
                <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                <p className="text-sm text-slate-400">Tell us about yourself</p>
              </div>

              <Input
                type="email"
                label="Email Address"
                error={formState.errors["email"] as FieldError | undefined}
                registration={register("email")}
                placeholder="your.email@company.com"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  label="First Name"
                  error={formState.errors["firstName"] as FieldError | undefined}
                  registration={register("firstName")}
                  placeholder="John"
                />
                
                <Input
                  type="text"
                  label="Last Name"
                  error={formState.errors["lastName"] as FieldError | undefined}
                  registration={register("lastName")}
                  placeholder="Smith"
                />
              </div>

              <Input
                type="password"
                label="Password"
                error={formState.errors["password"] as FieldError | undefined}
                registration={register("password")}
                placeholder="Create a strong password"
              />
            </div>

            {/* Company Information Section - Only show if no invitation */}
            {!hasInvitation && (
              <div className="space-y-4 mb-6">
                <div className="border-b border-slate-700/50 pb-2 mb-4">
                  <h3 className="text-lg font-semibold text-white">Company Information</h3>
                  <p className="text-sm text-slate-400">Help us understand your organization</p>
                </div>

                <Input
                  type="text"
                  label="Company Name"
                  error={formState.errors["companyName"] as FieldError | undefined}
                  registration={register("companyName", { 
                    required: !hasInvitation ? "Company name is required" : false 
                  })}
                  placeholder="Acme Corporation"
                />

                <Input
                  type="text"
                  label="Company Domain"
                  error={formState.errors["companyDomain"] as FieldError | undefined}
                  registration={register("companyDomain", { 
                    required: !hasInvitation ? "Company domain is required" : false,
                    pattern: !hasInvitation ? {
                      value: /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
                      message: "Please enter a valid domain (e.g., company.com)"
                    } : undefined
                  })}
                  placeholder="acmecorp.com"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Country"
                    options={COUNTRY_OPTIONS}
                    error={formState.errors["companyCountry"] as FieldError | undefined}
                    registration={register("companyCountry", { 
                      required: !hasInvitation ? "Country is required" : false 
                    })}
                    defaultValue=""
                  />

                  <Select
                    label="Company Size"
                    options={COMPANY_SIZE_OPTIONS}
                    error={formState.errors["companySize"] as FieldError | undefined}
                    registration={register("companySize", { 
                      required: !hasInvitation ? "Company size is required" : false,
                      valueAsNumber: true
                    })}
                    defaultValue=""
                  />
                </div>

                <Select
                  label="Industry"
                  options={INDUSTRY_OPTIONS}
                  error={formState.errors["companyIndustry"] as FieldError | undefined}
                  registration={register("companyIndustry", { 
                    required: !hasInvitation ? "Industry is required" : false 
                  })}
                  defaultValue=""
                />
              </div>
            )}

            {/* Invitation Token Info */}
            {hasInvitation && (
              <div className="mb-6 p-4 bg-green-600/20 rounded-lg border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-400 font-medium">Joining via invitation</span>
                </div>
                <p className="text-green-300 text-sm">
                  You're joining an existing company workspace. No need to fill out company details.
                </p>
              </div>
            )}

            {/* Terms and Submit */}
            <div className="space-y-4">
              <div className="text-xs text-slate-400 bg-slate-700/30 p-3 rounded-lg">
                By creating an account, you agree to our{" "}
                <a href="/terms" className="text-blue-400 hover:text-blue-300 underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                  Privacy Policy
                </a>
                .
              </div>

              <Button
                isLoading={registering.isPending}
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {registering.isPending ? "Creating account..." : "Create my account"}
              </Button>
            </div>
          </>
        )}
      </Form>
    </div>
  );
};