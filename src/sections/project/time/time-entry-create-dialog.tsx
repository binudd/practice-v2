import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { createProjectTimeEntry } from 'src/actions/project-time-entries';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const Schema = zod.object({
  description: zod.string().min(1, { message: 'Description is required!' }),
  hours: zod.string().min(1, { message: 'Hours is required' }),
  loggedAt: zod.string().min(1),
  userLabel: zod.string().optional(),
});

type FormValues = zod.infer<typeof Schema>;

// ----------------------------------------------------------------------

type Props = {
  projectId: string;
  open: boolean;
  onClose: () => void;
};

export function TimeEntryCreateDialog({ projectId, open, onClose }: Props) {
  const defaultValues: FormValues = {
    description: '',
    hours: '1',
    loggedAt: new Date().toISOString().slice(0, 16),
    userLabel: 'You',
  };

  const methods = useForm<FormValues>({
    mode: 'all',
    resolver: zodResolver(Schema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const h = Number(data.hours);
    if (Number.isNaN(h) || h <= 0) {
      toast.error('Enter a valid hours value');
      return;
    }
    try {
      await createProjectTimeEntry(projectId, {
        description: data.description,
        hours: h,
        loggedAt: new Date(data.loggedAt).toISOString(),
        userLabel: data.userLabel?.trim() || undefined,
      });
      reset(defaultValues);
      toast.success('Time logged');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Could not log time');
    }
  });

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Log time</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Field.Text name="description" label="Description" />
            <Field.Text name="hours" label="Hours" />
            <Field.Text name="loggedAt" label="When" type="datetime-local" />
            <Field.Text name="userLabel" label="Who (label)" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="outlined" color="inherit" onClick={handleClose}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Save
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
