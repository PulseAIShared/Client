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
                  key={job.id}
                  className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 hover:bg-slate-700/50 transition-colors"
                onClick={() => handleImportClick(job.id)}
                >
                  <div className="flex items-center justify-between mb-3" >
                    <div>
                      <h4 className="text-white font-medium">{job.fileName}</h4>
                      <p className="text-sm text-slate-400">
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