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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface-primary/95 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-2xl max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-error/20 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Delete Segment</h3>
            <p className="text-sm text-text-muted">This action cannot be undone</p>
          </div>
        </div>
        
        <p className="text-text-secondary mb-6">
          Are you sure you want to delete <strong>"{segmentName}"</strong>? This will permanently remove the segment and all its associated data.
        </p>
        
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-border-primary/50 hover:border-border-primary/60"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleteSegmentMutation.isPending}
            className="flex-1 bg-error hover:bg-error/90 text-white"
          >
            {deleteSegmentMutation.isPending ? 'Deleting...' : 'Delete Segment'}
          </Button>
        </div>
      </div>
    </div>
  );
};