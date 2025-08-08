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
        <div className="bg-surface-primary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-surface-secondary rounded w-1/4"></div>
            <div className="h-10 bg-surface-secondary rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-surface-secondary/30 backdrop-blur-lg p-6 rounded-xl border border-border-primary/50 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-border-primary rounded w-3/4"></div>
                <div className="h-3 bg-border-primary rounded w-1/2"></div>
                <div className="h-20 bg-border-primary rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface-primary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg">
        <div className="text-center py-8">
          <div className="text-error mb-2">Failed to load segments</div>
          <div className="text-text-muted text-sm">Please try refreshing the page</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-surface-primary/50 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Search segments by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-secondary/50 border border-border-primary/50 rounded-lg px-4 py-3 pl-10 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 transition-all"
            />
            <svg className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All Types' },
              { key: 'behavioral', label: 'Behavioral' },
              { key: 'demographic', label: 'Demographic' },
              { key: 'ai-generated', label: 'AI Generated' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFilterType(filter.key as 'all' | 'behavioral' | 'demographic' | 'ai-generated')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                  filterType === filter.key
                    ? 'bg-gradient-to-r from-accent-primary/30 to-accent-secondary/30 text-accent-primary border border-accent-primary/30'
                    : 'bg-surface-secondary/50 text-text-secondary hover:bg-surface-secondary/60 border border-border-primary/50'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as 'name' | 'customers' | 'churn' | 'ltv')}
            className="bg-surface-secondary/50 border border-border-primary/50 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 transition-all"
          >
            <option value="churn">Sort by Churn Rate</option>
            <option value="customers">Sort by Customer Count</option>
            <option value="ltv">Sort by LTV</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSegments.map((segment) => {
          const churnRisk = getChurnRiskLevel(segment.churnRate);
          const isSelected = selectedSegment === segment.id;
          
          return (
            <div
              key={segment.id}
              onClick={() => onSelectSegment(isSelected ? null : segment.id)}
              className={`group relative bg-surface-secondary/30 backdrop-blur-lg p-6 rounded-xl border transition-all duration-300 hover:shadow-lg cursor-pointer ${
                isSelected 
                  ? 'border-accent-primary/50 bg-accent-primary/10 shadow-lg shadow-accent-primary/25' 
                  : 'border-border-primary/50 hover:border-border-primary/60'
              }`}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className="w-3 h-3 bg-accent-primary rounded-full animate-pulse"></div>
                </div>
              )}

              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full shadow-lg"
                    style={{ backgroundColor: segment.color }}
                  />
                  <div>
                    <h3 className={`text-lg font-semibold transition-colors ${
                      isSelected ? 'text-accent-primary' : 'text-text-primary group-hover:text-accent-primary'
                    }`}>
                      {segment.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(segment.type)}`}>
                      {segment.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-text-secondary text-sm mb-4 leading-relaxed">
                {segment.description}
              </p>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-2xl font-bold text-text-primary">{segment.customerCount.toLocaleString()}</div>
                  <div className="text-xs text-text-muted">Customers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-success">${segment.avgLTV}</div>
                  <div className="text-xs text-text-muted">Avg LTV</div>
                </div>
              </div>

              {/* Churn Risk */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-text-muted text-sm">Churn Rate</span>
                <div className="flex items-center gap-2">
                  <span className="text-text-primary font-semibold">{segment.churnRate}%</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${churnRisk.color}`}>
                    {churnRisk.label}
                  </span>
                </div>
              </div>

              {/* Progress bar for churn rate */}
              <div className="mb-4">
                <div className="w-full bg-surface-secondary/50 rounded-full h-2">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      segment.churnRate >= 40 ? 'bg-error' :
                      segment.churnRate >= 20 ? 'bg-warning' :
                      segment.churnRate >= 10 ? 'bg-warning-muted' : 'bg-success'
                    }`}
                    style={{ width: `${Math.min(segment.churnRate, 100)}%` }}
                  />
                </div>
              </div>

              {/* Criteria Preview */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-text-secondary">Criteria:</h4>
                <div className="flex flex-wrap gap-1">
                  {segment.criteria.slice(0, 2).map((criteria, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-surface-secondary/50 text-text-secondary rounded-md text-xs border border-border-primary/50"
                    >
                      {criteria.label}
                    </span>
                  ))}
                  {segment.criteria.length > 2 && (
                    <span className="px-2 py-1 bg-surface-secondary/50 text-text-muted rounded-md text-xs border border-border-primary/50">
                      +{segment.criteria.length - 2} more
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-border-primary/50">
                <Link
                  to={`/app/campaigns/create?segmentId=${segment.id}`}
                  className="flex-1 px-3 py-2 bg-accent-primary/20 text-accent-primary rounded-lg hover:bg-accent-primary/30 transition-colors text-sm border border-accent-primary/30 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  Launch Campaign
                </Link>
                <button className="px-3 py-2 bg-surface-secondary/50 text-text-secondary rounded-lg hover:bg-surface-secondary/70 transition-colors text-sm border border-border-primary/50">
                  Edit
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSegment(segment.id, segment.name);
                  }}
                  className="px-3 py-2 bg-error/20 text-error rounded-lg hover:bg-error/30 transition-colors text-sm border border-error/30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSegments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-text-muted mb-2">No segments found</div>
          <div className="text-sm text-text-muted">Try adjusting your search or filter criteria</div>
        </div>
      )}

      {/* Selected Segment Details */}
      {selectedSegment && (
        <div className="bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 backdrop-blur-lg p-6 rounded-2xl border border-accent-primary/30 shadow-xl">
          {(() => {
            const segment = segments.find(s => s.id === selectedSegment);
            if (!segment) return null;
            
            return (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-text-primary mb-2">{segment.name}</h3>
                    <p className="text-accent-primary">{segment.description}</p>
                  </div>
                  <button 
                    onClick={() => onSelectSegment(null)}
                    className="p-2 text-text-muted hover:text-text-primary transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="bg-surface-primary/50 p-4 rounded-xl border border-border-primary/50">
                    <div className="text-2xl font-bold text-text-primary">{segment.customerCount.toLocaleString()}</div>
                    <div className="text-sm text-text-muted">Total Customers</div>
                  </div>
                  <div className="bg-surface-primary/50 p-4 rounded-xl border border-border-primary/50">
                    <div className="text-2xl font-bold text-error">{segment.churnRate}%</div>
                    <div className="text-sm text-text-muted">Churn Rate</div>
                  </div>
                  <div className="bg-surface-primary/50 p-4 rounded-xl border border-border-primary/50">
                    <div className="text-2xl font-bold text-success">${segment.avgLTV}</div>
                    <div className="text-sm text-text-muted">Average LTV</div>
                  </div>
                  <div className="bg-surface-primary/50 p-4 rounded-xl border border-border-primary/50">
                    <div className="text-2xl font-bold text-accent-primary">${segment.avgRevenue.toLocaleString()}</div>
                    <div className="text-sm text-text-muted">Avg Revenue</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-text-primary">Segment Criteria</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {segment.criteria.map((criteria, index) => (
                      <div key={index} className="bg-surface-primary/50 p-3 rounded-lg border border-border-primary/50">
                        <span className="text-accent-primary font-medium">{criteria.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Link
                    to={`/app/campaigns/create?segmentId=${segment.id}`}
                    className="px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-text-primary rounded-lg hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-semibold"
                  >
                    Create Recovery Campaign
                  </Link>
                  <button className="px-6 py-3 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-secondary/60 transition-colors font-medium border border-border-primary/50">
                    Export Segment Data
                  </button>
                  <button className="px-6 py-3 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-secondary/60 transition-colors font-medium border border-border-primary/50">
                    Edit Segment
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

    </div>
  );
};