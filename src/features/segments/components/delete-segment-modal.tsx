import React from 'react';
import { Button } from '@/components/ui/button';
import { useDeleteSegment } from '@/features/segments/api/segments';
import { useNotifications } from '@/components/ui/notifications';
import { useQueryClient } from '@tanstack/react-query';

interface DeleteSegmentModalProps {
  segmentId: string;
  segmentName: string;
  onClose: () => void;
}

export const DeleteSegmentModal: React.FC<DeleteSegmentModalProps> = ({
  segmentId,
  segmentName,
  onClose
}) => {
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();

  const deleteSegmentMutation = useDeleteSegment({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Segment Deleted',
          message: `"${segmentName}" has been deleted successfully.`
        });
        queryClient.invalidateQueries({ queryKey: ['segments'] });
        queryClient.invalidateQueries({ queryKey: ['segments', 'performance'] });
        onClose();
      },
      onError: (error) => {
        console.error('Failed to delete segment:', error);
        addNotification({
          type: 'error',
          title: 'Failed to Delete Segment',
          message: 'There was an error deleting the segment. Please try again.'
        });
      }
    }
  });

  const handleDelete = () => {
    deleteSegmentMutation.mutate({ segmentId });
  };

  return (
    <div className="fixed inset-0 bg-bg-primary/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface-primary/95 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-border-primary/30 shadow-2xl max-w-md w-full">
        {/* Enhanced Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-error/20 to-error-muted/20 rounded-2xl flex items-center justify-center">
            <svg className="w-6 h-6 text-error-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-text-primary">Delete Segment</h3>
            <p className="text-sm text-text-muted">This action cannot be undone</p>
          </div>
        </div>
        
        {/* Enhanced Warning Message */}
        <div className="bg-error/10 rounded-2xl p-4 border border-error/30 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-error/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-error mb-1">Permanent Deletion</h4>
              <p className="text-sm text-text-muted">
                Are you sure you want to delete <strong className="text-text-primary">"{segmentName}"</strong>? This will permanently remove the segment and all its associated data including:
              </p>
              <ul className="text-sm text-text-muted mt-2 space-y-1">
                <li>• Segment criteria and configuration</li>
                <li>• Associated customer data</li>
                <li>• Performance analytics</li>
                <li>• Playbook history</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Enhanced Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 px-6 py-3 bg-surface-secondary/50 text-text-primary rounded-xl hover:bg-surface-secondary/80 border border-border-primary/30 hover:border-border-secondary transition-all duration-200 font-medium"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleteSegmentMutation.isPending}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-error to-error-muted text-white rounded-xl hover:shadow-lg hover:shadow-error/25 transform hover:-translate-y-0.5 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {deleteSegmentMutation.isPending ? (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </div>
            ) : (
              'Delete Segment'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
