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
  onCustomerClick,
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

  return (
    <div className="space-y-3">
      {customers.map((customer) => (
        <div
          key={customer.id}
          className="bg-surface-secondary border border-border-primary rounded-lg p-4 hover:border-accent-primary/50 transition-all duration-200"
        >
          {/* Customer Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <Link
                to={`/app/customers/${customer.id}`}
                className="text-text-primary font-medium hover:text-accent-primary transition-colors block truncate"
              >
                {customer.fullName}
              </Link>
              <p className="text-text-muted text-sm truncate">{customer.email}</p>
            </div>
            <div className="ml-3 flex flex-col items-end gap-1">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(customer.churnRiskScore)}`}>
                {customer.churnRiskScore}%
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSubscriptionStatusColor(customer.subscriptionStatus)}`}>
                {customer.subscriptionStatus === 0 ? 'Active' : 
                 customer.subscriptionStatus === 1 ? 'Inactive' :
                 customer.subscriptionStatus === 2 ? 'Cancelled' :
                 customer.subscriptionStatus === 3 ? 'Past Due' :
                 customer.subscriptionStatus === 4 ? 'Paused' : 'Unknown'}
              </div>
            </div>
          </div>

          {/* Customer Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-text-muted">Plan:</span>
              <p className="text-text-primary font-medium">{customer.plan}</p>
            </div>
            <div>
              <span className="text-text-muted">LTV:</span>
              <p className="text-text-primary font-medium">${customer.lifetimeValue}</p>
            </div>
            <div>
              <span className="text-text-muted">Tenure:</span>
              <p className="text-text-primary font-medium">{customer.tenureDisplay}</p>
            </div>
            <div>
              <span className="text-text-muted">Activity:</span>
              <p className={`font-medium ${getActivityColor(customer.activityStatus)}`}>
                {customer.activityStatus}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-border-primary">
            <Link
              to={`/app/customers/${customer.id}`}
              className="flex-1 bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary text-center py-2 px-3 rounded-lg text-sm font-medium transition-colors"
            >
              View Details
            </Link>
            <CompanyAuthorization
              policyCheck={canEditCustomers}
              forbiddenFallback={null}
            >
              <button
                onClick={() => onCustomerClick?.(customer.id)}
                className="flex-1 bg-surface-tertiary hover:bg-surface-tertiary/80 text-text-secondary text-center py-2 px-3 rounded-lg text-sm font-medium transition-colors"
              >
                Actions
              </button>
            </CompanyAuthorization>
          </div>
        </div>
      ))}
    </div>
  );
};