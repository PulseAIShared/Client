// src/features/segments/components/segments-list.tsx
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGetSegments } from '@/features/segments/api/segments';
import { useModal } from '@/app/modal-provider';
import { DeleteSegmentModal } from './delete-segment-modal';

interface SegmentsListProps {
  onSelectSegment: (segmentId: string | null) => void;
  selectedSegment: string | null;
}

export const SegmentsList: React.FC<SegmentsListProps> = ({ 
  onSelectSegment, 
  selectedSegment 
}) => {
  const { data: segments = [], isLoading, error } = useGetSegments();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'behavioral' | 'demographic' | 'ai-generated'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'customers' | 'churn' | 'ltv'>('churn');
  const { openModal, closeModal } = useModal();

  const handleDeleteSegment = (segmentId: string, segmentName: string) => {
    openModal(
      <DeleteSegmentModal
        segmentId={segmentId}
        segmentName={segmentName}
        onClose={closeModal}
      />
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'behavioral': return 'bg-info/20 text-info border-info/30';
      case 'demographic': return 'bg-success/20 text-success border-success/30';
      case 'geographic': return 'bg-accent-secondary/20 text-accent-secondary border-accent-secondary/30';
      case 'ai-generated': return 'bg-warning/20 text-warning border-warning/30';
      default: return 'bg-surface-secondary/20 text-text-muted border-border-primary/30';
    }
  };

  const getChurnRiskLevel = (churnRate: number) => {
    if (churnRate >= 40) return { label: 'High Risk', color: 'text-error bg-error/20 border-error/30' };
    if (churnRate >= 20) return { label: 'Medium Risk', color: 'text-warning bg-warning/20 border-warning/30' };
    if (churnRate >= 10) return { label: 'Low Risk', color: 'text-warning-muted bg-warning-muted/20 border-warning-muted/30' };
    return { label: 'Minimal Risk', color: 'text-success bg-success/20 border-success/30' };
  };

  const filteredSegments = useMemo(() => {
    return segments
      .filter(segment => {
        const matchesSearch = segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             segment.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || segment.type === filterType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name': return a.name.localeCompare(b.name);
          case 'customers': return b.customerCount - a.customerCount;
          case 'churn': return b.churnRate - a.churnRate;
          case 'ltv': return b.avgLTV - a.avgLTV;
          default: return 0;
        }
      });
  }, [segments, searchTerm, filterType, sortBy]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-surface-secondary/50 rounded-xl w-1/4"></div>
            <div className="h-10 bg-surface-secondary/50 rounded-xl"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 animate-pulse shadow-lg">
              <div className="space-y-3">
                <div className="h-4 bg-surface-secondary/50 rounded-xl w-3/4"></div>
                <div className="h-3 bg-surface-secondary/50 rounded-xl w-1/2"></div>
                <div className="h-20 bg-surface-secondary/50 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-error/20 to-error-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="text-error-muted font-medium mb-2">Failed to load segments</div>
          <div className="text-sm text-text-muted mb-4">Please try refreshing the page</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error-muted transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Search and Filters */}
      <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Search segments by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-secondary/50 border border-border-primary/30 rounded-xl px-4 py-3 pl-10 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200"
            />
            <svg className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'All Types' },
              { key: 'behavioral', label: 'Behavioral' },
              { key: 'demographic', label: 'Demographic' },
              { key: 'ai-generated', label: 'AI Generated' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFilterType(filter.key as any)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                  filterType === filter.key
                    ? 'bg-gradient-to-r from-accent-primary/30 to-accent-secondary/30 text-accent-primary border border-accent-primary/30'
                    : 'bg-surface-secondary/50 text-text-secondary hover:bg-surface-secondary/80 border border-border-primary/30'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Segments Grid */}
      {filteredSegments.length === 0 ? (
        <div className="bg-surface-primary/80 backdrop-blur-lg rounded-2xl border border-border-primary/30 p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-gradient-to-br from-surface-secondary/50 to-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">No segments found</h3>
          <p className="text-text-muted">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSegments.map((segment) => (
            <div
              key={segment.id}
              className={`group bg-surface-primary/80 backdrop-blur-lg border rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
                selectedSegment === segment.id
                  ? 'border-accent-primary/50 shadow-accent-primary/25'
                  : 'border-border-primary/30 hover:border-accent-primary/30'
              }`}
              onClick={() => onSelectSegment(segment.id)}
            >
              {/* Enhanced Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent-primary transition-colors truncate">
                    {segment.name}
                  </h3>
                  <p className="text-sm text-text-muted mt-1 line-clamp-2">
                    {segment.description}
                  </p>
                </div>
                <div className="ml-3 flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(segment.type)}`}>
                    {segment.type}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSegment(segment.id, segment.name);
                    }}
                    className="p-1 text-error hover:bg-error/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete segment"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-primary">{segment.customerCount.toLocaleString()}</div>
                  <div className="text-xs text-text-muted">Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-text-primary">${segment.avgLTV.toLocaleString()}</div>
                  <div className="text-xs text-text-muted">Avg LTV</div>
                </div>
              </div>

              {/* Enhanced Churn Risk */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-muted">Churn Risk</span>
                  <span className="text-sm font-medium text-text-primary">{segment.churnRate}%</span>
                </div>
                <div className="w-full bg-surface-secondary/50 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      segment.churnRate >= 40 ? 'bg-error' :
                      segment.churnRate >= 20 ? 'bg-warning' :
                      segment.churnRate >= 10 ? 'bg-warning-muted' : 'bg-success'
                    }`}
                    style={{ width: `${Math.min(segment.churnRate, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Enhanced Actions */}
              <div className="flex gap-2">
                <Link
                  to={`/app/segments/${segment.id}`}
                  className="flex-1 bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary text-center py-2 px-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Details
                </Link>
                <Link
                  to={`/app/segments/${segment.id}/edit`}
                  className="bg-surface-secondary/50 hover:bg-surface-secondary/80 text-text-primary py-2 px-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};