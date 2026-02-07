import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PlaybookListItem, SegmentListItem } from '@/types/api';

type CustomerActionsMenuProps = {
  customerId: string;
  customerName: string;
  segments: SegmentListItem[];
  playbooks: PlaybookListItem[];
  onViewDetails: (customerId: string) => void;
  onAddToSegment: (customerIds: string[], segmentId: string) => void;
  onTriggerPlaybook: (customerIds: string[], playbookId: string) => void;
  onAddToWorkQueue: (customerIds: string[]) => void;
  onDeleteCustomer: (customerId: string) => void;
};

export const CustomerActionsMenu = ({
  customerId,
  customerName,
  segments,
  playbooks,
  onViewDetails,
  onAddToSegment,
  onTriggerPlaybook,
  onAddToWorkQueue,
  onDeleteCustomer,
}: CustomerActionsMenuProps) => {
  const [segmentId, setSegmentId] = useState('');
  const [playbookId, setPlaybookId] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const menuWidth = 240;
    const estimatedMenuHeight = 320;
    const viewportPadding = 8;

    const left = Math.max(
      viewportPadding,
      Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - viewportPadding),
    );

    const preferredTop = rect.bottom + 8;
    const top = preferredTop + estimatedMenuHeight > window.innerHeight - viewportPadding
      ? Math.max(viewportPadding, rect.top - estimatedMenuHeight - 8)
      : preferredTop;

    setMenuPosition({ top, left });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    updateMenuPosition();

    const onViewportChange = () => updateMenuPosition();
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedTrigger = triggerRef.current?.contains(target) ?? false;
      const clickedMenu = menuPanelRef.current?.contains(target) ?? false;
      if (!clickedTrigger && !clickedMenu) {
        closeMenu();
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onEscape);

    return () => {
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange, true);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onEscape);
    };
  }, [closeMenu, isOpen, updateMenuPosition]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((previous) => {
            const next = !previous;
            if (next) {
              updateMenuPosition();
            }
            return next;
          });
        }}
        className="rounded-md p-2 text-text-muted hover:bg-surface-secondary/50 hover:text-text-primary"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Customer actions"
      >
        <span className="text-lg leading-none">...</span>
      </button>

      {isOpen && menuPosition &&
        createPortal(
          <div
            ref={menuPanelRef}
            className="fixed z-[130] w-60 rounded-lg border border-border-primary/40 bg-surface-primary p-3 shadow-xl"
            style={{ top: menuPosition.top, left: menuPosition.left }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-2 text-xs font-semibold text-text-muted">
              {customerName}
            </div>

            <button
              className="mb-2 w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface-secondary/60"
              onClick={() => {
                onViewDetails(customerId);
                closeMenu();
              }}
            >
              View Details
            </button>

            <div className="mb-2 space-y-1">
              <div className="text-xs text-text-muted">Add to Segment</div>
              <div className="flex gap-1">
                <select
                  value={segmentId}
                  onChange={(event) => setSegmentId(event.target.value)}
                  className="h-8 flex-1 rounded border border-border-primary/40 bg-surface-secondary/50 px-2 text-xs"
                >
                  <option value="">Select</option>
                  {segments.map((segment) => (
                    <option key={segment.id} value={segment.id}>
                      {segment.name}
                    </option>
                  ))}
                </select>
                <button
                  className="h-8 rounded bg-accent-primary/15 px-2 text-xs text-accent-primary disabled:opacity-50"
                  disabled={!segmentId}
                  onClick={() => {
                    onAddToSegment([customerId], segmentId);
                    setSegmentId('');
                    closeMenu();
                  }}
                >
                  Add
                </button>
              </div>
            </div>

            <div className="mb-2 space-y-1">
              <div className="text-xs text-text-muted">Trigger Playbook</div>
              <div className="flex gap-1">
                <select
                  value={playbookId}
                  onChange={(event) => setPlaybookId(event.target.value)}
                  className="h-8 flex-1 rounded border border-border-primary/40 bg-surface-secondary/50 px-2 text-xs"
                >
                  <option value="">Select</option>
                  {playbooks.map((playbook) => (
                    <option key={playbook.id} value={playbook.id}>
                      {playbook.name}
                    </option>
                  ))}
                </select>
                <button
                  className="h-8 rounded bg-warning/15 px-2 text-xs text-warning disabled:opacity-50"
                  disabled={!playbookId}
                  onClick={() => {
                    onTriggerPlaybook([customerId], playbookId);
                    setPlaybookId('');
                    closeMenu();
                  }}
                >
                  Run
                </button>
              </div>
            </div>

            <button
              className="mb-2 w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface-secondary/60"
              onClick={() => {
                onAddToWorkQueue([customerId]);
                closeMenu();
              }}
            >
              Create Work Queue Item
            </button>

            <div className="my-2 h-px bg-border-primary/50" />

            <button
              className="w-full rounded-md px-2 py-1.5 text-left text-sm text-error hover:bg-error/10"
              onClick={() => {
                onDeleteCustomer(customerId);
                closeMenu();
              }}
            >
              Delete Customer
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
};
