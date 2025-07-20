// src/features/customers/components/delete-customers-modal.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDeleteCustomers, type DeleteCustomersResponse } from '@/features/customers/api/customers';
import { useAuthorization } from '@/lib/authorization';
import { useNotifications } from '@/components/ui/notifications';
import { CustomerDisplayData } from '@/types/api';

interface DeleteCustomersModalProps {
  customers: CustomerDisplayData[];
  onClose: () => void;
  onSuccess: (response: DeleteCustomersResponse) => void;
}

export const DeleteCustomersModal: React.FC<DeleteCustomersModalProps> = ({
  customers,
  onClose,
  onSuccess,
}) => {
  const [showResults, setShowResults] = useState(false);
  const [deletionResults, setDeletionResults] = useState<DeleteCustomersResponse | null>(null);
  const { checkCompanyPolicy } = useAuthorization();
  const { addNotification } = useNotifications();
  
  // Check if user has write permissions for customers
  const canDeleteCustomers = checkCompanyPolicy('customers:write');
  
  // If user doesn't have permission, show error and close
  React.useEffect(() => {
    if (!canDeleteCustomers) {
      addNotification({
        type: 'error',
        title: 'Access Denied',
        message: 'You need Staff or Owner permissions to delete customers'
      });
      onClose();
    }
  }, [canDeleteCustomers, addNotification, onClose]);
  
  // Don't render if user doesn't have permission
  if (!canDeleteCustomers) {
    return null;
  }

  const deleteCustomers = useDeleteCustomers({
    mutationConfig: {
      onSuccess: (response) => {
        setDeletionResults(response);
        setShowResults(true);
        onSuccess(response);
      },
      onError: (error) => {
        console.error('Delete customers failed:', error);
      }
    }
  });

  const handleConfirmDelete = () => {
    const customerIds = customers.map(customer => customer.id);
    deleteCustomers.mutate({ customerIds });
  };

  const handleClose = () => {
    onClose();
  };

  const customerCount = customers.length;
  const isMultiple = customerCount > 1;

  if (showResults && deletionResults) {
    return (
      <div className="fixed inset-0 bg-bg-primary/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
        <div className="bg-surface-primary/95 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-border-primary shadow-2xl w-full max-w-sm sm:max-w-lg md:max-w-2xl h-[95vh] sm:h-auto sm:min-h-[400px] sm:max-h-[85vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-border-primary">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
                deletionResults.failed === 0 
                  ? 'bg-success-bg' 
                  : deletionResults.successfullyDeleted === 0 
                  ? 'bg-error-bg' 
                  : 'bg-warning-bg'
              }`}>
                {deletionResults.failed === 0 ? (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : deletionResults.successfullyDeleted === 0 ? (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-text-primary">Deletion Results</h2>
                <p className="text-xs sm:text-sm text-text-muted hidden sm:block">{deletionResults.message}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Results Summary */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
              <div className="bg-surface-secondary/30 p-4 rounded-xl border border-border-primary text-center">
                <div className="text-xl sm:text-2xl font-bold text-text-primary">{deletionResults.totalRequested}</div>
                <div className="text-xs sm:text-sm text-text-muted">Total Requested</div>
              </div>
              <div className="bg-success-bg p-4 rounded-xl border border-success/30 text-center">
                <div className="text-xl sm:text-2xl font-bold text-success">{deletionResults.successfullyDeleted}</div>
                <div className="text-xs sm:text-sm text-success-muted">Successfully Deleted</div>
              </div>
              <div className="bg-error-bg p-4 rounded-xl border border-error/30 text-center">
                <div className="text-xl sm:text-2xl font-bold text-error">{deletionResults.failed}</div>
                <div className="text-xs sm:text-sm text-error-muted">Failed</div>
              </div>
            </div>

            {/* Error Details */}
            {deletionResults.errors.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-error">Deletion Errors</h3>
                <div className="max-h-40 sm:max-h-60 overflow-y-auto space-y-3">
                  {deletionResults.errors.map((error, index) => (
                    <div key={index} className="bg-error-bg p-3 sm:p-4 rounded-lg border border-error/30">
                      <div className="flex items-start gap-3">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-error mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <div className="text-error-muted font-medium truncate">{error.email}</div>
                          <div className="text-error text-xs sm:text-sm mt-1">{error.errorMessage}</div>
                          <div className="text-error text-xs mt-1 font-mono">ID: {error.customerId}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {deletionResults.hasMoreErrors && (
                  <div className="text-xs sm:text-sm text-warning text-center p-2 bg-warning-bg rounded-lg border border-warning/30">
                    More errors were encountered. Only the first 10 are shown.
                  </div>
                )}
              </div>
            )}

            {/* Success Message */}
            {deletionResults.failed === 0 && (
              <div className="bg-success-bg p-6 rounded-xl border border-success/30 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-success/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-success mb-2">All Customers Deleted Successfully</h4>
                <p className="text-success-muted text-sm">
                  {isMultiple 
                    ? `All ${deletionResults.successfullyDeleted} customers have been permanently removed from your system.`
                    : 'The customer has been permanently removed from your system.'
                  }
                </p>
              </div>
            )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 flex items-center justify-end p-4 sm:p-6 border-t border-border-primary bg-surface-primary/95">
            <Button
              onClick={handleClose}
              className="bg-gradient-to-r from-accent-primary to-accent-secondary hover:from-accent-primary/80 hover:to-accent-secondary/80 w-full sm:w-auto"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-bg-primary/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-surface-primary/95 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-border-primary shadow-2xl w-full max-w-sm sm:max-w-lg h-auto min-h-[300px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-border-primary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-error-bg rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-text-primary">
                Delete {isMultiple ? 'Customers' : 'Customer'}
              </h2>
              <p className="text-xs sm:text-sm text-text-muted">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <div className="bg-error-bg p-4 rounded-lg border border-error/30 mb-6">
              <div className="flex items-start gap-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-error mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="text-error font-medium mb-1">Warning: Permanent Deletion</h4>
                <p className="text-error-muted text-xs sm:text-sm">
                  {isMultiple 
                    ? `You are about to permanently delete ${customerCount} customers. This will remove all their data, subscription history, and cannot be undone.`
                    : `You are about to permanently delete this customer. This will remove all their data, subscription history, and cannot be undone.`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Customer List */}
          <div className="space-y-3 max-h-40 sm:max-h-60 overflow-y-auto">
            {customers.map((customer) => (
              <div key={customer.id} className="flex items-center gap-3 p-3 bg-surface-secondary/30 rounded-lg border border-border-primary">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full flex items-center justify-center text-text-primary font-medium text-xs sm:text-sm flex-shrink-0">
                  {customer.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-text-primary font-medium truncate">{customer.fullName}</div>
                  <div className="text-text-muted text-xs sm:text-sm truncate">{customer.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-text-primary text-xs sm:text-sm">{customer.plan}</div>
                  <div className="text-text-muted text-xs">${customer.lifetimeValue} LTV</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-surface-secondary/30 rounded-lg border border-border-primary">
            <h5 className="text-text-primary font-medium mb-2">What will be deleted:</h5>
            <ul className="text-xs sm:text-sm text-text-muted space-y-1">
              <li>• Customer profile and contact information</li>
              <li>• Subscription and payment history</li>
              <li>• Usage analytics and activity data</li>
              <li>• Support tickets and communication history</li>
              <li>• All associated metadata and custom fields</li>
            </ul>
          </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 sm:p-6 border-t border-border-primary bg-surface-primary/95">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border-primary hover:border-border-primary/70 order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            disabled={deleteCustomers.isPending || !canDeleteCustomers}
            isLoading={deleteCustomers.isPending}
            className="bg-error hover:bg-error/80 text-text-primary order-1 sm:order-2"
          >
            {deleteCustomers.isPending 
              ? 'Deleting...' 
              : `Delete ${isMultiple ? `${customerCount} Customers` : 'Customer'}`
            }
          </Button>
        </div>
      </div>
    </div>
  );
};