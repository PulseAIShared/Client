import React from 'react';
import { AppPageHeader, ContentLayout } from '@/components/layouts';
import { IntegrationsSection } from '@/features/settings/components';

export const IntegrationsRoute = () => {
  return (
    <ContentLayout>
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        <AppPageHeader
          title="Integrations"
          description="Connect external platforms, manage sync schedules, and monitor integration health."
        />

        <IntegrationsSection />
      </div>
    </ContentLayout>
  );
};
