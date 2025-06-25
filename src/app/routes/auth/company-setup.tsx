import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCompanyCreation, useUser } from '@/lib/auth';
import { CompanySize } from '@/types/api';
import { AuthLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Form, Input } from '@/components/ui/form';
import { Select } from '@/components/ui/form/select';
import { z } from 'zod';
import { FieldError } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';

const companySetupSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  companyDomain: z.string().optional(),
  companyCountry: z.string().optional(),
  companySize: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  companyIndustry: z.string().optional(),
});

type CompanySetupInput = z.infer<typeof companySetupSchema>;

export const CompanySetupRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const createCompany = useCompanyCreation();
  const user = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const requiresCompanyCreation = location.state?.requiresCompanyCreation || false;

  const handleSubmit = async (values: CompanySetupInput) => {
    try {
      setIsSubmitting(true);
      await createCompany.mutateAsync({
        companyName: values.companyName,
        companyDomain: values.companyDomain,
        companyCountry: values.companyCountry,
        companySize: values.companySize,
        companyIndustry: values.companyIndustry,
      });

      // Refetch user data to get updated company info
      await user.refetch();
      navigate('/app');
    } catch (error) {
      console.error('Company creation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const companySizeOptions = [
    { value: CompanySize.Startup, label: 'Startup (1-50 employees)' },
    { value: CompanySize.SMB, label: 'Small-Medium Business (51-500 employees)' },
    { value: CompanySize.Enterprise, label: 'Enterprise (500+ employees)' },
  ];

  return (
 
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">Almost Done</span>
              </div>
              
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Set Up Your Company
              </h1>
              <p className="text-slate-600">
                Complete your profile to get started with PulseLTV
              </p>
            </div>

            {/* Company Setup Form */}
            <Form<CompanySetupInput, typeof companySetupSchema>
              onSubmit={handleSubmit}
              schema={companySetupSchema}
              options={{ shouldUnregister: true }}
            >
              {({ register, formState }) => (
                <div className="space-y-4">
                  <Input
                    type="text"
                    label="Company Name *"
                    placeholder="Enter your company name"
                    error={formState.errors["companyName"] as FieldError | undefined}
                    registration={register("companyName")}
                  />

                  <Input
                    type="text"
                    label="Company Domain"
                    placeholder="example.com (optional)"
                    error={formState.errors["companyDomain"] as FieldError | undefined}
                    registration={register("companyDomain")}
                  />

                  <Select
                    label="Company Size *"
                    options={companySizeOptions}
                    error={formState.errors["companySize"] as FieldError | undefined}
                    registration={register("companySize", { valueAsNumber: true })}
                  />

                  <Input
                    type="text"
                    label="Industry"
                    placeholder="e.g., SaaS, E-commerce, Healthcare (optional)"
                    error={formState.errors["companyIndustry"] as FieldError | undefined}
                    registration={register("companyIndustry")}
                  />

                  <Input
                    type="text"
                    label="Country"
                    placeholder="e.g., United States (optional)"
                    error={formState.errors["companyCountry"] as FieldError | undefined}
                    registration={register("companyCountry")}
                  />

                  <div className="pt-4">
                    <Button
                      isLoading={isSubmitting || createCompany.isPending}
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                    >
                      Complete Setup
                    </Button>
                  </div>
                </div>
              )}
            </Form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-slate-200 text-center">
              <p className="text-xs text-slate-500">
                By continuing, you confirm that you have the authority to create a company account
              </p>
            </div>
          </div>
        </div>
      </div>

  );
};