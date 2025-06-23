// src/app/routes/app/customers/customer-detail.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContentLayout } from '@/components/layouts';
import { CustomerDetailView } from '@/features/customers/components/details/customer-detail-view';
import { useGetCustomerById } from '@/features/customers/api/customers';
import { Spinner } from '@/components/ui/spinner';

export const CustomerDetailRoute = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { data: customer, isLoading, error } = useGetCustomerById(customerId!);

  if (isLoading) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center py-12">
          <Spinner size="xl" />
        </div>
      </ContentLayout>
    );
  }

  if (error || !customer) {
    return (
      <ContentLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-error/30 to-warning/30 rounded-2xl blur-3xl"></div>
            
            <div className="relative bg-surface-primary backdrop-blur-lg p-6 rounded-2xl border border-border-primary shadow-xl">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/app/customers')}
                  className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-error">Customer Not Found</h1>
                  <p className="text-text-secondary">The customer you're looking for doesn't exist or has been removed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout>
      <CustomerDetailView customer={customer} />
    </ContentLayout>
  );
};