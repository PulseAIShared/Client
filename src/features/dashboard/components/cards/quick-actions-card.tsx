// src/features/dashboard/components/cards/quick-actions-card.tsx
import React from 'react';

export const QuickActionsCard = () => {
  return (
    <div className="relative bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg p-8 rounded-2xl border border-blue-500/30 shadow-xl overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #7c3aed 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, #3b82f6 0%, transparent 50%)`,
        }}></div>
      </div>

      <div className="relative">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-400/30 mb-4">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-purple-200">AI Recommendations</span>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-3">
              Ready to take action?
            </h3>
            <p className="text-slate-300 text-lg mb-6">
              Your AI assistant has identified 12 high-risk customers and 3 optimization opportunities.
            </p>

            {/* Action items */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-sm">5 customers ready for win-back campaigns</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-sm">3 payment failures require retry logic</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm">4 upsell opportunities identified</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-fit">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5 transition-all duration-200 font-semibold whitespace-nowrap">
              Launch Recovery Campaign
            </button>
            <button className="px-6 py-3 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 transition-colors font-medium border border-slate-600/50 whitespace-nowrap">
              Export Insights
            </button>
            <button className="px-6 py-3 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 transition-colors font-medium border border-slate-600/50 whitespace-nowrap">
              Schedule Review
            </button>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-6 pt-6 border-t border-slate-600/50">
          <div className="flex items-center justify-between text-sm text-slate-300 mb-2">
            <span>Monthly Goal Progress</span>
            <span>73% Complete</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-[73%] transition-all duration-1000 ease-out"></div>
          </div>
        </div>
      </div>
    </div>
  );
};