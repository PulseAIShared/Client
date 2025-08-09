// src/app/routes/app/segments/segment-detail.tsx
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ContentLayout } from '@/components/layouts';
import { useGetSegmentById } from '@/features/segments/api/segments';
import { Spinner } from '@/components/ui/spinner';

export const SegmentDetailRoute: React.FC = () => {
  const navigate = useNavigate();
  const { segmentId } = useParams();
  const { data: segment, isLoading, error } = useGetSegmentById(segmentId || '');

  if (isLoading) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center py-12">
          <Spinner size="xl" />
        </div>
      </ContentLayout>
    );
  }

  if (error || !segment) {
    return (
      <ContentLayout>
        <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-error/20 to-error-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="text-error-muted font-medium mb-2">Segment not found</div>
            <Link to="/app/segments" className="px-4 py-2 bg-surface-secondary/50 text-text-primary rounded-lg border border-border-primary/30 hover:bg-surface-secondary/80">
              Back to Segments
            </Link>
          </div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-2xl blur-3xl"></div>
          <div className="relative bg-surface-primary/90 backdrop-blur-xl p-6 rounded-2xl border border-border-primary/30 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/app/segments')}
                  className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary/60 rounded-lg transition-colors"
                  aria-label="Back to Segments"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-text-primary">{segment.name}</h1>
                  <p className="text-text-secondary text-sm">{segment.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/app/segments/${segment.id}/edit`
                  }
                  className="px-4 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg hover:shadow-lg hover:shadow-accent-primary/25 transform hover:-translate-y-0.5 transition-all duration-200 text-sm"
                >
                  Edit Segment
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg">
            <div className="text-sm text-text-muted mb-1">Customers</div>
            <div className="text-2xl font-bold text-text-primary">{segment.customerCount.toLocaleString()}</div>
          </div>
          <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg">
            <div className="text-sm text-text-muted mb-1">Avg LTV</div>
            <div className="text-2xl font-bold text-text-primary">${segment.avgLTV.toLocaleString()}</div>
          </div>
          <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg">
            <div className="text-sm text-text-muted mb-1">Churn Rate</div>
            <div className="text-2xl font-bold text-text-primary">{segment.churnRate}%</div>
          </div>
        </div>

        {/* Criteria */}
        <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Criteria</h2>
          <div className="space-y-2">
            {segment.criteria.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-surface-secondary/30 rounded-xl border border-border-primary/30">
                <div className="font-medium text-text-primary">{c.label}</div>
                <div className="text-sm text-text-muted">{c.field} · {c.operator} · {c.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};