import type { IProject, IProjectPriority } from 'src/types/project';

import dayjs from 'dayjs';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useCallback } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import ButtonBase from '@mui/material/ButtonBase';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { uuidv4 } from 'src/utils/uuidv4';
import { fIsAfter } from 'src/utils/format-time';

import { varAlpha } from 'src/theme/styles';
import { _userList } from 'src/_mock/_user';
import { updateProject } from 'src/actions/project';
import { notify } from 'src/store/notifications-store';
import { PROJECT_STATUS_OPTIONS } from 'src/_mock/_project';
import { createProjectWithBoard } from 'src/services/project-service';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { AssigneePickerStrip } from 'src/components/assignee-picker-strip';

import { KanbanContactsDialog } from 'src/sections/kanban/components/kanban-contacts-dialog';

import { useAuthContext } from 'src/auth/hooks';

import {
  PROJECT_PRIORITY_OPTIONS,
  ProjectPriorityKanbanIcon,
} from './project-priority-kanban-style';
import {
  DEPARTMENT_OPTIONS,
  projectUserNameById,
  projectAssignPickerRows,
  projectAvatarsForMemberIds,
  PROJECT_USER_SELECT_OPTIONS,
  resolveProjectUserIdInPickerOptions,
} from './project-field-options';

// ----------------------------------------------------------------------

const TEMPLATE_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'standard', label: 'Standard template' },
  { value: 'internal', label: 'Internal delivery' },
];

const CATEGORY_OPTIONS = [
  { value: 'software', label: 'Software' },
  { value: 'operations', label: 'Operations' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'marketing', label: 'Marketing' },
];

const GROUP_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'alpha', label: 'Alpha squad' },
  { value: 'platform', label: 'Platform' },
];

const CLIENT_COMPANY_OPTIONS = Array.from(new Set(_userList.map((u) => u.company))).map(
  (name) => ({
    value: name,
    label: name,
  })
);

const CUSTOM_FIELD_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'billing-code', label: 'Billing code' },
  { value: 'cost-center', label: 'Cost center' },
];

const DEFAULT_SETTINGS = {
  hiddenFromClient: false,
  restrictTaskView: false,
  emailNotification: true,
  restrictTimesheetHours: false,
  notification: true,
  enableTimesheetApproval: false,
} as const;

const settingsSchema = zod.object({
  hiddenFromClient: zod.boolean(),
  restrictTaskView: zod.boolean(),
  emailNotification: zod.boolean(),
  restrictTimesheetHours: zod.boolean(),
  notification: zod.boolean(),
  enableTimesheetApproval: zod.boolean(),
});

const ProjectCreateFormSchema = zod
  .object({
    templateId: zod.string(),
    name: zod.string().min(1, 'Project name is required'),
    code: zod.string(),
    referenceNo: zod.string(),
    description: zod.string(),
    projectLeaderId: zod.string().min(1, 'Project leader is required'),
    ownerId: zod.string().min(1, 'Project owner is required'),
    status: zod.enum(['active', 'on-hold', 'completed', 'archived']),
    priority: zod.enum(['low', 'medium', 'high', 'critical']),
    category: zod.string().min(1, 'Category is required'),
    group: zod.string(),
    department: zod.string(),
    clientCompanyName: zod.string().min(1, 'Client company is required'),
    startDate: zod.string().min(1, 'Start date is required'),
    endDate: zod.string().min(1, 'End date is required'),
    budgetHours: zod.string(),
    customFieldKey: zod.string(),
    budgetType: zod.enum(['fixed', 'time_expenses', 'non_billable']),
    settings: settingsSchema,
    attachments: zod.any(),
    memberIds: zod.array(zod.string()),
  })
  .refine((d) => !fIsAfter(d.startDate, d.endDate), {
    path: ['endDate'],
    message: 'End date must be on or after start date',
  });

export type ProjectCreateFormValues = zod.infer<typeof ProjectCreateFormSchema>;

// ----------------------------------------------------------------------

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Stack spacing={2.5}>
      <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1.1 }}>
        {title}
      </Typography>
      {children}
    </Stack>
  );
}

export function projectToFormValues(
  project: IProject,
  defaultUserId: string
): ProjectCreateFormValues {
  const ownerFallback = resolveProjectUserIdInPickerOptions(project.ownerId, defaultUserId);
  const leaderId = resolveProjectUserIdInPickerOptions(project.projectLeaderId, ownerFallback);

  const priority: IProjectPriority = PROJECT_PRIORITY_OPTIONS.includes(project.priority)
    ? project.priority
    : 'medium';

  const category =
    project.category && CATEGORY_OPTIONS.some((c) => c.value === project.category)
      ? project.category
      : 'software';

  const group =
    project.group && GROUP_OPTIONS.some((g) => g.value === project.group) ? project.group : '';

  const department =
    project.department && DEPARTMENT_OPTIONS.some((d) => d.value === project.department)
      ? project.department
      : 'dt-dev';

  const clientCompanyName =
    project.clientCompanyName &&
    CLIENT_COMPANY_OPTIONS.some((c) => c.value === project.clientCompanyName)
      ? project.clientCompanyName
      : (CLIENT_COMPANY_OPTIONS[0]?.value ?? '');

  const budgetType =
    project.budgetType && ['fixed', 'time_expenses', 'non_billable'].includes(project.budgetType)
      ? project.budgetType
      : 'non_billable';

  const customFieldKey =
    project.customFieldKey &&
    CUSTOM_FIELD_OPTIONS.some((c) => c.value === project.customFieldKey)
      ? project.customFieldKey
      : '';

  return {
    templateId: project.templateId ?? '',
    name: project.name,
    code: project.code,
    referenceNo: project.referenceNo ?? '',
    description: project.description ?? '',
    projectLeaderId: leaderId,
    ownerId: ownerFallback,
    status: project.status,
    priority,
    category,
    group,
    department,
    clientCompanyName,
    startDate: project.startDate || dayjs().format(),
    endDate: project.endDate || project.startDate || dayjs().format(),
    budgetHours: project.budgetHours != null ? String(project.budgetHours) : '',
    customFieldKey,
    budgetType,
    settings: { ...DEFAULT_SETTINGS, ...project.settings },
    attachments: [],
    memberIds: [...project.members],
  };
}

function emptyFormValues(defaultUserId: string): ProjectCreateFormValues {
  return {
    templateId: '',
    name: '',
    code: '',
    referenceNo: '',
    description: '',
    projectLeaderId: defaultUserId,
    ownerId: defaultUserId,
    status: 'active',
    priority: 'medium',
    category: 'software',
    group: '',
    department: 'dt-dev',
    clientCompanyName: CLIENT_COMPANY_OPTIONS[0]?.value ?? '',
    startDate: dayjs().format(),
    endDate: dayjs().format(),
    budgetHours: '',
    customFieldKey: '',
    budgetType: 'non_billable',
    settings: { ...DEFAULT_SETTINGS },
    attachments: [],
    memberIds: [],
  };
}

// ----------------------------------------------------------------------

export type ProjectFormProps = {
  mode?: 'create' | 'edit';
  current?: IProject;
  /** When creating from templates/recurring hubs (`?preset=` on /projects/new). */
  creationPreset?: 'template' | 'recurring';
};

export function ProjectCreateForm({ mode = 'create', current, creationPreset }: ProjectFormProps) {
  const router = useRouter();
  const { user } = useAuthContext();

  const defaultUserId = user?.id ?? PROJECT_USER_SELECT_OPTIONS[0]?.value ?? '';

  const browseAfterSaveHref =
    mode === 'edit' ? paths.dashboard.project.list
    : creationPreset === 'template' ? paths.dashboard.project.templates.root
    : creationPreset === 'recurring' ? paths.dashboard.project.recurringProjects.root
    : paths.dashboard.project.list;

  const [postCreateContext, setPostCreateContext] = useState<{ id: string } | null>(null);
  const [postMemberIds, setPostMemberIds] = useState<string[]>([]);
  const [postTeamSaving, setPostTeamSaving] = useState(false);
  const postTeamContacts = useBoolean();
  const editTeamContacts = useBoolean();

  const handleTogglePostMember = useCallback((id: string) => {
    setPostMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleSkipPostTeam = useCallback(() => {
    setPostCreateContext(null);
    router.push(browseAfterSaveHref);
  }, [browseAfterSaveHref, router]);

  const handleContinuePostTeam = useCallback(async () => {
    if (!postCreateContext) return;
    setPostTeamSaving(true);
    try {
      await updateProject(postCreateContext.id, { members: postMemberIds });
      notify({ kind: 'success', title: 'Team updated' });
      const {id} = postCreateContext;
      setPostCreateContext(null);
      router.push(paths.dashboard.project.details(id));
    } catch (error) {
      console.error(error);
      notify({ kind: 'error', title: 'Could not save team members' });
    } finally {
      setPostTeamSaving(false);
    }
  }, [postCreateContext, postMemberIds, router]);
  const methods = useForm<ProjectCreateFormValues>({
    resolver: zodResolver(ProjectCreateFormSchema),
    defaultValues:
      mode === 'edit' && current
        ? projectToFormValues(current, defaultUserId)
        : emptyFormValues(defaultUserId),
  });

  const {
    reset,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = methods;

  const watchedMemberIds = useWatch({
    control,
    name: 'memberIds',
    defaultValue: [] as string[],
  });

  const handleToggleFormMemberIds = useCallback(
    (id: string) => {
      const prev = getValues('memberIds');
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      setValue('memberIds', next, { shouldDirty: true });
    },
    [getValues, setValue]
  );

  useEffect(() => {
    if (mode === 'edit' && current) {
      reset(projectToFormValues(current, defaultUserId));
    }
  }, [mode, current, defaultUserId, reset]);

  const onSubmit = handleSubmit(async (data) => {
    const budgetParsed = Number.parseFloat(data.budgetHours.trim());
    const budgetHours = Number.isFinite(budgetParsed) ? budgetParsed : undefined;

    const generatedCode = `PRJ-${data.name
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '')
      .slice(0, 6)
      .toUpperCase()}-${uuidv4().slice(0, 4)}`;

    const code =
      data.code.trim() ||
      (mode === 'edit' && current ? current.code : '') ||
      generatedCode;

    const sharedFields = {
      name: data.name.trim(),
      code,
      status: data.status,
      startDate: data.startDate,
      endDate: data.endDate,
      ownerId: data.ownerId,
      ownerName: projectUserNameById(data.ownerId),
      description: data.description.trim() || undefined,
      priority: data.priority,
      isTemplate: Boolean(creationPreset === 'template' || data.templateId),
      referenceNo: data.referenceNo.trim() || undefined,
      templateId: data.templateId || undefined,
      projectLeaderId: data.projectLeaderId,
      projectLeaderName: projectUserNameById(data.projectLeaderId),
      category: data.category,
      group: data.group || undefined,
      department: data.department || undefined,
      clientCompanyName: data.clientCompanyName,
      budgetHours,
      budgetType: data.budgetType,
      customFieldKey: data.customFieldKey || undefined,
      settings: data.settings,
    };

    if (mode === 'edit' && current) {
      try {
        await updateProject(current.id, { ...sharedFields, members: data.memberIds });
        notify({ kind: 'success', title: 'Project updated' });
        router.push(paths.dashboard.project.list);
      } catch (error) {
        console.error(error);
        notify({ kind: 'error', title: 'Update failed' });
      }
      return;
    }

    const project: IProject = {
      id: uuidv4(),
      ...sharedFields,
      members: [],
      progress: 0,
      totalTasks: 0,
      completedTasks: 0,
      isFavorite: false,
      isRecurring: Boolean(creationPreset === 'recurring'),
      createdAt: dayjs().toISOString(),
    };

    try {
      const result = await createProjectWithBoard(project);
      if (result.ok) {
        setPostMemberIds([]);
        setPostCreateContext({ id: project.id });
      }
    } catch (error) {
      console.error(error);
      notify({ kind: 'error', title: 'Could not create project' });
    }
  });

  if (mode === 'create' && postCreateContext) {
    return (
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: (theme) => theme.customShadows.card,
        }}
      >
        <CardHeader
          title="Add team (optional)"
          subheader="Project created successfully. Add people now or skip and manage the team later when editing the project."
          titleTypographyProps={{ variant: 'h6' }}
          action={
            <IconButton onClick={handleSkipPostTeam} aria-label="Close">
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          }
          sx={{
            py: 2,
            px: { xs: 2, sm: 3 },
            borderBottom: (theme) => `solid 1px ${theme.vars.palette.divider}`,
          }}
        />
        <Stack spacing={3} sx={{ p: { xs: 2, sm: 3 } }}>
          <AssigneePickerStrip
            label="Members"
            avatarUsers={projectAvatarsForMemberIds(postMemberIds)}
            onAddClick={postTeamContacts.onTrue}
          />
          <KanbanContactsDialog
            open={postTeamContacts.value}
            onClose={postTeamContacts.onFalse}
            rows={projectAssignPickerRows()}
            title="Users"
            selectedIds={postMemberIds}
            onToggle={handleTogglePostMember}
          />
          <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
            <Button variant="outlined" onClick={handleSkipPostTeam}>
              Skip for now
            </Button>
            <LoadingButton
              variant="contained"
              loading={postTeamSaving}
              onClick={async () => {
                await handleContinuePostTeam();
              }}
            >
              Continue
            </LoadingButton>
          </Stack>
        </Stack>
      </Card>
    );
  }

  const heading =
    mode === 'edit'
      ? 'Edit project'
      : creationPreset === 'template'
        ? 'New template'
        : creationPreset === 'recurring'
          ? 'New recurring project'
          : 'Create project';

  const submitLabel = mode === 'edit' ? 'Save changes' : 'Create project';

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: (theme) => theme.customShadows.card,
        }}
      >
        <CardHeader
          title={heading}
          titleTypographyProps={{ variant: 'h6' }}
          action={
            <IconButton onClick={() => router.push(browseAfterSaveHref)} aria-label="Close">
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          }
          sx={{
            py: 2,
            px: { xs: 2, sm: 3 },
            borderBottom: (theme) => `solid 1px ${theme.vars.palette.divider}`,
          }}
        />

        <Stack spacing={4} sx={{ p: { xs: 2, sm: 3 } }}>
          <FormSection title="Basic information">
            <Grid container spacing={2.5}>
              <Grid xs={12} md={6}>
                <Field.Select name="templateId" label="Template">
                  {TEMPLATE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.label} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Field.Select>
              </Grid>
              <Grid xs={12} md={6}>
                <Field.Text name="name" label="Project name *" />
              </Grid>
              <Grid xs={12} md={6}>
                <Field.Text name="code" label="Project code" placeholder="Auto-generated if empty" />
              </Grid>
              <Grid xs={12} md={6}>
                <Field.Text name="referenceNo" label="Reference no." />
              </Grid>
              <Grid xs={12}>
                <Field.Text name="description" label="Description" multiline rows={3} />
              </Grid>
              <Grid xs={12} md={6}>
                <Field.Select name="projectLeaderId" label="Project leader *">
                  {PROJECT_USER_SELECT_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Field.Select>
              </Grid>
              <Grid xs={12} md={6}>
                <Field.Select name="ownerId" label="Project owner *">
                  {PROJECT_USER_SELECT_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Field.Select>
              </Grid>
              {mode === 'edit' && (
                <Grid xs={12}>
                  <Stack spacing={1}>
                    <AssigneePickerStrip
                      label="Members"
                      avatarUsers={projectAvatarsForMemberIds(watchedMemberIds ?? [])}
                      onAddClick={editTeamContacts.onTrue}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Optional. People on the project besides owner and leader.
                    </Typography>
                    <KanbanContactsDialog
                      open={editTeamContacts.value}
                      onClose={editTeamContacts.onFalse}
                      rows={projectAssignPickerRows()}
                      title="Users"
                      selectedIds={watchedMemberIds ?? []}
                      onToggle={handleToggleFormMemberIds}
                    />
                  </Stack>
                </Grid>
              )}
            </Grid>
          </FormSection>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <FormSection title="Workflow and schedule">
            <Grid container spacing={2.5}>
              <Grid xs={12} md={6}>
                <Field.Select name="status" label="Kanban status *">
                  {PROJECT_STATUS_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Field.Select>
              </Grid>
              <Grid xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Priority
                </Typography>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {PROJECT_PRIORITY_OPTIONS.map((option: IProjectPriority) => {
                        const selected = field.value === option;
                        return (
                          <ButtonBase
                            key={option}
                            type="button"
                            onClick={() => field.onChange(option)}
                            sx={{
                              py: 0.5,
                              pl: 0.75,
                              pr: 1.25,
                              fontSize: 12,
                              borderRadius: 1,
                              lineHeight: '20px',
                              textTransform: 'capitalize',
                              fontWeight: 'fontWeightBold',
                              boxShadow: (theme) =>
                                `inset 0 0 0 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.24)}`,
                              ...(selected && {
                                boxShadow: (theme) =>
                                  `inset 0 0 0 2px ${theme.vars.palette.text.primary}`,
                              }),
                            }}
                          >
                            <ProjectPriorityKanbanIcon priority={option} sx={{ mr: 0.5 }} />
                            {option}
                          </ButtonBase>
                        );
                      })}
                    </Stack>
                  )}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <Field.Select name="category" label="Category *">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Field.Select>
              </Grid>
              <Grid xs={12} md={6}>
                <Field.Select name="group" label="Group">
                  {GROUP_OPTIONS.map((opt) => (
                    <MenuItem key={opt.label} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Field.Select>
              </Grid>
              <Grid xs={12} md={6}>
                <Field.Select name="department" label="Department">
                  {DEPARTMENT_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Field.Select>
              </Grid>
              <Grid xs={12} md={6}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Field.Select name="clientCompanyName" label="Client company *">
                      {CLIENT_COMPANY_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Field.Select>
                  </Box>
                  <IconButton
                    sx={{ mt: 1 }}
                    onClick={() =>
                      notify({
                        kind: 'info',
                        title: 'Add company',
                        description: 'Connect your CRM to add companies.',
                      })
                    }
                    aria-label="Add company"
                  >
                    <Iconify icon="mingcute:add-line" />
                  </IconButton>
                </Stack>
              </Grid>
              <Grid xs={12} md={6}>
                <Field.DatePicker name="startDate" label="Due start *" />
              </Grid>
              <Grid xs={12} md={6}>
                <Field.DatePicker name="endDate" label="Due end *" />
              </Grid>
              <Grid xs={12} md={6}>
                <Field.Text
                  name="budgetHours"
                  label="Budget hours"
                  placeholder="e.g. 120"
                  type="number"
                />
              </Grid>
              <Grid xs={12} md={6}>
                <Field.Select name="customFieldKey" label="Custom fields">
                  {CUSTOM_FIELD_OPTIONS.map((opt) => (
                    <MenuItem key={opt.label} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Field.Select>
              </Grid>
              <Grid xs={12}>
                <Field.RadioGroup
                  name="budgetType"
                  label="Budget type *"
                  row
                  sx={{ flexWrap: 'wrap', columnGap: 2, rowGap: 0.5 }}
                  options={[
                    { value: 'fixed', label: 'Fixed price' },
                    { value: 'time_expenses', label: 'Time and expenses' },
                    { value: 'non_billable', label: 'Non-billable' },
                  ]}
                />
              </Grid>
              <Grid xs={12}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Project settings
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid xs={12} sm={6}>
                      <Field.Switch name="settings.hiddenFromClient" label="Hidden from client" />
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <Field.Switch name="settings.restrictTaskView" label="Restrict task view" />
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <Field.Switch name="settings.emailNotification" label="Email notification" />
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <Field.Switch
                        name="settings.restrictTimesheetHours"
                        label="Restrict timesheet hours"
                      />
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <Field.Switch name="settings.notification" label="Notification" />
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <Field.Switch
                        name="settings.enableTimesheetApproval"
                        label="Enable timesheet approval"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </FormSection>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <FormSection title="Attachments">
            <Field.Upload
              name="attachments"
              multiple
              helperText="Drop files here or click to browse"
              accept={{ 'image/*': [], 'application/pdf': [] }}
            />
          </FormSection>
        </Stack>

        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={1.5}
          sx={{
            p: { xs: 2, sm: 3 },
            pt: 0,
            borderTop: (theme) => `solid 1px ${theme.vars.palette.divider}`,
          }}
        >
          <Button variant="outlined" onClick={() => router.push(browseAfterSaveHref)}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} size="large">
            {submitLabel}
          </LoadingButton>
        </Stack>
      </Card>
    </Form>
  );
}
