import type { IProject } from 'src/domain/project';

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { varAlpha } from 'src/theme/styles';
import { useGetProject } from 'src/actions/project';
import { DashboardContent } from 'src/layouts/dashboard';
import { ProjectPolicy } from 'src/domain/project/project-policy';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { breadcrumbHomeLink, useSetDashboardBreadcrumbs } from 'src/components/dashboard-breadcrumbs';

import { ProjectTimeView } from 'src/sections/project/time';
import { ProjectChatView } from 'src/sections/project/chat';
import { ProjectMailView } from 'src/sections/project/mail';
import { ProjectNotesView } from 'src/sections/project/notes';
import { ProjectFilesView } from 'src/sections/project/files';
import { KanbanView } from 'src/sections/kanban/view/kanban-view';
import { ProjectExpenseView } from 'src/sections/project/expense';
import { ProjectActivityView } from 'src/sections/project/activity';
import { ProjectTaskTypesView } from 'src/sections/project/task-type';
import { ProjectRecurringView } from 'src/sections/project/recurring';
import { ProjectDiscussionView } from 'src/sections/project/discussion';
import { ProjectAutomationView } from 'src/sections/project/automation';

import { Can } from 'src/auth/guard';

import { PROJECT_DETAIL_QUERY_KEYS } from './project-detail-query-params';
import {
  PROJECT_DETAIL_TABS,
  type ProjectDetailTabId,
  isValidProjectDetailTabId,
  PROJECT_DETAIL_DEFAULT_TAB,
  parseProjectDetailTabParam,
} from './project-details-tabs';

// ----------------------------------------------------------------------

type Props = {
  id: string;
};

function renderOverviewPanel(project: IProject) {
  return (
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
}

function renderTabPanel(tab: ProjectDetailTabId, project: IProject | undefined) {
  switch (tab) {
    case 'overview':
      return project ? renderOverviewPanel(project) : null;
    case 'kanban':
      return project ? <KanbanView embedded projectId={project.id} title={project.name} /> : null;
    case 'files':
      return project ? <ProjectFilesView projectId={project.id} /> : null;
    case 'discussion':
      return project ? <ProjectDiscussionView projectId={project.id} project={project} /> : null;
    case 'task-type':
      return project ? <ProjectTaskTypesView projectId={project.id} /> : null;
    case 'recurring':
      return project ? <ProjectRecurringView projectId={project.id} /> : null;
    case 'notes':
      return project ? <ProjectNotesView projectId={project.id} /> : null;
    case 'time':
      return project ? <ProjectTimeView projectId={project.id} /> : null;
    case 'expense':
      return project ? <ProjectExpenseView projectId={project.id} /> : null;
    case 'activity':
      return project ? <ProjectActivityView projectId={project.id} /> : null;
    case 'automation':
      return project ? <ProjectAutomationView projectId={project.id} /> : null;
    case 'chat':
      return project ? <ProjectChatView projectId={project.id} /> : null;
    case 'mail':
      return project ? <ProjectMailView projectId={project.id} /> : null;
    default: {
      const _exhaustive: never = tab;
      return _exhaustive;
    }
  }
}

export function ProjectDetailsView({ id }: Props) {
  const { project, projectLoading, projectNotFound } = useGetProject(id);

  const [searchParams, setSearchParams] = useSearchParams();
  const rawTabParam = searchParams.get('tab');
  const tab = parseProjectDetailTabParam(rawTabParam);

  useEffect(() => {
    if (rawTabParam !== null && !isValidProjectDetailTabId(rawTabParam)) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('tab');
          return next;
        },
        { replace: true }
      );
    }
  }, [rawTabParam, setSearchParams]);

  const handleTabChange = (_: React.SyntheticEvent, value: ProjectDetailTabId) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === PROJECT_DETAIL_DEFAULT_TAB) {
          next.delete('tab');
        } else {
          next.set('tab', value);
        }
        PROJECT_DETAIL_QUERY_KEYS.forEach((key) => next.delete(key));
        return next;
      },
      { replace: true }
    );
  };

  useSetDashboardBreadcrumbs(
    [
      breadcrumbHomeLink,
      { name: 'Projects', href: paths.dashboard.project.root },
      {
        name: projectNotFound ? 'Not found' : (project?.name ?? (projectLoading ? 'Loading…' : '')),
      },
    ],
    project && !projectNotFound ? (
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
    ) : undefined,
    [project, projectLoading, projectNotFound]
  );

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

  return (
    <DashboardContent
      sx={{
        flex: '1 1 auto',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Tabs
        value={tab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2.5,
          boxShadow: (theme) =>
            `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
        }}
      >
        {PROJECT_DETAIL_TABS.map((t) => (
          <Tab
            key={t.value}
            value={t.value}
            label={t.label}
            icon={<Iconify icon={t.icon} width={24} />}
            iconPosition="start"
          />
        ))}
      </Tabs>

      {projectLoading ? (
        <EmptyContent title="Loading..." />
      ) : (
        <Box
          sx={{
            flex: '1 1 auto',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {renderTabPanel(tab, project)}
        </Box>
      )}
    </DashboardContent>
  );
}
