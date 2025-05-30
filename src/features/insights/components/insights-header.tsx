export const InsightsHeader = () => {
  return (
    <div className="relative">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-3xl"></div>
      
      <div className="relative bg-slate-800/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-700/50 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-400/30 mb-4">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-purple-200">AI-Powered Analytics</span>
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
              Customer Insights
            </h1>
            <p className="text-slate-300 text-lg">
              Deep analytics and predictive insights to maximize retention and revenue
            </p>
          </div>
          
          <div className="hidden lg:flex items-center gap-4">
            {/* Quick stats */}
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">87.3%</div>
              <div className="text-sm text-slate-400">prediction accuracy</div>
            </div>
            <div className="w-px h-12 bg-slate-600"></div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-400">$4.2M</div>
              <div className="text-sm text-slate-400">revenue saved</div>
            </div>
          </div>
        </div>
        
        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm">
            Generate Report
          </button>
          <button className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 transition-colors font-medium text-sm border border-slate-600/50">
            Export Data
          </button>
          <button className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 transition-colors font-medium text-sm border border-slate-600/50">
            Schedule Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
