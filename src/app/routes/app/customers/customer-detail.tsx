// src/app/routes/app/customers/customer-detail.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppPageHeader, ContentLayout } from '@/components/layouts';
import { CustomerProfileProvider } from '@/features/customers/components/details/customer-profile-context';
import { CustomerDetailView } from '@/features/customers/components/details/customer-detail-view';

export const CustomerDetailRoute = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();

  if (!customerId) {
    return (
      <ContentLayout>
        <div className="space-y-6">
          <AppPageHeader
            title="Customer Not Found"
            description="The customer you're looking for doesn't exist or has been removed."
            compact
            actions={(
              <button
                onClick={() => navigate('/app/customers')}
                className="px-4 py-2 bg-surface-secondary/50 text-text-primary rounded-lg border border-border-primary/30 hover:bg-surface-secondary/80 transition-colors text-sm"
              >
                Back to Customers
              </button>
            )}
          />
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout>
      <CustomerProfileProvider customerId={customerId}>
        <CustomerDetailView />
      </CustomerProfileProvider>
    </ContentLayout>
  );
};
