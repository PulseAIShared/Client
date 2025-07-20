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

  console.log(importHistory);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-success-bg text-success border-success/30';
      case 'Failed':
        return 'bg-error-bg text-error border-error/30';
      case 'Processing':
        return 'bg-info-bg text-info border-info/30';
      case 'Validating':
        return 'bg-warning-bg text-warning border-warning/30';
      case 'Cancelled':
        return 'bg-surface-secondary text-text-muted border-border-primary';
      default:
        return 'bg-surface-secondary text-text-muted border-border-primary';
    }
  };

  const handleImportClick = (importId: string) => {
    navigate(`/app/imports/${importId}`);
  };

  console.log(importHistory);
  return (
    <div className="fixed inset-0 bg-bg-primary/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-surface-primary/95 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-border-primary shadow-2xl w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl h-[95vh] sm:h-auto sm:min-h-[500px] sm:max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-border-primary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          {isLoading ? (
            <div className="space-y-3 sm:space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-20 sm:h-16 bg-surface-secondary rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : importHistory && importHistory.items.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {importHistory.items.map((job) => (
                <div 
                  key={job.id}
                  className="bg-surface-secondary/30 p-4 rounded-xl border border-border-primary hover:bg-surface-secondary/50 hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => handleImportClick(job.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2" >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-text-primary font-semibold truncate">{job.fileName}</h4>
                      <p className="text-xs sm:text-sm text-text-muted">
                        {new Date(job.createdAt).toLocaleDateString()} at{' '}
                        {new Date(job.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border self-start sm:self-center ${getStatusColor(ImportJobStatus[job.status])}`}>
                      {ImportJobStatus[job.status]}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-sm">
                    <div className="space-y-1">
                      <span className="text-text-muted text-xs">Total Records</span>
                      <div className="text-text-primary font-semibold">{job.totalRecords}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-text-muted text-xs">Successful</span>
                      <div className="text-success font-semibold">{job.successfulRecords}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-text-muted text-xs">Errors</span>
                      <div className="text-error font-semibold">{job.errorCount}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-text-muted text-xs">Completed</span>
                      <div className="text-text-primary font-semibold text-xs sm:text-sm">
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
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-text-primary font-semibold mb-2">No Import History</h3>
              <p className="text-text-muted text-sm">You haven't imported any customers yet.</p>
            </div>
          )}
          </div>
        </div>

        {/* Pagination */}
        {importHistory && importHistory.totalPages > 1 && (
          <div className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-6 border-t border-border-primary bg-surface-primary/95">
            <div className="text-xs sm:text-sm text-text-muted order-2 sm:order-1">
              Page {importHistory.page} of {importHistory.totalPages}
            </div>
            <div className="flex gap-2 order-1 sm:order-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="px-3 py-2 bg-surface-secondary text-text-primary rounded-lg hover:bg-surface-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= importHistory.totalPages}
                className="px-3 py-2 bg-surface-secondary text-text-primary rounded-lg hover:bg-surface-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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