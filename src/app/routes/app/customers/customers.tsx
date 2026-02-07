import React, { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppPageHeader, ContentLayout } from '@/components/layouts';
import { useNotifications } from '@/components/ui/notifications';
import {
  getCustomers,
  useBulkAddToSegment,
  useBulkAddToWorkQueue,
  useBulkExportCustomers,
  useBulkTriggerPlaybook,
  useGetCustomers,
  useGetPlaybooksList,
  useGetSegmentsList,
} from '@/features/customers/api/customers';
import { DeleteCustomersModal } from '@/features/customers/components/customers-delete-modal';
import {
  BulkActionBar,
  CustomerActionsMenu,
  HealthIndicator,
  SegmentFilter,
} from '@/features/customers/components';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuthorization } from '@/lib/authorization';
import { cn } from '@/utils/cn';
import { formatRelativeActivity } from '@/utils/format-relative-time';
import { CustomerListItem, CustomersQueryParams, formatCurrency } from '@/types/api';

type FilterKey =
  | 'all'
  | 'active'
  | 'high-risk'
  | 'recently-active'
  | 'payment-issues'
  | 'cancelled';

type SortKey = 'healthStatus' | 'full_name' | 'ltv' | 'churnRiskScore' | 'lastActivity';

type SortState = {
  sortBy: SortKey;
  sortDescending: boolean;
};

const FILTER_TABS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'All Customers' },
  { key: 'active', label: 'Active' },
  { key: 'high-risk', label: 'High Risk' },
  { key: 'recently-active', label: 'Recently Active' },
  { key: 'payment-issues', label: 'Payment Issues' },
  { key: 'cancelled', label: 'Cancelled' },
];

const activitySeverityClass: Record<string, string> = {
  healthy: 'text-success',
  warning: 'text-text-secondary',
  concerning: 'text-warning',
  critical: 'text-error',
};

const getChurnColor = (score: number) => {
  if (score >= 70) return 'bg-error';
  if (score >= 50) return 'bg-orange-500';
  if (score >= 30) return 'bg-warning';
  return 'bg-success';
};

const shouldShowBillingWarning = (paymentStatusLabel?: string) => {
  const value = (paymentStatusLabel ?? '').toLowerCase();
  return value !== '' && value !== 'current' && value !== 'active';
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
};

const buildExportLabel = ({
  count,
  filter,
  segmentName,
  search,
}: {
  count: number;
  filter: FilterKey;
  segmentName?: string;
  search?: string;
}) => {
  if (search) {
    return `Export ${count} Results`;
  }

  if (segmentName && filter !== 'all') {
    return `Export ${count} ${FILTER_TABS.find((tab) => tab.key === filter)?.label ?? 'Customers'} in ${segmentName}`;
  }

  if (segmentName) {
    return `Export ${segmentName} (${count})`;
  }

  if (filter !== 'all') {
    return `Export ${count} ${FILTER_TABS.find((tab) => tab.key === filter)?.label ?? 'Customers'}`;
  }

  return `Export All ${count} Customers`;
};

const resolveFilterForApi = (filter: FilterKey): string | undefined => {
  if (filter === 'all') return undefined;
  return filter;
};

const getSortLabel = (sortBy: SortKey, active: SortState) => {
  if (active.sortBy !== sortBy) {
    return 'text-text-muted';
  }

  return active.sortDescending ? 'text-accent-primary' : 'text-accent-secondary';
};

export const CustomersRoute = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const { checkCompanyPolicy } = useAuthorization();
  const [searchParams, setSearchParams] = useSearchParams();

  const canManageCustomers = checkCompanyPolicy('customers:write');
  const canDeleteCustomers = checkCompanyPolicy('customers:delete');

  const page = Number(searchParams.get('page') ?? '1');
  const pageSize = Number(searchParams.get('pageSize') ?? '25');
  const selectedFilter = (searchParams.get('filter') as FilterKey) ?? 'all';
  const selectedSegmentId = searchParams.get('segmentId') ?? undefined;
  const searchFromUrl = searchParams.get('search') ?? '';

  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const debouncedSearch = useDebounce(searchInput, 300);

  const [sort, setSort] = useState<SortState>({
    sortBy: (searchParams.get('sortBy') as SortKey) || 'healthStatus',
    sortDescending: searchParams.get('sortDescending') !== 'false',
  });

  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set());
  const [isAllMatchingSelected, setIsAllMatchingSelected] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customersToDelete, setCustomersToDelete] = useState<CustomerListItem[]>([]);

  useEffect(() => {
    setSearchInput(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const queryParams = useMemo<CustomersQueryParams>(() => ({
    page,
    pageSize,
    segmentId: selectedSegmentId,
    filter: resolveFilterForApi(selectedFilter),
    search: debouncedSearch || undefined,
    sortBy: sort.sortBy,
    sortDescending: sort.sortDescending,
  }), [debouncedSearch, page, pageSize, selectedFilter, selectedSegmentId, sort]);

  const { data, isLoading, isFetching, error } = useGetCustomers(queryParams);
  const { data: segments = [] } = useGetSegmentsList();
  const { data: playbooks = [] } = useGetPlaybooksList();

  const customers = data?.customers ?? [];
  const summary = data?.summary;
  const pagination = data?.pagination;

  const selectedCount = selectedCustomerIds.size;

  const filterCounts = useMemo(() => ({
    all: summary?.totalCount ?? 0,
    active: summary?.activeCount ?? 0,
    'high-risk': summary?.highRiskCount ?? 0,
    'recently-active': summary?.recentActivityCount ?? 0,
    'payment-issues': summary?.paymentIssuesCount ?? 0,
    cancelled: summary?.cancelledCount ?? 0,
  }), [summary]);

  const selectedSegmentName = useMemo(
    () => segments.find((segment) => segment.id === selectedSegmentId)?.name,
    [segments, selectedSegmentId],
  );

  const exportLabel = buildExportLabel({
    count: summary?.totalCount ?? customers.length,
    filter: selectedFilter,
    segmentName: selectedSegmentName,
    search: debouncedSearch,
  });

  const bulkAddToSegmentMutation = useBulkAddToSegment();
  const bulkTriggerPlaybookMutation = useBulkTriggerPlaybook();
  const bulkAddToWorkQueueMutation = useBulkAddToWorkQueue();
  const bulkExportCustomersMutation = useBulkExportCustomers();

  const setParam = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    if (key !== 'page') {
      params.set('page', '1');
    }

    setSearchParams(params);
  };

  const getMatchingCustomerIds = async () => {
    const ids = new Set<string>();
    const maxPageSize = 200;
    let currentPage = 1;

    while (true) {
      const pageData = await getCustomers({
        ...queryParams,
        page: currentPage,
        pageSize: maxPageSize,
      });

      pageData.customers.forEach((customer) => ids.add(customer.id));

      if (!pageData.pagination.hasNextPage) {
        break;
      }

      currentPage += 1;
    }

    return Array.from(ids);
  };

  const getSelectedCustomerIds = async () => {
    if (isAllMatchingSelected) {
      return getMatchingCustomerIds();
    }

    return Array.from(selectedCustomerIds);
  };

  const handleMutationError = (title: string, message: string) => {
    addNotification({
      type: 'error',
      title,
      message,
    });
  };

  const handleActionSuccess = (message: string) => {
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    queryClient.invalidateQueries({ queryKey: ['segments'] });
    queryClient.invalidateQueries({ queryKey: ['playbooks'] });
    queryClient.invalidateQueries({ queryKey: ['work-queue'] });

    addNotification({
      type: 'success',
      title: 'Action completed',
      message,
    });
  };

  const runBulkAddToSegment = async (customerIds: string[], segmentId: string) => {
    if (!segmentId || customerIds.length === 0) return;

    try {
      const result = await bulkAddToSegmentMutation.mutateAsync({ customerIds, segmentId });
      handleActionSuccess(`Added ${result.processed} customers to segment.`);
    } catch {
      handleMutationError('Failed to add customers', 'Could not add selected customers to segment.');
    }
  };

  const runBulkTriggerPlaybook = async (customerIds: string[], playbookId: string) => {
    if (!playbookId || customerIds.length === 0) return;

    try {
      const result = await bulkTriggerPlaybookMutation.mutateAsync({ customerIds, playbookId });
      handleActionSuccess(`Triggered playbook for ${result.processed} customers.`);
    } catch {
      handleMutationError('Failed to trigger playbook', 'Could not trigger playbook for selected customers.');
    }
  };

  const runBulkAddToWorkQueue = async (customerIds: string[]) => {
    if (customerIds.length === 0) return;

    try {
      const result = await bulkAddToWorkQueueMutation.mutateAsync({ customerIds });
      handleActionSuccess(`Created ${result.processed} work queue items.`);
    } catch {
      handleMutationError('Failed to add to work queue', 'Could not create work queue items.');
    }
  };

  const runExport = async (customerIds: string[]) => {
    if (customerIds.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No customers to export',
        message: 'There are no customers matching the current filters.',
      });
      return;
    }

    try {
      const blob = await bulkExportCustomersMutation.mutateAsync({ customerIds });
      downloadBlob(blob, `customers-export-${new Date().toISOString().split('T')[0]}.csv`);
      addNotification({
        type: 'success',
        title: 'Export complete',
        message: `Exported ${customerIds.length} customers.`,
      });
    } catch {
      handleMutationError('Export failed', 'Could not export customers.');
    }
  };

  const toggleSort = (sortBy: SortKey) => {
    const nextSort: SortState = {
      sortBy,
      sortDescending: sort.sortBy === sortBy ? !sort.sortDescending : true,
    };

    setSort(nextSort);
    const params = new URLSearchParams(searchParams);
    params.set('sortBy', nextSort.sortBy);
    params.set('sortDescending', nextSort.sortDescending ? 'true' : 'false');
    params.set('page', '1');
    setSearchParams(params);
  };

  const toggleCustomerSelection = (customerId: string) => {
    if (isAllMatchingSelected) {
      setIsAllMatchingSelected(false);
    }

    const next = new Set(selectedCustomerIds);
    if (next.has(customerId)) {
      next.delete(customerId);
    } else {
      next.add(customerId);
    }
    setSelectedCustomerIds(next);
  };

  const toggleSelectAllVisible = () => {
    const visibleIds = customers.map((customer) => customer.id);
    const allVisibleSelected = visibleIds.every((id) => selectedCustomerIds.has(id));

    if (allVisibleSelected) {
      setSelectedCustomerIds(new Set());
      setIsAllMatchingSelected(false);
      return;
    }

    setSelectedCustomerIds(new Set(visibleIds));
  };

  const openDeleteModal = (customerIds: string[]) => {
    if (!canDeleteCustomers) {
      handleMutationError('Access denied', 'You do not have permission to delete customers.');
      return;
    }

    const customerLookup = new Map(customers.map((customer) => [customer.id, customer]));
    const nextCustomers = customerIds.map((customerId) =>
      customerLookup.get(customerId) ?? ({
        id: customerId,
        firstName: '',
        lastName: '',
        email: '',
        fullName: customerId,
        companyName: '',
        tenureDisplay: '',
        activityStatus: 'Inactive',
        lastActivityDisplay: '',
        planDisplay: '',
        statusDisplay: '',
        churnRiskDisplay: '',
        formattedMrr: '',
        formattedLtv: '',
        healthStatus: 'Watch',
        plan: 0,
        status: 0,
        paymentStatus: 0,
        churnRisk: 0,
        churnRiskScore: 0,
        monthlyRecurringRevenue: 0,
        lifetimeValue: 0,
        nextBillingDate: null,
        hasPaymentIssues: false,
        paymentFailureCount: 0,
        planName: '',
        monthlyAmount: 0,
        currency: 'USD',
        paymentStatusLabel: 'Current',
        lastActivityAt: null,
        lastActivityDate: null,
        hasRecentActivity: false,
        lastSyncedAt: new Date().toISOString(),
        leadSource: null,
        industry: null,
        isSubscribed: false,
        openSupportTickets: 0,
        tenureDays: 0,
      } as CustomerListItem),
    );
    setCustomersToDelete(nextCustomers);
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = () => {
    setSelectedCustomerIds(new Set());
    setIsAllMatchingSelected(false);
    queryClient.invalidateQueries({ queryKey: ['customers'] });
  };

  const renderSortIcon = (sortBy: SortKey) => (
    <span className={cn('text-xs', getSortLabel(sortBy, sort))}>
      {sort.sortBy === sortBy ? (sort.sortDescending ? 'v' : '^') : '-'}
    </span>
  );

  if (isLoading) {
    return (
      <ContentLayout>
        <div className="rounded-xl border border-border-primary/30 bg-surface-primary p-6 text-text-secondary">
          Loading customers...
        </div>
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout>
        <div className="rounded-xl border border-error/30 bg-error/10 p-6 text-error">
          Failed to load customers.
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout>
      <div className="space-y-6">
        <AppPageHeader
          title="Customers"
          description="Segment-aware view with filter-scoped stats, health indicators, and bulk actions."
          actions={(
            <button
              onClick={async () => {
                const ids = await getMatchingCustomerIds();
                await runExport(ids);
              }}
              className="h-10 rounded-lg border border-border-primary/40 bg-surface-secondary/60 px-4 text-sm hover:border-accent-primary/40"
            >
              {exportLabel}
            </button>
          )}
        />

        <div className="rounded-2xl border border-border-primary/30 bg-surface-primary p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/35 p-3">
              <div className="text-xs uppercase text-text-muted">Total Customers</div>
              <div className="mt-1 text-xl font-semibold text-text-primary">{summary?.totalCount ?? 0}</div>
              <div className="text-xs text-text-secondary">{summary?.activeCount ?? 0} active</div>
            </div>
            <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/35 p-3">
              <div className="text-xs uppercase text-text-muted">Total MRR</div>
              <div className="mt-1 text-xl font-semibold text-text-primary">
                {formatCurrency(summary?.totalMrr ?? 0, 'USD')}
              </div>
              <div className="text-xs text-text-secondary">Across current filters</div>
            </div>
            <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/35 p-3">
              <div className="text-xs uppercase text-text-muted">Avg Churn Risk</div>
              <div className="mt-1 text-xl font-semibold text-text-primary">
                {Math.round(summary?.avgChurnRisk ?? 0)}%
              </div>
              <div className="text-xs text-text-secondary">{summary?.highRiskCount ?? 0} high-risk</div>
            </div>
            <div className="rounded-xl border border-border-primary/30 bg-surface-secondary/35 p-3">
              <div className="text-xs uppercase text-text-muted">Recent Activity</div>
              <div className="mt-1 text-xl font-semibold text-text-primary">{summary?.recentActivityCount ?? 0}</div>
              <div className="text-xs text-text-secondary">Active in last 7 days</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border-primary/30 bg-surface-primary p-4">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search customers by name, email, or company"
                className="h-10 w-full rounded-lg border border-border-primary/40 bg-surface-secondary/35 px-3 text-sm outline-none focus:border-accent-primary/50"
              />
              <SegmentFilter
                segments={segments}
                selectedSegmentId={selectedSegmentId}
                onSegmentChange={(segmentId) => setParam('segmentId', segmentId)}
              />
            </div>

            {isFetching && (
              <span className="text-xs text-text-muted">Refreshing...</span>
            )}
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-sm transition-colors',
                  selectedFilter === tab.key
                    ? 'border-accent-primary/50 bg-accent-primary/15 text-accent-primary'
                    : 'border-border-primary/40 bg-surface-secondary/35 text-text-secondary hover:border-accent-primary/30',
                )}
                onClick={() => setParam('filter', tab.key === 'all' ? undefined : tab.key)}
              >
                {tab.label} ({filterCounts[tab.key] ?? 0})
              </button>
            ))}
          </div>

          {selectedCount > 0 && (
            <div className="mb-4">
              <BulkActionBar
                selectedCount={selectedCount}
                totalMatching={summary?.totalCount ?? customers.length}
                isAllMatchingSelected={isAllMatchingSelected}
                segments={segments}
                playbooks={playbooks}
                onSelectAllMatching={() => {
                  setIsAllMatchingSelected(true);
                  setSelectedCustomerIds(new Set(customers.map((customer) => customer.id)));
                }}
                onClearSelection={() => {
                  setSelectedCustomerIds(new Set());
                  setIsAllMatchingSelected(false);
                }}
                onAddToSegment={async (segmentId) => {
                  const ids = await getSelectedCustomerIds();
                  await runBulkAddToSegment(ids, segmentId);
                }}
                onTriggerPlaybook={async (playbookId) => {
                  const ids = await getSelectedCustomerIds();
                  await runBulkTriggerPlaybook(ids, playbookId);
                }}
                onAddToWorkQueue={async () => {
                  const ids = await getSelectedCustomerIds();
                  await runBulkAddToWorkQueue(ids);
                }}
                onExportSelected={async () => {
                  const ids = await getSelectedCustomerIds();
                  await runExport(ids);
                }}
                onDeleteSelected={async () => {
                  const ids = await getSelectedCustomerIds();
                  openDeleteModal(ids);
                }}
              />
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] border-collapse">
              <thead>
                <tr className="border-b border-border-primary/40 text-left text-xs uppercase tracking-wide text-text-muted">
                  {canManageCustomers && (
                    <th className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={customers.length > 0 && customers.every((customer) => selectedCustomerIds.has(customer.id))}
                        onChange={toggleSelectAllVisible}
                      />
                    </th>
                  )}
                  <th className="px-3 py-3" onClick={() => toggleSort('healthStatus')}>
                    <button className="flex items-center gap-1">Health {renderSortIcon('healthStatus')}</button>
                  </th>
                  <th className="px-3 py-3" onClick={() => toggleSort('full_name')}>
                    <button className="flex items-center gap-1">Customer {renderSortIcon('full_name')}</button>
                  </th>
                  <th className="px-3 py-3">Billing</th>
                  <th className="px-3 py-3" onClick={() => toggleSort('ltv')}>
                    <button className="flex items-center gap-1">LTV {renderSortIcon('ltv')}</button>
                  </th>
                  <th className="px-3 py-3" onClick={() => toggleSort('churnRiskScore')}>
                    <button className="flex items-center gap-1">Churn Risk {renderSortIcon('churnRiskScore')}</button>
                  </th>
                  <th className="px-3 py-3" onClick={() => toggleSort('lastActivity')}>
                    <button className="flex items-center gap-1">Activity {renderSortIcon('lastActivity')}</button>
                  </th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => {
                  const activity = formatRelativeActivity(customer.lastActivityAt ?? customer.lastActivityDate);
                  const paymentWarning = shouldShowBillingWarning(customer.paymentStatusLabel);
                  const churnScore = Math.round(customer.churnRiskScore ?? 0);

                  return (
                    <tr
                      key={customer.id}
                      className="border-b border-border-primary/20 text-sm text-text-primary hover:bg-surface-secondary/25"
                    >
                      {canManageCustomers && (
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={isAllMatchingSelected || selectedCustomerIds.has(customer.id)}
                            onChange={() => toggleCustomerSelection(customer.id)}
                          />
                        </td>
                      )}

                      <td className="px-3 py-3">
                        <HealthIndicator healthStatus={customer.healthStatus} />
                      </td>

                      <td className="px-3 py-3">
                        <button
                          className="text-left"
                          onClick={() => navigate(`/app/customers/${customer.id}`)}
                        >
                          <div className="font-medium text-text-primary">{customer.fullName}</div>
                          <div className="text-xs text-text-muted">{customer.email}</div>
                        </button>
                      </td>

                      <td className="px-3 py-3">
                        <div className="font-medium text-text-primary">
                          {customer.planName || customer.planDisplay}
                          {' - '}
                          {formatCurrency(customer.monthlyAmount ?? customer.monthlyRecurringRevenue ?? 0, customer.currency || 'USD')}/mo
                        </div>
                        {paymentWarning && (
                          <span className="mt-1 inline-flex rounded-full border border-error/40 bg-error/10 px-2 py-0.5 text-xs text-error">
                            {customer.paymentStatusLabel}
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-3 font-semibold">{customer.formattedLtv}</td>

                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span className={cn('inline-flex h-2.5 w-2.5 rounded-full', getChurnColor(churnScore))} />
                          <span className="font-medium">{churnScore}%</span>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <span className={cn('text-sm', activitySeverityClass[activity.severity])}>
                          {activity.label}
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        {canManageCustomers ? (
                          <CustomerActionsMenu
                            customerId={customer.id}
                            customerName={customer.fullName}
                            segments={segments}
                            playbooks={playbooks}
                            onViewDetails={(customerId) => navigate(`/app/customers/${customerId}`)}
                            onAddToSegment={async (customerIds, segmentId) => runBulkAddToSegment(customerIds, segmentId)}
                            onTriggerPlaybook={async (customerIds, playbookId) => runBulkTriggerPlaybook(customerIds, playbookId)}
                            onAddToWorkQueue={async (customerIds) => runBulkAddToWorkQueue(customerIds)}
                            onDeleteCustomer={(customerId) => openDeleteModal([customerId])}
                          />
                        ) : (
                          <button
                            className="rounded-md border border-border-primary/40 px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
                            onClick={() => navigate(`/app/customers/${customer.id}`)}
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-text-secondary">
              <div>
                Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} customers)
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-border-primary/40 px-3 py-1 disabled:opacity-40"
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => setParam('page', String(pagination.page - 1))}
                >
                  Previous
                </button>
                <button
                  className="rounded-md border border-border-primary/40 px-3 py-1 disabled:opacity-40"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setParam('page', String(pagination.page + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {showDeleteModal && (
          <DeleteCustomersModal
            customers={customersToDelete}
            onClose={() => setShowDeleteModal(false)}
            onSuccess={() => handleDeleteSuccess()}
          />
        )}
      </div>
    </ContentLayout>
  );
};

