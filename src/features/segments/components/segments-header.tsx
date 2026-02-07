// src/features/segments/components/segments-header.tsx
import React from 'react';
import { AppPageHeader } from '@/components/layouts';
import { useGetSegmentPerformance, useGetSegments } from '@/features/segments/api/segments';

export const SegmentsHeader = () => {
  const { data: segments = [] } = useGetSegments();
  const { data: performance } = useGetSegmentPerformance();

  const activeSegments = segments.filter((segment) => segment.status === 'active').length;
  const hasSegments = segments.length > 0;
  const hasPerformanceData = hasSegments && Boolean(performance) && performance!.avgChurnReduction > 0;
  const avgChurnReductionText = hasPerformanceData
    ? `${Math.round(performance!.avgChurnReduction)}%`
    : null;

  return (
    <AppPageHeader
      title="Customer Segments"
      description="AI-powered customer segmentation for targeted retention strategies and personalized experiences."
      actions={(
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:flex lg:items-center lg:gap-4">
          <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/40 px-4 py-3 text-center lg:text-right">
            <div className="text-xl font-bold text-success-muted lg:text-2xl">{avgChurnReductionText ?? '-'}</div>
            <div className="text-xs text-text-muted sm:text-sm">
              {hasPerformanceData ? 'avg churn reduction' : 'no performance data'}
            </div>
          </div>
          <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/40 px-4 py-3 text-center lg:text-right">
            <div className="text-xl font-bold text-accent-primary lg:text-2xl">{activeSegments}</div>
            <div className="text-xs text-text-muted sm:text-sm">active segments</div>
          </div>
        </div>
      )}
    />
  );
};
