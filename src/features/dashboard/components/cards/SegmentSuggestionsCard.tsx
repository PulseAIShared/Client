import React from 'react';
import { Lightbulb, Gem, TrendingUp, Target, LayoutGrid } from 'lucide-react';
import { SegmentSuggestion } from '@/types/api';


interface SegmentSuggestionsCardProps {
  data?: SegmentSuggestion[];
  isLoading?: boolean;
  error?: Error | null;
  onCreateSegment?: (suggestion: SegmentSuggestion) => void;
}

export const SegmentSuggestionsCard: React.FC<SegmentSuggestionsCardProps> = ({
  data,
  isLoading,
  error,
  onCreateSegment,
}) => {
  if (isLoading) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg space-y-4">
        <div className="h-6 bg-gradient-to-r from-surface-secondary to-surface-primary rounded-lg w-48" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-gradient-to-r from-surface-secondary to-surface-primary rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="bg-warning-muted/5 border border-warning-muted/20 p-6 rounded-2xl">
        <div className="text-warning-muted text-sm">
          No segment suggestions at this time
        </div>
      </div>
    );
  }

  const getIcon = (name: string) => {
    const lower = name.toLowerCase();
    const iconClass = "w-5 h-5";
    if (lower.includes('high') || lower.includes('value')) return <Gem className={`${iconClass} text-purple-400`} />;
    if (lower.includes('expansion') || lower.includes('growth')) return <TrendingUp className={`${iconClass} text-green-400`} />;
    if (lower.includes('win') || lower.includes('risk')) return <Target className={`${iconClass} text-orange-400`} />;
    return <LayoutGrid className={`${iconClass} text-blue-400`} />;
  };

  const getPriorityColor = (index: number) => {
    switch (index) {
      case 0:
        return {
          bg: 'from-red-500/10 to-red-500/5',
          border: 'border-red-500/20',
          badge: 'bg-red-500/20 text-red-400',
          text: 'text-red-300',
        };
      case 1:
        return {
          bg: 'from-orange-500/10 to-orange-500/5',
          border: 'border-orange-500/20',
          badge: 'bg-orange-500/20 text-orange-400',
          text: 'text-orange-300',
        };
      default:
        return {
          bg: 'from-yellow-500/10 to-yellow-500/5',
          border: 'border-yellow-500/20',
          badge: 'bg-yellow-500/20 text-yellow-400',
          text: 'text-yellow-300',
        };
    }
  };

  return (
    <div className="bg-surface-primary/80 backdrop-blur-lg rounded-2xl border border-border-primary/30 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-surface-primary to-surface-secondary p-6 border-b border-border-primary/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 rounded-xl flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-accent-primary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">Segment Suggestions</h3>
        </div>
        <p className="text-text-muted text-sm">AI-recommended customer cohorts ready to activate</p>
      </div>

      <div className="divide-y divide-border-primary/10">
        {data.map((suggestion, idx) => {
          const colors = getPriorityColor(idx);
          const maxValue = Math.max(...data.map(s => s.potentialValue || 0));
          const valuePercentage = maxValue > 0 ? (suggestion.potentialValue / maxValue) * 100 : 0;

          return (
            <div key={idx} className={`bg-gradient-to-r ${colors.bg} border-l-4 ${colors.border} p-4`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surface-secondary/50 flex items-center justify-center flex-shrink-0">
                    {getIcon(suggestion.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-text-primary truncate">{suggestion.name}</h4>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colors.badge}`}>
                        #{idx + 1}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted mb-2">{suggestion.description}</p>
                    <p className="text-xs text-text-muted line-clamp-2">{suggestion.reasoning}</p>
                  </div>
                </div>
                <button
                  onClick={() => onCreateSegment?.(suggestion)}
                  className="flex-shrink-0 ml-3 px-3 py-1.5 text-xs font-semibold bg-accent-primary hover:bg-accent-secondary text-white rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-2 mb-3 pt-3 border-t border-border-primary/10">
                <div>
                  <p className="text-xs text-text-muted mb-1">Customers</p>
                  <p className="font-bold text-text-primary">
                    {suggestion.customerCount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1">Potential Value</p>
                  <p className="font-bold text-text-primary">
                    ${(suggestion.potentialValue / 1000).toFixed(1)}k
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1">Priority</p>
                  <p className={`font-bold text-sm ${colors.text}`}>
                    {idx === 0 ? 'Critical' : idx === 1 ? 'High' : 'Medium'}
                  </p>
                </div>
              </div>

              {/* Value Bar */}
              <div className="relative h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary transition-all duration-500"
                  style={{ width: `${Math.min(valuePercentage, 100)}%` }}
                />
              </div>

              {/* Characteristics */}
              {suggestion.characteristics.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {suggestion.characteristics.map((char, cidx) => (
                    <span
                      key={cidx}
                      className="inline-flex items-center px-2 py-0.5 text-xs bg-surface-secondary/50 text-text-secondary rounded-full border border-border-primary/10"
                    >
                      {char}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-6 py-4 bg-surface-secondary/50 border-t border-border-primary/10">
        <p className="text-xs text-text-muted">
          These segments are AI-generated based on your customer data. Click "Create" to add them to your segment library.
        </p>
      </div>
    </div>
  );
};
