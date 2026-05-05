import type { IKanbanTask, IKanbanSubtask } from 'src/types/kanban';

import dayjs from 'dayjs';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { AssigneePickerStrip } from 'src/components/assignee-picker-strip';
import { useDateRangePicker, CustomDateRangePicker } from 'src/components/custom-date-range-picker';

import { KanbanDetailsToolbar } from './kanban-details-toolbar';
import { KanbanInputName } from '../components/kanban-input-name';
import { KanbanDetailsPriority } from './kanban-details-priority';
import { KanbanSubtaskAddDialog } from './kanban-subtask-add-form';
import { KanbanDetailsAttachments } from './kanban-details-attachments';
import { KanbanDetailsCommentList } from './kanban-details-comment-list';
import { KanbanDetailsCommentInput } from './kanban-details-comment-input';
import { KanbanContactsDialog } from '../components/kanban-contacts-dialog';
import { kanbanAssigneeFromContactId } from '../kanban-assignee-field-options';

// ----------------------------------------------------------------------

const StyledLabel = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  width: 100,
  flexShrink: 0,
  color: theme.vars.palette.text.secondary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

// ----------------------------------------------------------------------

type Props = {
  task: IKanbanTask;
  openDetails: boolean;
  onDeleteTask: () => void;
  onCloseDetails: () => void;
  onUpdateTask: (updateTask: IKanbanTask) => void;
};

export function KanbanDetails({
  task,
  openDetails,
  onUpdateTask,
  onDeleteTask,
  onCloseDetails,
}: Props) {
  const tabs = useTabs('overview');

  const [priority, setPriority] = useState(task.priority);

  const [taskName, setTaskName] = useState(task.name);

  const like = useBoolean();

  const contacts = useBoolean();

  const addSubtaskDialog = useBoolean();

  const [taskDescription, setTaskDescription] = useState(task.description);

  const rangePicker = useDateRangePicker(dayjs(task.due[0]), dayjs(task.due[1]));

  const handleChangeTaskName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setTaskName(event.target.value);
  }, []);

  const handleUpdateTask = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      try {
        if (event.key === 'Enter') {
          if (taskName) {
            onUpdateTask({ ...task, name: taskName });
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    [onUpdateTask, task, taskName]
  );

  const handleChangeTaskDescription = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setTaskDescription(event.target.value);
  }, []);

  const handleChangePriority = useCallback((newValue: string) => {
    setPriority(newValue);
  }, []);

  const handleToggleAssignee = useCallback(
    (id: string) => {
      const idStr = String(id);
      const isOn = task.assignee.some((a) => String(a.id) === idStr);
      let next = task.assignee;
      if (isOn) {
        next = task.assignee.filter((a) => String(a.id) !== idStr);
      } else {
        const row = kanbanAssigneeFromContactId(idStr);
        if (!row) return;
        next = [...task.assignee, row];
      }
      onUpdateTask({ ...task, assignee: next });
    },
    [onUpdateTask, task]
  );

  const handleClickSubtaskComplete = useCallback(
    (subtaskId: string) => {
      const subtasks = task.subtasks ?? [];
      onUpdateTask({
        ...task,
        subtasks: subtasks.map((s) =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        ),
      });
    },
    [onUpdateTask, task]
  );

  const handleAddSubtask = useCallback(
    (subtask: IKanbanSubtask) => {
      const subtasks = task.subtasks ?? [];
      onUpdateTask({ ...task, subtasks: [...subtasks, subtask] });
    },
    [onUpdateTask, task]
  );

  const renderToolbar = (
    <KanbanDetailsToolbar
      liked={like.value}
      taskName={task.name}
      onLike={like.onToggle}
      onDelete={onDeleteTask}
      taskStatus={task.status}
      onCloseDetails={onCloseDetails}
    />
  );

  const renderTabs = (
    <CustomTabs
      value={tabs.value}
      onChange={tabs.onChange}
      variant="fullWidth"
      slotProps={{ tab: { px: 0 } }}
    >
      {[
        { value: 'overview', label: 'Overview' },
        { value: 'subTasks', label: 'Subtasks' },
        { value: 'comments', label: `Comments (${task.comments.length})` },
      ].map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} />
      ))}
    </CustomTabs>
  );

  const renderTabOverview = (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      {/* Task name */}
      <KanbanInputName
        placeholder="Task name"
        value={taskName}
        onChange={handleChangeTaskName}
        onKeyUp={handleUpdateTask}
        inputProps={{ id: `input-task-${taskName}` }}
      />

      {/* Reporter */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <StyledLabel>Reporter</StyledLabel>
        <Avatar alt={task.reporter.name} src={task.reporter.avatarUrl} />
      </Box>

      {/* Assignee */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <AssigneePickerStrip
          avatarUsers={task.assignee.map((u) => ({
            id: String(u.id),
            name: u.name,
            avatarUrl: u.avatarUrl,
          }))}
          onAddClick={contacts.onTrue}
        />
        <KanbanContactsDialog
          open={contacts.value}
          onClose={contacts.onFalse}
          selectedIds={task.assignee.map((a) => String(a.id))}
          onToggle={handleToggleAssignee}
        />
      </Box>

      {/* Label */}
      <Box sx={{ display: 'flex' }}>
        <StyledLabel sx={{ height: 24, lineHeight: '24px' }}>Labels</StyledLabel>

        {!!task.labels.length && (
          <Box sx={{ gap: 1, display: 'flex', flexWrap: 'wrap' }}>
            {task.labels.map((label) => (
              <Chip key={label} color="info" label={label} size="small" variant="soft" />
            ))}
          </Box>
        )}
      </Box>

      {/* Due date */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <StyledLabel> Due date </StyledLabel>

        {rangePicker.selected ? (
          <Button size="small" onClick={rangePicker.onOpen}>
            {rangePicker.shortLabel}
          </Button>
        ) : (
          <Tooltip title="Add due date">
            <IconButton
              onClick={rangePicker.onOpen}
              sx={{
                bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                border: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
              }}
            >
              <Iconify icon="mingcute:add-line" />
            </IconButton>
          </Tooltip>
        )}

        <CustomDateRangePicker
          variant="calendar"
          title="Choose due date"
          startDate={rangePicker.startDate}
          endDate={rangePicker.endDate}
          onChangeStartDate={rangePicker.onChangeStartDate}
          onChangeEndDate={rangePicker.onChangeEndDate}
          open={rangePicker.open}
          onClose={rangePicker.onClose}
          selected={rangePicker.selected}
          error={rangePicker.error}
        />
      </Box>

      {/* Priority */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <StyledLabel>Priority</StyledLabel>
        <KanbanDetailsPriority priority={priority} onChangePriority={handleChangePriority} />
      </Box>

      {/* Description */}
      <Box sx={{ display: 'flex' }}>
        <StyledLabel> Description </StyledLabel>
        <TextField
          fullWidth
          multiline
          size="small"
          minRows={4}
          value={taskDescription}
          onChange={handleChangeTaskDescription}
          InputProps={{ sx: { typography: 'body2' } }}
        />
      </Box>

      {/* Attachments */}
      <Box sx={{ display: 'flex' }}>
        <StyledLabel>Attachments</StyledLabel>
        <KanbanDetailsAttachments attachments={task.attachments} />
      </Box>
    </Box>
  );

  const subtasks = task.subtasks ?? [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;
  const totalSubtasks = subtasks.length;
  const progressPct = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const renderTabSubtasks = (
    <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
      <div>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {completedSubtasks} of {totalSubtasks}
        </Typography>

        <LinearProgress variant="determinate" value={progressPct} />
      </div>

      <FormGroup>
        {subtasks.map((item) => (
          <FormControlLabel
            key={item.id}
            control={
              <Checkbox
                disableRipple
                checked={item.completed}
                onChange={() => handleClickSubtaskComplete(item.id)}
              />
            }
            label={
              <Box>
                <Typography variant="subtitle2">{item.name}</Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {item.hoursEstimated}h · {item.assignee.map((a) => a.name).join(', ')}
                </Typography>
                {item.description ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    {item.description}
                  </Typography>
                ) : null}
              </Box>
            }
            sx={{ alignItems: 'flex-start', mb: 1 }}
          />
        ))}
      </FormGroup>

      <Button
        variant="outlined"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={addSubtaskDialog.onTrue}
        sx={{ alignSelf: 'flex-start' }}
      >
        Add subtask
      </Button>

      <KanbanSubtaskAddDialog
        key={String(task.id)}
        open={addSubtaskDialog.value}
        onClose={addSubtaskDialog.onFalse}
        onAdded={handleAddSubtask}
      />
    </Box>
  );

  const renderTabComments = (
    <>{!!task.comments.length && <KanbanDetailsCommentList comments={task.comments} />}</>
  );

  return (
    <Drawer
      open={openDetails}
      onClose={onCloseDetails}
      anchor="right"
      slotProps={{ backdrop: { invisible: true } }}
      PaperProps={{ sx: { width: { xs: 1, sm: 480 } } }}
    >
      {renderToolbar}

      {renderTabs}

      <Scrollbar fillContent sx={{ py: 3, px: 2.5 }}>
        {tabs.value === 'overview' && renderTabOverview}
        {tabs.value === 'subTasks' && renderTabSubtasks}
        {tabs.value === 'comments' && renderTabComments}
      </Scrollbar>

      {tabs.value === 'comments' && <KanbanDetailsCommentInput />}
    </Drawer>
  );
}
