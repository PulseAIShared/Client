import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  useActivatePlaybook,
  useDeletePlaybook,
  usePausePlaybook,
  useDuplicatePlaybook,
  useUnarchivePlaybook,
} from '@/features/playbooks/api/playbooks';
import { PlaybookStatus } from '@/types/playbooks';
import { useModal } from '@/app/modal-provider';
import { useNotifications } from '@/components/ui/notifications';

type Props = {
  id: string;
  status: PlaybookStatus | string;
};

export const PlaybookRowActions: React.FC<Props> = ({ id, status }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const navigate = useNavigate();
  const activate = useActivatePlaybook();
  const pause = usePausePlaybook();
  const unarchive = useUnarchivePlaybook();
  const del = useDeletePlaybook();
  const duplicate = useDuplicatePlaybook();
  const { openModal, closeModal } = useModal();
  const { addNotification } = useNotifications();

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const menuWidth = 192;
    const viewportPadding = 8;
    const left = Math.max(
      viewportPadding,
      Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - viewportPadding),
    );

    setMenuPosition({
      top: rect.bottom + 8,
      left,
    });
  }, []);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedTrigger = triggerRef.current?.contains(target) ?? false;
      const clickedMenu = menuPanelRef.current?.contains(target) ?? false;
      if (!clickedTrigger && !clickedMenu) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const isActive = String(status) === 'Active' || status === PlaybookStatus.Active;
  const isPaused = String(status) === 'Paused' || status === PlaybookStatus.Paused;
  const isDraft = String(status) === 'Draft' || status === PlaybookStatus.Draft;
  const isArchived = String(status) === 'Archived' || status === PlaybookStatus.Archived;

  useEffect(() => {
    if (!open) {
      return;
    }

    updateMenuPosition();
    const onViewportChange = () => updateMenuPosition();
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);

    return () => {
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange, true);
    };
  }, [open, updateMenuPosition]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen((previous) => {
      const next = !previous;
      if (next) {
        updateMenuPosition();
      }
      return next;
    });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/app/playbooks/${id}/edit`);
  };

  const handleActivate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await activate.mutateAsync(id);
    setOpen(false);
  };

  const handlePause = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await pause.mutateAsync(id);
    setOpen(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    const Confirm = () => (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-surface-secondary/90 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/50 shadow-xl max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Archive Playbook</h3>
          <p className="text-text-secondary mb-6">Are you sure you want to archive this playbook? You can re-activate later from the Archived list.</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-surface-primary/50 text-text-primary rounded-lg hover:bg-surface-primary transition-colors font-medium text-sm border border-border-primary/50"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                try {
                  await del.mutateAsync(id);
                  addNotification({ type: 'success', title: 'Playbook archived', message: 'The playbook was archived.' });
                } catch (err) {
                  addNotification({ type: 'error', title: 'Archive failed', message: err instanceof Error ? err.message : 'Failed to archive playbook' });
                } finally {
                  closeModal();
                }
              }}
              className="px-4 py-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-2 bg-red-500/80 text-white hover:bg-red-500"
            >
              Archive
            </button>
          </div>
        </div>
      </div>
    );
    openModal(<Confirm />);
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await duplicate.mutateAsync(id);
    setOpen(false);
  };

  const handleUnarchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await unarchive.mutateAsync(id);
      addNotification({
        type: 'success',
        title: 'Playbook restored',
        message: 'Playbook moved from Archived to Paused.',
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Restore failed',
        message: err instanceof Error ? err.message : 'Failed to restore playbook',
      });
    } finally {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        aria-label="Row actions"
        className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-surface-secondary/60 border border-border-primary/30 text-text-muted"
        onClick={handleToggle}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </button>
      {open && menuPosition &&
        createPortal(
          <div
            ref={menuPanelRef}
            className="fixed z-[120] min-w-48 rounded-md border border-border-primary/30 bg-surface-primary shadow-xl"
            style={{ top: menuPosition.top, left: menuPosition.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1 text-sm">
              <button className="w-full px-3 py-2 text-left hover:bg-surface-secondary/60" onClick={handleEdit}>
                Edit
              </button>
              <button className="w-full px-3 py-2 text-left hover:bg-surface-secondary/60" onClick={handleDuplicate}>
                Duplicate
              </button>
              {isActive && (
                <button className="w-full px-3 py-2 text-left hover:bg-surface-secondary/60" onClick={handlePause}>
                  Pause
                </button>
              )}
              {isPaused && (
                <button className="w-full px-3 py-2 text-left hover:bg-surface-secondary/60" onClick={handleActivate}>
                  Resume
                </button>
              )}
              {isDraft && (
                <button className="w-full px-3 py-2 text-left hover:bg-surface-secondary/60" onClick={handleActivate}>
                  Activate
                </button>
              )}
              {isArchived && (
                <button className="w-full px-3 py-2 text-left hover:bg-surface-secondary/60" onClick={handleUnarchive}>
                  Unarchive
                </button>
              )}
              {!isArchived && (
                <>
                  <div className="my-1 h-px bg-border-primary/20" />
                  <button
                    className="w-full px-3 py-2 text-left text-error hover:bg-error/10"
                    onClick={handleDelete}
                  >
                    Archive
                  </button>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
