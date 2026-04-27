import type { ITimesheetEntry } from 'src/types/timesheet';

import dayjs from 'dayjs';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { buildTimesheetEntryId } from 'src/utils/timesheet-entry-id';

import { _projects } from 'src/_mock/_project';
import { toIsoDay } from 'src/_mock/_timesheet';
import { getTasksForProject } from 'src/_mock/_timesheet-tasks';
import { upsertEntry, deleteEntry } from 'src/actions/timesheet';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import { getRecentHourSuggestions } from './utils';

// ----------------------------------------------------------------------

export type LogTimeDrawerProps = {
  open: boolean;
  onClose: () => void;
  targetUserId: string;
  historyEntries: ITimesheetEntry[];
  weekDays: string[];
  defaultDate?: string;
  defaultProjectId?: string;
  defaultTaskId?: string;
  defaultTaskName?: string;
  editingEntry?: ITimesheetEntry | null;
};

export function LogTimeDrawer({
  open,
  onClose,
  targetUserId,
  historyEntries,
  weekDays,
  defaultDate,
  defaultProjectId,
  defaultTaskId,
  defaultTaskName,
  editingEntry,
}: LogTimeDrawerProps) {
  const [dateIso, setDateIso] = useState('');
  const [projectId, setProjectId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [hoursStr, setHoursStr] = useState('');
  const [note, setNote] = useState('');

  const taskOptions = useMemo(() => getTasksForProject(projectId), [projectId]);

  const suggestions = useMemo(
    () => getRecentHourSuggestions(historyEntries, { limit: 6 }),
    [historyEntries]
  );

  const resetFromProps = useCallback(() => {
    if (editingEntry) {
      setDateIso(editingEntry.date);
      setProjectId(editingEntry.projectId);
      setTaskId(editingEntry.taskId ?? '');
      setHoursStr(String(editingEntry.hours));
      setNote(editingEntry.note ?? '');
      return;
    }
    const d = defaultDate ?? weekDays[0] ?? toIsoDay(new Date());
    setDateIso(d);
    const proj = defaultProjectId ?? _projects[0]?.id ?? '';
    setProjectId(proj);
    const tasks = getTasksForProject(proj);
    let tid = '';
    if (defaultTaskId && tasks.some((t) => t.id === defaultTaskId)) {
      tid = defaultTaskId;
    } else if (defaultTaskName) {
      tid = tasks.find((t) => t.name === defaultTaskName)?.id ?? '';
    }
    if (!tid) tid = tasks[0]?.id ?? '';
    setTaskId(tid);
    setHoursStr('');
    setNote('');
  }, [defaultDate, defaultProjectId, defaultTaskId, defaultTaskName, editingEntry, weekDays]);

  useEffect(() => {
    if (open) {
      resetFromProps();
    }
  }, [open, resetFromProps]);

  const applySuggestion = (s: { hours: number; projectId?: string; taskId?: string }) => {
    setHoursStr(String(s.hours));
    if (s.projectId) setProjectId(s.projectId);
    if (s.taskId) setTaskId(s.taskId);
  };

  const handleSave = async () => {
    const parsed = parseFloat(hoursStr);
    const hours = Number.isFinite(parsed) ? Math.max(0, Math.min(24, parsed)) : 0;
    if (!projectId || !dateIso) {
      toast.error('Choose project and date');
      return;
    }
    if (hours <= 0) {
      toast.error('Enter hours greater than 0');
      return;
    }

    const task = taskOptions.find((t) => t.id === taskId);
    const taskName = task?.name ?? defaultTaskName;
    const newId = buildTimesheetEntryId(targetUserId, projectId, dateIso, taskId || undefined);

    try {
      if (editingEntry && editingEntry.id !== newId) {
        await deleteEntry(editingEntry.id);
      }
      await upsertEntry({
        id: newId,
        userId: targetUserId,
        projectId,
        date: dateIso,
        hours,
        note: note.trim() || undefined,
        taskId: taskId || undefined,
        taskName: taskName || undefined,
      });
      toast.success(editingEntry ? 'Time updated' : 'Time logged');
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save');
    }
  };

  const handleDelete = async () => {
    if (!editingEntry) return;
    try {
      await deleteEntry(editingEntry.id);
      toast.success('Entry removed');
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete');
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor="right"
      slotProps={{ backdrop: { invisible: true } }}
      PaperProps={{ sx: { width: 1, maxWidth: 440 } }}
    >
      <Stack direction="row" alignItems="center" sx={{ p: 2, pb: 1 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {editingEntry ? 'Edit time' : 'Log time'}
        </Typography>
        <IconButton onClick={onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Stack>
      <Divider />

      <Stack spacing={2.5} sx={{ p: 2.5 }}>
        <DatePicker
          label="Date"
          value={dateIso ? dayjs(dateIso) : null}
          onChange={(v) => {
            if (v) setDateIso(v.format('YYYY-MM-DD'));
          }}
          slotProps={{ textField: { fullWidth: true, size: 'small' } }}
        />

        <TextField
          select
          fullWidth
          size="small"
          label="Project"
          value={projectId}
          onChange={(e) => {
            setProjectId(e.target.value);
            setTaskId('');
          }}
        >
          {_projects.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name} ({p.code})
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          fullWidth
          size="small"
          label="Task"
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          disabled={!projectId || taskOptions.length === 0}
          helperText={!projectId ? 'Select a project first' : undefined}
        >
          {taskOptions.map((t) => (
            <MenuItem key={t.id} value={t.id}>
              {t.name}
            </MenuItem>
          ))}
        </TextField>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
            Hours
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ sm: 'center' }}
            useFlexGap
          >
            <TextField
              size="small"
              type="number"
              value={hoursStr}
              onChange={(e) => setHoursStr(e.target.value)}
              inputProps={{ min: 0, max: 24, step: 0.25 }}
              sx={{ width: { xs: 1, sm: 120 } }}
            />
            <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap sx={{ flex: 1, minWidth: 0 }}>
              {suggestions.map((s) => (
                <Chip
                  key={`${s.label}|${s.projectId}|${s.taskId}`}
                  label={s.label}
                  size="small"
                  variant="outlined"
                  onClick={() => applySuggestion(s)}
                />
              ))}
            </Stack>
          </Stack>
        </Box>

        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Description"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What did you work on?"
        />

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          {editingEntry && (
            <Button color="error" variant="outlined" onClick={handleDelete}>
              Delete
            </Button>
          )}
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}
