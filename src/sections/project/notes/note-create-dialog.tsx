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

import { createProjectNote } from 'src/actions/project-notes';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const NoteFormSchema = zod.object({
  title: zod.string().min(1, { message: 'Title is required!' }),
  body: zod.string().optional(),
});

export type NoteFormValues = zod.infer<typeof NoteFormSchema>;

// ----------------------------------------------------------------------

type Props = {
  projectId: string;
  open: boolean;
  onClose: () => void;
};

export function NoteCreateDialog({ projectId, open, onClose }: Props) {
  const defaultValues: NoteFormValues = { title: '', body: '' };

  const methods = useForm<NoteFormValues>({
    mode: 'all',
    resolver: zodResolver(NoteFormSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createProjectNote(projectId, {
        title: data.title,
        body: data.body || undefined,
      });
      reset(defaultValues);
      toast.success('Note created');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Could not create note');
    }
  });

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>New note</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Field.Text name="title" label="Title" />
            <Field.Text name="body" label="Body" multiline minRows={4} />
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
