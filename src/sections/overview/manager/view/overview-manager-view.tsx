import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useGetProjects } from 'src/actions/project';
import { DashboardContent } from 'src/layouts/dashboard';
import { SeoIllustration } from 'src/assets/illustrations';

import { breadcrumbHomeLink, useSetDashboardBreadcrumbs } from 'src/components/dashboard-breadcrumbs';

import { AppWelcome } from 'src/sections/overview/app/app-welcome';
import { AppAreaInstalled } from 'src/sections/overview/app/app-area-installed';
import { AppWidgetSummary } from 'src/sections/overview/app/app-widget-summary';
import { AppCurrentDownload } from 'src/sections/overview/app/app-current-download';

import { useMockedUser } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function OverviewManagerView() {
  const { user } = useMockedUser();

  const { projects } = useGetProjects();

  useSetDashboardBreadcrumbs([breadcrumbHomeLink, { name: 'Overview' }], undefined, []);

  const myProjects = projects.filter((p) => p.status === 'active').slice(0, 6);

  return (
    <DashboardContent>
      <Grid container spacing={3}>
        <Grid xs={12}>
          <AppWelcome
            title={`Welcome back 👋 \n ${user?.displayName}`}
            description="Your team's workload, project progress and upcoming milestones."
            img={<SeoIllustration hideBackground />}
            action={
              <Button component={RouterLink} href={paths.dashboard.project.new} variant="contained">
                Start a project
              </Button>
            }
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="My active projects"
            total={myProjects.length}
            percent={0}
            chart={{
              categories: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
              series: [2, 3, 3, 4, 4, myProjects.length, myProjects.length],
            }}
          />
        </Grid>
        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Team members"
            total={new Set(projects.flatMap((p) => p.members)).size}
            percent={0}
            chart={{
              categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
              series: [6, 6, 7, 7, 8],
            }}
          />
        </Grid>
        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Tasks due this week"
            total={projects.reduce((sum, p) => sum + (p.totalTasks - p.completedTasks), 0)}
            percent={0}
            chart={{
              categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
              series: [5, 8, 12, 6, 4],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppCurrentDownload
            title="My projects"
            subheader="Tasks distribution"
            chart={{
              series: myProjects.slice(0, 4).map((p) => ({
                label: p.name,
                value: p.totalTasks,
              })),
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AppAreaInstalled
            title="Sprint velocity"
            subheader="Completed vs planned"
            chart={{
              categories: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Sprint 5', 'Sprint 6'],
              series: [
                {
                  name: 'This quarter',
                  data: [
                    { name: 'Completed', data: [22, 27, 31, 29, 34, 38] },
                    { name: 'Planned', data: [30, 30, 34, 33, 36, 40] },
                  ],
                },
              ],
            }}
          />
        </Grid>

      </Grid>
    </DashboardContent>
  );
}
