import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { _userList } from 'src/_mock/_user';
import { useGetProjects } from 'src/actions/project';
import { DashboardContent } from 'src/layouts/dashboard';
import { SeoIllustration } from 'src/assets/illustrations';

import { AppWelcome } from 'src/sections/overview/app/app-welcome';
import { AppAreaInstalled } from 'src/sections/overview/app/app-area-installed';
import { AppWidgetSummary } from 'src/sections/overview/app/app-widget-summary';
import { AppCurrentDownload } from 'src/sections/overview/app/app-current-download';

import { useMockedUser } from 'src/auth/hooks';

// ----------------------------------------------------------------------

/**
 * Platform-level dashboard for the SaaS owner. Tenant data is mocked until the
 * multi-tenant backend lands - see the "Non-goals" note in the plan.
 */
export function OverviewSuperAdminView() {
  const { user } = useMockedUser();
  const theme = useTheme();

  const { projects } = useGetProjects();

  return (
    <DashboardContent>
      <Grid container spacing={3}>
        <Grid xs={12}>
          <AppWelcome
            title={`Platform control - ${user?.displayName}`}
            description="Monitor tenants, usage and platform health."
            img={<SeoIllustration hideBackground />}
            action={
              <Button component={RouterLink} href={paths.dashboard.user.list} variant="contained">
                Manage users
              </Button>
            }
          />
        </Grid>

        <Grid xs={12} md={3}>
          <AppWidgetSummary
            title="Tenants"
            total={12}
            percent={1.2}
            chart={{
              categories: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
              series: [8, 9, 9, 10, 11, 11, 12],
            }}
          />
        </Grid>
        <Grid xs={12} md={3}>
          <AppWidgetSummary
            title="Platform users"
            total={_userList.length * 12}
            percent={3.4}
            chart={{
              colors: [theme.vars.palette.info.main],
              categories: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
              series: [120, 150, 180, 210, 230, 235, _userList.length * 12],
            }}
          />
        </Grid>
        <Grid xs={12} md={3}>
          <AppWidgetSummary
            title="Total projects"
            total={projects.length * 12}
            percent={0.8}
            chart={{
              colors: [theme.vars.palette.success.main],
              categories: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
              series: [40, 50, 60, 70, 80, 90, projects.length * 12],
            }}
          />
        </Grid>
        <Grid xs={12} md={3}>
          <AppWidgetSummary
            title="MRR"
            total={24500}
            percent={4.1}
            chart={{
              colors: [theme.vars.palette.warning.main],
              categories: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
              series: [18000, 19500, 20100, 21000, 22500, 23800, 24500],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppCurrentDownload
            title="Tenant plans"
            chart={{
              series: [
                { label: 'Free', value: 4 },
                { label: 'Starter', value: 5 },
                { label: 'Pro', value: 2 },
                { label: 'Enterprise', value: 1 },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AppAreaInstalled
            title="Signups"
            subheader="New tenants and users"
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              series: [
                {
                  name: '2026',
                  data: [
                    { name: 'Tenants', data: [1, 2, 1, 3, 2, 3] },
                    { name: 'Users', data: [30, 45, 40, 65, 50, 70] },
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
