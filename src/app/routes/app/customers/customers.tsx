// src/app/routes/app/customers/customers.tsx (updated for background import)
import React, { useState } from 'react';
import { ContentLayout } from '@/components/layouts';
import { CustomersTable } from '@/features/customers/components';
import { CustomerImportModal } from '@/features/customers/components/customer-import-modal';
import { useNotifications } from '@/components/ui/notifications';
import { useGetImportHistory } from '@/features/customers/api/import';

export const CustomersRoute = () => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportHistory, setShowImportHistory] = useState(false);
  const { addNotification } = useNotifications();
  
  // Get recent import history
  const { data: importHistory } = useGetImportHistory({ page: 1, pageSize: 5 });
console.log(importHistory);
  const handleImportStarted = () => {
    addNotification({
      type: 'info',
      title: 'Import job started',
      message: 'Your customer import is being processed. You will receive notifications as it progresses.'
    });
    
    // Optionally refresh the import history
    // refetch();
  };

  return (
    <ContentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-3xl"></div>
          
          <div className="relative bg-slate-800/50 backdrop-blur-lg p-6 rounded-2xl border border-slate-700/50 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-400/30 mb-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-purple-200">Customer Management</span>
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                  Customers Overview
                </h1>
                <p className="text-slate-300">
                  Monitor customer behavior, churn risk, and lifetime value
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowImportHistory(true)}
                  className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 transition-colors font-medium text-sm border border-slate-600/50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Import History
                </button>
                <button className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 transition-colors font-medium text-sm border border-slate-600/50">
                  Export Data
                </button>
                <button 
                  onClick={() => setShowImportModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Import Customers
                </button>
              </div>
            </div>
          </div>
        </div>

   

        {/* Customers Table */}
        <CustomersTable />

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

// Import History Modal Component
interface ImportHistoryModalProps {
  onClose: () => void;
}

const ImportHistoryModal: React.FC<ImportHistoryModalProps> = ({ onClose }) => {
  const [page, setPage] = useState(1);
  const { data: importHistory, isLoading } = useGetImportHistory({ page, pageSize: 10 });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Validating':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Cancelled':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800/95 backdrop-blur-lg rounded-2xl border border-slate-700/50 shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div>
            <h2 className="text-xl font-bold text-white">Import History</h2>
            <p className="text-sm text-slate-400">View your customer import jobs</p>
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
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-16 bg-slate-700 rounded animate-pulse"></div>
              ))}
            </div>
          ) : importHistory && importHistory.items.length > 0 ? (
            <div className="space-y-4">
              {importHistory.items.map((job) => (
                <div 
                  key={job.importJobId}
                  className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-white font-medium">{job.fileName}</h4>
                      <p className="text-sm text-slate-400">
                        {new Date(job.createdAt).toLocaleDateString()} at{' '}
                        {new Date(job.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Total Records:</span>
                      <div className="text-white font-medium">{job.totalRecords}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Successful:</span>
                      <div className="text-green-400 font-medium">{job.successfulRecords}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Errors:</span>
                      <div className="text-red-400 font-medium">{job.errorCount}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Completed:</span>
                      <div className="text-white font-medium">
                        {job.completedAt 
                          ? new Date(job.completedAt).toLocaleDateString()
                          : 'In Progress'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-2">No Import History</h3>
              <p className="text-slate-400">You haven't imported any customers yet.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {importHistory && importHistory.totalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t border-slate-700/50">
            <div className="text-sm text-slate-400">
              Page {importHistory.page} of {importHistory.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1 bg-slate-700/50 text-white rounded hover:bg-slate-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= importHistory.totalPages}
                className="px-3 py-1 bg-slate-700/50 text-white rounded hover:bg-slate-600/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};