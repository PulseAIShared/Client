import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppPageHeader, ContentLayout } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/form';
import { useGetPlaybooks } from '@/features/playbooks/api/playbooks';
import { PlaybookCategoryBadge, PlaybookStatusBadge, PlaybookRowActions } from '@/features/playbooks/components';
import { enumLabelMap, formatRelativeDate, getPriorityColor, getPriorityLabel, getSignalDisplayName } from '@/features/playbooks/utils';
import { formatDate } from '@/utils/customer-helpers';

export const PlaybooksRoute = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: '',
    sort: 'priority:asc',
    includeArchived: false,
  });

  const [sortBy, sortDir] = useMemo(() => {
    const [col, dir] = (filters.sort || 'priority:asc').split(':');
    return [col as string, ((dir as 'asc' | 'desc') || 'asc')];
  }, [filters.sort]);

  const { data: playbooks, isLoading: playbooksLoading, error: playbooksError } = useGetPlaybooks({
    status: filters.status || undefined,
    category: filters.category || undefined,
    sortBy,
    sortDirection: sortDir,
    includeArchived: filters.includeArchived || filters.status === 'Archived',
  });

  const filteredPlaybooks = useMemo(() => {
    if (!playbooks) return [];
    let items = playbooks;
    const viewingArchivedOnly = filters.status === 'Archived';
    if (!filters.includeArchived && !viewingArchivedOnly) {
      items = items.filter((p) => String(p.status) !== 'Archived');
    }
    if (!filters.search.trim()) return items;
    const term = filters.search.toLowerCase();
    return items.filter((playbook) => playbook.name.toLowerCase().includes(term));
  }, [filters.search, filters.includeArchived, filters.status, playbooks]);

  const setSort = (sort: string) => setFilters({ ...filters, sort });
  const toggleHeaderSort = (col: string) => {
    const [curCol, curDir] = (filters.sort || '').split(':');
    if (curCol === col) setSort(`${col}:${curDir === 'asc' ? 'desc' : 'asc'}`);
    else setSort(`${col}:${col === 'name' ? 'asc' : col === 'priority' ? 'asc' : 'desc'}`);
  };

  return (
    <ContentLayout>
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        <AppPageHeader
          title="Playbooks"
          description="Automations built on signals and actions."
          actions={(
            <>
              <Link to="/app/work-queue">
                <Button variant="outline">Work Queue</Button>
              </Link>
              <Link to="/app/playbooks/create">
                <Button variant="default">Create playbook</Button>
              </Link>
            </>
          )}
        />

        <div className="bg-surface-primary/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Search</label>
                  <input
                    value={filters.search}
                    onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                    placeholder="Search playbooks"
                    className="w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(event) => setFilters({ ...filters, status: event.target.value })}
                    className="w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200"
                  >
                    <option value="">All statuses</option>
                    {enumLabelMap.status.map((label) => (
                      <option key={label} value={label}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(event) => setFilters({ ...filters, category: event.target.value })}
                    className="w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200"
                  >
                    <option value="">All categories</option>
                    {enumLabelMap.category.map((label) => (
                      <option key={label} value={label}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="block text-sm font-medium text-text-secondary mb-2">Archived</label>
                  <div className="h-[50px] px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl flex items-center">
                    <label htmlFor="include-archived-toggle" className="inline-flex items-center gap-3 text-sm text-text-secondary cursor-pointer">
                      <Switch
                        id="include-archived-toggle"
                        checked={!!filters.includeArchived}
                        onCheckedChange={(v) => setFilters({ ...filters, includeArchived: !!v })}
                      />
                      <span>Include archived</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Sort by (client-side for now) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-text-secondary mb-2">Sort by</label>
                  <select
                    value={filters.sort}
                    onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-secondary/50 border border-border-primary/30 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200"
                  >
                    <option value="priority:asc">Priority (high -&gt; low)</option>
                    <option value="priority:desc">Priority (low -&gt; high)</option>
                    <option value="activeRuns:desc">Most active runs</option>
                    <option value="createdAt:desc">Newest first</option>
                    <option value="createdAt:asc">Oldest first</option>
                    <option value="name:asc">Name (A-Z)</option>
                  </select>
                </div>
              </div>

              {playbooksLoading && (
                <div className="text-text-muted">Loading playbooks...</div>
              )}
              {playbooksError && (
                <div className="text-error">Failed to load playbooks.</div>
              )}

              {(playbooks?.length ?? 0) > 0 && filteredPlaybooks.length === 0 && (
                <div className="bg-surface-secondary/40 border border-border-primary/30 rounded-2xl p-8 text-center">
                  <p className="text-text-primary font-semibold mb-2">No playbooks match your filters</p>
                  <p className="text-text-muted mb-4">Try adjusting your search or filter criteria.</p>
                  <Button onClick={() => setFilters({ status: '', category: '', search: '', sort: 'priority:asc', includeArchived: false })}>
                    Clear filters
                  </Button>
                </div>
              )}

              {/* Desktop table */}
              {filteredPlaybooks.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-border-primary/30">
                  <table className="min-w-full divide-y divide-border-primary/30 hidden md:table">
                    <thead className="bg-surface-secondary/40">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary cursor-pointer" onClick={() => toggleHeaderSort('name')}>Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary cursor-pointer" onClick={() => toggleHeaderSort('priority')}>Priority</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary cursor-pointer" onClick={() => toggleHeaderSort('activeRuns')}>Active Runs</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary cursor-pointer" onClick={() => toggleHeaderSort('totalRuns')}>Total Runs</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary cursor-pointer" onClick={() => toggleHeaderSort('createdAt')}>Created</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-primary/20">
                      {filteredPlaybooks.map((p) => {
                        const isDraft = String(p.status) === 'Draft';
                        return (
                          <tr key={p.id} onClick={() => navigate(`/app/playbooks/${p.id}`)} className={`hover:bg-surface-secondary/40 transition-colors cursor-pointer ${isDraft ? 'opacity-80' : ''}`}>
                            <td className="px-4 py-3 align-middle">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-text-primary">{p.name}</span>
                                {p.signalType && (
                                  <span className="text-xs text-text-muted">Triggered by: {getSignalDisplayName(p.signalType)}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 align-middle">
                              <PlaybookCategoryBadge category={p.category} />
                            </td>
                            <td className="px-4 py-3 align-middle">
                              <PlaybookStatusBadge status={p.status} />
                            </td>
                            <td className="px-4 py-3 align-middle">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(p.priority || 100)}`} title={`Priority ${p.priority}`}>
                                {getPriorityLabel(p.priority || 100)} ({p.priority})
                              </span>
                            </td>
                            <td className="px-4 py-3 align-middle">
                              {p.activeRunCount > 0 ? (
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${(p.activeRunCount || 0) >= 6 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-green-700 bg-green-50 border-green-200'}`}>
                                  {p.activeRunCount} running
                                </span>
                              ) : (
                                <span className="text-text-muted">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 align-middle">
                              {p.totalRunCount > 0 ? (
                                <span className="text-text-secondary text-sm">{p.totalRunCount}</span>
                              ) : (
                                <span className="text-text-muted text-sm">No runs yet</span>
                              )}
                            </td>
                            <td className="px-4 py-3 align-middle">
                              <span className="text-sm text-text-secondary" title={formatDate(p.createdAt)}>
                                {formatRelativeDate(p.createdAt)}
                              </span>
                            </td>
                            <td className="px-4 py-3 align-middle">
                              <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                                <PlaybookRowActions id={p.id} status={p.status} />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Mobile condensed list */}
              {filteredPlaybooks.length > 0 && (
                <div className="md:hidden grid grid-cols-1 gap-3">
                  {filteredPlaybooks.map((p) => {
                    const isDraft = String(p.status) === 'Draft';
                    return (
                      <div
                        key={p.id}
                        onClick={() => navigate(`/app/playbooks/${p.id}`)}
                        className={`rounded-xl border border-border-primary/30 bg-surface-primary p-4 shadow-sm hover:bg-surface-secondary/40 cursor-pointer ${
                          isDraft ? 'opacity-80' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-text-primary">{p.name}</div>
                            {p.signalType && (
                              <div className="truncate text-xs text-text-muted">Triggered by: {getSignalDisplayName(p.signalType)}</div>
                            )}
                          </div>
                          <PlaybookStatusBadge status={p.status} />
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold border ${getPriorityColor(
                              p.priority || 100,
                            )}`}
                            title={`Priority ${p.priority}`}
                          >
                            {getPriorityLabel(p.priority || 100)} ({p.priority})
                          </span>
                          {p.activeRunCount > 0 && (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold border ${
                                (p.activeRunCount || 0) >= 6
                                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                                  : 'text-green-700 bg-green-50 border-green-200'
                              }`}
                            >
                              {p.activeRunCount} running
                            </span>
                          )}
                          {p.totalRunCount > 0 ? (
                            <span className="text-text-secondary">{p.totalRunCount} total</span>
                          ) : (
                            <span className="text-text-muted">No runs yet</span>
                          )}
                          <span className="text-text-secondary" title={formatDate(p.createdAt)}>
                            {formatRelativeDate(p.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {!playbooksLoading && (playbooks?.length ?? 0) === 0 && (
                <div className="bg-surface-secondary/40 border border-border-primary/30 rounded-2xl p-8 text-center">
                  <p className="text-text-primary font-semibold mb-2">No playbooks yet</p>
                  <p className="text-text-muted mb-4">
                    Playbooks automate actions based on customer signals. Create your first playbook to start automating.
                  </p>
                  <Link to="/app/playbooks/create">
                    <Button>Create playbook</Button>
                  </Link>
                </div>
              )}

              {false && (
              <div className="grid grid-cols-1 gap-4">
                {filteredPlaybooks.map((playbook) => (
                  <div
                    key={playbook.id}
                    className="bg-surface-primary/90 border border-border-primary/30 rounded-2xl p-6 shadow-sm flex flex-col gap-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary">{playbook.name}</h3>
                        <p className="text-sm text-text-muted">
                          Priority {playbook.priority} - {playbook.activeRunCount} active runs - {playbook.totalRunCount} total runs
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <PlaybookCategoryBadge category={playbook.category} />
                        <PlaybookStatusBadge status={playbook.status} />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-text-muted">
                      <div>Created {formatDate(playbook.createdAt)}</div>
                      <Link
                        to={`/app/playbooks/${playbook.id}`}
                        className="text-accent-primary hover:underline font-medium"
                      >
                        View details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};

