import type { IProject } from 'src/domain/project';
import type {
  ProjectBulkFlatFields,
  ProjectBulkMergeInput,
} from 'src/domain/project/bulk-project-patch';

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
import { bulkUpdateProjects } from 'src/actions/project';

import { Form, Field } from 'src/components/hook-form';

import { PROJECT_PRIORITY_OPTIONS } from './project-priority-kanban-style';
import {
  DEPARTMENT_OPTIONS,
  projectUserNameById,
  PROJECT_USER_SELECT_OPTIONS,
} from './project-field-options';

// ----------------------------------------------------------------------

const BulkSchema = zod
  .object({
    applyTeam: zod.boolean(),
    memberIdsToAdd: zod.array(zod.string()),
    applySchedule: zod.boolean(),
    startDate: zod.string(),
    endDate: zod.string(),
    applyPriority: zod.boolean(),
    priority: zod.enum(['low', 'medium', 'high', 'critical']),
    applyDepartment: zod.boolean(),
    department: zod.string(),
    applyOwner: zod.boolean(),
    ownerId: zod.string(),
    applyLeader: zod.boolean(),
    projectLeaderId: zod.string(),
  })
  .superRefine((val, ctx) => {
    if (val.applyTeam && val.memberIdsToAdd.length === 0) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: 'Select at least one user to add',
        path: ['memberIdsToAdd'],
      });
    }
    if (val.applySchedule && !val.startDate.trim() && !val.endDate.trim()) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: 'Set at least one date',
        path: ['startDate'],
      });
    }
    if (val.applyOwner && !val.ownerId.trim()) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: 'Choose an owner',
        path: ['ownerId'],
      });
    }
    if (val.applyLeader && !val.projectLeaderId.trim()) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: 'Choose a leader',
        path: ['projectLeaderId'],
      });
    }
  });

type BulkFormValues = zod.infer<typeof BulkSchema>;

function buildMergeInput(values: BulkFormValues): ProjectBulkMergeInput | null {
  const flat: ProjectBulkFlatFields = {};
  if (values.applyPriority) {
    flat.priority = values.priority;
  }
  if (values.applyDepartment) {
    flat.department = values.department;
  }
  if (values.applyOwner && values.ownerId) {
    flat.ownerId = values.ownerId;
    flat.ownerName = projectUserNameById(values.ownerId);
  }
  if (values.applyLeader && values.projectLeaderId) {
    flat.projectLeaderId = values.projectLeaderId;
    flat.projectLeaderName = projectUserNameById(values.projectLeaderId);
  }
  if (values.applySchedule) {
    if (values.startDate) flat.startDate = values.startDate;
    if (values.endDate) flat.endDate = values.endDate;
  }

  const hasFlat = Object.keys(flat).length > 0;
  const hasMembers = Boolean(values.applyTeam && values.memberIdsToAdd.length);

  if (!hasFlat && !hasMembers) {
    return null;
  }

  return {
    ...(hasFlat ? { flat } : {}),
    ...(hasMembers ? { memberIdsToAdd: values.memberIdsToAdd } : {}),
  };
}

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  editableProjectIds: readonly string[];
  projectsSnapshot: readonly IProject[];
  onClose: () => void;
  onApplied: () => void;
};

export function ProjectBulkUpdateDialog({
  open,
  editableProjectIds,
  projectsSnapshot,
  onClose,
  onApplied,
}: Props) {
  const defaults = useMemo(() => {
    const t = dayjs().format();
    return {
      applyTeam: false,
      memberIdsToAdd: [] as string[],
      applySchedule: false,
      startDate: t,
      endDate: t,
      applyPriority: false,
      priority: 'medium' as const,
      applyDepartment: false,
      department: DEPARTMENT_OPTIONS[0].value,
      applyOwner: false,
      ownerId: PROJECT_USER_SELECT_OPTIONS[0]?.value ?? '',
      applyLeader: false,
      projectLeaderId: PROJECT_USER_SELECT_OPTIONS[0]?.value ?? '',
    };
  }, []);

  const methods = useForm<BulkFormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(BulkSchema),
    defaultValues: defaults,
  });

  const { reset, handleSubmit, watch, formState } = methods;

  const showTeamFields = watch('applyTeam');
  const showSchedule = watch('applySchedule');
  const showPriority = watch('applyPriority');
  const showDept = watch('applyDepartment');
  const showOwner = watch('applyOwner');
  const showLeader = watch('applyLeader');

  const handleClose = () => {
    reset(defaults);
    onClose();
  };

  const onSubmit = handleSubmit(async (vals) => {
    const merged = buildMergeInput(vals);
    const anyToggle =
      vals.applyTeam ||
      vals.applySchedule ||
      vals.applyPriority ||
      vals.applyDepartment ||
      vals.applyOwner ||
      vals.applyLeader;

    if (!anyToggle) {
      notify({ kind: 'warning', title: 'Choose at least one update' });
      return;
    }

    if (!merged) {
      notify({ kind: 'warning', title: 'Nothing to apply for the enabled sections' });
      return;
    }

    try {
      await bulkUpdateProjects(projectsSnapshot, editableProjectIds, merged);
      notify({
        kind: 'success',
        title: `Updated ${editableProjectIds.length} project(s)`,
      });
      reset(defaults);
      onApplied();
      onClose();
    } catch (e) {
      console.error(e);
      notify({ kind: 'error', title: 'Bulk update failed' });
    }
  });

  const count = editableProjectIds.length;

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Bulk update projects</DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ pb: 2 }}>
            Changes apply to {count} selected project(s). Enable each section you want to change.
          </Typography>

          <Stack spacing={2.5}>
            <Box>
              <Field.Switch name="applyTeam" label="Add team members" />
              {showTeamFields && (
                <Field.MultiSelect
                  name="memberIdsToAdd"
                  label="Members to add"
                  options={[...PROJECT_USER_SELECT_OPTIONS]}
                  checkbox
                  chip
                  placeholder="+ Users"
                  helperText="Selected users are merged into each project's member list."
                  sx={{ mt: 2 }}
                />
              )}
            </Box>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Box>
              <Field.Switch name="applySchedule" label="Update schedule dates" />
              {showSchedule && (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                  <Field.DatePicker name="startDate" label="Start date" />
                  <Field.DatePicker name="endDate" label="Due date" />
                </Stack>
              )}
            </Box>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Box>
              <Field.Switch name="applyPriority" label="Set priority" />
              {showPriority && (
                <Field.Select name="priority" label="Priority" sx={{ mt: 2 }}>
                  {PROJECT_PRIORITY_OPTIONS.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </MenuItem>
                  ))}
                </Field.Select>
              )}
            </Box>

            <Box>
              <Field.Switch name="applyDepartment" label="Set department" />
              {showDept && (
                <Field.Select name="department" label="Department" sx={{ mt: 2 }}>
                  {[...DEPARTMENT_OPTIONS].map((d) => (
                    <MenuItem key={d.value} value={d.value}>
                      {d.label}
                    </MenuItem>
                  ))}
                </Field.Select>
              )}
            </Box>

            <Box>
              <Field.Switch name="applyOwner" label="Set project owner" />
              {showOwner && (
                <Field.Select name="ownerId" label="Owner" sx={{ mt: 2 }}>
                  {[...PROJECT_USER_SELECT_OPTIONS].map((u) => (
                    <MenuItem key={u.value} value={u.value}>
                      {u.label}
                    </MenuItem>
                  ))}
                </Field.Select>
              )}
            </Box>

            <Box>
              <Field.Switch name="applyLeader" label="Set project leader" />
              {showLeader && (
                <Field.Select name="projectLeaderId" label="Leader" sx={{ mt: 2 }}>
                  {[...PROJECT_USER_SELECT_OPTIONS].map((u) => (
                    <MenuItem key={u.value} value={u.value}>
                      {u.label}
                    </MenuItem>
                  ))}
                </Field.Select>
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
            Apply to {count} project(s)
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
