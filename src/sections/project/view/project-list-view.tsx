import type { IDatePickerControl } from 'src/types/common';
import type { ViewMode } from 'src/store/ui-preferences-store';
import type { GridColDef, GridRowParams } from '@mui/x-data-grid';
import type { IProject, IProjectStatus, IProjectPriority } from 'src/types/project';

import { useMemo, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import LinearProgress from '@mui/material/LinearProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { fIsAfter, fIsBetween } from 'src/utils/format-time';

import { varAlpha } from 'src/theme/styles';
import { useGetProjects } from 'src/actions/project';
import { DashboardContent } from 'src/layouts/dashboard';
import { PROJECT_STATUS_OPTIONS } from 'src/_mock/_project';
import { useUIPreferencesStore } from 'src/store/ui-preferences-store';
import { useFiltersStore, selectScreenFilter } from 'src/store/filters-store';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import {
  breadcrumbHomeLink,
  useSetDashboardBreadcrumbs,
  DashboardToolbarPrimaryButton,
} from 'src/components/dashboard-breadcrumbs';

import { Can } from 'src/auth/guard';
import { useCurrentRole } from 'src/auth/hooks';

import { ProjectCardList } from '../project-card-list';
import { ProjectListFilters } from '../project-list-filters';
import { ProjectListFiltersResult } from '../project-list-filters-result';
import {
  PROJECT_LIST_FILTER_KEY,
  PROJECT_BROWSE_FILTER_KEYS,
} from '../project-list-filter-key';

// ----------------------------------------------------------------------

/** Main project browse: active | completed | overview. Templates/recurring are separate hubs. */
const DEFAULT_MODULE_TABS = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'overview', label: 'Overview' },
] as const;

type DefaultModuleTabValue = (typeof DEFAULT_MODULE_TABS)[number]['value'];

const DEFAULT_TAB_SET = new Set<string>(DEFAULT_MODULE_TABS.map((t) => t.value));

export type ProjectListViewProps = {
  /** Standalone hubs: templates & recurring projects have their own routes and filter-store keys. */
  moduleHub?: 'templates' | 'recurring';
};

/** Row filter excluding overview dashboard. */
export type BrowseListTab =
  | Exclude<DefaultModuleTabValue, 'overview'>
  | 'templates'
  | 'recurring';

const EMPTY_TITLE: Record<Exclude<BrowseListTab, 'overview'>, string> = {
  active: 'No active projects',
  completed: 'No completed projects',
  templates: 'No templates',
  recurring: 'No recurring projects',
};

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

function OverviewStatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card sx={{ p: 2.5, height: 1 }}>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="h4">{value}</Typography>
    </Card>
  );
}

function OverviewStatCardLink({
  title,
  value,
  href,
}: {
  title: string;
  value: number;
  href: string;
}) {
  return (
    <Card
      component={RouterLink}
      href={href}
      sx={{
        p: 2.5,
        height: 1,
        textDecoration: 'none',
        transition: (theme) => theme.transitions.create(['box-shadow', 'border-color']),
        '&:hover': {
          boxShadow: (theme) => theme.customShadows.card,
          borderColor: 'primary.main',
        },
      }}
    >
      <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="h4" color="text.primary">
        {value}
      </Typography>
    </Card>
  );
}

function matchesModuleTab(project: IProject, tab: Exclude<BrowseListTab, 'overview'>): boolean {
  if (tab === 'active') return project.status === 'active' || project.status === 'on-hold';
  if (tab === 'completed') return project.status === 'completed';
  if (tab === 'templates') return project.isTemplate;
  return project.isRecurring;
}

const PRIORITY_SET = new Set<IProjectPriority>(['low', 'medium', 'high', 'critical']);

function normalizePriorities(raw: unknown): IProjectPriority[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((p): p is IProjectPriority => PRIORITY_SET.has(p as IProjectPriority));
}

// ----------------------------------------------------------------------

type ProjectListBrowseMode =
  | { kind: 'default' }
  | { kind: 'module'; moduleKey: 'templates' | 'recurring' };

export function ProjectListView({ moduleHub }: ProjectListViewProps) {
  const browseMode: ProjectListBrowseMode =
    moduleHub === 'templates' || moduleHub === 'recurring'
      ? { kind: 'module', moduleKey: moduleHub }
      : { kind: 'default' };

  const moduleBrowseKey = browseMode.kind === 'module' ? browseMode.moduleKey : null;
  const router = useRouter();

  const openFilters = useBoolean();

  const role = useCurrentRole();

  const SCREEN_KEY =
    browseMode.kind === 'module'
      ? browseMode.moduleKey === 'templates'
        ? PROJECT_BROWSE_FILTER_KEYS.templates
        : PROJECT_BROWSE_FILTER_KEYS.recurring
      : PROJECT_BROWSE_FILTER_KEYS.default;

  // Clients only see their own projects; everyone else sees the full list.
  const { projects, projectsLoading, projectsEmpty } = useGetProjects({
    scope: role === 'client' ? 'mine' : 'all',
  });

  const view = useUIPreferencesStore((s) => s.viewMode[SCREEN_KEY] ?? 'list');
  const setViewMode = useUIPreferencesStore((s) => s.setViewMode);

  const filter = useFiltersStore(selectScreenFilter(SCREEN_KEY));
  const setFilter = useFiltersStore((s) => s.setFilter);

  const search = (filter.search as string | undefined) ?? '';
  const rawModuleTabRaw = browseMode.kind === 'default' ? filter.moduleTab : undefined;
  const rawModuleTab =
    browseMode.kind === 'default'
      ? (rawModuleTabRaw as string | undefined)
      : undefined;

  /** Legacy: templates/recurring used to live on the default list tabs; migrate to hubs. */
  useEffect(() => {
    if (browseMode.kind !== 'default') return;
    const m = rawModuleTab as string | undefined;
    if (m === 'templates' || m === 'recurring') {
      setFilter(PROJECT_LIST_FILTER_KEY, { moduleTab: 'active' });
    }
  }, [browseMode.kind, rawModuleTab, setFilter]);

  const defaultModuleTab: DefaultModuleTabValue =
    browseMode.kind === 'default'
      ? rawModuleTab && DEFAULT_TAB_SET.has(rawModuleTab)
        ? (rawModuleTab as DefaultModuleTabValue)
        : 'active'
      : 'active';

  const listBrowseTab: BrowseListTab | 'overview' =
    browseMode.kind === 'module' ? browseMode.moduleKey : defaultModuleTab;

  const priorities = normalizePriorities(filter.priorities);
  const filterStartDate = (filter.startDate as IDatePickerControl | undefined) ?? null;
  const filterEndDate = (filter.endDate as IDatePickerControl | undefined) ?? null;

  const dateError = Boolean(
    filterStartDate && filterEndDate && fIsAfter(filterStartDate, filterEndDate)
  );

  const canReset =
    priorities.length > 0 ||
    Boolean(filterStartDate && filterEndDate) ||
    Boolean(search.trim());

  const resetDrawerFilters = useCallback(() => {
    setFilter(SCREEN_KEY, {
      priorities: [],
      startDate: null,
      endDate: null,
      search: '',
    });
  }, [SCREEN_KEY, setFilter]);

  const handleClearProjectSearch = useCallback(() => {
    setFilter(SCREEN_KEY, { search: '' });
  }, [SCREEN_KEY, setFilter]);

  const handleChangeView = useCallback(
    (event: React.MouseEvent<HTMLElement>, newView: ViewMode | null) => {
      if (newView !== null) setViewMode(SCREEN_KEY, newView);
    },
    [SCREEN_KEY, setViewMode]
  );

  const handleModuleTabChange = useCallback(
    (_: React.SyntheticEvent, value: DefaultModuleTabValue) => {
      setFilter(PROJECT_LIST_FILTER_KEY, { moduleTab: value });
    },
    [setFilter]
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

  const overviewStats = useMemo(() => {
    const active = projects.filter((p) => p.status === 'active').length;
    const onHold = projects.filter((p) => p.status === 'on-hold').length;
    const completed = projects.filter((p) => p.status === 'completed').length;
    const archived = projects.filter((p) => p.status === 'archived').length;
    const templates = projects.filter((p) => p.isTemplate).length;
    const recurring = projects.filter((p) => p.isRecurring).length;
    return { active, onHold, completed, archived, templates, recurring, total: projects.length };
  }, [projects]);

  const moduleTabCounts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matchesSearch = (project: IProject) =>
      !q ||
      project.name.toLowerCase().includes(q) ||
      project.code.toLowerCase().includes(q) ||
      project.ownerName.toLowerCase().includes(q);

    const scoped = projects.filter(matchesSearch);

    return {
      active: scoped.filter((p) => matchesModuleTab(p, 'active')).length,
      completed: scoped.filter((p) => matchesModuleTab(p, 'completed')).length,
      overview: scoped.length,
    };
  }, [projects, search]);

  const dataFiltered = useMemo(() => {
    if (listBrowseTab === 'overview') return [];

    const tabRow = listBrowseTab as Exclude<BrowseListTab, 'overview'>;

    return projects.filter((project) => {
      const matchesSearch =
        !search ||
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.code.toLowerCase().includes(search.toLowerCase()) ||
        project.ownerName.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch || !matchesModuleTab(project, tabRow)) {
        return false;
      }

      if (priorities.length && !priorities.includes(project.priority)) {
        return false;
      }

      if (!dateError && filterStartDate && filterEndDate) {
        if (!fIsBetween(project.startDate, filterStartDate, filterEndDate)) {
          return false;
        }
      }

      return true;
    });
  }, [
    listBrowseTab,
    projects,
    search,
    priorities,
    dateError,
    filterStartDate,
    filterEndDate,
  ]);

  const notFound = !projectsLoading && !projectsEmpty && dataFiltered.length === 0;

  const searchTrimmed = search.trim();

  const browseContextLabel = useMemo(() => {
    if (moduleBrowseKey === 'templates') return 'Templates';
    if (moduleBrowseKey === 'recurring') return 'Recurring projects';
    const tabEntry = DEFAULT_MODULE_TABS.find((t) => t.value === defaultModuleTab);
    return tabEntry?.label ?? 'Projects';
  }, [moduleBrowseKey, defaultModuleTab]);

  const breadcrumbsForToolbar = useMemo(() => {
    if (moduleHub === 'templates') {
      return [
        breadcrumbHomeLink,
        { name: 'Projects', href: paths.dashboard.project.root },
        { name: 'Templates' },
      ] as const;
    }
    if (moduleHub === 'recurring') {
      return [
        breadcrumbHomeLink,
        { name: 'Projects', href: paths.dashboard.project.root },
        { name: 'Recurring projects' },
      ] as const;
    }
    return [
      breadcrumbHomeLink,
      { name: 'Projects', href: paths.dashboard.project.root },
      { name: 'List' },
    ] as const;
  }, [moduleHub]);

  const primaryToolbarAction =
    moduleHub === 'templates' || moduleHub === 'recurring' ? (
      <Can perm="project:create">
        <DashboardToolbarPrimaryButton
          component={RouterLink}
          href={
            moduleHub === 'templates'
              ? paths.dashboard.project.newWithPreset('template')
              : paths.dashboard.project.newWithPreset('recurring')
          }
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          {moduleHub === 'templates' ? 'New template' : 'New recurring project'}
        </DashboardToolbarPrimaryButton>
      </Can>
    ) : (
      <Can perm="project:create">
        <DashboardToolbarPrimaryButton
          component={RouterLink}
          href={paths.dashboard.project.new}
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          New project
        </DashboardToolbarPrimaryButton>
      </Can>
    );

  useSetDashboardBreadcrumbs([...breadcrumbsForToolbar], primaryToolbarAction, [moduleHub]);

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

  const renderOverview = (
    <Grid container spacing={3}>
      <Grid xs={12} sm={6} md={4}>
        <OverviewStatCard title="Total projects" value={overviewStats.total} />
      </Grid>
      <Grid xs={12} sm={6} md={4}>
        <OverviewStatCard title="Active" value={overviewStats.active} />
      </Grid>
      <Grid xs={12} sm={6} md={4}>
        <OverviewStatCard title="On hold" value={overviewStats.onHold} />
      </Grid>
      <Grid xs={12} sm={6} md={4}>
        <OverviewStatCard title="Completed" value={overviewStats.completed} />
      </Grid>
      <Grid xs={12} sm={6} md={4}>
        <OverviewStatCard title="Archived" value={overviewStats.archived} />
      </Grid>
      <Grid xs={12} sm={6} md={4}>
        <OverviewStatCardLink
          title="Templates"
          value={overviewStats.templates}
          href={paths.dashboard.project.templates.root}
        />
      </Grid>
      <Grid xs={12} sm={6} md={4}>
        <OverviewStatCardLink
          title="Recurring"
          value={overviewStats.recurring}
          href={paths.dashboard.project.recurringProjects.root}
        />
      </Grid>
    </Grid>
  );

  const showToolbarFiltersRow = browseMode.kind === 'module' || defaultModuleTab !== 'overview';

  const emptyCaption =
    listBrowseTab === 'overview'
      ? 'No projects'
      : EMPTY_TITLE[listBrowseTab as Exclude<BrowseListTab, 'overview'>];

  const tabRowTitle =
    browseMode.kind === 'module'
      ? browseMode.moduleKey === 'templates'
        ? 'Templates'
        : 'Recurring projects'
      : null;

  return (
    <>
      <DashboardContent>

        {canReset &&
          listBrowseTab !== 'overview' && (
          <ProjectListFiltersResult
            totalResults={dataFiltered.length}
            priorities={priorities}
            startDate={filterStartDate}
            endDate={filterEndDate}
            search={search}
            onRemoveSearch={handleClearProjectSearch}
            onReset={resetDrawerFilters}
            onRemovePriority={(p) =>
              setFilter(SCREEN_KEY, { priorities: priorities.filter((x) => x !== p) })
            }
            onRemoveDateRange={() =>
              setFilter(SCREEN_KEY, { startDate: null, endDate: null })
            }
            sx={{ mb: { xs: 2, md: 2.5 } }}
          />
        )}

        <Stack
          direction="row"
          alignItems="flex-end"
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 2.5 }}
        >
          {browseMode.kind === 'default' ? (
            <Tabs
              value={defaultModuleTab}
              onChange={handleModuleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                flex: 1,
                minWidth: 0,
                boxShadow: (theme) =>
                  `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
              }}
            >
              {DEFAULT_MODULE_TABS.map((t) => (
                <Tab
                  key={t.value}
                  value={t.value}
                  label={`${t.label} (${moduleTabCounts[t.value]})`}
                />
              ))}
            </Tabs>
          ) : (
            <Typography variant="h6" sx={{ flex: 1, minWidth: 0 }}>
              {tabRowTitle}
            </Typography>
          )}

          {showToolbarFiltersRow && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0, mb: 0.5 }}>
              <Tooltip title="Filters">
                <IconButton onClick={openFilters.onTrue}>
                  <Badge color="error" variant="dot" invisible={!canReset}>
                    <Iconify icon="ic:round-filter-list" />
                  </Badge>
                </IconButton>
              </Tooltip>

              <ToggleButtonGroup
                size="small"
                value={view}
                exclusive
                onChange={handleChangeView}
              >
                <ToggleButton value="list" aria-label="List view">
                  <Iconify icon="solar:list-bold" />
                </ToggleButton>
                <ToggleButton value="grid" aria-label="Grid view">
                  <Iconify icon="mingcute:dot-grid-fill" />
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          )}
        </Stack>

        {listBrowseTab === 'overview' ? (
          projectsLoading ? (
            <EmptyContent title="Loading…" sx={{ py: 10 }} />
          ) : (
            renderOverview
          )
        ) : (
          <>
            {projectsEmpty ? (
              <EmptyContent title="No projects" sx={{ py: 10 }} />
            ) : notFound ? (
              searchTrimmed ? (
                <EmptyContent
                  title="No matching projects"
                  description={`Nothing matches “${searchTrimmed}” in ${browseContextLabel}. Try different keywords or clear the search.`}
                  action={
                    <Button variant="outlined" color="inherit" onClick={handleClearProjectSearch}>
                      Clear search
                    </Button>
                  }
                  sx={{ py: 10 }}
                />
              ) : (
                <EmptyContent title={emptyCaption} sx={{ py: 10 }} />
              )
            ) : (
              <>{view === 'list' ? renderList : renderGrid}</>
            )}
          </>
        )}
      </DashboardContent>

      <ProjectListFilters
        open={openFilters.value}
        onClose={openFilters.onFalse}
        canReset={canReset}
        dateError={dateError}
        onReset={resetDrawerFilters}
        priorities={priorities}
        startDate={filterStartDate}
        endDate={filterEndDate}
        onChangePriorities={(value) => setFilter(SCREEN_KEY, { priorities: value })}
        onChangeStartDate={(value) => setFilter(SCREEN_KEY, { startDate: value })}
        onChangeEndDate={(value) => setFilter(SCREEN_KEY, { endDate: value })}
      />
    </>
  );
}
