import { useMemo } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useGetProjects } from 'src/actions/project';
import { useGetTimesheet } from 'src/actions/timesheet';
import { DashboardContent } from 'src/layouts/dashboard';
import { SeoIllustration } from 'src/assets/illustrations';
import { startOfWeek, CURRENT_USER_ID } from 'src/_mock/_timesheet';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { breadcrumbHomeLink, useSetDashboardBreadcrumbs } from 'src/components/dashboard-breadcrumbs';

import { AppWelcome } from 'src/sections/overview/app/app-welcome';
import { AppWidgetSummary } from 'src/sections/overview/app/app-widget-summary';

import { useMockedUser } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function OverviewMemberView() {
  const { user } = useMockedUser();

  const { projects } = useGetProjects();

  useSetDashboardBreadcrumbs([breadcrumbHomeLink, { name: 'Overview' }], undefined, []);

  const weekStart = useMemo(() => startOfWeek(new Date()), []);

  const { entries, weekDays } = useGetTimesheet(CURRENT_USER_ID, weekStart, 7);

  const weekTotal = entries.reduce((sum, e) => sum + e.hours, 0);

  const myProjects = projects.filter((p) => p.members.includes(CURRENT_USER_ID) || true).slice(0, 5);

  const renderMyWork = (
    <Card>
      <CardHeader title="My projects" subheader="Projects you are assigned to" />
      <Stack spacing={2} sx={{ p: 3 }}>
        {myProjects.length === 0 ? (
          <EmptyContent title="No projects" />
        ) : (
          myProjects.map((project) => (
            <Stack
              key={project.id}
              component={RouterLink}
              href={paths.dashboard.project.kanban(project.id)}
              spacing={1}
              sx={{
                p: 2,
                borderRadius: 1,
                border: (theme) => `solid 1px ${theme.vars.palette.divider}`,
                textDecoration: 'none',
                color: 'inherit',
                transition: (theme) => theme.transitions.create('background-color'),
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2" noWrap>
                  {project.name}
                </Typography>
                <Label variant="soft" color="info">
                  {project.status}
                </Label>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={project.progress}
                sx={{ height: 6, borderRadius: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                {project.completedTasks}/{project.totalTasks} tasks - {project.progress}%
              </Typography>
            </Stack>
          ))
        )}
      </Stack>
    </Card>
  );

  return (
    <DashboardContent>
      <Grid container spacing={3}>
        <Grid xs={12}>
          <AppWelcome
            title={`Hi ${user?.displayName} 👋`}
            description="Here's what's on your plate this week."
            img={<SeoIllustration hideBackground />}
            action={
              <Button component={RouterLink} href={paths.dashboard.timesheet} variant="contained">
                Log hours
              </Button>
            }
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="My projects"
            total={myProjects.length}
            percent={0}
            chart={{
              categories: ['W1', 'W2', 'W3', 'W4', 'W5'],
              series: [2, 3, 3, 3, myProjects.length],
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Open tasks"
            total={myProjects.reduce((s, p) => s + (p.totalTasks - p.completedTasks), 0)}
            percent={0}
            chart={{
              categories: weekDays.map((d) => d.slice(5)),
              series: [4, 3, 5, 2, 3, 1, 0],
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Hours this week"
            total={weekTotal}
            percent={0}
            chart={{
              categories: weekDays.map((d) => d.slice(5)),
              series: weekDays.map(
                (d) => entries.filter((e) => e.date === d).reduce((s, e) => s + e.hours, 0) || 0
              ),
            }}
          />
        </Grid>

        <Grid xs={12} md={7}>
          {renderMyWork}
        </Grid>

        <Grid xs={12} md={5}>
          <Card sx={{ height: 1 }}>
            <CardHeader title="Quick links" />
            <Stack spacing={1.5} sx={{ p: 3 }}>
              <Button
                component={RouterLink}
                href={paths.dashboard.kanban}
                variant="outlined"
                startIcon={<Iconify icon="solar:list-check-bold" />}
                sx={{ justifyContent: 'flex-start' }}
              >
                My tasks (Kanban)
              </Button>
              <Button
                component={RouterLink}
                href={paths.dashboard.calendar}
                variant="outlined"
                startIcon={<Iconify icon="solar:calendar-bold" />}
                sx={{ justifyContent: 'flex-start' }}
              >
                Calendar
              </Button>
              <Button
                component={RouterLink}
                href={paths.dashboard.timesheet}
                variant="outlined"
                startIcon={<Iconify icon="solar:clock-circle-bold" />}
                sx={{ justifyContent: 'flex-start' }}
              >
                Timesheet
              </Button>
              <Button
                component={RouterLink}
                href={paths.dashboard.chat}
                variant="outlined"
                startIcon={<Iconify icon="solar:chat-round-bold" />}
                sx={{ justifyContent: 'flex-start' }}
              >
                Chat
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
