import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { _appInvoices } from 'src/_mock';
import { useGetProjects } from 'src/actions/project';
import { DashboardContent } from 'src/layouts/dashboard';
import { SeoIllustration } from 'src/assets/illustrations';

import { breadcrumbHomeLink, useSetDashboardBreadcrumbs } from 'src/components/dashboard-breadcrumbs';

import { AppWelcome } from 'src/sections/overview/app/app-welcome';
import { AppNewInvoice } from 'src/sections/overview/app/app-new-invoice';
import { AppAreaInstalled } from 'src/sections/overview/app/app-area-installed';
import { AppWidgetSummary } from 'src/sections/overview/app/app-widget-summary';
import { AppCurrentDownload } from 'src/sections/overview/app/app-current-download';

import { useMockedUser } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function OverviewAdminView() {
  const { user } = useMockedUser();
  const theme = useTheme();

  const { projects } = useGetProjects();

  useSetDashboardBreadcrumbs([breadcrumbHomeLink, { name: 'Overview' }], undefined, []);

  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const totalTasks = projects.reduce((sum, p) => sum + p.totalTasks, 0);
  const completedTasks = projects.reduce((sum, p) => sum + p.completedTasks, 0);

  return (
    <DashboardContent>
      <Grid container spacing={3}>
        <Grid xs={12}>
          <AppWelcome
            title={`Welcome back 👋 \n ${user?.displayName}`}
            description="Organization-wide view. Manage projects, people and billing from one place."
            img={<SeoIllustration hideBackground />}
            action={
              <Button component={RouterLink} href={paths.dashboard.project.new} variant="contained">
                New project
              </Button>
            }
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Active projects"
            percent={2.6}
            total={activeProjects}
            chart={{
              categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              series: [3, 4, 4, 5, 5, activeProjects, activeProjects],
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Tasks completed"
            percent={0.2}
            total={completedTasks}
            chart={{
              colors: [theme.vars.palette.info.main],
              categories: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
              series: [20, 41, 63, 33, 28, 35, completedTasks],
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Open tasks"
            percent={-0.1}
            total={Math.max(totalTasks - completedTasks, 0)}
            chart={{
              colors: [theme.vars.palette.error.main],
              categories: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
              series: [18, 19, 31, 8, 16, 37, totalTasks - completedTasks],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppCurrentDownload
            title="Projects by status"
            chart={{
              series: [
                { label: 'Active', value: projects.filter((p) => p.status === 'active').length },
                {
                  label: 'On hold',
                  value: projects.filter((p) => p.status === 'on-hold').length,
                },
                {
                  label: 'Completed',
                  value: projects.filter((p) => p.status === 'completed').length,
                },
                {
                  label: 'Archived',
                  value: projects.filter((p) => p.status === 'archived').length,
                },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AppAreaInstalled
            title="Task completion"
            subheader="Trend across the quarter"
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              series: [
                {
                  name: 'This year',
                  data: [
                    { name: 'Completed', data: [30, 45, 55, 70, 82, completedTasks] },
                    { name: 'Opened', data: [40, 55, 65, 72, 88, totalTasks] },
                  ],
                },
              ],
            }}
          />
        </Grid>

        <Grid xs={12}>
          <AppNewInvoice
            title="Recent invoices"
            tableData={_appInvoices}
            headLabel={[
              { id: 'id', label: 'Invoice ID' },
              { id: 'category', label: 'Category' },
              { id: 'price', label: 'Price' },
              { id: 'status', label: 'Status' },
              { id: '' },
            ]}
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
