import { Link } from 'react-router-dom';
import { AppPageHeader } from '@/components/layouts';

export const CampaignsHeader = () => {
  return (
    <AppPageHeader
      title="Campaign Center"
      description="Create and manage targeted campaigns to reduce churn and boost engagement with AI-powered insights."
      actions={(
        <div className="hidden lg:flex items-center gap-6">
          <div className="text-right">
            <div className="text-3xl font-bold text-success-muted">94.2%</div>
            <div className="text-sm text-text-muted">email delivery rate</div>
          </div>
          <div className="w-px h-12 bg-border-primary/30"></div>
          <div className="text-right">
            <div className="text-3xl font-bold text-accent-primary">12.8%</div>
            <div className="text-sm text-text-muted">avg conversion rate</div>
          </div>
        </div>
      )}
      filters={(
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <Link
            to="/app/campaigns/create"
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-secondary/25 sm:px-8 sm:py-4 sm:text-base"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent-secondary to-accent-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
            <svg className="relative h-4 w-4 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="relative">Create Campaign</span>
          </Link>
          <button className="group flex items-center justify-center gap-2 rounded-xl border border-border-primary/30 bg-surface-secondary/50 px-6 py-3 text-sm font-medium text-text-primary transition-all duration-200 hover:bg-surface-primary/50 hover:shadow-md sm:px-8 sm:py-4 sm:text-base">
            <svg className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Campaign Analytics
          </button>
          <button className="group flex items-center justify-center gap-2 rounded-xl border border-border-primary/30 bg-surface-secondary/50 px-6 py-3 text-sm font-medium text-text-primary transition-all duration-200 hover:bg-surface-primary/50 hover:shadow-md sm:px-8 sm:py-4 sm:text-base">
            <svg className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            A/B Test Manager
          </button>
        </div>
      )}
    />
  );
};
