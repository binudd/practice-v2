import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { createProjectRecurringRule } from 'src/actions/project-recurring';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const Schema = zod.object({
  title: zod.string().min(1, { message: 'Title is required!' }),
  cadence: zod.enum(['daily', 'weekly', 'monthly']),
  nextRunAt: zod.string().min(1, { message: 'Next run is required' }),
  enabled: zod.boolean(),
});

type FormValues = zod.infer<typeof Schema>;

// ----------------------------------------------------------------------

type Props = {
  projectId: string;
  open: boolean;
  onClose: () => void;
};

export function RecurringCreateDialog({ projectId, open, onClose }: Props) {
  const defaultValues: FormValues = {
    title: '',
    cadence: 'weekly',
    nextRunAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    enabled: true,
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
    try {
      await createProjectRecurringRule(projectId, {
        title: data.title,
        cadence: data.cadence,
        nextRunAt: new Date(data.nextRunAt).toISOString(),
        enabled: data.enabled,
      });
      reset(defaultValues);
      toast.success('Recurring rule created');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Could not create rule');
    }
  });

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>New recurring rule</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Field.Text name="title" label="Title" />
            <Field.Select name="cadence" label="Cadence">
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Field.Select>
            <Field.Text name="nextRunAt" label="Next run" type="datetime-local" />
            <Field.Switch name="enabled" label="Enabled" />
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
