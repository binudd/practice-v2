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

import { createProjectTaskType } from 'src/actions/project-task-types';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const Schema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  description: zod.string().optional(),
  defaultEstimateHours: zod.string().optional(),
  color: zod.string().optional(),
});

type FormValues = zod.infer<typeof Schema>;

// ----------------------------------------------------------------------

type Props = {
  projectId: string;
  open: boolean;
  onClose: () => void;
};

export function TaskTypeCreateDialog({ projectId, open, onClose }: Props) {
  const defaultValues: FormValues = {
    name: '',
    description: '',
    defaultEstimateHours: '',
    color: '',
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
      const hoursRaw = data.defaultEstimateHours?.trim();
      const hoursParsed = hoursRaw ? Number(hoursRaw) : undefined;
      await createProjectTaskType(projectId, {
        name: data.name,
        description: data.description || undefined,
        defaultEstimateHours:
          hoursParsed !== undefined && !Number.isNaN(hoursParsed) && hoursParsed > 0
            ? hoursParsed
            : undefined,
        color: data.color?.trim() || undefined,
      });
      reset(defaultValues);
      toast.success('Task type created');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Could not create task type');
    }
  });

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>New task type</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Field.Text name="name" label="Name" />
            <Field.Text name="description" label="Description" multiline minRows={2} />
            <Field.Text name="defaultEstimateHours" label="Default estimate (hours)" />
            <Field.Text name="color" label="Theme color key (optional)" placeholder="primary" />
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
