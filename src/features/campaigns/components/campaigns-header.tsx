import { Link } from 'react-router-dom';

export const CampaignsHeader = () => {
  return (
    <div className="relative">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-2xl blur-3xl"></div>
      
      <div className="relative bg-surface-secondary/50 backdrop-blur-lg p-8 rounded-2xl border border-border-primary/50 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-accent-secondary/20 backdrop-blur-sm px-4 py-2 rounded-full border border-accent-secondary/30 mb-4">
              <div className="w-2 h-2 bg-success-muted rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-accent-secondary">Smart Campaigns</span>
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary mb-2">
              Campaign Center
            </h1>
            <p className="text-text-secondary text-lg">
              Create and manage targeted campaigns to reduce churn and boost engagement
            </p>
          </div>
          
          <div className="hidden lg:flex items-center gap-4">
            {/* Quick stats */}
            <div className="text-right">
              <div className="text-2xl font-bold text-success-muted">94.2%</div>
              <div className="text-sm text-text-muted">email delivery rate</div>
            </div>
            <div className="w-px h-12 bg-border-primary"></div>
            <div className="text-right">
              <div className="text-2xl font-bold text-accent-primary">12.8%</div>
              <div className="text-sm text-text-muted">avg conversion rate</div>
            </div>
          </div>
        </div>
        
        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          <Link 
            to="/app/campaigns/create"
            className="px-4 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-text-primary rounded-lg hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Campaign
          </Link>
          <button className="px-4 py-2 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-secondary/70 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm border border-border-primary/50">
            Campaign Analytics
          </button>
          <button className="px-4 py-2 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-secondary/70 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm border border-border-primary/50">
            A/B Test Manager
          </button>
        </div>
      </div>
    </div>
  );
};