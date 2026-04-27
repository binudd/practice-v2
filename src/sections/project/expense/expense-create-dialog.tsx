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

import { createProjectExpense } from 'src/actions/project-expenses';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const Schema = zod.object({
  title: zod.string().min(1, { message: 'Title is required!' }),
  amount: zod.string().min(1, { message: 'Amount is required' }),
  currency: zod.string().min(1),
  incurredAt: zod.string().min(1),
  category: zod.string().optional(),
});

type FormValues = zod.infer<typeof Schema>;

// ----------------------------------------------------------------------

type Props = {
  projectId: string;
  open: boolean;
  onClose: () => void;
};

export function ExpenseCreateDialog({ projectId, open, onClose }: Props) {
  const defaultValues: FormValues = {
    title: '',
    amount: '',
    currency: 'USD',
    incurredAt: new Date().toISOString().slice(0, 10),
    category: '',
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
    const amt = Number(data.amount);
    if (Number.isNaN(amt) || amt <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    try {
      await createProjectExpense(projectId, {
        title: data.title,
        amount: amt,
        currency: data.currency,
        incurredAt: new Date(data.incurredAt).toISOString(),
        category: data.category?.trim() || undefined,
      });
      reset(defaultValues);
      toast.success('Expense added');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Could not add expense');
    }
  });

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>New expense</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Field.Text name="title" label="Title" />
            <Field.Text name="amount" label="Amount" />
            <Field.Text name="currency" label="Currency" />
            <Field.Text name="incurredAt" label="Date" type="date" />
            <Field.Text name="category" label="Category" />
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
