import { useState } from "react";
import { useGetImportHistory } from "../api/import";
import { useNavigate } from "react-router-dom";
import { ImportJobStatus } from "@/types/api";

// Import History Modal Component
interface ImportHistoryModalProps {
  onClose: () => void;
}

export const ImportHistoryModal: React.FC<ImportHistoryModalProps> = ({ onClose }) => {
  const [page, setPage] = useState(1);
  const { data: importHistory, isLoading } = useGetImportHistory({ page, pageSize: 10 });

  console.log(importHistory);
  const navigate = useNavigate();
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

  const handleImportClick = (importId: string) => {
    navigate(`/app/imports/${importId}`);
  };

  console.log(importHistory);
  return (
    <div className="fixed inset-0 bg-bg-primary/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface-primary/95 backdrop-blur-lg rounded-2xl border border-border-primary shadow-2xl w-full max-w-4xl h-[90vh] min-h-[500px] max-h-[800px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-border-primary">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Import History</h2>
            <p className="text-sm text-text-muted">View your customer import jobs</p>
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
          <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-16 bg-surface-secondary rounded animate-pulse"></div>
              ))}
            </div>
          ) : importHistory && importHistory.items.length > 0 ? (
            <div className="space-y-4">
              {importHistory.items.map((job) => (
                <div 
                  key={job.id}
                  className="bg-surface-secondary/30 p-4 rounded-lg border border-border-primary hover:bg-surface-secondary/50 transition-colors"
                onClick={() => handleImportClick(job.id)}
                >
                  <div className="flex items-center justify-between mb-3" >
                    <div>
                      <h4 className="text-text-primary font-medium">{job.fileName}</h4>
                      <p className="text-sm text-text-muted">
                        {new Date(job.createdAt).toLocaleDateString()} at{' '}
                        {new Date(job.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(ImportJobStatus[job.status])}`}>
                      {ImportJobStatus[job.status]}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-text-muted">Total Records:</span>
                      <div className="text-text-primary font-medium">{job.totalRecords}</div>
                    </div>
                    <div>
                      <span className="text-text-muted">Successful:</span>
                      <div className="text-success font-medium">{job.successfulRecords}</div>
                    </div>
                    <div>
                      <span className="text-text-muted">Errors:</span>
                      <div className="text-error font-medium">{job.errorCount}</div>
                    </div>
                    <div>
                      <span className="text-text-muted">Completed:</span>
                      <div className="text-text-primary font-medium">
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
              <div className="w-16 h-16 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-text-primary font-medium mb-2">No Import History</h3>
              <p className="text-text-muted">You haven't imported any customers yet.</p>
            </div>
          )}
          </div>
        </div>

        {/* Pagination */}
        {importHistory && importHistory.totalPages > 1 && (
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-t border-border-primary bg-surface-primary/95">
            <div className="text-sm text-text-muted">
              Page {importHistory.page} of {importHistory.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1 bg-surface-secondary text-text-primary rounded hover:bg-surface-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= importHistory.totalPages}
                className="px-3 py-1 bg-surface-secondary text-text-primary rounded hover:bg-surface-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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