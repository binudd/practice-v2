import { z as zod } from 'zod';
import { useForm, Controller } from 'react-hook-form';
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

import { uuidv4 } from 'src/utils/uuidv4';

import { createDiscussionTopic } from 'src/actions/project-discussion';

import { Upload } from 'src/components/upload';
import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const DiscussionTopicFormSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  description: zod.string().optional(),
  attachment: zod
    .custom<File | null>((v) => v === null || v === undefined || v instanceof File)
    .optional()
    .nullable(),
  hiddenFromClient: zod.boolean(),
});

export type DiscussionTopicFormValues = zod.infer<typeof DiscussionTopicFormSchema>;

// ----------------------------------------------------------------------

type Props = {
  projectId: string;
  open: boolean;
  onClose: () => void;
};

export function DiscussionTopicCreateDialog({ projectId, open, onClose }: Props) {
  const defaultValues: DiscussionTopicFormValues = {
    name: '',
    description: '',
    attachment: null,
    hiddenFromClient: false,
  };

  const methods = useForm<DiscussionTopicFormValues>({
    mode: 'all',
    resolver: zodResolver(DiscussionTopicFormSchema),
    defaultValues,
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const attachments =
        data.attachment instanceof File
          ? [
              {
                id: uuidv4(),
                fileName: data.attachment.name,
                url: URL.createObjectURL(data.attachment),
              },
            ]
          : [];

      await createDiscussionTopic(projectId, {
        name: data.name,
        description: data.description || undefined,
        attachments,
        hiddenFromClient: data.hiddenFromClient,
      });

      reset(defaultValues);
      toast.success('Topic created');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Could not create topic');
    }
  });

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>New discussion topic</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            <Field.Text name="name" label="Name" />

            <Field.Text name="description" label="Description" multiline rows={3} />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Attachment
              </Typography>
              <Controller
                name="attachment"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Upload
                    value={field.value}
                    onDrop={(acceptedFiles: File[]) => {
                      field.onChange(acceptedFiles[0] ?? null);
                    }}
                    onDelete={() => field.onChange(null)}
                    accept={{
                      'application/pdf': ['.pdf'],
                      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
                      'text/plain': ['.txt'],
                    }}
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Box>

            <Field.Checkbox
              name="hiddenFromClient"
              label="Hidden from client"
              helperText="Client users will not see this topic or its messages."
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Create
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
