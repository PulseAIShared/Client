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
import { getActivityColor, getRiskColor, getSubscriptionStatusColor } from '@/utils/customer-helpers';
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
  CompanyRole
} from '@/types/api';

type SortField = 'fullName' | 'tenureDays' | 'lifetimeValue' | 'churnRiskScore' | 'activityStatus' | 'email' | 'plan';

// Map frontend sort fields to actual API field names from the JSON structure
const sortFieldMap: Record<SortField, string> = {
  fullName: 'fullName',
  tenureDays: 'tenureDays', 
  lifetimeValue: 'lifetimeValue',
  churnRiskScore: 'churnRiskScore',
  activityStatus: 'activityStatus', 
  email: 'email',
  plan: 'plan'
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
  const canReadCustomers = checkCompanyPolicy('customers:read');

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
    };

    switch (filter) {
      case 'active':
        newParams.subscriptionStatus = SubscriptionStatus.Active;
        break;
      case 'high-risk':
        newParams.churnRiskLevel = ChurnRiskLevel.High;
        break;
      case 'payment-issues':
        newParams.paymentStatus = PaymentStatus.Failed;
        break;
      case 'cancelled':
        newParams.subscriptionStatus = SubscriptionStatus.Cancelled;
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
    'payment-issues': customers.filter(c => c.subscriptionStatus === SubscriptionStatus.PastDue).length,
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
        {/* Enhanced Header */}
        <div className="relative group">
          {/* Enhanced background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 via-accent-secondary/5 to-accent-primary/5 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-500"></div>
          
          <div className="relative bg-surface-primary/90 backdrop-blur-xl p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8">
              <div className="space-y-3">
    
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-primary mb-2">
                  Customers Overview
                </h1>
                <p className="text-text-secondary text-base sm:text-lg lg:text-xl max-w-2xl">
                  Monitor customer behavior, churn risk, and lifetime value with AI-powered insights
                </p>
              </div>
              
              {/* Enhanced Mobile-First Button Layout */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                {/* Primary Action - Staff+ only */}
                <CompanyAuthorization
                  policyCheck={canEditCustomers}
                  forbiddenFallback={null}
                >
                  <button 
                    onClick={() => setShowImportModal(true)}
                    className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 whitespace-nowrap overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-secondary to-accent-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    <svg className="relative w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="relative hidden sm:inline">Import Customers</span>
                    <span className="relative sm:hidden">Import</span>
                  </button>
                </CompanyAuthorization>
                
                {/* Secondary Actions */}
                <div className="flex flex-row gap-3 w-full sm:w-auto">
                  <CompanyAuthorization
                    policyCheck={canEditCustomers}
                    forbiddenFallback={null}
                  >
                    <button 
                      onClick={() => setShowImportHistory(true)}
                      className="group flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-4 bg-surface-secondary/50 text-text-primary rounded-xl hover:bg-surface-primary/50 transition-all duration-200 font-medium text-sm sm:text-base border border-border-primary/30 hover:border-border-secondary hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="hidden sm:inline">Import History</span>
                      <span className="sm:hidden">History</span>
                    </button>
                  </CompanyAuthorization>
                  <CompanyAuthorization
                    policyCheck={canEditCustomers}
                    forbiddenFallback={null}
                  >
                    <button 
                      onClick={handleExportAll}
                      className="group flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-4 bg-surface-secondary/50 text-text-primary rounded-xl hover:bg-surface-primary/50 transition-all duration-200 font-medium text-sm sm:text-base border border-border-primary/30 hover:border-border-secondary hover:shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="hidden sm:inline">Export Data</span>
                      <span className="sm:hidden">Export</span>
                    </button>
                  </CompanyAuthorization>
                </div>
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

              <div className="overflow-x-auto">
                <table className="w-full">
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
                        className="text-left py-4 px-6 font-semibold text-text-secondary cursor-pointer hover:text-text-primary transition-colors" 
                        onClick={() => handleSort('plan')}
                      >
                        <div className="flex items-center gap-2">
                          Plan
                          <SortIcon field="plan" />
                        </div>
                      </th>
                      <th 
                        className="text-left py-4 px-6 font-semibold text-text-secondary cursor-pointer hover:text-text-primary transition-colors" 
                        onClick={() => handleSort('tenureDays')}
                      >
                        <div className="flex items-center gap-2">
                          Tenure
                          <SortIcon field="tenureDays" />
                        </div>
                      </th>
                      <th 
                        className="text-left py-4 px-6 font-semibold text-text-secondary cursor-pointer hover:text-text-primary transition-colors" 
                        onClick={() => handleSort('lifetimeValue')}
                      >
                        <div className="flex items-center gap-2">
                          Lifetime Value
                          <SortIcon field="lifetimeValue" />
                        </div>
                      </th>
                      <th 
                        className="text-left py-4 px-6 font-semibold text-text-secondary cursor-pointer hover:text-text-primary transition-colors" 
                        onClick={() => handleSort('churnRiskScore')}
                      >
                        <div className="flex items-center gap-2">
                          Churn Risk
                          <SortIcon field="churnRiskScore" />
                        </div>
                      </th>
                      <th 
                        className="text-left py-4 px-6 font-semibold text-text-secondary cursor-pointer hover:text-text-primary transition-colors" 
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
                        <th className="text-left py-4 px-6 font-semibold text-text-secondary">Actions</th>
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
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                              {customer.fullName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-medium text-text-primary">{customer.fullName}</div>
                              <div className="text-sm text-text-muted">{customer.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSubscriptionStatusColor(customer.subscriptionStatus)}`}>
                            {formatSubscriptionStatus(customer.subscriptionStatus)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-text-primary font-medium">{customer.tenureDisplay}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-text-primary font-semibold">${customer.lifetimeValue.toLocaleString()}</div>
                        </td>
                        <td className="py-4 px-6">
                          <ChurnRiskBadge score={Math.round(customer.churnRiskScore)} />
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(customer.activityStatus)}`}>
                            {customer.activityStatus}
                          </span>
                        </td>
                        <CompanyAuthorization
                          policyCheck={canEditCustomers}
                          forbiddenFallback={<td className="py-4 px-6"></td>}
                        >
                          <td className="py-4 px-6">
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

