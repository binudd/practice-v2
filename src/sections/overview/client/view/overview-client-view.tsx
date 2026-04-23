import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { _appInvoices } from 'src/_mock';
import { useGetProjects } from 'src/actions/project';
import { DashboardContent } from 'src/layouts/dashboard';
import { SeoIllustration } from 'src/assets/illustrations';

import { Label } from 'src/components/label';
import { EmptyContent } from 'src/components/empty-content';

import { AppWelcome } from 'src/sections/overview/app/app-welcome';
import { AppNewInvoice } from 'src/sections/overview/app/app-new-invoice';

import { useMockedUser } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function OverviewClientView() {
  const { user } = useMockedUser();

  const { projects } = useGetProjects({ scope: 'mine' });

  const renderProjects = (
    <Card>
      <CardHeader title="Your projects" />
      <Box
        sx={{
          p: 3,
          gap: 2,
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
        }}
      >
        {projects.length === 0 ? (
          <EmptyContent title="No projects assigned" />
        ) : (
          projects.map((project) => (
            <Stack
              key={project.id}
              component={RouterLink}
              href={paths.dashboard.project.details(project.id)}
              spacing={1}
              sx={{
                p: 2,
                borderRadius: 1,
                border: (theme) => `solid 1px ${theme.vars.palette.divider}`,
                textDecoration: 'none',
                color: 'inherit',
                transition: (theme) => theme.transitions.create('background-color'),
                '&:hover': { bgcolor: 'background.neutral' },
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2">{project.name}</Typography>
                <Label variant="soft" color="info">
                  {project.status}
                </Label>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {project.code}
              </Typography>
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
      </Box>
    </Card>
  );

  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        <Grid xs={12}>
          <AppWelcome
            title={`Welcome ${user?.displayName} 👋`}
            description="Track the progress of your active engagements and invoices."
            img={<SeoIllustration hideBackground />}
            action={
              <Button
                component={RouterLink}
                href={paths.dashboard.invoice.list}
                variant="contained"
              >
                View invoices
              </Button>
            }
          />
        </Grid>

        <Grid xs={12}>{renderProjects}</Grid>

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
