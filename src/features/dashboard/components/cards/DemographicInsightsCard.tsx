import React, { useState } from 'react';
import { PieChart } from 'lucide-react';
import { DemographicInsight } from '@/types/api';

interface DemographicInsightsCardProps {
  data?: DemographicInsight[];
  isLoading?: boolean;
  error?: Error | null;
}

export const DemographicInsightsCard: React.FC<DemographicInsightsCardProps> = ({
  data,
  isLoading,
  error,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (isLoading) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg space-y-4">
        <div className="h-6 bg-gradient-to-r from-surface-secondary to-surface-primary rounded-lg w-48" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gradient-to-r from-surface-secondary to-surface-primary rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="bg-error-muted/5 border border-error-muted/20 p-6 rounded-2xl">
        <div className="text-error-muted text-sm">
          No demographic insights available
        </div>
      </div>
    );
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-success-muted';
    if (change < 0) return 'text-error-muted';
    return 'text-text-muted';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return '↑';
    if (change < 0) return '↓';
    return '→';
  };

  return (
    <div className="bg-surface-primary/80 backdrop-blur-lg rounded-2xl border border-border-primary/30 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-surface-primary to-surface-secondary p-6 border-b border-border-primary/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
            <PieChart className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">Demographic Insights</h3>
        </div>
        <p className="text-text-muted text-sm">AI-powered segment analysis with trends</p>
      </div>

      <div className="divide-y divide-border-primary/10">
        {data.map((insight, idx) => (
          <div
            key={idx}
            className={`transition-colors ${
              expandedIndex === idx ? 'bg-surface-secondary/30' : 'hover:bg-surface-secondary/10'
            }`}
          >
            <button
              onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
              className="w-full p-4 text-left focus:outline-none"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-text-primary mb-2 truncate">
                    {insight.segment}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-text-muted mb-1">Customers</p>
                      <p className="font-bold text-text-primary">
                        {insight.customerCount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-1">Avg LTV</p>
                      <p className="font-bold text-text-primary">
                        ${Math.round(insight.avgLtv).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-text-muted mb-1">Churn Risk</p>
                      <p className="font-bold text-text-primary">
                        {Math.round(insight.avgChurnRisk)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-1">LTV Change</p>
                      <p className={`font-bold flex items-center gap-1 ${getChangeColor(insight.ltvChange)}`}>
                        {getChangeIcon(insight.ltvChange)}
                        {Math.abs(Math.round(insight.ltvChange))}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <svg
                    className={`w-5 h-5 text-text-muted transition-transform ${
                      expandedIndex === idx ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
              </div>
            </button>

            {expandedIndex === idx && (
              <div className="px-4 pb-4 space-y-3 border-t border-border-primary/10">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-error-muted/5 border border-error-muted/20 rounded-lg p-3">
                    <p className="text-xs text-text-muted mb-1">Churn Risk Change</p>
                    <p className={`font-bold flex items-center gap-1 ${getChangeColor(insight.churnRiskChange)}`}>
                      {getChangeIcon(insight.churnRiskChange)}
                      {Math.abs(Math.round(insight.churnRiskChange))}%
                    </p>
                  </div>
                  <div className="bg-success-muted/5 border border-success-muted/20 rounded-lg p-3">
                    <p className="text-xs text-text-muted mb-1">Top Metrics</p>
                    <p className="text-xs text-text-primary font-semibold">
                      {insight.topMetrics.length > 0 ? insight.topMetrics[0] : 'No data'}
                    </p>
                  </div>
                </div>
                {insight.topMetrics.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {insight.topMetrics.map((metric, midx) => (
                      <span
                        key={midx}
                        className="inline-block px-2 py-1 text-xs bg-accent-primary/10 text-accent-primary border border-accent-primary/20 rounded-full"
                      >
                        {metric}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="px-6 py-4 bg-surface-secondary/50 border-t border-border-primary/10">
        <p className="text-xs text-text-muted">
          Click on segments to see detailed insights and trend analysis
        </p>
      </div>
    </div>
  );
};
