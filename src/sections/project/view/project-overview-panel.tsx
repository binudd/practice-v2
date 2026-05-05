import type { IProject } from 'src/domain/project';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import LinearProgress from '@mui/material/LinearProgress';

import { fDate } from 'src/utils/format-time';
import { fNumber, fCurrency } from 'src/utils/format-number';

import { formatProjectCodeWithClient } from 'src/domain/project/project-selectors';

import { Label } from 'src/components/label';

import { PROJECT_STATUS_LABELS, PROJECT_STATUS_SOFT_COLOR } from '../project-status-meta';

// ----------------------------------------------------------------------

function displayDate(iso?: string) {
  return iso ? fDate(iso) : '—';
}

function displayHours(n?: number) {
  if (n == null || Number.isNaN(n)) return '—';
  return fNumber(n, { maximumFractionDigits: 2 }) || '—';
}

function displayCurrency(n?: number) {
  if (n == null || Number.isNaN(n)) return '—';
  return fCurrency(n) || '—';
}

function displayInt(n?: number) {
  if (n == null || Number.isNaN(n)) return '—';
  return fNumber(n, { maximumFractionDigits: 0 }) || '—';
}

type OverviewField = {
  readonly label: string;
  readonly value: React.ReactNode;
};

function PropertyGrid({ items }: { readonly items: readonly OverviewField[] }) {
  return (
    <Box
      display="grid"
      columnGap={3}
      rowGap={2.5}
      gridTemplateColumns={{ xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' }}
    >
      {items.map((row, index) => (
        <Stack key={`${index}-${row.label}`} spacing={0.5}>
          <Typography variant="caption" color="text.secondary">
            {row.label}
          </Typography>
          <Box sx={{ typography: 'subtitle2', wordBreak: 'break-word' }}>{row.value}</Box>
        </Stack>
      ))}
    </Box>
  );
}

export type ProjectOverviewPanelProps = {
  project: IProject;
};

export function ProjectOverviewPanel({ project }: ProjectOverviewPanelProps) {
  const desc = project.description?.trim();

  const peopleFields: OverviewField[] = [
    { label: 'Client company', value: project.clientCompanyName?.trim() || '—' },
    { label: 'Project owner', value: project.ownerName },
    { label: 'Project leader', value: project.projectLeaderName?.trim() || '—' },
  ];

  const timelineFields: OverviewField[] = [
    { label: 'Created date', value: displayDate(project.createdAt) },
    { label: 'Start date', value: displayDate(project.startDate) },
    { label: 'Due date', value: displayDate(project.endDate) },
    { label: 'Completion date', value: displayDate(project.completionDate) },
  ];

  const budgetFields: OverviewField[] = [
    { label: 'Budget hours', value: displayHours(project.budgetHours) },
    { label: 'Budget amount', value: displayCurrency(project.budgetAmount) },
    { label: 'Actual hours', value: displayHours(project.actualHours) },
    { label: 'Actual amount', value: displayCurrency(project.actualAmount) },
    { label: 'Daily hours', value: displayHours(project.dailyHours) },
  ];

  const taskFields: OverviewField[] = [
    { label: 'Total tasks', value: displayInt(project.totalTasks) },
    { label: 'Completed tasks', value: displayInt(project.completedTasks) },
    { label: 'Needs review', value: displayInt(project.needsReviewTaskCount) },
  ];

  return (
    <Grid container spacing={3}>
      <Grid xs={12} lg={8}>
        <Stack spacing={3}>
          <Card>
            <CardHeader
              titleTypographyProps={{ variant: 'h5' }}
              title={project.name}
              subheader={formatProjectCodeWithClient(project)}
              action={
                <Label variant="soft" color={PROJECT_STATUS_SOFT_COLOR[project.status]}>
                  {PROJECT_STATUS_LABELS[project.status]}
                </Label>
              }
              sx={{
                '& .MuiCardHeader-action': { alignSelf: 'center', mr: -0.25 },
              }}
            />
            <Divider />
            <Stack spacing={3} sx={{ p: { xs: 2.5, md: 3 } }}>
              {desc ? (
                <Typography variant="body2" color="text.secondary">
                  {desc}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                  No description added yet.
                </Typography>
              )}

              <Stack spacing={1}>
                <Typography variant="overline" color="text.secondary" sx={{ opacity: 0.9 }}>
                  Progress
                </Typography>
                <LinearProgress variant="determinate" value={project.progress} sx={{ height: 8, borderRadius: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  {project.completedTasks}/{project.totalTasks} tasks ({project.progress}%)
                </Typography>
              </Stack>
            </Stack>
          </Card>

          <Card>
            <CardHeader title="People & organization" />
            <Divider />
            <Box sx={{ p: { xs: 2.5, md: 3 } }}>
              <PropertyGrid items={peopleFields} />
            </Box>
          </Card>

          <Card>
            <CardHeader title="Schedule" subheader="Key milestones and timelines" />
            <Divider />
            <Box sx={{ p: { xs: 2.5, md: 3 } }}>
              <PropertyGrid items={timelineFields} />
            </Box>
          </Card>

          <Card>
            <CardHeader title="Budget & time" subheader="Planned versus actual workload" />
            <Divider />
            <Box sx={{ p: { xs: 2.5, md: 3 } }}>
              <PropertyGrid items={budgetFields} />
            </Box>
          </Card>

          <Card>
            <CardHeader title="Tasks & review" />
            <Divider />
            <Box sx={{ p: { xs: 2.5, md: 3 } }}>
              <PropertyGrid items={taskFields} />
            </Box>
          </Card>
        </Stack>
      </Grid>

      <Grid xs={12} lg={4}>
        <Card sx={{ height: 'fit-content' }}>
          <CardHeader title="At a glance" />
          <Divider />
          <Stack spacing={2.25} sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Completion
              </Typography>
              <Typography variant="h3">{project.progress}%</Typography>
              <Typography variant="caption" color="text.secondary">
                {PROJECT_STATUS_LABELS[project.status]}
              </Typography>
            </Stack>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Stack spacing={1}>
              <Typography variant="overline" color="text.secondary" sx={{ opacity: 0.9 }}>
                Tasks
              </Typography>
              <Typography variant="subtitle2">
                {project.completedTasks} completed / {project.totalTasks} total
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending review: {displayInt(project.needsReviewTaskCount)}
              </Typography>
            </Stack>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Stack spacing={1}>
              <Typography variant="overline" color="text.secondary" sx={{ opacity: 0.9 }}>
                Hours snapshot
              </Typography>
              <Typography variant="body2" component="div">
                <Box component="span" sx={{ color: 'text.secondary' }}>
                  Budget:{' '}
                </Box>
                {displayHours(project.budgetHours)}
              </Typography>
              <Typography variant="body2" component="div">
                <Box component="span" sx={{ color: 'text.secondary' }}>
                  Actual:{' '}
                </Box>
                {displayHours(project.actualHours)}
              </Typography>
            </Stack>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Stack spacing={1}>
              <Typography variant="overline" color="text.secondary" sx={{ opacity: 0.9 }}>
                Amounts
              </Typography>
              <Typography variant="body2" component="div">
                <Box component="span" sx={{ color: 'text.secondary' }}>
                  Budget:{' '}
                </Box>
                {displayCurrency(project.budgetAmount)}
              </Typography>
              <Typography variant="body2" component="div">
                <Box component="span" sx={{ color: 'text.secondary' }}>
                  Actual:{' '}
                </Box>
                {displayCurrency(project.actualAmount)}
              </Typography>
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
}
