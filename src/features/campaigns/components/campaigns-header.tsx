import { Link } from 'react-router-dom';

export const CampaignsHeader = () => {
  return (
    <div className="relative group">
      {/* Enhanced background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 via-accent-secondary/5 to-accent-primary/5 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
      
      <div className="relative bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
          <div className="flex-1 space-y-3">
   
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary mb-2">
              Campaign Center
            </h1>
            <p className="text-text-secondary text-base sm:text-lg lg:text-xl max-w-2xl">
              Create and manage targeted campaigns to reduce churn and boost engagement with AI-powered insights
            </p>
          </div>
          
          {/* Enhanced Mobile: Quick stats in a responsive grid */}
          <div className="lg:hidden grid grid-cols-2 gap-4 mt-6">
            <div className="bg-surface-primary/50 backdrop-blur-lg p-4 rounded-2xl border border-border-primary/30 text-center shadow-lg">
              <div className="text-xl sm:text-2xl font-bold text-success-muted">94.2%</div>
              <div className="text-xs sm:text-sm text-text-muted">email delivery rate</div>
            </div>
            <div className="bg-surface-primary/50 backdrop-blur-lg p-4 rounded-2xl border border-border-primary/30 text-center shadow-lg">
              <div className="text-xl sm:text-2xl font-bold text-accent-primary">12.8%</div>
              <div className="text-xs sm:text-sm text-text-muted">avg conversion rate</div>
            </div>
          </div>
          
          {/* Enhanced Desktop: Quick stats in sidebar format */}
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
        </div>
        
        {/* Enhanced Quick action buttons */}
        <div className="mt-6 sm:mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Link 
              to="/app/campaigns/create"
              className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent-secondary to-accent-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <svg className="relative w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="relative">Create Campaign</span>
            </Link>
            <button className="group px-6 sm:px-8 py-3 sm:py-4 bg-surface-secondary/50 text-text-primary rounded-xl hover:bg-surface-primary/50 transition-all duration-200 font-medium text-sm sm:text-base border border-border-primary/30 hover:border-border-secondary hover:shadow-md flex items-center justify-center gap-2">
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Campaign Analytics
            </button>
            <button className="group px-6 sm:px-8 py-3 sm:py-4 bg-surface-secondary/50 text-text-primary rounded-xl hover:bg-surface-primary/50 transition-all duration-200 font-medium text-sm sm:text-base border border-border-primary/30 hover:border-border-secondary hover:shadow-md flex items-center justify-center gap-2">
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              A/B Test Manager
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};