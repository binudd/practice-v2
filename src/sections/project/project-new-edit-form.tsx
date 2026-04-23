import type { IProject } from 'src/types/project';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { _mock } from 'src/_mock/_mock';
import { updateProject } from 'src/actions/project';
import { notify } from 'src/store/notifications-store';
import { PROJECT_STATUS_OPTIONS } from 'src/_mock/_project';
import { createProjectWithBoard } from 'src/services/project-service';

import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const ProjectSchema = zod.object({
  name: zod.string().min(1, 'Name is required'),
  code: zod.string().min(1, 'Code is required'),
  status: zod.enum(['active', 'on-hold', 'completed', 'archived']),
  ownerName: zod.string().min(1, 'Owner is required'),
  description: zod.string().optional(),
});

export type ProjectSchemaType = zod.infer<typeof ProjectSchema>;

// ----------------------------------------------------------------------

type Props = {
  current?: IProject;
};

export function ProjectNewEditForm({ current }: Props) {
  const router = useRouter();

  const defaultValues: ProjectSchemaType = {
    name: current?.name ?? '',
    code: current?.code ?? '',
    status: current?.status ?? 'active',
    ownerName: current?.ownerName ?? '',
    description: current?.description ?? '',
  };

  const methods = useForm<ProjectSchemaType>({
    resolver: zodResolver(ProjectSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    if (current) {
      try {
        await updateProject(current.id, data);
        notify({ kind: 'success', title: 'Project updated' });
        router.push(paths.dashboard.project.list);
      } catch (error) {
        console.error(error);
        notify({ kind: 'error', title: 'Update failed' });
      }
      return;
    }

    const result = await createProjectWithBoard({
      ...data,
      ownerId: _mock.id(1),
    });
    if (result.ok) router.push(paths.dashboard.project.kanban(result.value.id));
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Field.Text name="name" label="Project name" />
          <Field.Text name="code" label="Code" helperText="Short identifier, e.g. PRJ-1001" />
          <Field.Select name="status" label="Status">
            {PROJECT_STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Field.Select>
          <Field.Text name="ownerName" label="Owner" />
          <Field.Text name="description" label="Description" multiline rows={4} />
        </Stack>

        <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={() => router.push(paths.dashboard.project.list)}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {current ? 'Save changes' : 'Create project'}
          </LoadingButton>
        </Stack>
      </Card>
    </Form>
  );
}
