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

import { createProjectAutomation } from 'src/actions/project-automations';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const Schema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  triggerLabel: zod.string().min(1, { message: 'Trigger is required' }),
  actionLabel: zod.string().min(1, { message: 'Action is required' }),
  enabled: zod.boolean(),
});

type FormValues = zod.infer<typeof Schema>;

// ----------------------------------------------------------------------

type Props = {
  projectId: string;
  open: boolean;
  onClose: () => void;
};

export function AutomationCreateDialog({ projectId, open, onClose }: Props) {
  const defaultValues: FormValues = {
    name: '',
    triggerLabel: '',
    actionLabel: '',
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
      await createProjectAutomation(projectId, {
        name: data.name,
        triggerLabel: data.triggerLabel,
        actionLabel: data.actionLabel,
        enabled: data.enabled,
      });
      reset(defaultValues);
      toast.success('Automation created');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Could not create automation');
    }
  });

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>New automation</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Field.Text name="name" label="Name" />
            <Field.Text name="triggerLabel" label="When…" multiline minRows={2} />
            <Field.Text name="actionLabel" label="Then…" multiline minRows={2} />
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
