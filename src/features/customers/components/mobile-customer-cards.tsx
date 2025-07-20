import React from 'react';
import { Link } from 'react-router-dom';
import { CustomerDisplayData } from '@/types/api';
import { getActivityColor, getRiskColor, getSubscriptionStatusColor } from '@/utils/customer-helpers';
import { CompanyAuthorization } from '@/lib/authorization';

interface MobileCustomerCardsProps {
  customers: CustomerDisplayData[];
  onCustomerClick?: (customerId: string) => void;
  selectedCustomers: Set<string>;
  onToggleSelection: (customerId: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onSingleDelete: (customer: CustomerDisplayData, event: React.MouseEvent<HTMLButtonElement>) => void;
  canEditCustomers: boolean;
}

export const MobileCustomerCards: React.FC<MobileCustomerCardsProps> = ({ 
  customers, 
  selectedCustomers,
  onToggleSelection,
  onSingleDelete,
  canEditCustomers
}) => {
  // LTV is already formatted as a string in CustomerDisplayData

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (customers.length === 0) {
    return (
      <div className="bg-surface-primary rounded-lg border border-border-primary p-8 text-center">
        <div className="w-16 h-16 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">No customers found</h3>
        <p className="text-text-muted">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {customers.map((customer) => (
        <div
          key={customer.id}
          className="bg-surface-primary border border-border-primary rounded-xl p-4 hover:border-accent-primary/50 hover:shadow-lg transition-all duration-200"
        >
          {/* Customer Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full flex items-center justify-center text-text-primary font-semibold text-sm flex-shrink-0">
                {customer.fullName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/app/customers/${customer.id}`}
                  className="text-text-primary font-semibold hover:text-accent-primary transition-colors block truncate text-base"
                >
                  {customer.fullName}
                </Link>
                <p className="text-text-muted text-sm truncate">{customer.email}</p>
              </div>
            </div>
            <div className="ml-3 flex flex-col items-end gap-1.5">
              <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRiskColor(customer.churnRiskScore)}`}>
                {customer.churnRiskScore}%
              </div>
              <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${getSubscriptionStatusColor(customer.subscriptionStatus)}`}>
                {customer.subscriptionStatus === 0 ? 'Active' : 
                 customer.subscriptionStatus === 1 ? 'Inactive' :
                 customer.subscriptionStatus === 2 ? 'Cancelled' :
                 customer.subscriptionStatus === 3 ? 'Past Due' :
                 customer.subscriptionStatus === 4 ? 'Paused' : 'Unknown'}
              </div>
            </div>
          </div>

          {/* Customer Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-text-muted text-xs">Plan</span>
              <p className="text-text-primary font-medium">{customer.plan}</p>
            </div>
            <div className="space-y-1">
              <span className="text-text-muted text-xs">LTV</span>
              <p className="text-text-primary font-medium">${customer.lifetimeValue}</p>
            </div>
            <div className="space-y-1">
              <span className="text-text-muted text-xs">Tenure</span>
              <p className="text-text-primary font-medium">{customer.tenureDisplay}</p>
            </div>
            <div className="space-y-1">
              <span className="text-text-muted text-xs">Activity</span>
              <p className={`font-medium text-xs ${getActivityColor(customer.activityStatus)}`}>
                {customer.activityStatus}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-border-primary">
            <Link
              to={`/app/customers/${customer.id}`}
              className="flex-1 bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary text-center py-2.5 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 min-h-[36px]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Details
            </Link>
            <CompanyAuthorization
              policyCheck={canEditCustomers}
              forbiddenFallback={null}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSingleDelete(customer, e as any);
                }}
                className="bg-error/10 hover:bg-error/20 text-error text-center py-2.5 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 min-h-[36px]"
                title="Delete customer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </CompanyAuthorization>
          </div>
        </div>
      ))}
    </div>
  );
};