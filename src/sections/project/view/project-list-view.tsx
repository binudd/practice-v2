import type { ViewMode } from 'src/store/ui-preferences-store';
import type { GridColDef, GridRowParams } from '@mui/x-data-grid';
import type { IProject, IProjectStatus } from 'src/types/project';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useGetProjects } from 'src/actions/project';
import { DashboardContent } from 'src/layouts/dashboard';
import { PROJECT_STATUS_OPTIONS } from 'src/_mock/_project';
import { useUIPreferencesStore } from 'src/store/ui-preferences-store';
import { useFiltersStore, selectScreenFilter } from 'src/store/filters-store';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { Can } from 'src/auth/guard';
import { useCurrentRole } from 'src/auth/hooks';

import { ProjectCardList } from '../project-card-list';

// ----------------------------------------------------------------------

const SCREEN_KEY = 'project.list';

const statusLabel: Record<IProjectStatus, string> = PROJECT_STATUS_OPTIONS.reduce(
  (acc, option) => ({ ...acc, [option.value]: option.label }),
  {} as Record<IProjectStatus, string>
);

const statusColor: Record<IProjectStatus, 'success' | 'warning' | 'info' | 'default'> = {
  active: 'success',
  'on-hold': 'warning',
  completed: 'info',
  archived: 'default',
};

// ----------------------------------------------------------------------

export function ProjectListView() {
  const router = useRouter();

  const role = useCurrentRole();

  // Clients only see their own projects; everyone else sees the full list.
  const { projects, projectsLoading, projectsEmpty } = useGetProjects({
    scope: role === 'client' ? 'mine' : 'all',
  });

  const view = useUIPreferencesStore((s) => s.viewMode[SCREEN_KEY] ?? 'list');
  const setViewMode = useUIPreferencesStore((s) => s.setViewMode);

  const filter = useFiltersStore(selectScreenFilter(SCREEN_KEY));
  const setFilter = useFiltersStore((s) => s.setFilter);

  const search = (filter.search as string | undefined) ?? '';
  const statusFilter = ((filter.status as string | undefined) ?? 'all') as IProjectStatus | 'all';

  const handleChangeView = useCallback(
    (event: React.MouseEvent<HTMLElement>, newView: ViewMode | null) => {
      if (newView !== null) setViewMode(SCREEN_KEY, newView);
    },
    [setViewMode]
  );

  const handleOpenBoard = useCallback(
    (id: string) => {
      router.push(paths.dashboard.project.kanban(id));
    },
    [router]
  );

  const handleOpenDetails = useCallback(
    (id: string) => {
      router.push(paths.dashboard.project.details(id));
    },
    [router]
  );

  const dataFiltered = projects.filter((project) => {
    const matchesSearch =
      !search ||
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.code.toLowerCase().includes(search.toLowerCase()) ||
      project.ownerName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const notFound = !projectsLoading && dataFiltered.length === 0;

  const columns: GridColDef<IProject>[] = [
    {
      field: 'code',
      headerName: 'Code',
      width: 120,
    },
    {
      field: 'name',
      headerName: 'Project',
      flex: 1,
      minWidth: 220,
    },
    {
      field: 'ownerName',
      headerName: 'Owner',
      width: 180,
    },
    {
      field: 'members',
      headerName: 'Members',
      width: 110,
      valueGetter: (value: string[]) => value.length,
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: 200,
      renderCell: (params) => (
        <Stack spacing={0.5} sx={{ width: 1, py: 1 }}>
          <LinearProgress
            variant="determinate"
            value={params.value}
            sx={{ height: 6, borderRadius: 1 }}
          />
          <Box sx={{ typography: 'caption', color: 'text.secondary' }}>
            {params.row.completedTasks}/{params.row.totalTasks} tasks ({params.value}%)
          </Box>
        </Stack>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Label variant="soft" color={statusColor[params.value as IProjectStatus]}>
          {statusLabel[params.value as IProjectStatus]}
        </Label>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      filterable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Open board">
            <IconButton onClick={() => handleOpenBoard(params.row.id)}>
              <Iconify icon="solar:list-check-bold" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Details">
            <IconButton onClick={() => handleOpenDetails(params.row.id)}>
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const renderToolbar = (
    <Stack
      spacing={2}
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'stretch', md: 'center' }}
      sx={{ mb: 2.5 }}
    >
      <TextField
        size="small"
        placeholder="Search projects..."
        value={search}
        onChange={(e) => setFilter(SCREEN_KEY, { search: e.target.value })}
        sx={{ flex: 1 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        select
        size="small"
        value={statusFilter}
        onChange={(e) => setFilter(SCREEN_KEY, { status: e.target.value })}
        SelectProps={{ native: true }}
        sx={{ minWidth: 180 }}
      >
        <option value="all">All statuses</option>
        {PROJECT_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </TextField>

      <ToggleButtonGroup size="small" value={view} exclusive onChange={handleChangeView}>
        <ToggleButton value="list" aria-label="List view">
          <Iconify icon="solar:list-bold" />
        </ToggleButton>
        <ToggleButton value="grid" aria-label="Grid view">
          <Iconify icon="mingcute:dot-grid-fill" />
        </ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );

  const renderList = (
    <Card sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <DataGrid
        autoHeight
        disableRowSelectionOnClick
        loading={projectsLoading}
        rows={dataFiltered}
        columns={columns}
        pageSizeOptions={[10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        onRowClick={(params: GridRowParams<IProject>) => handleOpenDetails(params.row.id)}
        slots={{
          noRowsOverlay: () => <EmptyContent title="No projects" />,
          noResultsOverlay: () => <EmptyContent title="No results" />,
        }}
        sx={{
          [`& .${gridClasses.row}`]: { cursor: 'pointer' },
        }}
      />
    </Card>
  );

  const renderGrid = <ProjectCardList projects={dataFiltered} />;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Projects"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Projects', href: paths.dashboard.project.root },
          { name: 'List' },
        ]}
        action={
          <Can perm="project:create">
            <Button
              component={RouterLink}
              href={paths.dashboard.project.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New project
            </Button>
          </Can>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {renderToolbar}

      {projectsEmpty ? (
        <EmptyContent title="No projects" sx={{ py: 10 }} />
      ) : notFound ? (
        <EmptyContent title="No results" sx={{ py: 10 }} />
      ) : (
        <>{view === 'list' ? renderList : renderGrid}</>
      )}
    </DashboardContent>
  );
}
