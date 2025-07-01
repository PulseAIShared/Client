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
    <div className="relative">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-2xl blur-3xl"></div>
      
      <div className="relative bg-surface-secondary/50 backdrop-blur-lg p-8 rounded-2xl border border-border-primary/50 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-accent-secondary/20 backdrop-blur-sm px-4 py-2 rounded-full border border-accent-secondary/30 mb-4">
              <div className="w-2 h-2 bg-info-muted rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-accent-secondary">Campaign Builder</span>
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary mb-2">
              Create New Campaign
            </h1>
            <p className="text-text-secondary text-lg">
              {selectedSegment 
                ? `Targeting ${selectedSegment.name} segment (${selectedSegment.customerCount.toLocaleString()} customers)`
                : 'Design targeted messaging to engage your customers and reduce churn'
              }
            </p>
          </div>
          
          <div className="hidden lg:flex items-center gap-4">
            {selectedSegment && (
              <>
                <div className="text-right">
                  <div className="text-2xl font-bold text-accent-primary">{selectedSegment.customerCount.toLocaleString()}</div>
                  <div className="text-sm text-text-muted">target customers</div>
                </div>
                <div className="w-px h-12 bg-border-primary"></div>
              </>
            )}
            <div className="text-right">
              <div className="text-2xl font-bold text-success-muted">~15%</div>
              <div className="text-sm text-text-muted">expected engagement</div>
            </div>
          </div>
        </div>
        
        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button 
            onClick={() => navigate('/app/campaigns')}
            className="px-4 py-2 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-secondary/70 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm border border-border-primary/50 inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Campaigns
          </button>
          <button className="px-4 py-2 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-secondary/70 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm border border-border-primary/50">
            Save as Draft
          </button>
          <button className="px-4 py-2 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-secondary/70 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm border border-border-primary/50">
            Preview Campaign
          </button>
        </div>
      </div>
    </div>
  );
};