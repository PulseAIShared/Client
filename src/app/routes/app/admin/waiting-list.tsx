// src/app/routes/app/admin/waiting-list.tsx
import React, { useState, useMemo } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { AppPageHeader, ContentLayout } from '@/components/layouts';
import { 
  useGetWaitingListEntries, 
  WaitingListEntryResponse, 
  WaitingListQueryParams 
} from '@/features/waitlist/api/waitlist';
import { useDebounce } from '@/hooks/useDebounce';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-warning/20 text-warning border border-warning/30';
    case 'approved':
      return 'bg-success/20 text-success border border-success/30';
    case 'rejected':
      return 'bg-error/20 text-error border border-error/30';
    default:
      return 'bg-surface-secondary text-text-muted border border-border-primary';
  }
};

const WaitingListMobileCard: React.FC<{ entry: WaitingListEntryResponse }> = ({ entry }) => (
  <div className="bg-surface-secondary border border-border-primary rounded-lg p-4 hover:border-accent-primary/50 transition-all duration-200">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1 min-w-0">
        <h3 className="text-text-primary font-medium truncate">
          {entry.firstName || entry.lastName ? `${entry.firstName || ''} ${entry.lastName || ''}`.trim() : 'No Name'}
        </h3>
        <p className="text-text-muted text-sm truncate">{entry.email}</p>
        {entry.companyName && (
          <p className="text-text-secondary text-sm truncate">{entry.companyName}</p>
        )}
      </div>
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 text-sm">
      <div>
        <span className="text-text-muted">Source:</span>
        <p className="text-text-primary font-medium">{entry.source || 'Unknown'}</p>
      </div>
      <div>
        <span className="text-text-muted">Created:</span>
        <p className="text-text-primary font-medium">{formatDate(entry.requestedAt)}</p>
      </div>
    </div>
  </div>
);

export const WaitingListAdminRoute = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [queryParams, setQueryParams] = useState<WaitingListQueryParams>({
    page: 1,
    pageSize: 50,
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  React.useEffect(() => {
    setQueryParams(prev => ({
      ...prev,
      search: debouncedSearchTerm || undefined,
      page: 1,
    }));
  }, [debouncedSearchTerm]);

  const { data, isLoading, error } = useGetWaitingListEntries(queryParams);
  const entries = useMemo(() => data?.items || [], [data]);
  const pagination = data?.pagination;

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    
    const newParams: WaitingListQueryParams = {
      ...queryParams,
      page: 1,
      status: filter === 'all' ? undefined : filter as 'pending' | 'approved' | 'rejected',
    };

    setQueryParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    setQueryParams(prev => ({ ...prev, page: newPage }));
  };

  const filterCounts = useMemo(() => ({
    all: pagination?.totalCount || 0,
    pending: entries.filter(e => e.status === 'pending').length,
    approved: entries.filter(e => e.status === 'approved').length,
    rejected: entries.filter(e => e.status === 'rejected').length,
  }), [entries, pagination?.totalCount]);

  return (
    <ContentLayout>
      <div className="space-y-6">
        <AppPageHeader
          title="Waiting List Management"
          description="Admin panel. Monitor and manage users on the waiting list."
        />

        {/* Filters and Search */}
        {isLoading ? (
          <div className="space-y-6">
            <div className="bg-surface-primary backdrop-blur-lg p-6 rounded-2xl border border-border-primary shadow-lg animate-pulse">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 h-12 bg-surface-secondary rounded"></div>
                <div className="flex gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-10 w-24 bg-surface-secondary rounded"></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-surface-primary backdrop-blur-lg rounded-2xl border border-border-primary shadow-lg animate-pulse">
              <div className="p-6 border-b border-border-primary">
                <div className="h-6 bg-surface-secondary rounded w-48"></div>
              </div>
              <div className="p-6">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="h-16 bg-surface-secondary rounded mb-2"></div>
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-surface-primary backdrop-blur-lg rounded-2xl border border-border-primary shadow-lg">
            <div className="p-12 text-center">
              <div className="text-error mb-2">Failed to load waiting list</div>
              <div className="text-sm text-text-muted">Please try refreshing the page</div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-surface-primary backdrop-blur-lg p-6 rounded-2xl border border-border-primary shadow-lg">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-surface-secondary border border-border-primary rounded-lg px-4 py-3 pl-10 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 transition-all"
                  />
                  <svg className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { key: 'all', label: 'All', count: filterCounts.all },
                    { key: 'pending', label: 'Pending', count: filterCounts.pending },
                    { key: 'approved', label: 'Approved', count: filterCounts.approved },
                    { key: 'rejected', label: 'Rejected', count: filterCounts.rejected }
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => handleFilterChange(filter.key)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                        selectedFilter === filter.key
                          ? 'bg-gradient-to-r from-accent-primary/30 to-accent-secondary/30 text-accent-primary border border-accent-primary/30'
                          : 'bg-surface-secondary text-text-secondary hover:bg-surface-secondary/80 border border-border-primary'
                      }`}
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            {isMobile ? (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <WaitingListMobileCard key={entry.id} entry={entry} />
                ))}
              </div>
            ) : (
              <div className="bg-surface-primary backdrop-blur-lg rounded-2xl border border-border-primary shadow-lg overflow-hidden">
                <div className="p-6 border-b border-border-primary">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-text-primary">
                      Waiting List Entries ({pagination?.totalCount || 0})
                    </h2>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface-secondary/30">
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold text-text-secondary">Name</th>
                        <th className="text-left py-4 px-6 font-semibold text-text-secondary">Email</th>
                        <th className="text-left py-4 px-6 font-semibold text-text-secondary">Company</th>
                        <th className="text-left py-4 px-6 font-semibold text-text-secondary">Source</th>
                        <th className="text-left py-4 px-6 font-semibold text-text-secondary">Status</th>
                        <th className="text-left py-4 px-6 font-semibold text-text-secondary">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => (
                        <tr 
                          key={entry.id} 
                          className="border-t border-border-primary hover:bg-surface-secondary/20 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full flex items-center justify-center text-text-primary font-semibold text-xs">
                                {entry.firstName ? entry.firstName[0] : entry.email[0].toUpperCase()}
                              </div>
                              <div className="font-medium text-text-primary">
                                {entry.firstName || entry.lastName ? `${entry.firstName || ''} ${entry.lastName || ''}`.trim() : 'No Name'}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-text-primary">{entry.email}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-text-secondary">{entry.companyName || '-'}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-text-secondary">{entry.source || 'Unknown'}</div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                              {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-text-secondary text-sm">{formatDate(entry.requestedAt)}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="p-6 border-t border-border-primary flex items-center justify-between">
                    <div className="text-sm text-text-muted">
                      Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total entries)
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPreviousPage}
                        className="px-3 py-1 bg-surface-secondary text-text-primary rounded hover:bg-surface-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNextPage}
                        className="px-3 py-1 bg-surface-secondary text-text-primary rounded hover:bg-surface-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </ContentLayout>
  );
};
