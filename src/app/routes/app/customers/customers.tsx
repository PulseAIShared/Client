// src/app/routes/app/customers/customers.tsx (updated for background import)
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useMediaQuery } from '@mantine/hooks';
import { ContentLayout } from '@/components/layouts';
import { useGetCustomers } from '@/features/customers/api/customers';
import { CustomerImportModal } from '@/features/customers/components/customer-import-modal';
import { useNotifications } from '@/components/ui/notifications';
import { useGetImportHistory } from '@/features/customers/api/import';
import { ImportHistoryModal } from '@/features/customers/components/import-history-modal';
import { MobileCustomerCards } from '@/features/customers/components/mobile-customer-cards';
import { DeleteCustomersModal } from '@/features/customers/components/customers-delete-modal';
import { getActivityColor, getSubscriptionStatusColor } from '@/utils/customer-helpers';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuthorization, CompanyAuthorization } from '@/lib/authorization';
import { 
  SubscriptionStatus, 
  SubscriptionPlan, 
  PaymentStatus, 
  ChurnRiskLevel,
  CustomersQueryParams,
  formatSubscriptionStatus,
  CustomerDisplayData,
  formatPlanName,
  formatPaymentStatus
} from '@/types/api';
import { formatCurrency } from '@/types/api';

type SortField = 'fullName' | 'tenureDays' | 'lifetimeValue' | 'churnRiskScore' | 'activityStatus' | 'email' | 'plan' | 'subscriptionStatus';

// Map frontend sort fields to actual API field names from the JSON structure
const sortFieldMap: Record<SortField, string> = {
  fullName: 'fullName',
  tenureDays: 'tenureDays', 
  lifetimeValue: 'lifetimeValue',
  churnRiskScore: 'churnRiskScore',
  activityStatus: 'activityStatus', 
  email: 'email',
  plan: 'plan',
  subscriptionStatus: 'subscriptionStatus'
};

const ChurnRiskBadge: React.FC<{ score: number }> = ({ score }) => {
  const getRiskLevel = (score: number) => {
    if (score >= 80) return { label: 'Critical', bgColor: 'bg-error/20', textColor: 'text-error', borderColor: 'border-error/30' };
    if (score >= 60) return { label: 'High', bgColor: 'bg-warning/20', textColor: 'text-warning', borderColor: 'border-warning/30' };
    if (score >= 40) return { label: 'Medium', bgColor: 'bg-warning/10', textColor: 'text-warning', borderColor: 'border-warning/20' };
    return { label: 'Low', bgColor: 'bg-success/20', textColor: 'text-success', borderColor: 'border-success/30' };
  };

  const risk = getRiskLevel(score);

  return (
    <div className="flex items-center gap-2">
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${risk.bgColor} ${risk.textColor} border ${risk.borderColor}`}>
        {risk.label}
      </div>
      <span className="text-sm font-medium text-text-secondary min-w-[40px] text-right">
        {score}%
      </span>
    </div>
  );
};

export const CustomersRoute = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { checkCompanyPolicy } = useAuthorization();
  
  // Check if user has write permissions for customers
  const canEditCustomers = checkCompanyPolicy('customers:write');

  // Import modal states
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportHistory, setShowImportHistory] = useState(false);
  
  // Table states
  const [queryParams, setQueryParams] = useState<CustomersQueryParams>({
    page: 1,
    pageSize: 50,
    sortBy: 'churnRiskScore',
    sortDescending: true,
  });
  
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customersToDelete, setCustomersToDelete] = useState<CustomerDisplayData[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [mrrRange, setMrrRange] = useState<{ min?: string; max?: string }>({});
  const [industryFilter, setIndustryFilter] = useState<string | undefined>();
  const [leadSourceFilter, setLeadSourceFilter] = useState<string | undefined>();

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Update query params when debounced search term changes
  React.useEffect(() => {
    setQueryParams(prev => ({
      ...prev,
      search: debouncedSearchTerm || undefined,
      page: 1,
    }));
  }, [debouncedSearchTerm]);

  // Get recent import history
  const { data: importHistory } = useGetImportHistory({ page: 1, pageSize: 5 });

  // Get customers data
  const { data, isLoading, error } = useGetCustomers(queryParams);
  const customers = useMemo(() => data?.customers || [], [data]);
  const pagination = data?.pagination;

  const handleImportStarted = () => {
    addNotification({
      type: 'info',
      title: 'Import job started',
      message: 'Your customer import is being processed. You will receive notifications as it progresses.'
    });
  };

  const handleSort = (field: SortField) => {
    const apiField = sortFieldMap[field];
    const isCurrentField = queryParams.sortBy === apiField;
    const newParams = {
      ...queryParams,
      sortBy: apiField,
      sortDescending: isCurrentField ? !queryParams.sortDescending : true,
      page: 1,
    };
    setQueryParams(newParams);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    
    const newParams: CustomersQueryParams = {
      ...queryParams,
      page: 1,
      subscriptionStatus: undefined,
      churnRiskLevel: undefined,
      paymentStatus: undefined,
      hasPaymentIssues: undefined,
      hasRecentActivity: undefined,
    };

    switch (filter) {
      case 'active':
        newParams.subscriptionStatus = SubscriptionStatus.Active;
        break;
      case 'high-risk':
        newParams.churnRiskLevel = ChurnRiskLevel.High;
        break;
      case 'payment-issues':
        newParams.hasPaymentIssues = true;
        break;
      case 'cancelled':
        newParams.subscriptionStatus = SubscriptionStatus.Cancelled;
        break;
      case 'recent':
        newParams.hasRecentActivity = true;
        break;
    }

    setQueryParams(newParams);
  };

  const handleCustomerClick = (customerId: string) => {
    navigate(`/app/customers/${customerId}`);
  };

  const handlePageChange = (newPage: number) => {
    setQueryParams(prev => ({ ...prev, page: newPage }));
  };

  const handleBulkDelete = () => {
    const selectedCustomerData = customers.filter(customer => 
      selectedCustomers.has(customer.id)
    );
    setCustomersToDelete(selectedCustomerData);
    setShowDeleteModal(true);
  };

  const handleSingleDelete = (customer: CustomerDisplayData, event: React.MouseEvent) => {
    event.stopPropagation();
    setCustomersToDelete([customer]);
    setShowDeleteModal(true);
  };

  interface DeleteCustomersResponse {
    failed: number;
    message: string;
  }

  const handleDeleteSuccess = (response: DeleteCustomersResponse) => {
    setSelectedCustomers(new Set());
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    addNotification({
      type: response.failed === 0 ? 'success' : 'warning',
      title: response.failed === 0 ? 'Customers deleted successfully' : 'Deletion completed with some errors',
      message: response.message,
    });
  };

  const handleExportAll = () => {
    if (!canEditCustomers) {
      addNotification({
        type: 'error',
        title: 'Access Denied',
        message: 'You need Staff or Owner permissions to export customers'
      });
      return;
    }
    
    // Generate CSV content from current customers
    const csvHeaders = ['Full Name', 'Email', 'Plan', 'Lifetime Value', 'Churn Risk Score', 'Activity Status', 'Tenure'];
    const csvRows = customers.map(customer => [
      customer.fullName,
      customer.email,
      customer.plan,
      customer.lifetimeValue,
      customer.churnRiskScore,
      customer.activityStatus,
      customer.tenureDisplay
    ]);
    
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `customers-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addNotification({
      type: 'success',
      title: 'Export Complete',
      message: `Successfully exported ${customers.length} customers`
    });
  };

  const handleExportSelected = () => {
    if (!canEditCustomers) {
      addNotification({
        type: 'error',
        title: 'Access Denied',
        message: 'You need Staff or Owner permissions to export customers'
      });
      return;
    }
    
    const selectedCustomerData = customers.filter(customer => 
      selectedCustomers.has(customer.id)
    );
    
    if (selectedCustomerData.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Selection',
        message: 'Please select customers to export'
      });
      return;
    }
    
    // Generate CSV content from selected customers
    const csvHeaders = ['Full Name', 'Email', 'Plan', 'Lifetime Value', 'Churn Risk Score', 'Activity Status', 'Tenure'];
    const csvRows = selectedCustomerData.map(customer => [
      customer.fullName,
      customer.email,
      customer.plan,
      customer.lifetimeValue,
      customer.churnRiskScore,
      customer.activityStatus,
      customer.tenureDisplay
    ]);
    
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `customers-selected-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addNotification({
      type: 'success',
      title: 'Export Complete',
      message: `Successfully exported ${selectedCustomerData.length} selected customers`
    });
  };

  const filterCounts = useMemo(() => ({
    all: pagination?.totalCount || 0,
    active: customers.filter(c => c.subscriptionStatus === SubscriptionStatus.Active).length,
    'high-risk': customers.filter(c => c.churnRiskLevel === ChurnRiskLevel.High || c.churnRiskLevel === ChurnRiskLevel.Critical).length,
    recent: customers.filter(c => c.hasRecentActivity).length,
    'payment-issues': customers.filter(c => (c as any).hasPaymentIssues || c.subscriptionStatus === SubscriptionStatus.PastDue).length,
    cancelled: customers.filter(c => c.subscriptionStatus === SubscriptionStatus.Cancelled).length,
  }), [customers, pagination?.totalCount]);

  const toggleCustomerSelection = (customerId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    const newSelected = new Set(selectedCustomers);
    if (newSelected.has(customerId)) {
      newSelected.delete(customerId);
    } else {
      newSelected.add(customerId);
    }
    setSelectedCustomers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedCustomers.size === customers.length) {
      setSelectedCustomers(new Set());
    } else {
      setSelectedCustomers(new Set(customers.map(c => c.id)));
    }
  };

  const industryOptions = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => {
      if ((c as any).industry) set.add((c as any).industry);
    });
    return Array.from(set);
  }, [customers]);

  const leadSourceOptions = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => {
      if ((c as any).leadSource) set.add((c as any).leadSource);
    });
    return Array.from(set);
  }, [customers]);

  const updateQueryParam = (updates: Partial<CustomersQueryParams>) => {
    setQueryParams((prev) => ({ ...prev, ...updates, page: 1 }));
  };

  const handleAdvancedFilterApply = () => {
    updateQueryParam({
      mrrMin: mrrRange.min ? Number(mrrRange.min) : undefined,
      mrrMax: mrrRange.max ? Number(mrrRange.max) : undefined,
      industry: industryFilter,
      leadSource: leadSourceFilter,
    });
    setShowFilters(false);
  };

  const handleAdvancedReset = () => {
    setMrrRange({});
    setIndustryFilter(undefined);
    setLeadSourceFilter(undefined);
    updateQueryParam({
      mrrMin: undefined,
      mrrMax: undefined,
      industry: undefined,
      leadSource: undefined,
      plan: undefined,
      subscriptionStatus: undefined,
      paymentStatus: undefined,
      churnRiskLevel: undefined,
      hasRecentActivity: undefined,
      hasPaymentIssues: undefined,
      isSubscribed: undefined,
    });
    setSelectedFilter('all');
  };

  const totalMRR = useMemo(() => {
    return customers.reduce((acc, c) => acc + ((c as any).monthlyRecurringRevenue ?? 0), 0);
  }, [customers]);

  const avgChurn = useMemo(
    () => (customers.length ? customers.reduce((acc, c) => acc + (c.churnRiskScore ?? 0), 0) / customers.length : 0),
    [customers],
  );

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    const apiField = sortFieldMap[field];
    const isActive = queryParams.sortBy === apiField;
    return (
      <svg 
        className={`w-4 h-4 transition-colors ${isActive ? 'text-accent-primary' : 'text-text-muted'}`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d={isActive && !queryParams.sortDescending ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
        />
      </svg>
    );
  };

  return (
    <ContentLayout>
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        {/* Sleek Header */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/8 via-accent-secondary/8 to-accent-primary/8 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-surface-primary/95 backdrop-blur-xl p-6 sm:p-8 lg:p-10 rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary">
                    Customers
                  </h1>
                  <p className="text-text-secondary text-base sm:text-lg lg:text-xl max-w-3xl">
                    Track health, revenue, and engagement at a glance. Filters mirror the API so what you see is exactly what we fetch.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                  <CompanyAuthorization policyCheck={canEditCustomers} forbiddenFallback={null}>
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="group relative w-full sm:w-auto px-6 sm:px-7 py-3 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl hover:shadow-lg hover:shadow-accent-secondary/20 transform hover:-translate-y-0.5 transition-all duration-200 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 whitespace-nowrap overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-accent-secondary to-accent-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      <svg className="relative w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="relative">Import Customers</span>
                    </button>
                  </CompanyAuthorization>
                  <div className="flex flex-row gap-3 w-full sm:w-auto">
                    <CompanyAuthorization policyCheck={canEditCustomers} forbiddenFallback={null}>
                      <button
                        onClick={() => setShowImportHistory(true)}
                        className="group flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-surface-secondary/60 text-text-primary rounded-xl hover:bg-surface-primary/70 transition-all duration-200 font-medium text-sm sm:text-base border border-border-primary/40 hover:border-accent-primary/30 hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        History
                      </button>
                    </CompanyAuthorization>
                    <CompanyAuthorization policyCheck={canEditCustomers} forbiddenFallback={null}>
                      <button
                        onClick={handleExportAll}
                        className="group flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-surface-secondary/60 text-text-primary rounded-xl hover:bg-surface-primary/70 transition-all duration-200 font-medium text-sm sm:text-base border border-border-primary/40 hover:border-accent-primary/30 hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export
                      </button>
                    </CompanyAuthorization>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Total customers', value: pagination?.totalCount ?? 0, hint: `${filterCounts.active} active` },
                  { label: 'Total MRR', value: formatCurrency(totalMRR, 'USD'), hint: 'Based on current page' },
                  { label: 'Avg churn risk', value: `${Math.round(avgChurn)}%`, hint: `${filterCounts['high-risk']} high-risk` },
                  { label: 'Recent activity', value: filterCounts.recent, hint: 'Last-seen customers' },
                ].map((stat) => (
                  <div key={stat.label} className="p-4 bg-surface-secondary/60 border border-border-primary/30 rounded-2xl shadow-inner">
                    <div className="text-xs uppercase tracking-wide text-text-muted font-semibold">{stat.label}</div>
                    <div className="text-xl font-semibold text-text-primary mt-1">{stat.value}</div>
                    <div className="text-xs text-text-secondary/80 mt-1">{stat.hint}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Customers Table */}
        {isLoading ? (
          <div className="space-y-6">
            <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg animate-pulse">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 h-12 bg-surface-secondary rounded-xl"></div>
                <div className="flex gap-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="h-10 w-24 bg-surface-secondary rounded-xl"></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-surface-primary/80 backdrop-blur-lg rounded-2xl border border-border-primary/30 shadow-lg animate-pulse">
              <div className="p-6 border-b border-border-primary/30">
                <div className="h-6 bg-surface-secondary rounded-xl w-48"></div>
              </div>
              <div className="p-6">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="h-16 bg-surface-secondary rounded-xl mb-3"></div>
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-surface-primary/80 backdrop-blur-lg rounded-2xl border border-border-primary/30 shadow-lg">
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-error/20 to-error-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="text-error-muted font-medium mb-2">Failed to load customers</div>
              <div className="text-sm text-text-muted mb-4">Please try refreshing the page</div>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error-muted transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : isMobile ? (
          <div className="space-y-6">
            <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    placeholder="Search customers by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-surface-secondary/50 border border-border-primary/30 rounded-xl px-4 py-3 pl-10 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all duration-200"
                  />
                  <svg className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {[
                    { key: 'all', label: 'All', count: filterCounts.all },
                    { key: 'active', label: 'Active', count: filterCounts.active },
                    { key: 'high-risk', label: 'High Risk', count: filterCounts['high-risk'] },
                    { key: 'recent', label: 'Recent', count: filterCounts.recent },
                    { key: 'payment-issues', label: 'Payment', count: filterCounts['payment-issues'] },
                    { key: 'cancelled', label: 'Cancelled', count: filterCounts.cancelled }
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => handleFilterChange(filter.key)}
                      className={`px-3 py-1.5 rounded-xl font-medium text-xs transition-all duration-200 whitespace-nowrap ${
                        selectedFilter === filter.key
                          ? 'bg-gradient-to-r from-accent-primary/30 to-accent-secondary/30 text-accent-primary border border-accent-primary/30'
                          : 'bg-surface-secondary/50 text-text-secondary hover:bg-surface-secondary/80 border border-border-primary/30'
                      }`}
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <MobileCustomerCards 
              customers={customers}
              onCustomerClick={handleCustomerClick}
              selectedCustomers={selectedCustomers}
              onToggleSelection={toggleCustomerSelection}
              onSingleDelete={handleSingleDelete}
              canEditCustomers={canEditCustomers}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    placeholder="Search customers by name or email..."
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
                    { key: 'all', label: 'All Customers', shortLabel: 'All', count: filterCounts.all },
                    { key: 'active', label: 'Active', shortLabel: 'Active', count: filterCounts.active },
                    { key: 'high-risk', label: 'High Risk', shortLabel: 'High Risk', count: filterCounts['high-risk'] },
                    { key: 'recent', label: 'Recent', shortLabel: 'Recent', count: filterCounts.recent },
                    { key: 'payment-issues', label: 'Payment Issues', shortLabel: 'Payment', count: filterCounts['payment-issues'] },
                    { key: 'cancelled', label: 'Cancelled', shortLabel: 'Cancelled', count: filterCounts.cancelled }
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => handleFilterChange(filter.key)}
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                      selectedFilter === filter.key
                        ? 'bg-gradient-to-r from-accent-primary/30 to-accent-secondary/30 text-accent-primary border border-accent-primary/30'
                        : 'bg-surface-secondary/50 text-text-secondary hover:bg-surface-secondary/80 border border-border-primary/30'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={() => setShowFilters((prev) => !prev)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-border-primary/40 bg-surface-secondary/60 hover:border-accent-primary/40 hover:text-accent-primary transition-colors flex items-center gap-2"
              >
                <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Advanced filters
              </button>
              {showFilters && (
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  API params: status, plan, payment, risk, activity, mrr, industry, source
                </div>
              )}
            </div>
            {showFilters && (
              <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-3 bg-surface-secondary/50 border border-border-primary/30 rounded-2xl p-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-muted uppercase">Plan</label>
                  <select
                    className="w-full rounded-lg border border-border-primary/40 bg-surface-primary/80 px-3 py-2 text-sm"
                    value={queryParams.plan ?? ''}
                    onChange={(e) => updateQueryParam({ plan: e.target.value === '' ? undefined : Number(e.target.value) as SubscriptionPlan })}
                  >
                    <option value="">All plans</option>
                    {[SubscriptionPlan.Basic, SubscriptionPlan.Pro, SubscriptionPlan.Enterprise].map((plan) => (
                      <option key={plan} value={plan}>{formatPlanName(plan)}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-muted uppercase">Subscription</label>
                  <select
                    className="w-full rounded-lg border border-border-primary/40 bg-surface-primary/80 px-3 py-2 text-sm"
                    value={queryParams.subscriptionStatus ?? ''}
                    onChange={(e) => updateQueryParam({ subscriptionStatus: e.target.value === '' ? undefined : Number(e.target.value) as SubscriptionStatus })}
                  >
                    <option value="">All</option>
                    {Object.values(SubscriptionStatus).filter((v) => typeof v === 'number').map((status) => (
                      <option key={status as number} value={status as number}>{formatSubscriptionStatus(status as SubscriptionStatus)}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-muted uppercase">Payment status</label>
                  <select
                    className="w-full rounded-lg border border-border-primary/40 bg-surface-primary/80 px-3 py-2 text-sm"
                    value={queryParams.paymentStatus ?? ''}
                    onChange={(e) => updateQueryParam({ paymentStatus: e.target.value === '' ? undefined : Number(e.target.value) as PaymentStatus })}
                  >
                    <option value="">All</option>
                    {Object.values(PaymentStatus).filter((v) => typeof v === 'number').map((status) => (
                      <option key={status as number} value={status as number}>{formatPaymentStatus(status as PaymentStatus)}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-muted uppercase">Churn risk</label>
                  <select
                    className="w-full rounded-lg border border-border-primary/40 bg-surface-primary/80 px-3 py-2 text-sm"
                    value={queryParams.churnRiskLevel ?? ''}
                    onChange={(e) => updateQueryParam({ churnRiskLevel: e.target.value === '' ? undefined : Number(e.target.value) as ChurnRiskLevel })}
                  >
                    <option value="">All</option>
                    {Object.values(ChurnRiskLevel).filter((v) => typeof v === 'number').map((risk) => (
                      <option key={risk as number} value={risk as number}>{ChurnRiskLevel[risk as number]}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-muted uppercase">MRR range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="Min"
                      value={mrrRange.min ?? ''}
                      onChange={(e) => setMrrRange((prev) => ({ ...prev, min: e.target.value }))}
                      className="w-full rounded-lg border border-border-primary/40 bg-surface-primary/80 px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="Max"
                      value={mrrRange.max ?? ''}
                      onChange={(e) => setMrrRange((prev) => ({ ...prev, max: e.target.value }))}
                      className="w-full rounded-lg border border-border-primary/40 bg-surface-primary/80 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-muted uppercase">Industry</label>
                  <select
                    className="w-full rounded-lg border border-border-primary/40 bg-surface-primary/80 px-3 py-2 text-sm"
                    value={industryFilter ?? ''}
                    onChange={(e) => setIndustryFilter(e.target.value || undefined)}
                  >
                    <option value="">All</option>
                    {industryOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-muted uppercase">Lead source</label>
                  <select
                    className="w-full rounded-lg border border-border-primary/40 bg-surface-primary/80 px-3 py-2 text-sm"
                    value={leadSourceFilter ?? ''}
                    onChange={(e) => setLeadSourceFilter(e.target.value || undefined)}
                  >
                    <option value="">All</option>
                    {leadSourceOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-muted uppercase">Flags</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'hasRecentActivity', label: 'Recent', value: queryParams.hasRecentActivity },
                      { key: 'hasPaymentIssues', label: 'Payment issues', value: queryParams.hasPaymentIssues },
                      { key: 'isSubscribed', label: 'Marketing opt-in', value: queryParams.isSubscribed },
                    ].map((flag) => (
                      <button
                        key={flag.key}
                        onClick={() =>
                          updateQueryParam({
                            [flag.key]: flag.value ? undefined : true,
                          } as Partial<CustomersQueryParams>)
                        }
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                          flag.value
                            ? 'bg-accent-primary/15 text-accent-primary border-accent-primary/40'
                            : 'bg-surface-primary/80 text-text-secondary border-border-primary/40 hover:border-accent-primary/30'
                        }`}
                      >
                        {flag.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-end gap-2 lg:col-span-4 justify-end">
                  <button
                    onClick={handleAdvancedReset}
                    className="px-4 py-2 rounded-lg text-sm font-semibold border border-border-primary/40 bg-surface-primary/80 hover:border-accent-primary/40 hover:text-accent-primary transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleAdvancedFilterApply}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-accent-primary to-accent-secondary hover:from-accent-primary/90 hover:to-accent-secondary/90 shadow-md transition-colors"
                  >
                    Apply filters
                  </button>
                </div>
              </div>
            )}
          </div>

            <div className="bg-surface-primary/80 backdrop-blur-lg rounded-2xl border border-border-primary/30 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-border-primary/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-text-primary">
                      Customers ({pagination?.totalCount || 0})
                    </h2>
                    {selectedCustomers.size > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-text-muted">
                          {selectedCustomers.size} selected
                        </span>
                        <CompanyAuthorization
                          policyCheck={canEditCustomers}
                          forbiddenFallback={null}
                        >
                          <button 
                            onClick={handleBulkDelete}
                            className="px-3 py-1 bg-error/20 text-error rounded-lg hover:bg-error/30 transition-colors text-sm border border-error/30 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Selected
                          </button>
                        </CompanyAuthorization>
                        <CompanyAuthorization
                          policyCheck={canEditCustomers}
                          forbiddenFallback={null}
                        >
                          <button 
                            onClick={handleExportSelected}
                            className="px-3 py-1 bg-info-bg text-info rounded-lg hover:bg-info-bg/80 transition-colors text-sm border border-info/30"
                          >
                            Export Selected
                          </button>
                        </CompanyAuthorization>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedCustomers.size > 0 && (
                <div className="flex items-center justify-between px-6 py-3 bg-surface-secondary/40 border-b border-border-primary/30 sticky top-0 z-10">
                  <div className="text-sm text-text-muted">{selectedCustomers.size} selected</div>
                  <div className="flex items-center gap-2">
                    <CompanyAuthorization policyCheck={canEditCustomers} forbiddenFallback={null}>
                      <button
                        onClick={handleBulkDelete}
                        className="px-3 py-2 bg-error/15 text-error rounded-lg hover:bg-error/25 transition-colors text-sm border border-error/30 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete selected
                      </button>
                    </CompanyAuthorization>
                    <CompanyAuthorization policyCheck={canEditCustomers} forbiddenFallback={null}>
                      <button
                        onClick={handleExportSelected}
                        className="px-3 py-2 bg-surface-primary/80 text-text-primary rounded-lg hover:bg-surface-primary/90 transition-colors text-sm border border-border-primary/40"
                      >
                        Export selected
                      </button>
                    </CompanyAuthorization>
                  </div>
                </div>
              )}

              <div className="relative overflow-hidden">
                <table className="w-full table-auto border-collapse">
                  <colgroup>
                    {canEditCustomers && <col style={{ width: '48px' }} />}
                    <col style={{ width: '220px' }} />
                    <col style={{ width: '200px' }} />
                    <col style={{ width: '110px' }} />
                    <col style={{ width: '140px' }} />
                    <col style={{ width: '140px' }} />
                    <col style={{ width: '120px' }} />
                    {canEditCustomers && <col style={{ width: '80px' }} />}
                  </colgroup>
                  <thead className="bg-surface-secondary/30">
                    <tr>
                      <CompanyAuthorization
                        policyCheck={canEditCustomers}
                        forbiddenFallback={<th className="text-left py-4 px-6 font-semibold text-text-secondary w-12"></th>}
                      >
                        <th className="text-left py-4 px-6 font-semibold text-text-secondary">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.size === customers.length && customers.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-border-primary bg-surface-secondary focus:ring-accent-primary"
                        />
                        </th>
                      </CompanyAuthorization>
                      <th 
                        className="text-left py-4 px-6 font-semibold text-text-secondary cursor-pointer hover:text-text-primary transition-colors" 
                        onClick={() => handleSort('fullName')}
                      >
                        <div className="flex items-center gap-2">
                          Customer
                          <SortIcon field="fullName" />
                        </div>
                      </th>
                      <th 
                        className="text-left py-4 px-6 font-semibold text-text-secondary cursor-pointer hover:text-text-primary transition-colors whitespace-normal break-words" 
                        onClick={() => handleSort('plan')}
                      >
                        <div className="flex items-center gap-2">
                          Billing
                          <SortIcon field="plan" />
                        </div>
                      </th>
                      <th 
                        className="text-left py-4 px-6 font-semibold text-text-secondary cursor-pointer hover:text-text-primary transition-colors whitespace-normal break-words" 
                        onClick={() => handleSort('tenureDays')}
                      >
                        <div className="flex items-center gap-2">
                          Tenure
                          <SortIcon field="tenureDays" />
                        </div>
                      </th>
                      <th 
                        className="text-left py-4 px-6 font-semibold text-text-secondary cursor-pointer hover:text-text-primary transition-colors whitespace-normal break-words" 
                        onClick={() => handleSort('lifetimeValue')}
                      >
                        <div className="flex items-center gap-2">
                          Lifetime Value
                          <SortIcon field="lifetimeValue" />
                        </div>
                      </th>
                      <th 
                        className="text-left py-4 px-6 font-semibold text-text-secondary cursor-pointer hover:text-text-primary transition-colors whitespace-normal break-words" 
                        onClick={() => handleSort('churnRiskScore')}
                      >
                        <div className="flex items-center gap-2">
                          Churn Risk
                          <SortIcon field="churnRiskScore" />
                        </div>
                      </th>
                      <th 
                        className="text-left py-4 px-6 font-semibold text-text-secondary cursor-pointer hover:text-text-primary transition-colors whitespace-normal break-words" 
                        onClick={() => handleSort('activityStatus')}
                      >
                        <div className="flex items-center gap-2">
                          Activity
                          <SortIcon field="activityStatus" />
                        </div>
                      </th>
                      <CompanyAuthorization
                        policyCheck={canEditCustomers}
                        forbiddenFallback={<th className="text-left py-4 px-6 font-semibold text-text-secondary w-16"></th>}
                      >
                        <th className="text-left py-4 px-6 font-semibold text-text-secondary sticky right-0 bg-surface-secondary/60 backdrop-blur-sm">
                          Actions
                        </th>
                      </CompanyAuthorization>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr 
                        key={customer.id} 
                        className="border-t border-border-primary/30 hover:bg-surface-secondary/20 cursor-pointer transition-colors"
                        onClick={() => handleCustomerClick(customer.id)}
                      >
                        <CompanyAuthorization
                          policyCheck={canEditCustomers}
                          forbiddenFallback={<td className="py-4 px-6"></td>}
                        >
                          <td className="py-4 px-6">
                            <input
                              type="checkbox"
                              checked={selectedCustomers.has(customer.id)}
                              onChange={(e) => toggleCustomerSelection(customer.id, e)}
                              className="rounded border-border-primary bg-surface-secondary focus:ring-accent-primary"
                            />
                          </td>
                        </CompanyAuthorization>
                        <td className="py-4 px-6 align-top">
                          <div className="flex items-start gap-3">
                            <div className="min-w-[40px] w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                              {customer.fullName.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div className="space-y-1 break-words">
                              <div className="font-medium text-text-primary leading-snug break-words">{customer.fullName}</div>
                              <div className="text-xs text-text-muted leading-snug break-words">{customer.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-normal break-words align-top">
                          <div className="flex flex-col gap-1">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface-secondary/70 border border-border-primary/30 text-text-primary w-max">
                              {formatPlanName(customer.plan)}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-[11px] font-semibold w-max ${getSubscriptionStatusColor(customer.subscriptionStatus)}`}>
                              {formatSubscriptionStatus(customer.subscriptionStatus)}
                            </span>
                            <span className="text-xs text-text-secondary">
                              {formatPaymentStatus((customer as any).paymentStatus ?? PaymentStatus.Current)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-normal break-words align-top">
                          <div className="text-text-primary font-medium">{customer.tenureDisplay}</div>
                        </td>
                        <td className="py-4 px-6 whitespace-normal break-words align-top">
                          <div className="text-text-primary font-semibold">{formatCurrency(customer.lifetimeValue, 'USD')}</div>
                        </td>
                        <td className="py-4 px-6 whitespace-normal break-words align-top">
                          <ChurnRiskBadge score={Math.round(customer.churnRiskScore)} />
                        </td>
                        <td className="py-4 px-6 whitespace-normal break-words align-top">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(customer.activityStatus)}`}>
                            {customer.activityStatus}
                          </span>
                        </td>
                        <CompanyAuthorization
                          policyCheck={canEditCustomers}
                          forbiddenFallback={<td className="py-4 px-6"></td>}
                        >
                          <td className="py-4 px-6 sticky right-0 bg-surface-primary/90 backdrop-blur-sm border-l border-border-primary/20 align-top">
                            <button 
                              onClick={(e) => handleSingleDelete(customer, e)}
                              className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                              title="Delete customer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </CompanyAuthorization>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Enhanced Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="p-6 border-t border-border-primary/30 flex items-center justify-between">
                  <div className="text-sm text-text-muted">
                    Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total customers)
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPreviousPage}
                      className="px-3 py-1 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNextPage}
                      className="px-3 py-1 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <DeleteCustomersModal
            customers={customersToDelete}
            onClose={() => setShowDeleteModal(false)}
            onSuccess={handleDeleteSuccess}
          />
        )}

        {/* Import Modal */}
        {showImportModal && (
          <CustomerImportModal
            onClose={() => setShowImportModal(false)}
            onImportStarted={handleImportStarted}
          />
        )}

        {/* Import History Modal */}
        {showImportHistory && (
          <ImportHistoryModal
            onClose={() => setShowImportHistory(false)}
          />
        )}
      </div>
    </ContentLayout>
  );
};

