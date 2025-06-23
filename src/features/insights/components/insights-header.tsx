export const InsightsHeader = () => {
  return (
    <div className="relative">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-2xl blur-3xl"></div>
      
      <div className="relative bg-surface-secondary/50 backdrop-blur-lg p-8 rounded-2xl border border-border-primary/50 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-accent-secondary/20 backdrop-blur-sm px-4 py-2 rounded-full border border-accent-secondary/30 mb-4">
              <div className="w-2 h-2 bg-success-muted rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-accent-secondary">AI-Powered Analytics</span>
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary mb-2">
              Customer Insights
            </h1>
            <p className="text-text-secondary text-lg">
              Deep analytics and predictive insights to maximize retention and revenue
            </p>
          </div>
          
          <div className="hidden lg:flex items-center gap-4">
            {/* Quick stats */}
            <div className="text-right">
              <div className="text-2xl font-bold text-success-muted">87.3%</div>
              <div className="text-sm text-text-muted">prediction accuracy</div>
            </div>
            <div className="w-px h-12 bg-border-primary"></div>
            <div className="text-right">
              <div className="text-2xl font-bold text-accent-primary">$4.2M</div>
              <div className="text-sm text-text-muted">revenue saved</div>
            </div>
          </div>
        </div>
        
        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button className="px-4 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-text-primary rounded-lg hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm">
            Generate Report
          </button>
          <button className="px-4 py-2 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-secondary/70 transition-colors font-medium text-sm border border-border-primary/50">
            Export Data
          </button>
          <button className="px-4 py-2 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-secondary/70 transition-colors font-medium text-sm border border-border-primary/50">
            Schedule Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
