import { useGetInsightsData } from '@/features/insights/api/insights';

export const InsightsHeader = () => {
  const { data: insights } = useGetInsightsData();

  return (
    <div className="relative group">
      {/* Enhanced background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 via-accent-secondary/5 to-accent-primary/5 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
      
      <div className="relative bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
          <div className="flex-1 space-y-3">
  
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary mb-2">
              Customer Insights
            </h1>
            <p className="text-text-secondary text-base sm:text-lg lg:text-xl max-w-2xl">
              Deep analytics and predictive insights to maximize retention and revenue with AI-powered recommendations
            </p>
          </div>
          
          {/* Enhanced Mobile: Quick stats in a responsive grid */}
          <div className="lg:hidden grid grid-cols-2 gap-4 mt-6">
            <div className="bg-surface-primary/50 backdrop-blur-lg p-4 rounded-2xl border border-border-primary/30 text-center shadow-lg">
              <div className="text-xl sm:text-2xl font-bold text-success-muted">
                {insights?.header.predictionAccuracy ?? 87.3}%
              </div>
              <div className="text-xs sm:text-sm text-text-muted">prediction accuracy</div>
            </div>
            <div className="bg-surface-primary/50 backdrop-blur-lg p-4 rounded-2xl border border-border-primary/30 text-center shadow-lg">
              <div className="text-xl sm:text-2xl font-bold text-accent-primary">
                {insights?.header.revenueSaved ?? '$4.2M'}
              </div>
              <div className="text-xs sm:text-sm text-text-muted">revenue saved</div>
            </div>
          </div>
          
          {/* Enhanced Desktop: Quick stats in sidebar format */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="text-right">
              <div className="text-3xl font-bold text-success-muted">
                {insights?.header.predictionAccuracy ?? 87.3}%
              </div>
              <div className="text-sm text-text-muted">prediction accuracy</div>
            </div>
            <div className="w-px h-12 bg-border-primary/30"></div>
            <div className="text-right">
              <div className="text-3xl font-bold text-accent-primary">
                {insights?.header.revenueSaved ?? '$4.2M'}
              </div>
              <div className="text-sm text-text-muted">revenue saved</div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Quick action buttons */}
        <div className="mt-6 sm:mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <button className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-secondary to-accent-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <svg className="relative w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="relative">Generate Report</span>
            </button>
            <button className="group px-6 sm:px-8 py-3 sm:py-4 bg-surface-secondary/50 text-text-primary rounded-xl hover:bg-surface-primary/50 transition-all duration-200 font-medium text-sm sm:text-base border border-border-primary/30 hover:border-border-secondary hover:shadow-md flex items-center justify-center gap-2">
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Data
            </button>
            <button className="group px-6 sm:px-8 py-3 sm:py-4 bg-surface-secondary/50 text-text-primary rounded-xl hover:bg-surface-primary/50 transition-all duration-200 font-medium text-sm sm:text-base border border-border-primary/30 hover:border-border-secondary hover:shadow-md flex items-center justify-center gap-2">
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Schedule Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
