import React from 'react';
import { GeoInsight } from '@/types/api';

interface GeoInsightsCardProps {
  data?: GeoInsight[];
  isLoading?: boolean;
  error?: Error | null;
}

export const GeoInsightsCard: React.FC<GeoInsightsCardProps> = ({ data, isLoading, error }) => {
  if (isLoading) {
    return <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg animate-pulse min-h-[260px]" />;
  }

  if (error || !data) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg min-h-[260px] flex items-center justify-center">
        <p className="text-text-muted text-sm">Geo insights unavailable</p>
      </div>
    );
  }

  const top = data.slice(0, 6);

  return (
    <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Geo / LTV heatmap</h3>
          <p className="text-text-muted text-sm">Top regions by customers, LTV, and risk</p>
        </div>
        <div className="px-3 py-1 rounded-full text-xs bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
          {data.length} regions
        </div>
      </div>

      <div className="space-y-3">
        {top.map((geo) => (
          <div key={geo.country} className="flex items-center justify-between bg-surface-secondary/50 rounded-xl p-3 border border-border-primary/30 hover:border-border-secondary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent-primary/60" />
              <div>
                <div className="text-sm font-semibold text-text-primary">{geo.country}</div>
                <div className="text-xs text-text-muted">{geo.customerCount.toLocaleString()} customers</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-right">
              <div>
                <div className="text-xs uppercase text-text-muted">Avg LTV</div>
                <div className="text-sm font-semibold text-text-primary">${geo.avgLtv.toFixed(0)}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-text-muted">Avg risk</div>
                <div className="text-sm font-semibold text-error-muted">{geo.avgRisk.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
