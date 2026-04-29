import type { ITimesheetEntry } from 'src/types/timesheet';

import dayjs from 'dayjs';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Popper from '@mui/material/Popper';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemText from '@mui/material/ListItemText';
import DialogActions from '@mui/material/DialogActions';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemButton from '@mui/material/ListItemButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

import { buildTimesheetEntryId } from 'src/utils/timesheet-entry-id';

import { _projects } from 'src/_mock/_project';
import { toIsoDay } from 'src/_mock/_timesheet';
import { getTasksForProject } from 'src/_mock/_timesheet-tasks';
import { upsertEntry, deleteEntry } from 'src/actions/timesheet';

import { toast } from 'src/components/snackbar';
import { Scrollbar } from 'src/components/scrollbar';

import { getRecentHourSuggestions } from './utils';

// ----------------------------------------------------------------------

export type LogTimeDialogProps = {
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

export function LogTimeDialog({
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
}: LogTimeDialogProps) {
  const theme = useTheme();

  const [dateIso, setDateIso] = useState('');
  const [projectId, setProjectId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [hoursStr, setHoursStr] = useState('');
  const [billable, setBillable] = useState(true);
  const [note, setNote] = useState('');

  const [hoursSuggestOpen, setHoursSuggestOpen] = useState(false);
  const hoursFieldRef = useRef<HTMLDivElement>(null);

  const taskOptions = useMemo(() => getTasksForProject(projectId), [projectId]);

  const hourSuggestions = useMemo(
    () => getRecentHourSuggestions(historyEntries, { limit: 8 }),
    [historyEntries]
  );

  const resetFromProps = useCallback(() => {
    if (editingEntry) {
      setDateIso(editingEntry.date);
      setProjectId(editingEntry.projectId);
      setTaskId(editingEntry.taskId ?? '');
      setHoursStr(String(editingEntry.hours));
      setBillable(editingEntry.billable !== false);
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
    setBillable(true);
    setNote('');
  }, [defaultDate, defaultProjectId, defaultTaskId, defaultTaskName, editingEntry, weekDays]);

  useEffect(() => {
    if (open) {
      resetFromProps();
    }
  }, [open, resetFromProps]);

  useEffect(() => {
    if (!open) {
      setHoursSuggestOpen(false);
    }
  }, [open]);

  const openHourSuggestions = useCallback(() => {
    if (hourSuggestions.length > 0) setHoursSuggestOpen(true);
  }, [hourSuggestions]);

  const applyHourSuggestion = useCallback((hours: number) => {
    setHoursStr(String(hours));
    setHoursSuggestOpen(false);
  }, []);

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
        billable,
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
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      onClose={onClose}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
      PaperProps={{
        sx: {
          display: 'flex',
          overflow: 'hidden',
          flexDirection: 'column',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ minHeight: 76, flexShrink: 0 }}>
        {open && <>{editingEntry ? 'Edit time' : 'Log time'}</>}
      </DialogTitle>

      <Scrollbar
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          p: 3,
          bgcolor: 'background.subtle',
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Date
            </Typography>
            <Paper
              variant="outlined"
              sx={{ borderRadius: 2, borderColor: 'divider', borderStyle: 'dashed' }}
            >
              <DateCalendar
                value={dayjs(dateIso || toIsoDay(new Date()))}
                onChange={(v) => {
                  if (v) setDateIso(v.format('YYYY-MM-DD'));
                }}
              />
            </Paper>
          </Box>

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

          <ClickAwayListener onClickAway={() => setHoursSuggestOpen(false)}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'flex-end' }}
              useFlexGap
              sx={{ position: 'relative' }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={billable}
                    onChange={(_, checked) => setBillable(checked)}
                    color="primary"
                  />
                }
                label="Billable"
                labelPlacement="start"
                sx={{
                  m: 0,
                  mx: 0,
                  px: { sm: 0 },
                  flex: { sm: '0 1 auto' },
                  justifyContent: { sm: 'flex-start' },
                }}
              />

              <Box
                ref={hoursFieldRef}
                sx={{
                  flex: { xs: '1 1 auto', sm: '0 0 auto' },
                  alignSelf: { xs: 'stretch', sm: 'flex-end' },
                  width: { xs: '100%', sm: 'min(50%, 12ch)' },
                  minWidth: 0,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Hours"
                  value={hoursStr}
                  onChange={(e) => setHoursStr(e.target.value)}
                  onClick={() => openHourSuggestions()}
                  onFocus={() => openHourSuggestions()}
                  inputProps={{ min: 0, max: 24, step: 0.25 }}
                />

                <Popper
                  open={hoursSuggestOpen && hourSuggestions.length > 0}
                  anchorEl={hoursFieldRef.current}
                  placement="bottom-start"
                  disablePortal
                  modifiers={[{ name: 'offset', options: { offset: [0, 4] } }]}
                  sx={{ zIndex: (t) => t.zIndex.modal + 1 }}
                >
                  <Paper
                    elevation={8}
                    variant="outlined"
                    sx={{
                      py: 0.5,
                      minWidth: 'fit-content',
                      maxWidth: 'min(92vw, 36ch)',
                    }}
                  >
                    <List
                      dense
                      disablePadding
                      subheader={
                        <ListSubheader
                          component="div"
                          disableSticky
                          sx={{ typography: 'caption', color: 'text.secondary', py: 0.5, lineHeight: 1.25 }}
                        >
                          Recent hours
                        </ListSubheader>
                      }
                    >
                      {hourSuggestions.map((s) => (
                        <ListItemButton
                          key={s.hours}
                          dense
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => applyHourSuggestion(s.hours)}
                        >
                          <ListItemText primary={s.label} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Paper>
                </Popper>
              </Box>
            </Stack>
          </ClickAwayListener>

          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Description"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What did you work on?"
          />
        </Stack>
      </Scrollbar>

      <DialogActions sx={{ flexShrink: 0, px: 3, pb: 2 }}>
        {!!editingEntry && (
          <Button color="error" variant="outlined" onClick={handleDelete}>
            Delete
          </Button>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>

        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
