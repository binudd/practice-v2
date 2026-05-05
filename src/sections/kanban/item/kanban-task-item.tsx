import type { IKanbanTask } from 'src/types/kanban';
import type { Theme, SxProps } from '@mui/material/styles';

import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';

import { imageClasses } from 'src/components/image';

import ItemBase from './item-base';

// ----------------------------------------------------------------------

type TaskItemProps = {
  disabled?: boolean;
  sx?: SxProps<Theme>;
  task: IKanbanTask;
  /** Parent-owned drawer highlights the active card while open */
  highlightOpen?: boolean;
  onOpen?: () => void;
};

export function KanbanTaskItem({
  task,
  disabled,
  sx,
  highlightOpen = false,
  onOpen,
}: TaskItemProps) {
  const { setNodeRef, listeners, isDragging, isSorting, transform, transition } = useSortable({
    id: task?.id,
  });

  const mounted = useMountStatus();

  const mountedWhileDragging = isDragging && !mounted;

  return (
    <ItemBase
      ref={disabled ? undefined : setNodeRef}
      task={task}
      onClick={onOpen}
      stateProps={{
        transform,
        listeners,
        transition,
        sorting: isSorting,
        dragging: isDragging,
        fadeIn: mountedWhileDragging,
      }}
      sx={{ ...(highlightOpen && { [`& .${imageClasses.root}`]: { opacity: 0.8 } }), ...sx }}
    />
  );
}

// ----------------------------------------------------------------------

function useMountStatus() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 500);

    return () => clearTimeout(timeout);
  }, []);

  return isMounted;
}
