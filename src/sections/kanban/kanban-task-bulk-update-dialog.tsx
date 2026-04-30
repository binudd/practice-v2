import type { IKanban } from 'src/types/kanban';
import type { KanbanBulkTaskTarget } from 'src/actions/kanban';

import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { notify } from 'src/store/notifications-store';
import { bulkUpdateKanbanTasks } from 'src/actions/kanban';
import {
  isKanbanBulkMergeEmpty,
  type KanbanBulkMergeInput,
} from 'src/domain/kanban/bulk-task-patch';

import { Form, Field } from 'src/components/hook-form';

import {
  kanbanAssigneeFromContactId,
  KANBAN_CONTACT_ASSIGN_OPTIONS,
} from './kanban-assignee-field-options';

// ----------------------------------------------------------------------

/** Matches {@link import('src/sections/kanban/details/kanban-details-priority').KanbanDetailsPriority} literals */
const KANBAN_TASK_PRIORITY_VALUES = ['low', 'medium', 'hight'] as const;

const BulkSchema = zod
  .object({
    applyPriority: zod.boolean(),
    priority: zod.enum(KANBAN_TASK_PRIORITY_VALUES),
    applyDue: zod.boolean(),
    dueStart: zod.string(),
    dueEnd: zod.string(),
    applyAssignees: zod.boolean(),
    assigneeContactIdsToAdd: zod.array(zod.string()),
  })
  .superRefine((val, ctx) => {
    if (val.applyDue && !val.dueStart.trim() && !val.dueEnd.trim()) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: 'Set at least one due date',
        path: ['dueStart'],
      });
    }
    if (val.applyAssignees && val.assigneeContactIdsToAdd.length === 0) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: 'Select at least one contact',
        path: ['assigneeContactIdsToAdd'],
      });
    }
  });

type BulkFormValues = zod.infer<typeof BulkSchema>;

function buildMergeInput(values: BulkFormValues): KanbanBulkMergeInput | null {
  const out: KanbanBulkMergeInput = {};

  if (values.applyPriority) {
    out.priority = values.priority;
  }

  if (values.applyDue) {
    const startTrim = values.dueStart.trim();
    const endTrim = values.dueEnd.trim();

    const due: KanbanBulkMergeInput['due'] = {};
    if (startTrim) {
      due.startISO = dayjs(startTrim).format();
    }
    if (endTrim) {
      due.endISO = dayjs(endTrim).format();
    }
    out.due = due;
  }

  if (values.applyAssignees && values.assigneeContactIdsToAdd.length) {
    const resolved = values.assigneeContactIdsToAdd
      .map((id) => kanbanAssigneeFromContactId(id))
      .filter(Boolean) as NonNullable<
      ReturnType<typeof kanbanAssigneeFromContactId>
    >[];
    if (!resolved.length) {
      return null;
    }
    out.assigneesToAdd = resolved;
  }

  if (isKanbanBulkMergeEmpty(out)) return null;

  return out;
}

type Props = {
  open: boolean;
  kanbanBoardProjectId?: string;
  targets: readonly KanbanBulkTaskTarget[];
  boardSnapshot: Pick<IKanban, 'tasks'> | undefined;
  onClose: () => void;
  onApplied: () => void;
};

export function KanbanTaskBulkUpdateDialog({
  open,
  kanbanBoardProjectId,
  targets,
  boardSnapshot,
  onClose,
  onApplied,
}: Props) {
  const defaults = useMemo(() => {
    const t = dayjs().format();
    return {
      applyPriority: false,
      priority: 'medium' as const,
      applyDue: false,
      dueStart: t,
      dueEnd: t,
      applyAssignees: false,
      assigneeContactIdsToAdd: [] as string[],
    };
  }, []);

  const methods = useForm<BulkFormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(BulkSchema),
    defaultValues: defaults,
  });

  const { reset, handleSubmit, watch, formState } = methods;

  const showPriority = watch('applyPriority');
  const showDue = watch('applyDue');
  const showAssignees = watch('applyAssignees');

  const handleClose = () => {
    reset(defaults);
    onClose();
  };

  const onSubmit = handleSubmit(async (vals) => {
    const anyToggle =
      vals.applyPriority || vals.applyDue || vals.applyAssignees;

    if (!anyToggle) {
      notify({ kind: 'warning', title: 'Choose at least one update' });
      return;
    }

    const merged = buildMergeInput(vals);
    if (!merged) {
      notify({ kind: 'warning', title: 'Nothing to apply for the enabled sections' });
      return;
    }

    const validTargets = targets.filter((t) => {
      const col = boardSnapshot?.tasks[t.columnId];
      return !!col?.some((row) => row.id === t.taskId);
    });

    const skippedPrecheck = targets.length - validTargets.length;

    try {
      const result = await bulkUpdateKanbanTasks(
        kanbanBoardProjectId,
        validTargets,
        merged
      );

      notify({
        kind: result.updated ? 'success' : 'warning',
        title:
          result.updated === 0
            ? 'No tasks were updated'
            : `Updated ${result.updated} task(s)`,
        description:
          result.skipped + skippedPrecheck > 0
            ? `${result.skipped + skippedPrecheck} skipped (missing from board / no changes)`
            : undefined,
      });
      reset(defaults);
      if (result.updated > 0) {
        onApplied();
      }
      onClose();
    } catch (e) {
      console.error(e);
      notify({ kind: 'error', title: 'Bulk update failed' });
    }
  });

  const count = targets.length;

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Bulk update tasks</DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ pb: 2 }}>
            Changes apply to {count} selected task(s). Enable each section you want to change.
          </Typography>

          <Stack spacing={2.5}>
            <Box>
              <Field.Switch name="applyPriority" label="Set priority" />
              {showPriority && (
                <Field.Select name="priority" label="Priority" sx={{ mt: 2 }}>
                  {KANBAN_TASK_PRIORITY_VALUES.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </MenuItem>
                  ))}
                </Field.Select>
              )}
            </Box>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Box>
              <Field.Switch name="applyDue" label="Adjust due dates" />
              {showDue && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                  <Field.DatePicker name="dueStart" label="Start date" />
                  <Field.DatePicker name="dueEnd" label="End date" />
                </Stack>
              )}
            </Box>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Box>
              <Field.Switch name="applyAssignees" label="Add assignees" />
              {showAssignees && (
                <Field.MultiSelect
                  name="assigneeContactIdsToAdd"
                  label="Contacts to add"
                  options={[...KANBAN_CONTACT_ASSIGN_OPTIONS]}
                  checkbox
                  chip
                  placeholder="+ Assignees"
                  helperText="Selected contacts are merged into each task."
                  sx={{ mt: 2 }}
                />
              )}
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="outlined" color="inherit" onClick={handleClose}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={formState.isSubmitting}>
            Apply to {count} task(s)
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
