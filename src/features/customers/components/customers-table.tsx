// src/features/customers/components/customers-table.tsx - Complete with delete functionality
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCustomers } from '@/features/customers/api/customers';

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
    <div className="flex-1 bg-slate-700/50 rounded-full h-2 overflow-hidden max-w-[80px]">
      <div 
        className={`h-full rounded-full transition-all duration-500 ${
          risk >= 80 ? 'bg-gradient-to-r from-red-500 to-red-600' :
          risk >= 60 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
          risk >= 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
          'bg-gradient-to-r from-green-500 to-green-600'
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
      className={`w-4 h-4 transition-colors ${queryParams.sortBy === field ? 'text-blue-400' : 'text-slate-500'}`}
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
        <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg animate-pulse">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 h-12 bg-slate-700 rounded"></div>
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-10 w-24 bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 shadow-lg animate-pulse">
          <div className="p-6 border-b border-slate-700/50">
            <div className="h-6 bg-slate-700 rounded w-48"></div>
          </div>
          <div className="p-6">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="h-16 bg-slate-700 rounded mb-2"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 shadow-lg">
        <div className="p-12 text-center">
          <div className="text-red-400 mb-2">Failed to load customers</div>
          <div className="text-sm text-slate-500">Please try refreshing the page</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 pl-10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
            <svg className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'All Customers', count: filterCounts.all },
              { key: 'active', label: 'Active', count: filterCounts.active },
              { key: 'high-risk', label: 'High Risk', count: filterCounts['high-risk'] },
              { key: 'payment-issues', label: 'Payment Issues', count: filterCounts['payment-issues'] },
              { key: 'cancelled', label: 'Cancelled', count: filterCounts.cancelled }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => handleFilterChange(filter.key)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  selectedFilter === filter.key
                    ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-400 border border-blue-500/30'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-white">
                Customers ({pagination?.totalCount || 0})
              </h2>
              {selectedCustomers.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">
                    {selectedCustomers.size} selected
                  </span>
                  <button 
                    onClick={handleBulkDelete}
                    className="px-3 py-1 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm border border-red-500/30 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Selected
                  </button>
                  <button className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm border border-blue-500/30">
                    Export Selected
                  </button>
                </div>
              )}
            </div>
            <div className="text-sm text-slate-400">
              Page {pagination?.page || 1} of {pagination?.totalPages || 1}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left p-4">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.size === customers.length && customers.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </th>
                <th 
                  className="text-left p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-300 uppercase tracking-wider">
                    Customer
                    <SortIcon field="name" />
                  </div>
                </th>
                <th 
                  className="text-left p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
                  onClick={() => handleSort('plan')}
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-300 uppercase tracking-wider">
                    Plan & Status
                    <SortIcon field="plan" />
                  </div>
                </th>
                <th 
                  className="text-left p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
                  onClick={() => handleSort('monthsSubbed')}
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-300 uppercase tracking-wider">
                    Tenure
                    <SortIcon field="monthsSubbed" />
                  </div>
                </th>
                <th 
                  className="text-left p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
                  onClick={() => handleSort('ltv')}
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-300 uppercase tracking-wider">
                    LTV
                    <SortIcon field="ltv" />
                  </div>
                </th>
                <th 
                  className="text-left p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
                  onClick={() => handleSort('churnRisk')}
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-300 uppercase tracking-wider">
                    Churn Risk
                    <SortIcon field="churnRisk" />
                  </div>
                </th>
                <th 
                  className="text-left p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
                  onClick={() => handleSort('activityFrequency')}
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-300 uppercase tracking-wider">
                    Activity
                    <SortIcon field="activityFrequency" />
                  </div>
                </th>
                <th className="text-left p-4">
                  <span className="text-sm font-medium text-slate-300 uppercase tracking-wider">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr 
                  key={customer.id} 
                  className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-all duration-200 group"
                >
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedCustomers.has(customer.id)}
                      onChange={(e) => toggleCustomerSelection(customer.id, e)}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </td>
                  <td 
                    className="p-4 cursor-pointer"
                    onClick={() => handleCustomerClick(customer.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-white group-hover:text-blue-400 transition-colors">
                          {customer.name}
                        </div>
                        <div className="text-sm text-slate-400">{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td 
                    className="p-4 cursor-pointer"
                    onClick={() => handleCustomerClick(customer.id)}
                  >
                    <div className="space-y-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        customer.planEnum === SubscriptionPlan.Enterprise 
                          ? 'text-purple-400 bg-purple-500/20 border-purple-500/30'
                          : customer.planEnum === SubscriptionPlan.Pro
                          ? 'text-blue-400 bg-blue-500/20 border-blue-500/30'
                          : 'text-green-400 bg-green-500/20 border-green-500/30'
                      }`}>
                        {customer.plan}
                      </span>
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSubscriptionStatusColor(customer.subscriptionStatus)}`}>
                          {formatSubscriptionStatus(customer.subscriptionStatus)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td 
                    className="p-4 cursor-pointer"
                    onClick={() => handleCustomerClick(customer.id)}
                  >
                    <span className="text-white font-medium">{customer.monthsSubbed}mo</span>
                  </td>
                  <td 
                    className="p-4 cursor-pointer"
                    onClick={() => handleCustomerClick(customer.id)}
                  >
                    <span className="text-green-400 font-semibold">{customer.ltv}</span>
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
                        className="p-2 text-blue-400 hover:bg-blue-600/20 rounded-lg transition-colors border border-blue-500/30"
                        title="View Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button 
                        onClick={(e) => handleSingleDelete(customer, e)}
                        className="p-2 text-red-400 hover:bg-red-600/20 rounded-lg transition-colors border border-red-500/30"
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

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t border-slate-700/50">
            <div className="text-sm text-slate-400">
              Showing {((pagination.page - 1) * pagination.pageSize) + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount} customers
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPreviousPage}
                className="px-3 py-1 bg-slate-700/50 text-white rounded hover:bg-slate-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
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
                className="px-3 py-1 bg-slate-700/50 text-white rounded hover:bg-slate-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {customers.length === 0 && !isLoading && (
          <div className="p-12 text-center">
            <div className="text-slate-400 mb-2">No customers found</div>
            <div className="text-sm text-slate-500">Try adjusting your search or filter criteria</div>
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