import type { IKanbanTask } from 'src/types/kanban';

import { useState, useCallback } from 'react';

import Paper from '@mui/material/Paper';
import FormHelperText from '@mui/material/FormHelperText';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import InputBase, { inputBaseClasses } from '@mui/material/InputBase';

import { stylesMode } from 'src/theme/styles';
import { buildNewKanbanTask } from 'src/domain/kanban/new-task-defaults';

// ----------------------------------------------------------------------

type Props = {
  status: string;
  reporter: IKanbanTask['reporter'];
  openAddTask: boolean;
  onCloseAddTask: () => void;
  onAddTask: (task: IKanbanTask) => void;
};

export function KanbanTaskAdd({
  status,
  reporter,
  openAddTask,
  onAddTask,
  onCloseAddTask,
}: Props) {
  const [taskName, setTaskName] = useState('');

  const handleChangeName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setTaskName(event.target.value);
  }, []);

  const handleKeyUpAddTask = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        const trimmed = taskName.trim();
        onAddTask({
          ...buildNewKanbanTask({ status, reporter }),
          name: trimmed || 'Untitled',
        });
        setTaskName('');
      }
    },
    [onAddTask, reporter, status, taskName]
  );

  const handleCancel = useCallback(() => {
    setTaskName('');
    onCloseAddTask();
  }, [onCloseAddTask]);

  if (!openAddTask) {
    return null;
  }

  return (
    <ClickAwayListener onClickAway={handleCancel}>
      <div>
        <Paper
          sx={{
            borderRadius: 1.5,
            bgcolor: 'background.subtle',
            border: (theme) => `1px solid ${theme.vars.palette.divider}`,
            [stylesMode.dark]: { bgcolor: 'background.default' },
          }}
        >
          <InputBase
            autoFocus
            fullWidth
            placeholder="Untitled"
            value={taskName}
            onChange={handleChangeName}
            onKeyUp={handleKeyUpAddTask}
            sx={{
              px: 2,
              height: 56,
              [`& .${inputBaseClasses.input}`]: { p: 0, typography: 'subtitle2' },
            }}
          />
        </Paper>

        <FormHelperText sx={{ mx: 1 }}>Press Enter to create the task.</FormHelperText>
      </div>
    </ClickAwayListener>
  );
}
