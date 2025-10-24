import React from 'react';
import { ContentLayout } from '@/components/layouts';
import { IntegrationsSection } from '@/features/settings/components';

export const IntegrationsRoute = () => {
  return (
    <ContentLayout>
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 via-accent-secondary/5 to-accent-primary/5 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-500" />

          <div className="relative bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
              <div className="flex-1 space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary mb-2">
                  Integrations
                </h1>
                <p className="text-text-secondary text-base sm:text-lg lg:text-xl max-w-2xl">
                  Connect external platforms, manage sync schedules, and monitor integration health.
                </p>
              </div>
            </div>
          </div>
        </div>

        <IntegrationsSection />
      </div>
    </ContentLayout>
  );
};
