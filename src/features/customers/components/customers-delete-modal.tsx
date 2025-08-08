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
        <div className="bg-surface-primary/95 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-border-primary/30 shadow-2xl w-full max-w-sm sm:max-w-lg md:max-w-2xl h-[95vh] sm:h-auto sm:min-h-[400px] sm:max-h-[85vh] flex flex-col overflow-hidden">
          {/* Enhanced Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-border-primary/30">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
                deletionResults.failed === 0 
                  ? 'bg-success/20' 
                  : deletionResults.successfullyDeleted === 0 
                  ? 'bg-error/20' 
                  : 'bg-warning/20'
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
              className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary/50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Enhanced Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-6">
              {/* Results Summary */}
              <div className="bg-surface-secondary/30 rounded-2xl p-6 border border-border-primary/30">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-2xl font-bold text-success">{deletionResults.successfullyDeleted}</div>
                    <div className="text-sm text-text-muted">Successfully Deleted</div>
                  </div>
                  
                  {deletionResults.failed > 0 && (
                    <div className="text-center">
                      <div className="w-12 h-12 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div className="text-2xl font-bold text-error">{deletionResults.failed}</div>
                      <div className="text-sm text-text-muted">Failed</div>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-info/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-2xl font-bold text-info">{customerCount}</div>
                    <div className="text-sm text-text-muted">Total Requested</div>
                  </div>
                </div>
              </div>

              {/* Detailed Message */}
              <div className="bg-surface-secondary/30 rounded-2xl p-6 border border-border-primary/30">
                <h3 className="font-semibold text-text-primary mb-3">Details</h3>
                <p className="text-text-muted text-sm leading-relaxed">{deletionResults.message}</p>
              </div>

              {/* Action Items */}
              {deletionResults.failed > 0 && (
                <div className="bg-warning/10 rounded-2xl p-6 border border-warning/30">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-warning mb-2">Some deletions failed</h4>
                      <p className="text-sm text-text-muted">
                        {deletionResults.failed} customer{deletionResults.failed !== 1 ? 's' : ''} could not be deleted. 
                        This may be due to existing dependencies or permissions. Please check the customer details and try again.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {deletionResults.successfullyDeleted > 0 && (
                <div className="bg-success/10 rounded-2xl p-6 border border-success/30">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-success mb-2">Successfully deleted</h4>
                      <p className="text-sm text-text-muted">
                        {deletionResults.successfullyDeleted} customer{deletionResults.successfullyDeleted !== 1 ? 's' : ''} 
                        {deletionResults.successfullyDeleted === 1 ? ' has' : ' have'} been permanently removed from your system.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="flex-shrink-0 flex items-center justify-center p-4 sm:p-6 border-t border-border-primary/30">
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg hover:shadow-lg hover:shadow-accent-secondary/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-bg-primary/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-surface-primary/95 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-border-primary/30 shadow-2xl w-full max-w-sm sm:max-w-lg md:max-w-2xl h-[95vh] sm:h-auto sm:min-h-[400px] sm:max-h-[85vh] flex flex-col overflow-hidden">
        {/* Enhanced Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-border-primary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-error/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-text-primary">
                Delete Customer{isMultiple ? 's' : ''}
              </h2>
              <p className="text-xs sm:text-sm text-text-muted">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary/50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Enhanced Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-6">
            {/* Warning Message */}
            <div className="bg-error/10 rounded-2xl p-6 border border-error/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-error/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-error mb-2">Permanent Deletion</h4>
                  <p className="text-sm text-text-muted">
                    You are about to permanently delete {customerCount} customer{customerCount !== 1 ? 's' : ''}. 
                    This action cannot be undone and will remove all associated data including:
                  </p>
                  <ul className="text-sm text-text-muted mt-2 space-y-1">
                    <li>• Customer profile and contact information</li>
                    <li>• Purchase history and transaction records</li>
                    <li>• Activity logs and interaction data</li>
                    <li>• Associated analytics and insights</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Customer List */}
            <div className="bg-surface-secondary/30 rounded-2xl p-6 border border-border-primary/30">
              <h3 className="font-semibold text-text-primary mb-4">
                Customer{customerCount !== 1 ? 's' : ''} to be deleted ({customerCount})
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {customers.map((customer) => (
                  <div key={customer.id} className="flex items-center gap-3 p-3 bg-surface-primary/50 rounded-xl border border-border-primary/30">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {customer.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-text-primary truncate">{customer.fullName}</div>
                      <div className="text-sm text-text-muted truncate">{customer.email}</div>
                    </div>
                    <div className="text-sm text-text-muted">
                      {customer.plan}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6 border-t border-border-primary/30">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          
          <button
            onClick={handleConfirmDelete}
            disabled={deleteCustomers.isPending}
            className="px-6 py-2 bg-gradient-to-r from-error to-error-muted text-white rounded-lg hover:shadow-lg hover:shadow-error/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleteCustomers.isPending ? (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </div>
            ) : (
              `Delete ${customerCount} Customer${customerCount !== 1 ? 's' : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};