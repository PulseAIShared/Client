import { useGetInsightsData } from '@/features/insights/api/insights';
import { AppPageHeader } from '@/components/layouts';

export const InsightsHeader = () => {
  const { data: insights } = useGetInsightsData();

  return (
    <AppPageHeader
      title="Customer Insights"
      description="Deep analytics and predictive insights to maximize retention and revenue with AI-powered recommendations."
      actions={(
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:flex lg:items-center lg:gap-4">
          <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/40 px-4 py-3 text-center lg:text-right">
            <div className="text-xl font-bold text-success-muted lg:text-2xl">
              {insights?.header.predictionAccuracy ?? 87.3}%
            </div>
            <div className="text-xs text-text-muted sm:text-sm">prediction accuracy</div>
          </div>
          <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/40 px-4 py-3 text-center lg:text-right">
            <div className="text-xl font-bold text-accent-primary lg:text-2xl">
              {insights?.header.revenueSaved ?? '$4.2M'}
            </div>
            <div className="text-xs text-text-muted sm:text-sm">revenue saved</div>
          </div>
        </div>
      )}
      filters={(
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <button className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-secondary/25 sm:px-8 sm:py-4 sm:text-base">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-secondary to-accent-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
            <svg className="relative h-4 w-4 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="relative">Generate Report</span>
          </button>
          <button className="group flex items-center justify-center gap-2 rounded-xl border border-border-primary/30 bg-surface-secondary/50 px-6 py-3 text-sm font-medium text-text-primary transition-all duration-200 hover:bg-surface-primary/50 hover:shadow-md sm:px-8 sm:py-4 sm:text-base">
            <svg className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Data
          </button>
          <button className="group flex items-center justify-center gap-2 rounded-xl border border-border-primary/30 bg-surface-secondary/50 px-6 py-3 text-sm font-medium text-text-primary transition-all duration-200 hover:bg-surface-primary/50 hover:shadow-md sm:px-8 sm:py-4 sm:text-base">
            <svg className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Schedule Analysis
          </button>
        </div>
      )}
    />
  );
};
