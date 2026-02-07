import { useNavigate } from 'react-router-dom';
import { AppPageHeader } from '@/components/layouts';

interface CampaignCreateHeaderProps {
  selectedSegment?: {
    name: string;
    customerCount: number;
  } | null;
}

export const CampaignCreateHeader = ({ selectedSegment }: CampaignCreateHeaderProps) => {
  const navigate = useNavigate();

  return (
    <AppPageHeader
      title="Create New Campaign"
      description={
        selectedSegment
          ? `Targeting ${selectedSegment.name} segment (${selectedSegment.customerCount.toLocaleString()} customers)`
          : 'Design targeted messaging to engage your customers and reduce churn with AI-powered insights.'
      }
      actions={(
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
      )}
      filters={(
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <button
            onClick={() => navigate('/app/campaigns')}
            className="group flex items-center justify-center gap-2 rounded-xl border border-border-primary/30 bg-surface-secondary/50 px-6 py-3 text-sm font-medium text-text-primary transition-all duration-200 hover:bg-surface-primary/50 hover:shadow-md sm:px-8 sm:py-4 sm:text-base"
          >
            <svg className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Campaigns
          </button>
          <button className="group flex items-center justify-center gap-2 rounded-xl border border-border-primary/30 bg-surface-secondary/50 px-6 py-3 text-sm font-medium text-text-primary transition-all duration-200 hover:bg-surface-primary/50 hover:shadow-md sm:px-8 sm:py-4 sm:text-base">
            <svg className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-4 0V5a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
            Save as Draft
          </button>
          <button className="group flex items-center justify-center gap-2 rounded-xl border border-border-primary/30 bg-surface-secondary/50 px-6 py-3 text-sm font-medium text-text-primary transition-all duration-200 hover:bg-surface-primary/50 hover:shadow-md sm:px-8 sm:py-4 sm:text-base">
            <svg className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview Campaign
          </button>
        </div>
      )}
    />
  );
};
