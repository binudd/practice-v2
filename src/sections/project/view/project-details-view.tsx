import { useState } from 'react';

import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useGetProject } from 'src/actions/project';
import { DashboardContent } from 'src/layouts/dashboard';
import { ProjectPolicy } from 'src/domain/project/project-policy';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { KanbanView } from 'src/sections/kanban/view/kanban-view';

import { Can } from 'src/auth/guard';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'kanban', label: 'Kanban' },
  { value: 'files', label: 'Files' },
];

export function ProjectDetailsView({ id }: Props) {
  const { project, projectLoading, projectNotFound } = useGetProject(id);

  const [tab, setTab] = useState<string>('overview');

  if (projectNotFound) {
    return (
      <DashboardContent>
        <EmptyContent
          title="Project not found"
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.project.list}
              variant="contained"
              sx={{ mt: 2 }}
            >
              Back to projects
            </Button>
          }
        />
      </DashboardContent>
    );
  }

  const renderOverview = project && (
    <Card sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack>
            <Typography variant="subtitle2" color="text.secondary">
              {project.code}
            </Typography>
            <Typography variant="h5">{project.name}</Typography>
          </Stack>
          <Label variant="soft" color="info">
            {project.status}
          </Label>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          {project.description ?? 'No description'}
        </Typography>

        <Divider />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
          <Stack spacing={0.5} sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Progress
            </Typography>
            <LinearProgress variant="determinate" value={project.progress} />
            <Typography variant="body2">
              {project.completedTasks}/{project.totalTasks} tasks ({project.progress}%)
            </Typography>
          </Stack>
          <Stack spacing={0.5} sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Owner
            </Typography>
            <Typography variant="body2">{project.ownerName}</Typography>
          </Stack>
          <Stack spacing={0.5} sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Team size
            </Typography>
            <Typography variant="body2">{project.members.length} members</Typography>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );

  const renderKanban = project && <KanbanView projectId={project.id} title={project.name} />;

  const renderFiles = (
    <Card sx={{ p: 3 }}>
      <EmptyContent title="Files" description="File manager integration coming soon." />
    </Card>
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Projects', href: paths.dashboard.project.root },
          { name: project?.name ?? '' },
        ]}
        action={
          project && (
            <Can policy={ProjectPolicy.canEdit} subject={project}>
              <Button
                component={RouterLink}
                href={paths.dashboard.project.edit(project.id)}
                variant="contained"
                startIcon={<Iconify icon="solar:pen-bold" />}
              >
                Edit
              </Button>
            </Can>
          )
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <CustomTabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        {TABS.map((t) => (
          <Tab key={t.value} value={t.value} label={t.label} />
        ))}
      </CustomTabs>

      {projectLoading ? (
        <EmptyContent title="Loading..." />
      ) : (
        <>
          {tab === 'overview' && renderOverview}
          {tab === 'kanban' && renderKanban}
          {tab === 'files' && renderFiles}
        </>
      )}
    </DashboardContent>
  );
}
