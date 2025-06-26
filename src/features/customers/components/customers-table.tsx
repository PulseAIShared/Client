// src/features/customers/components/customers-table.tsx - Complete with delete functionality
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useMediaQuery } from '@mantine/hooks';
import { useGetCustomers } from '@/features/customers/api/customers';
import { MobileCustomerCards } from './mobile-customer-cards';

import { useNotifications } from '@/components/ui/notifications';
import { 
  SubscriptionStatus, 
  SubscriptionPlan, 
  PaymentStatus, 
  ChurnRiskLevel,
  CustomersQueryParams,
  formatSubscriptionStatus,
  CustomerDisplayData,
} from '@/types/api';
import { DeleteCustomersModal } from './customers-delete-modal';
import { getActivityColor, getRiskColor, getSubscriptionStatusColor } from '@/utils/customer-helpers';

type SortField = 'name' | 'monthsSubbed' | 'ltv' | 'churnRisk' | 'activityFrequency' | 'email' | 'plan';




const ChurnRiskBar: React.FC<{ risk: number }> = ({ risk }) => (
  <div className="flex items-center gap-3">
    <div className="flex-1 bg-surface-secondary rounded-full h-2 overflow-hidden max-w-[80px]">
      <div 
        className={`h-full rounded-full transition-all duration-500 ${
          risk >= 80 ? 'bg-gradient-to-r from-error to-error-muted' :
          risk >= 60 ? 'bg-gradient-to-r from-warning to-warning-muted' :
          risk >= 40 ? 'bg-gradient-to-r from-warning to-warning-muted' :
          'bg-gradient-to-r from-success to-success-muted'
        }`}
        style={{ width: `${risk}%` }}
      />
    </div>
    <span className={`text-sm font-semibold min-w-[3rem] px-2 py-1 rounded-full border text-center ${getRiskColor(risk)}`}>
      {risk}%
    </span>
  </div>
);

export const CustomersTable: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
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

  const { data, isLoading, error } = useGetCustomers(queryParams);
  const customers = useMemo(() => data?.customers || [], [data]);
  const pagination = data?.pagination;

  const handleSort = (field: SortField) => {
    const isCurrentField = queryParams.sortBy === field;
    setQueryParams(prev => ({
      ...prev,
      sortBy: field,
      sortDescending: isCurrentField ? !prev.sortDescending : true,
      page: 1,
    }));
  };

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setQueryParams(prev => ({
      ...prev,
      search: search || undefined,
      page: 1,
    }));
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

  const filterCounts = useMemo(() => ({
    all: pagination?.totalCount || 0,
    active: customers.filter(c => c.subscriptionStatus === SubscriptionStatus.Active).length,
    'high-risk': customers.filter(c => c.churnRisk >= 70).length,
    'payment-issues': customers.filter(c => c.paymentStatus === PaymentStatus.Failed).length,
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

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => (
    <svg 
      className={`w-4 h-4 transition-colors ${queryParams.sortBy === field ? 'text-accent-primary' : 'text-text-muted'}`}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d={queryParams.sortBy === field && !queryParams.sortDescending ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
      />
    </svg>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-surface-primary backdrop-blur-lg p-6 rounded-2xl border border-border-primary shadow-lg animate-pulse">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 h-12 bg-surface-secondary rounded"></div>
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
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
    );
  }

  if (error) {
    return (
      <div className="bg-surface-primary backdrop-blur-lg rounded-2xl border border-border-primary shadow-lg">
        <div className="p-12 text-center">
          <div className="text-error mb-2">Failed to load customers</div>
          <div className="text-sm text-text-muted">Please try refreshing the page</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-surface-primary backdrop-blur-lg p-6 rounded-2xl border border-border-primary shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-surface-secondary border border-border-primary rounded-lg px-4 py-3 pl-10 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 transition-all"
            />
            <svg className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className={`flex gap-2 ${isMobile ? 'overflow-x-auto pb-2' : 'flex-wrap'}`}>
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
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                  selectedFilter === filter.key
                    ? 'bg-gradient-to-r from-accent-primary/30 to-accent-secondary/30 text-accent-primary border border-accent-primary/30'
                    : 'bg-surface-secondary text-text-secondary hover:bg-surface-secondary/80 border border-border-primary'
                }`}
              >
                <span className="block sm:hidden">{filter.shortLabel} ({filter.count})</span>
                <span className="hidden sm:block">{filter.label} ({filter.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-surface-primary backdrop-blur-lg rounded-2xl border border-border-primary shadow-lg overflow-hidden">
        <div className="p-6 border-b border-border-primary">
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
                  <button 
                    onClick={handleBulkDelete}
                    className="px-3 py-1 bg-error/20 text-error rounded-lg hover:bg-error/30 transition-colors text-sm border border-error/30 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Selected
                  </button>
                  <button className="px-3 py-1 bg-info-bg text-info rounded-lg hover:bg-info-bg/80 transition-colors text-sm border border-info/30">
                    Export Selected
                  </button>
                </div>
              )}
            </div>
            <div className="text-sm text-text-muted">
              Page {pagination?.page || 1} of {pagination?.totalPages || 1}
            </div>
          </div>
        </div>

        {/* Mobile: Card Layout */}
        {isMobile ? (
          <MobileCustomerCards 
            customers={customers}
            onCustomerSelect={(customer) => navigate(`/app/customers/${customer.id}`)}
          />
        ) : (
          /* Desktop: Table Layout */
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead>
              <tr className="border-b border-border-primary">
                <th className="text-left p-4">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.size === customers.length && customers.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-accent-primary bg-surface-secondary border border-border-primary rounded focus:ring-accent-primary focus:ring-2"
                  />
                </th>
                <th 
                  className="text-left p-4 cursor-pointer hover:bg-surface-secondary/30 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-text-secondary uppercase tracking-wider">
                    Customer
                    <SortIcon field="name" />
                  </div>
                </th>
                <th 
                  className="text-left p-4 cursor-pointer hover:bg-surface-secondary/30 transition-colors"
                  onClick={() => handleSort('plan')}
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-text-secondary uppercase tracking-wider">
                    Plan
                    <SortIcon field="plan" />
                  </div>
                </th>
                <th className="text-left p-4">
                  <span className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                    Status
                  </span>
                </th>
                <th 
                  className="text-left p-4 cursor-pointer hover:bg-surface-secondary/30 transition-colors"
                  onClick={() => handleSort('monthsSubbed')}
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-text-secondary uppercase tracking-wider">
                    Tenure
                    <SortIcon field="monthsSubbed" />
                  </div>
                </th>
                <th 
                  className="text-left p-4 cursor-pointer hover:bg-surface-secondary/30 transition-colors"
                  onClick={() => handleSort('ltv')}
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-text-secondary uppercase tracking-wider">
                    LTV
                    <SortIcon field="ltv" />
                  </div>
                </th>
                <th 
                  className="text-left p-4 cursor-pointer hover:bg-surface-secondary/30 transition-colors"
                  onClick={() => handleSort('churnRisk')}
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-text-secondary uppercase tracking-wider">
                    Churn Risk
                    <SortIcon field="churnRisk" />
                  </div>
                </th>
                <th 
                  className="text-left p-4 cursor-pointer hover:bg-surface-secondary/30 transition-colors"
                  onClick={() => handleSort('activityFrequency')}
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-text-secondary uppercase tracking-wider">
                    Activity
                    <SortIcon field="activityFrequency" />
                  </div>
                </th>
                <th className="text-left p-4">
                  <span className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr 
                  key={customer.id} 
                  className="border-b border-border-primary/30 hover:bg-surface-secondary/20 transition-all duration-200 group"
                >
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedCustomers.has(customer.id)}
                      onChange={(e) => toggleCustomerSelection(customer.id, e)}
                      className="w-4 h-4 text-accent-primary bg-surface-secondary border border-border-primary rounded focus:ring-accent-primary focus:ring-2"
                    />
                  </td>
                  <td 
                    className="p-4 cursor-pointer"
                    onClick={() => handleCustomerClick(customer.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full flex items-center justify-center text-text-primary font-medium text-sm">
                        {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-text-primary group-hover:text-accent-primary transition-colors">
                          {customer.name}
                        </div>
                        <div className="text-sm text-text-muted">{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td 
                    className="p-4 cursor-pointer"
                    onClick={() => handleCustomerClick(customer.id)}
                  >
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      customer.planEnum === SubscriptionPlan.Enterprise 
                        ? 'text-accent-secondary bg-accent-secondary/20 border-accent-secondary/30'
                        : customer.planEnum === SubscriptionPlan.Pro
                        ? 'text-accent-primary bg-accent-primary/20 border-accent-primary/30'
                        : 'text-success bg-success/20 border-success/30'
                    }`}>
                      {customer.plan}
                    </span>
                  </td>
                  <td 
                    className="p-4 cursor-pointer"
                    onClick={() => handleCustomerClick(customer.id)}
                  >
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSubscriptionStatusColor(customer.subscriptionStatus)}`}>
                      {formatSubscriptionStatus(customer.subscriptionStatus)}
                    </span>
                  </td>
                  <td 
                    className="p-4 cursor-pointer"
                    onClick={() => handleCustomerClick(customer.id)}
                  >
                    <span className="text-text-primary font-medium">{customer.monthsSubbed}mo</span>
                  </td>
                  <td 
                    className="p-4 cursor-pointer"
                    onClick={() => handleCustomerClick(customer.id)}
                  >
                    <span className="text-success font-semibold">{customer.ltv}</span>
                  </td>
                  <td 
                    className="p-4 cursor-pointer"
                    onClick={() => handleCustomerClick(customer.id)}
                  >
                    <ChurnRiskBar risk={customer.churnRisk} />
                  </td>
                  <td 
                    className="p-4 cursor-pointer"
                    onClick={() => handleCustomerClick(customer.id)}
                  >
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getActivityColor(customer.activityFrequency)}`}>
                      {customer.activityFrequency}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCustomerClick(customer.id);
                        }}
                        className="p-2 text-accent-primary hover:bg-accent-primary/20 rounded-lg transition-colors border border-accent-primary/30"
                        title="View Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button 
                        onClick={(e) => handleSingleDelete(customer, e)}
                        className="p-2 text-error hover:bg-error/20 rounded-lg transition-colors border border-error/30"
                        title="Delete Customer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t border-border-primary">
            <div className="text-sm text-slate-400">
              Showing {((pagination.page - 1) * pagination.pageSize) + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount} customers
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPreviousPage}
                className="px-3 py-1 bg-surface-secondary text-text-primary rounded hover:bg-surface-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, pagination.page - 2) + i;
                  if (pageNum > pagination.totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded transition-colors ${
                        pageNum === pagination.page
                          ? 'bg-accent-primary text-text-primary'
                          : 'bg-surface-secondary text-text-secondary hover:bg-surface-secondary/80'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-1 bg-surface-secondary text-text-primary rounded hover:bg-surface-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {customers.length === 0 && !isLoading && (
          <div className="p-12 text-center">
            <div className="text-text-muted mb-2">No customers found</div>
            <div className="text-sm text-text-muted">Try adjusting your search or filter criteria</div>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <DeleteCustomersModal
          customers={customersToDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setCustomersToDelete([]);
          }}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};