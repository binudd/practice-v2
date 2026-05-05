import type { IKanbanSubtask, IKanbanAssignee } from 'src/types/kanban';

import { z as zod } from 'zod';
import { useEffect, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useBoolean } from 'src/hooks/use-boolean';

import { uuidv4 } from 'src/utils/uuidv4';

import { Form, Field } from 'src/components/hook-form';
import { AssigneePickerStrip } from 'src/components/assignee-picker-strip';

import { KanbanContactsDialog } from '../components/kanban-contacts-dialog';
import {
  kanbanAssigneeFromContactId,
  kanbanAvatarUsersForContactIds,
} from '../kanban-assignee-field-options';

// ----------------------------------------------------------------------

const KanbanSubtaskAddSchema = zod.object({
  name: zod.string().trim().min(1, { message: 'Name is required' }),
  description: zod.string().trim().min(1, { message: 'Description is required' }),
  hoursEstimated: zod
    .string()
    .min(1, { message: 'Hours estimated is required' })
    .refine(
      (s) => {
        const n = Number.parseFloat(s);
        return Number.isFinite(n) && n > 0;
      },
      { message: 'Hours estimated must be greater than 0' }
    ),
  assigneeIds: zod
    .array(zod.string())
    .min(1, { message: 'At least one assignee is required' }),
});

type KanbanSubtaskAddFormValues = zod.infer<typeof KanbanSubtaskAddSchema>;

const defaultFormValues: KanbanSubtaskAddFormValues = {
  name: '',
  description: '',
  hoursEstimated: '',
  assigneeIds: [],
};

function emptyDefaults(): KanbanSubtaskAddFormValues {
  return { ...defaultFormValues };
}

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onAdded: (subtask: IKanbanSubtask) => void;
};

export function KanbanSubtaskAddDialog({ open, onClose, onAdded }: Props) {
  const contacts = useBoolean();

  const methods = useForm<KanbanSubtaskAddFormValues>({
    resolver: zodResolver(KanbanSubtaskAddSchema),
    defaultValues: emptyDefaults(),
  });

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = methods;

  const assigneeIds = useWatch({ control, name: 'assigneeIds', defaultValue: [] });

  const handleClose = useCallback(() => {
    reset(emptyDefaults());
    contacts.onFalse();
    onClose();
  }, [contacts, onClose, reset]);

  useEffect(() => {
    if (open) {
      reset(emptyDefaults());
    }
  }, [open, reset]);

  const handleToggleAssigneeIds = useCallback(
    (id: string) => {
      const prev = getValues('assigneeIds');
      const idStr = String(id);
      const next = prev.includes(idStr)
        ? prev.filter((x) => x !== idStr)
        : [...prev, idStr];
      setValue('assigneeIds', next, { shouldDirty: true, shouldValidate: true });
    },
    [getValues, setValue]
  );

  const onSubmit = handleSubmit((data) => {
    const assignee = data.assigneeIds
      .map((id) => kanbanAssigneeFromContactId(id))
      .filter((a): a is IKanbanAssignee => a != null);

    if (assignee.length === 0) {
      return;
    }

    const hoursParsed = Number.parseFloat(data.hoursEstimated);

    onAdded({
      id: uuidv4(),
      name: data.name.trim(),
      description: data.description.trim(),
      hoursEstimated: hoursParsed,
      assignee,
      completed: false,
    });
    handleClose();
  });

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>New subtask</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Field.Text name="name" label="Name *" autoFocus />

            <Field.Text name="description" label="Description *" multiline rows={3} />

            <Box sx={{ maxWidth: 200, width: 1 }}>
              <Field.Text
                name="hoursEstimated"
                label="Hours estimated *"
                placeholder="e.g. 2.5"
                inputProps={{ inputMode: 'decimal' }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <AssigneePickerStrip
                label="Assignee *"
                avatarUsers={kanbanAvatarUsersForContactIds(assigneeIds)}
                onAddClick={contacts.onTrue}
              />
              {errors.assigneeIds?.message ? (
                <Typography variant="caption" color="error">
                  {errors.assigneeIds.message}
                </Typography>
              ) : null}

              <KanbanContactsDialog
                open={contacts.value}
                onClose={contacts.onFalse}
                selectedIds={assigneeIds ?? []}
                onToggle={handleToggleAssigneeIds}
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Add subtask
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
