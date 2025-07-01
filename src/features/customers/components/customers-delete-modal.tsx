// src/features/customers/components/delete-customers-modal.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDeleteCustomers, type DeleteCustomersResponse } from '@/features/customers/api/customers';
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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800/95 backdrop-blur-lg rounded-2xl border border-slate-700/50 shadow-2xl w-full max-w-2xl h-[85vh] min-h-[400px] max-h-[600px] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                deletionResults.failed === 0 
                  ? 'bg-green-500/20' 
                  : deletionResults.successfullyDeleted === 0 
                  ? 'bg-red-500/20' 
                  : 'bg-yellow-500/20'
              }`}>
                {deletionResults.failed === 0 ? (
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : deletionResults.successfullyDeleted === 0 ? (
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Deletion Results</h2>
                <p className="text-sm text-slate-400">{deletionResults.message}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Results Summary */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/50 text-center">
                <div className="text-2xl font-bold text-white">{deletionResults.totalRequested}</div>
                <div className="text-sm text-slate-400">Total Requested</div>
              </div>
              <div className="bg-green-600/20 p-4 rounded-xl border border-green-500/30 text-center">
                <div className="text-2xl font-bold text-green-400">{deletionResults.successfullyDeleted}</div>
                <div className="text-sm text-green-300">Successfully Deleted</div>
              </div>
              <div className="bg-red-600/20 p-4 rounded-xl border border-red-500/30 text-center">
                <div className="text-2xl font-bold text-red-400">{deletionResults.failed}</div>
                <div className="text-sm text-red-300">Failed</div>
              </div>
            </div>

            {/* Error Details */}
            {deletionResults.errors.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-red-400">Deletion Errors</h3>
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {deletionResults.errors.map((error, index) => (
                    <div key={index} className="bg-red-600/10 p-4 rounded-lg border border-red-500/30">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div className="flex-1">
                          <div className="text-red-300 font-medium">{error.email}</div>
                          <div className="text-red-400 text-sm mt-1">{error.errorMessage}</div>
                          <div className="text-red-500 text-xs mt-1 font-mono">ID: {error.customerId}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {deletionResults.hasMoreErrors && (
                  <div className="text-sm text-yellow-400 text-center p-2 bg-yellow-600/10 rounded-lg border border-yellow-500/30">
                    More errors were encountered. Only the first 10 are shown.
                  </div>
                )}
              </div>
            )}

            {/* Success Message */}
            {deletionResults.failed === 0 && (
              <div className="bg-green-600/20 p-6 rounded-xl border border-green-500/30 text-center">
                <div className="w-16 h-16 bg-green-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-green-400 mb-2">All Customers Deleted Successfully</h4>
                <p className="text-green-300">
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
          <div className="flex-shrink-0 flex items-center justify-end p-6 border-t border-slate-700/50 bg-slate-800/95">
            <Button
              onClick={handleClose}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800/95 backdrop-blur-lg rounded-2xl border border-slate-700/50 shadow-2xl w-full max-w-lg h-auto min-h-[300px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Delete {isMultiple ? 'Customers' : 'Customer'}
              </h2>
              <p className="text-sm text-slate-400">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="bg-red-600/10 p-4 rounded-lg border border-red-500/30 mb-6">
              <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="text-red-400 font-medium mb-1">Warning: Permanent Deletion</h4>
                <p className="text-red-300 text-sm">
                  {isMultiple 
                    ? `You are about to permanently delete ${customerCount} customers. This will remove all their data, subscription history, and cannot be undone.`
                    : `You are about to permanently delete this customer. This will remove all their data, subscription history, and cannot be undone.`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Customer List */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {customers.map((customer) => (
              <div key={customer.id} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {customer.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">{customer.fullName}</div>
                  <div className="text-slate-400 text-sm">{customer.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-300 text-sm">{customer.plan}</div>
                  <div className="text-slate-400 text-xs">${customer.lifetimeValue} LTV</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
            <h5 className="text-white font-medium mb-2">What will be deleted:</h5>
            <ul className="text-sm text-slate-400 space-y-1">
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
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-t border-slate-700/50 bg-slate-800/95">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-600/50 hover:border-slate-500/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            disabled={deleteCustomers.isPending}
            isLoading={deleteCustomers.isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
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