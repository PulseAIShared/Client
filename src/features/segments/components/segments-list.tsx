// src/features/segments/components/segments-list.tsx
import React, { useState } from 'react';

// Mock data for segments
const mockSegments = [
  {
    id: '1',
    name: 'High-Value Enterprise',
    description: 'Enterprise customers with high LTV and low churn risk',
    customerCount: 1240,
    churnRate: 3.2,
    avgLTV: 850,
    avgRevenue: 12500,
    type: 'behavioral' as const,
    status: 'active' as const,
    color: '#8b5cf6',
    createdAt: '2024-03-15',
    criteria: [
      { field: 'plan_type', operator: 'equals' as const, value: 'Enterprise', label: 'Plan Type = Enterprise' },
      { field: 'ltv', operator: 'greater_than' as const, value: 500, label: 'LTV > $500' },
      { field: 'churn_risk', operator: 'less_than' as const, value: 20, label: 'Churn Risk < 20%' }
    ]
  },
  {
    id: '2',
    name: 'Trial Power Users',
    description: 'Trial users with high engagement and feature adoption',
    customerCount: 890,
    churnRate: 12.5,
    avgLTV: 245,
    avgRevenue: 890,
    type: 'behavioral' as const,
    status: 'active' as const,
    color: '#06b6d4',
    createdAt: '2024-03-20',
    criteria: [
      { field: 'plan_type', operator: 'equals' as const, value: 'Trial', label: 'Plan Type = Trial' },
      { field: 'feature_usage', operator: 'greater_than' as const, value: 80, label: 'Feature Usage > 80%' },
      { field: 'login_frequency', operator: 'greater_than' as const, value: 10, label: 'Logins > 10/week' }
    ]
  },
  {
    id: '3',
    name: 'Payment Failed Recovery',
    description: 'Customers with recent payment failures requiring intervention',
    customerCount: 567,
    churnRate: 67.8,
    avgLTV: 156,
    avgRevenue: 2340,
    type: 'behavioral' as const,
    status: 'active' as const,
    color: '#ef4444',
    createdAt: '2024-04-01',
    criteria: [
      { field: 'payment_status', operator: 'equals' as const, value: 'failed', label: 'Payment Status = Failed' },
      { field: 'days_since_failure', operator: 'less_than' as const, value: 7, label: 'Failure < 7 days ago' }
    ]
  },
  {
    id: '4',
    name: 'Young Professionals (25-34)',
    description: 'Demographic segment of working professionals aged 25-34',
    customerCount: 2890,
    churnRate: 18.4,
    avgLTV: 185,
    avgRevenue: 3450,
    type: 'demographic' as const,
    status: 'active' as const,
    color: '#10b981',
    createdAt: '2024-02-28',
    criteria: [
      { field: 'age', operator: 'greater_than' as const, value: 24, label: 'Age > 24' },
      { field: 'age', operator: 'less_than' as const, value: 35, label: 'Age < 35' },
      { field: 'employment_status', operator: 'equals' as const, value: 'employed', label: 'Employment = Employed' }
    ]
  },
  {
    id: '5',
    name: 'Feature Champions',
    description: 'Users who actively use advanced features and provide feedback',
    customerCount: 1890,
    churnRate: 8.9,
    avgLTV: 420,
    avgRevenue: 5670,
    type: 'behavioral' as const,
    status: 'active' as const,
    color: '#f59e0b',
    createdAt: '2024-03-10',
    criteria: [
      { field: 'advanced_features_used', operator: 'greater_than' as const, value: 5, label: 'Advanced Features > 5' },
      { field: 'feedback_submissions', operator: 'greater_than' as const, value: 2, label: 'Feedback > 2' },
      { field: 'support_tickets', operator: 'less_than' as const, value: 3, label: 'Support Tickets < 3' }
    ]
  },
  {
    id: '6',
    name: 'At-Risk SMB',
    description: 'Small business customers showing signs of disengagement',
    customerCount: 756,
    churnRate: 45.2,
    avgLTV: 89,
    avgRevenue: 1250,
    type: 'ai-generated' as const,
    status: 'active' as const,
    color: '#f97316',
    createdAt: '2024-04-05',
    criteria: [
      { field: 'plan_type', operator: 'equals' as const, value: 'Basic', label: 'Plan Type = Basic' },
      { field: 'login_frequency', operator: 'less_than' as const, value: 2, label: 'Logins < 2/week' },
      { field: 'feature_usage', operator: 'less_than' as const, value: 30, label: 'Feature Usage < 30%' }
    ]
  }
];

interface SegmentsListProps {
  onSelectSegment: (segmentId: string | null) => void;
  selectedSegment: string | null;
}

export const SegmentsList: React.FC<SegmentsListProps> = ({ onSelectSegment, selectedSegment }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'behavioral' | 'demographic' | 'ai-generated'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'customers' | 'churn' | 'ltv'>('churn');

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'behavioral': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'demographic': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'geographic': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'ai-generated': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getChurnRiskLevel = (churnRate: number) => {
    if (churnRate >= 40) return { label: 'High Risk', color: 'text-red-400 bg-red-500/20 border-red-500/30' };
    if (churnRate >= 20) return { label: 'Medium Risk', color: 'text-orange-400 bg-orange-500/20 border-orange-500/30' };
    if (churnRate >= 10) return { label: 'Low Risk', color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30' };
    return { label: 'Minimal Risk', color: 'text-green-400 bg-green-500/20 border-green-500/30' };
  };

  const filteredSegments = mockSegments
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

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Search segments by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 pl-10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
            <svg className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-400 border border-blue-500/30'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50'
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
            className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
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
              className={`group relative bg-slate-700/30 backdrop-blur-lg p-6 rounded-xl border transition-all duration-300 hover:shadow-lg cursor-pointer ${
                isSelected 
                  ? 'border-blue-500/50 bg-blue-600/10 shadow-lg shadow-blue-500/25' 
                  : 'border-slate-600/50 hover:border-slate-500/50'
              }`}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
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
                      isSelected ? 'text-blue-400' : 'text-white group-hover:text-blue-400'
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
              <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                {segment.description}
              </p>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-2xl font-bold text-white">{segment.customerCount.toLocaleString()}</div>
                  <div className="text-xs text-slate-400">Customers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">${segment.avgLTV}</div>
                  <div className="text-xs text-slate-400">Avg LTV</div>
                </div>
              </div>

              {/* Churn Risk */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm">Churn Rate</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{segment.churnRate}%</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${churnRisk.color}`}>
                    {churnRisk.label}
                  </span>
                </div>
              </div>

              {/* Progress bar for churn rate */}
              <div className="mb-4">
                <div className="w-full bg-slate-600/50 rounded-full h-2">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      segment.churnRate >= 40 ? 'bg-red-500' :
                      segment.churnRate >= 20 ? 'bg-orange-500' :
                      segment.churnRate >= 10 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(segment.churnRate, 100)}%` }}
                  />
                </div>
              </div>

              {/* Criteria Preview */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-300">Criteria:</h4>
                <div className="flex flex-wrap gap-1">
                  {segment.criteria.slice(0, 2).map((criteria, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-slate-600/50 text-slate-300 rounded-md text-xs border border-slate-600/50"
                    >
                      {criteria.label}
                    </span>
                  ))}
                  {segment.criteria.length > 2 && (
                    <span className="px-2 py-1 bg-slate-600/50 text-slate-400 rounded-md text-xs border border-slate-600/50">
                      +{segment.criteria.length - 2} more
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-600/50">
                <button className="flex-1 px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm border border-blue-500/30">
                  Launch Campaign
                </button>
                <button className="px-3 py-2 bg-slate-600/50 text-slate-300 rounded-lg hover:bg-slate-600/70 transition-colors text-sm border border-slate-600/50">
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSegments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-2">No segments found</div>
          <div className="text-sm text-slate-500">Try adjusting your search or filter criteria</div>
        </div>
      )}

      {/* Selected Segment Details */}
      {selectedSegment && (
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg p-6 rounded-2xl border border-blue-500/30 shadow-xl">
          {(() => {
            const segment = mockSegments.find(s => s.id === selectedSegment);
            if (!segment) return null;
            
            return (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{segment.name}</h3>
                    <p className="text-blue-200">{segment.description}</p>
                  </div>
                  <button 
                    onClick={() => onSelectSegment(null)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="text-2xl font-bold text-white">{segment.customerCount.toLocaleString()}</div>
                    <div className="text-sm text-slate-400">Total Customers</div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="text-2xl font-bold text-red-400">{segment.churnRate}%</div>
                    <div className="text-sm text-slate-400">Churn Rate</div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="text-2xl font-bold text-green-400">${segment.avgLTV}</div>
                    <div className="text-sm text-slate-400">Average LTV</div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="text-2xl font-bold text-blue-400">${segment.avgRevenue.toLocaleString()}</div>
                    <div className="text-sm text-slate-400">Avg Revenue</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Segment Criteria</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {segment.criteria.map((criteria, index) => (
                      <div key={index} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                        <span className="text-blue-400 font-medium">{criteria.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5 transition-all duration-200 font-semibold">
                    Create Recovery Campaign
                  </button>
                  <button className="px-6 py-3 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 transition-colors font-medium border border-slate-600/50">
                    Export Segment Data
                  </button>
                  <button className="px-6 py-3 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 transition-colors font-medium border border-slate-600/50">
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