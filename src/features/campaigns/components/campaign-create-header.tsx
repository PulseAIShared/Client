import { useNavigate } from 'react-router-dom';

interface CampaignCreateHeaderProps {
  selectedSegment?: {
    name: string;
    customerCount: number;
  } | null;
}

export const CampaignCreateHeader = ({ selectedSegment }: CampaignCreateHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="relative group">
      {/* Enhanced background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 via-accent-secondary/5 to-accent-primary/5 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
      
      <div className="relative bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-gradient-to-r from-info-muted to-accent-secondary rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-accent-secondary bg-accent-secondary/10 px-3 py-1 rounded-full">
                Campaign Builder
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary mb-2">
              Create New Campaign
            </h1>
            <p className="text-text-secondary text-base sm:text-lg lg:text-xl max-w-2xl">
              {selectedSegment 
                ? `Targeting ${selectedSegment.name} segment (${selectedSegment.customerCount.toLocaleString()} customers)`
                : 'Design targeted messaging to engage your customers and reduce churn with AI-powered insights'
              }
            </p>
          </div>
          
          {/* Enhanced Mobile: Quick stats in a responsive grid */}
          <div className="lg:hidden grid grid-cols-2 gap-4 mt-6">
            {selectedSegment && (
              <div className="bg-surface-primary/50 backdrop-blur-lg p-4 rounded-2xl border border-border-primary/30 text-center shadow-lg">
                <div className="text-xl sm:text-2xl font-bold text-accent-primary">{selectedSegment.customerCount.toLocaleString()}</div>
                <div className="text-xs sm:text-sm text-text-muted">target customers</div>
              </div>
            )}
            <div className="bg-surface-primary/50 backdrop-blur-lg p-4 rounded-2xl border border-border-primary/30 text-center shadow-lg">
              <div className="text-xl sm:text-2xl font-bold text-success-muted">~15%</div>
              <div className="text-xs sm:text-sm text-text-muted">expected engagement</div>
            </div>
          </div>
          
          {/* Enhanced Desktop: Quick stats in sidebar format */}
          <div className="hidden lg:flex items-center gap-6">
            {selectedSegment && (
              <>
                <div className="text-right">
                  <div className="text-3xl font-bold text-accent-primary">{selectedSegment.customerCount.toLocaleString()}</div>
                  <div className="text-sm text-text-muted">target customers</div>
                </div>
                <div className="w-px h-12 bg-border-primary/30"></div>
              </>
            )}
            <div className="text-right">
              <div className="text-3xl font-bold text-success-muted">~15%</div>
              <div className="text-sm text-text-muted">expected engagement</div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Quick action buttons */}
        <div className="mt-6 sm:mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <button 
              onClick={() => navigate('/app/campaigns')}
              className="group px-6 sm:px-8 py-3 sm:py-4 bg-surface-secondary/50 text-text-primary rounded-xl hover:bg-surface-primary/50 transition-all duration-200 font-medium text-sm sm:text-base border border-border-primary/30 hover:border-border-secondary hover:shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Campaigns
            </button>
            <button className="group px-6 sm:px-8 py-3 sm:py-4 bg-surface-secondary/50 text-text-primary rounded-xl hover:bg-surface-primary/50 transition-all duration-200 font-medium text-sm sm:text-base border border-border-primary/30 hover:border-border-secondary hover:shadow-md flex items-center justify-center gap-2">
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-4 0V5a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              Save as Draft
            </button>
            <button className="group px-6 sm:px-8 py-3 sm:py-4 bg-surface-secondary/50 text-text-primary rounded-xl hover:bg-surface-primary/50 transition-all duration-200 font-medium text-sm sm:text-base border border-border-primary/30 hover:border-border-secondary hover:shadow-md flex items-center justify-center gap-2">
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};