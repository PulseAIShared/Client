// src/features/segments/components/segment-insights-card.tsx
import React from 'react';
import { SegmentInsight } from '@/types/api';

interface SegmentInsightsCardProps {
  insights: SegmentInsight[];
  isLoading?: boolean;
}

const getPriorityColor = (priority: 'High' | 'Medium' | 'Low'): string => {
  switch (priority) {
    case 'High':
      return 'bg-error/20 border-error/30 text-error';
    case 'Medium':
      return 'bg-warning/20 border-warning/30 text-warning';
    case 'Low':
      return 'bg-info/20 border-info/30 text-info';
    default:
      return 'bg-surface-secondary/20 border-border-primary/30 text-text-muted';
  }
};

const getPriorityIcon = (priority: 'High' | 'Medium' | 'Low'): string => {
  switch (priority) {
    case 'High':
      return '⚠️';
    case 'Medium':
      return '📊';
    case 'Low':
      return 'ℹ️';
    default:
      return '💡';
  }
};

export const SegmentInsightsCard: React.FC<SegmentInsightsCardProps> = ({
  insights,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg">
        <h3 className="text-lg font-semibold text-text-primary mb-4">AI Insights</h3>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-surface-secondary/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg">
        <h3 className="text-lg font-semibold text-text-primary mb-4">AI Insights</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-surface-secondary/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-text-muted">No insights available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-text-primary">AI Insights</h3>
        <div className="w-5 h-5 bg-accent-secondary/30 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border transition-all ${getPriorityColor(insight.priority)}`}
          >
            <div className="flex gap-3">
              <span className="text-xl flex-shrink-0 mt-0.5">
                {getPriorityIcon(insight.priority)}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                <p className="text-xs opacity-80 mb-2">{insight.description}</p>
                <p className="text-xs font-medium opacity-70">
                  Recommendation: {insight.recommendation}
                </p>
              </div>
              <div className={`text-xs font-medium px-2 py-1 rounded-md whitespace-nowrap mt-0.5`}>
                {insight.priority}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
