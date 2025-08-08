import { useState, useEffect } from "react";
import { useGetImportHistory } from "../api/import";
import { useNavigate } from "react-router-dom";
import { useAuthorization } from '@/lib/authorization';
import { useNotifications } from '@/components/ui/notifications';
import { ImportJobStatus } from "@/types/api";

// Import History Modal Component
interface ImportHistoryModalProps {
  onClose: () => void;
}

export const ImportHistoryModal: React.FC<ImportHistoryModalProps> = ({ onClose }) => {
  const [page, setPage] = useState(1);
  const { data: importHistory, isLoading } = useGetImportHistory({ page, pageSize: 10 });
  const { checkCompanyPolicy } = useAuthorization();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  
  // Check if user has write permissions for customers
  const canViewImportHistory = checkCompanyPolicy('customers:write');
  
  // If user doesn't have permission, show error and close
  useEffect(() => {
    if (!canViewImportHistory) {
      addNotification({
        type: 'error',
        title: 'Access Denied',
        message: 'You need Staff or Owner permissions to view import history'
      });
      onClose();
    }
  }, [canViewImportHistory, addNotification, onClose]);
  
  // Don't render if user doesn't have permission
  if (!canViewImportHistory) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-success/20 text-success border-success/30';
      case 'Failed':
        return 'bg-error/20 text-error border-error/30';
      case 'Processing':
        return 'bg-info/20 text-info border-info/30';
      case 'Validating':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'Cancelled':
        return 'bg-surface-secondary/50 text-text-muted border-border-primary/30';
      default:
        return 'bg-surface-secondary/50 text-text-muted border-border-primary/30';
    }
  };

  const handleImportClick = (importId: string) => {
    navigate(`/app/imports/${importId}`);
  };

  return (
    <div className="fixed inset-0 bg-bg-primary/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-surface-primary/95 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-border-primary/30 shadow-2xl w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl h-[95vh] sm:h-auto sm:min-h-[500px] sm:max-h-[85vh] flex flex-col overflow-hidden">
        {/* Enhanced Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-border-primary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-text-primary">Import History</h2>
              <p className="text-xs sm:text-sm text-text-muted hidden sm:block">View your customer import jobs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary/50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Enhanced Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-20 sm:h-16 bg-surface-secondary/50 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : importHistory && importHistory.items.length > 0 ? (
            <div className="space-y-4">
              {importHistory.items.map((job) => (
                <div
                  key={job.id}
                  className="group bg-surface-primary/80 backdrop-blur-lg border border-border-primary/30 rounded-2xl p-4 hover:border-accent-primary/50 hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => handleImportClick(job.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
                          {job.fileName || `Import Job ${job.id}`}
                        </h3>
                        <p className="text-sm text-text-muted">
                          {new Date(job.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                      {job.status}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-text-muted">Total Records</span>
                      <p className="font-medium text-text-primary">{job.totalRecords || 0}</p>
                    </div>
                    <div>
                      <span className="text-text-muted">Processed</span>
                      <p className="font-medium text-text-primary">{job.processedRecords || 0}</p>
                    </div>
                    <div>
                      <span className="text-text-muted">Success</span>
                      <p className="font-medium text-success">{job.successfulRecords || 0}</p>
                    </div>
                    <div>
                      <span className="text-text-muted">Failed</span>
                      <p className="font-medium text-error">{job.failedRecords || 0}</p>
                    </div>
                  </div>
                  
                  {job.errorMessage && (
                    <div className="mt-3 p-3 bg-error/10 rounded-xl border border-error/30">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-error mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-sm text-error-muted">{job.errorMessage}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-surface-secondary/50 to-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">No import history</h3>
              <p className="text-text-muted">You haven't imported any customers yet.</p>
            </div>
          )}
          </div>
        </div>

        {/* Enhanced Footer */}
        {importHistory && importHistory.totalPages > 1 && (
          <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-t border-border-primary/30">
            <div className="text-sm text-text-muted">
              Page {page} of {importHistory.totalPages} ({importHistory.totalCount} total imports)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === importHistory.totalPages}
                className="px-3 py-1 bg-surface-secondary/50 text-text-primary rounded-lg hover:bg-surface-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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