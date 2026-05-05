import type { IKanbanTask } from 'src/types/kanban';
import type { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import type { KanbanBoardLayoutMode } from 'src/store/ui-preferences-store';
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  UniqueIdentifier,
  CollisionDetection,
} from '@dnd-kit/core';

import { createPortal } from 'react-dom';
import {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
  type ReactElement,
} from 'react';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSensor,
  DndContext,
  useSensors,
  MouseSensor,
  TouchSensor,
  closestCenter,
  pointerWithin,
  KeyboardSensor,
  rectIntersection,
  getFirstCollision,
  MeasuringStrategy,
} from '@dnd-kit/core';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { DataGrid, gridClasses } from '@mui/x-data-grid';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDate } from 'src/utils/format-time';

import { hideScrollY } from 'src/theme/styles';
import { DashboardContent } from 'src/layouts/dashboard';
import { useUIPreferencesStore } from 'src/store/ui-preferences-store';
import { buildNewKanbanTask } from 'src/domain/kanban/new-task-defaults';
import {
  moveTask,
  deleteTask,
  moveColumn,
  updateTask,
  createTask,
  useGetBoard,
} from 'src/actions/kanban';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import {
  breadcrumbHomeLink,
  useSetDashboardBreadcrumbs,
} from 'src/components/dashboard-breadcrumbs';

import { useProjectKanbanToolbarSlot } from 'src/sections/project/view/project-kanban-toolbar-slot';

import { Can } from 'src/auth/guard';
import { useAuthContext } from 'src/auth/hooks';
import { hasPermission } from 'src/auth/permissions';

import { kanbanClasses } from '../classes';
import { coordinateGetter } from '../utils';
import { KanbanColumn } from '../column/kanban-column';
import { KanbanDetails } from '../details/kanban-details';
import { KanbanTaskItem } from '../item/kanban-task-item';
import { KanbanColumnAdd } from '../column/kanban-column-add';
import { reporterFromAuthUser } from '../utils/reporter-from-auth';
import { KanbanColumnSkeleton } from '../components/kanban-skeleton';
import { KanbanDragOverlay } from '../components/kanban-drag-overlay';
import { KanbanTaskBulkUpdateDialog } from '../kanban-task-bulk-update-dialog';
import { KanbanBoardLayoutToggle } from '../components/kanban-board-layout-toggle';

// ----------------------------------------------------------------------

const PLACEHOLDER_ID = 'placeholder';

const cssVars = {
  '--item-gap': '16px',
  '--item-radius': '12px',
  '--column-gap': '24px',
  '--column-width': '336px',
  '--column-radius': '16px',
  '--column-padding': '20px 16px 16px 16px',
};

type TaskFlatRow = {
  id: string;
  columnId: UniqueIdentifier;
  columnName: string;
  task: IKanbanTask;
};

function emptyKanbanSelection(): GridRowSelectionModel {
  return [];
}

type Props = {
  projectId?: string;
  title?: string;
  /**
   * Omit inner DashboardContent so parent shell (e.g. project detail) owns padding — avoids double inset.
   * Board markup, cssVars, and scroll height behavior are unchanged vs the full-page variant.
   */
  embedded?: boolean;
  /**
   * Hide board/list toggle in the browsing toolbar (inline or portaled beside project tabs).
   */
  hideLayoutToggle?: boolean;
};

export function KanbanView({
  projectId,
  title: _title = 'My Work',
  embedded = false,
  hideLayoutToggle,
}: Props = {}) {
  const omitLayoutToggle = hideLayoutToggle ?? false;

  const projectDetailToolbarSlot = useProjectKanbanToolbarSlot();
  const projectDetailToolbarEl = projectDetailToolbarSlot?.toolbarEl ?? null;

  const { board, boardLoading, boardEmpty } = useGetBoard(projectId);

  const kanbanScopeKey = projectId ?? 'global';
  const layoutMode: KanbanBoardLayoutMode =
    useUIPreferencesStoreKanban(kanbanScopeKey);

  const { user } = useAuthContext();

  const taskReporter = useMemo(() => reporterFromAuthUser(user), [user]);

  const bulkPermission = Boolean(user && hasPermission(user.role, 'task:update'));
  const bulkSelectionEligible =
    bulkPermission && layoutMode === 'list' && !boardEmpty && !boardLoading;

  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>(() => emptyKanbanSelection());
  const bulkDialog = useBoolean();

  useEffect(() => {
    setRowSelectionModel(emptyKanbanSelection());
  }, [layoutMode]);

  useEffect(() => {
    setRowSelectionModel(emptyKanbanSelection());
  }, [kanbanScopeKey]);

  useSetDashboardBreadcrumbs(
    [breadcrumbHomeLink, { name: 'My Work' }],
    undefined,
    [embedded, projectId],
    { skip: embedded || Boolean(projectId) }
  );

  const recentlyMovedToNewContainer = useRef(false);

  const lastOverId = useRef<UniqueIdentifier | null>(null);

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const [detailTaskCtx, setDetailTaskCtx] = useState<
    | {
        task: IKanbanTask;
        columnId: UniqueIdentifier;
      }
    | null
  >(null);

  const [newTaskMenuAnchorEl, setNewTaskMenuAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpenNewTaskMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setNewTaskMenuAnchorEl(event.currentTarget);
  }, []);

  const handleCloseNewTaskMenu = useCallback(() => {
    setNewTaskMenuAnchorEl(null);
  }, []);

  const handlePickColumnNewTask = useCallback(
    (columnId: UniqueIdentifier, columnName: string) => {
      const task = buildNewKanbanTask({ status: columnName, reporter: taskReporter });
      createTask(columnId, task, projectId);
      setDetailTaskCtx({ columnId, task });
      handleCloseNewTaskMenu();
    },
    [handleCloseNewTaskMenu, projectId, taskReporter]
  );

  const columnIds = board.columns.map((column) => column.id);

  const taskRows = useMemo((): TaskFlatRow[] => {
    if (!board.columns.length) return [];

    return board.columns.flatMap((col) =>
      (board.tasks[col.id] ?? []).map((task) => ({
        id: String(task.id),
        columnId: col.id,
        columnName: col.name,
        task,
      }))
    );
  }, [board.columns, board.tasks]);

  const bulkTargetsResolved = useMemo(() => {
    const selectedIds = [...rowSelectionModel].map(String);
    return selectedIds.flatMap((id) => {
      const row = taskRows.find((r) => r.id === id);
      return row ? [{ columnId: row.columnId, taskId: row.task.id }] : [];
    });
  }, [rowSelectionModel, taskRows]);

  const selectedKanbanCount = rowSelectionModel.length;

  const isSortingContainer = activeId ? columnIds.includes(activeId) : false;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter })
  );

  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      if (activeId && activeId in board.tasks) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (column) => column.id in board.tasks
          ),
        });
      }

      const pointerIntersections = pointerWithin(args);

      const intersections =
        pointerIntersections.length > 0 ? pointerIntersections : rectIntersection(args);
      let overId = getFirstCollision(intersections, 'id');

      if (overId != null) {
        if (overId in board.tasks) {
          const columnItems = board.tasks[overId].map((task) => task.id);

          if (columnItems.length > 0) {
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (column) => column.id !== overId && columnItems.includes(column.id)
              ),
            })[0]?.id;
          }
        }

        lastOverId.current = overId;

        return [{ id: overId }];
      }

      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, board?.tasks]
  );

  const findColumn = useCallback(
    (id: UniqueIdentifier) => {
      if (id in board.tasks) {
        return id;
      }

      return Object.keys(board.tasks).find((key) =>
        board.tasks[key].map((task) => task.id).includes(id)
      );
    },
    [board.tasks]
  );

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, []);

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id);
  };

  const onDragOver = ({ active, over }: DragOverEvent) => {
    const overId = over?.id;

    if (overId == null || active.id in board.tasks) {
      return;
    }

    const overColumn = findColumn(overId);

    const activeColumn = findColumn(active.id);

    if (!overColumn || !activeColumn) {
      return;
    }

    if (activeColumn !== overColumn) {
      const activeItems = board.tasks[activeColumn].map((task) => task.id);
      const overItems = board.tasks[overColumn].map((task) => task.id);
      const overIndex = overItems.indexOf(overId);
      const activeIndex = activeItems.indexOf(active.id);

      let newIndex: number;

      if (overId in board.tasks) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;

        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      recentlyMovedToNewContainer.current = true;

      const updateTasks = {
        ...board.tasks,
        [activeColumn]: board.tasks[activeColumn].filter((task) => task.id !== active.id),
        [overColumn]: [
          ...board.tasks[overColumn].slice(0, newIndex),
          board.tasks[activeColumn][activeIndex],
          ...board.tasks[overColumn].slice(newIndex, board.tasks[overColumn].length),
        ],
      };

      moveTask(updateTasks, projectId);
    }
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id in board.tasks && over?.id) {
      const activeIndex = columnIds.indexOf(active.id);
      const overIndex = columnIds.indexOf(over.id);

      const updateColumns = arrayMove(board.columns, activeIndex, overIndex);

      moveColumn(updateColumns, projectId);
    }

    const activeColumn = findColumn(active.id);

    if (!activeColumn) {
      setActiveId(null);
      return;
    }

    const overId = over?.id;

    if (overId == null) {
      setActiveId(null);
      return;
    }

    const overColumn = findColumn(overId);

    if (overColumn) {
      const activeContainerTaskIds = board.tasks[activeColumn].map((task) => task.id);
      const overContainerTaskIds = board.tasks[overColumn].map((task) => task.id);

      const activeIndex = activeContainerTaskIds.indexOf(active.id);
      const overIndex = overContainerTaskIds.indexOf(overId);

      if (activeIndex !== overIndex) {
        const updateTasks = {
          ...board.tasks,
          [overColumn]: arrayMove(board.tasks[overColumn], activeIndex, overIndex),
        };

        moveTask(updateTasks, projectId);
      }
    }

    setActiveId(null);
  };

  const columns = useMemo<GridColDef<TaskFlatRow>[]>(
    () => [
      {
        field: 'name',
        headerName: 'Task',
        flex: 1,
        minWidth: 220,
        valueGetter: (_v, row) => row.task.name,
      },
      {
        field: 'columnName',
        headerName: 'Column',
        width: 160,
        valueGetter: (_v, row) => row.columnName,
      },
      {
        field: 'priority',
        headerName: 'Priority',
        width: 120,
        valueGetter: (_v, row) => row.task.priority,
      },
      {
        field: 'due',
        headerName: 'Due window',
        width: 200,
        valueGetter: (_v, row) => {
          const start = row.task.due[0];
          const end = row.task.due[1];
          if (!start && !end) return '—';
          return `${start ? fDate(start) : '—'} → ${end ? fDate(end) : '—'}`;
        },
      },
      {
        field: 'assignees',
        headerName: 'Assignees',
        flex: 0.85,
        minWidth: 160,
        sortable: false,
        valueGetter: (_v, row) =>
          row.task.assignee?.length
            ? row.task.assignee.map((a) => a.name).join(', ')
            : '—',
      },
    ],
    []
  );

  const handleBulkApplied = () => {
    setRowSelectionModel(emptyKanbanSelection());
  };

  const handleOpenBulkDialog = () => {
    if (bulkTargetsResolved.length === 0) return;
    bulkDialog.onTrue();
  };

  const handleUpdateDetailTask = useCallback(
    (taskData: IKanbanTask) => {
      if (!detailTaskCtx) return;

      updateTask(detailTaskCtx.columnId, taskData, projectId);
      setDetailTaskCtx({
        columnId: detailTaskCtx.columnId,
        task: taskData,
      });
    },
    [detailTaskCtx, projectId]
  );

  const handleDeleteDetailTask = useCallback(() => {
    if (!detailTaskCtx) return;

    deleteTask(detailTaskCtx.columnId, detailTaskCtx.task.id, projectId);

    toast.success('Delete success!', { position: 'top-center' });
    setDetailTaskCtx(null);
  }, [detailTaskCtx, projectId]);

  const renderLoading = (
    <Stack direction="row" alignItems="flex-start" sx={{ gap: 'var(--column-gap)' }}>
      <KanbanColumnSkeleton />
    </Stack>
  );

  const renderEmpty = <EmptyContent filled sx={{ py: 10, maxHeight: { md: 480 } }} />;

  const renderKanbanBoard = (
    <DndContext
      id="dnd-kanban"
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <Stack sx={{ flex: '1 1 auto', overflowX: 'auto' }}>
        <Stack
          sx={{
            pb: 3,
            minHeight: 0,
            display: 'flex',
            flex: '1 1 auto',
          }}
        >
          <Stack
            direction="row"
            sx={{
              gap: 'var(--column-gap)',
              minHeight: 0,
              flex: '1 1 auto',
              [`& .${kanbanClasses.columnList}`]: { ...hideScrollY, flex: '1 1 auto' },
            }}
          >
            <SortableContext
              items={[...columnIds, PLACEHOLDER_ID]}
              strategy={horizontalListSortingStrategy}
            >
              {board?.columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={board.tasks[column.id]}
                  boardProjectId={projectId}
                  taskReporter={taskReporter}
                >
                  <SortableContext
                    items={board.tasks[column.id]}
                    strategy={verticalListSortingStrategy}
                  >
                    {board.tasks[column.id].map((task) => (
                      <KanbanTaskItem
                        task={task}
                        key={task.id}
                        disabled={isSortingContainer}
                        highlightOpen={
                          detailTaskCtx !== null &&
                          detailTaskCtx.task.id === task.id &&
                          detailTaskCtx.columnId === column.id
                        }
                        onOpen={() => setDetailTaskCtx({ task, columnId: column.id })}
                      />
                    ))}
                  </SortableContext>
                </KanbanColumn>
              ))}

              <KanbanColumnAdd id={PLACEHOLDER_ID} boardProjectId={projectId} />
            </SortableContext>
          </Stack>
        </Stack>
      </Stack>

      <KanbanDragOverlay
        columns={board?.columns}
        tasks={board?.tasks}
        activeId={activeId}
        sx={cssVars}
      />
    </DndContext>
  );

  const renderKanbanTaskList = (
    <Card sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 360 }}>
      <DataGrid<TaskFlatRow>
        autoHeight
        disableRowSelectionOnClick={bulkSelectionEligible}
        rows={taskRows}
        columns={columns}
        pageSizeOptions={[10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        getRowId={(row) => row.id}
        checkboxSelection={bulkSelectionEligible}
        rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={setRowSelectionModel}
        onRowClick={(params) => {
          setDetailTaskCtx({
            task: params.row.task,
            columnId: params.row.columnId,
          });
        }}
        slots={{
          noRowsOverlay: () => <EmptyContent title="No tasks" sx={{ py: 4 }} />,
        }}
        sx={{
          [`& .${gridClasses.row}`]: { cursor: 'pointer' },
          borderWidth: 0,
        }}
      />
    </Card>
  );

  const toolbarPortaledBesideTabs =
    embedded &&
    projectDetailToolbarEl !== null &&
    projectDetailToolbarEl.isConnected &&
    !boardLoading &&
    !boardEmpty;

  const browsingToolbarChrome = (
    <Stack
      direction="row"
      alignItems="center"
      flexWrap="wrap"
      columnGap={2}
      rowGap={1}
      sx={{ mb: toolbarPortaledBesideTabs ? 0 : 2 }}
    >
      <Stack direction="row" alignItems="center" flexWrap="wrap" spacing={2}>
        {!omitLayoutToggle ? (
          <KanbanBoardLayoutToggle scopeKey={kanbanScopeKey} />
        ) : null}
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        flexWrap="wrap"
        sx={{ ml: 'auto' }}
      >
        {bulkPermission && board.columns.length > 0 ? (
          <>
            <Can perm="task:update">
              <Button
                color="primary"
                variant="contained"
                size="small"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={handleOpenNewTaskMenu}
              >
                New task
              </Button>
            </Can>
            <Menu
              anchorEl={newTaskMenuAnchorEl}
              open={Boolean(newTaskMenuAnchorEl)}
              onClose={handleCloseNewTaskMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {board.columns.map((col) => (
                <MenuItem
                  key={String(col.id)}
                  onClick={() => handlePickColumnNewTask(col.id, col.name)}
                >
                  {col.name}
                </MenuItem>
              ))}
            </Menu>
          </>
        ) : null}

        {bulkSelectionEligible ? (
          <>
            {selectedKanbanCount > 0 ? (
              <Typography variant="body2" color="text.secondary">
                {selectedKanbanCount} selected
              </Typography>
            ) : null}
            <Can perm="task:update">
              <Button
                color="secondary"
                variant="contained"
                size="small"
                disabled={bulkTargetsResolved.length === 0}
                startIcon={<Iconify icon="solar:pen-bold" />}
                onClick={handleOpenBulkDialog}
              >
                Update
              </Button>
            </Can>
          </>
        ) : null}
      </Stack>
    </Stack>
  );

  const projectDetailKanbanToolbarPortal =
    toolbarPortaledBesideTabs && projectDetailToolbarEl
      ? createPortal(browsingToolbarChrome, projectDetailToolbarEl)
      : null;

  const renderBrowsingChrome = (
    <Stack sx={{ flex: '1 1 0', minHeight: 0, width: 1 }}>
      {toolbarPortaledBesideTabs ? null : browsingToolbarChrome}

      <Box sx={{ flex: '1 1 0', minHeight: 0, display: 'flex', flexDirection: 'column', width: 1 }}>
        {layoutMode === 'board' ? renderKanbanBoard : renderKanbanTaskList}
      </Box>
    </Stack>
  );

  let bodyContent: ReactElement;

  if (boardLoading) {
    bodyContent = renderLoading;
  } else if (boardEmpty) {
    bodyContent = renderEmpty;
  } else {
    bodyContent = renderBrowsingChrome;
  }

  const shellSx = {
    ...cssVars,
    flex: '1 1 0',
    minHeight: 0,
    display: 'flex',
    overflow: 'hidden',
    flexDirection: 'column',
    width: 1,
  };

  const overlays = (
    <>
      {detailTaskCtx !== null ? (
        <KanbanDetails
          key={String(detailTaskCtx.task.id)}
          task={detailTaskCtx.task}
          openDetails={detailTaskCtx !== null}
          onCloseDetails={() => setDetailTaskCtx(null)}
          onUpdateTask={handleUpdateDetailTask}
          onDeleteTask={handleDeleteDetailTask}
        />
      ) : null}
      <KanbanTaskBulkUpdateDialog
        open={bulkDialog.value}
        kanbanBoardProjectId={projectId}
        targets={bulkTargetsResolved}
        boardSnapshot={{ tasks: board.tasks }}
        onClose={bulkDialog.onFalse}
        onApplied={handleBulkApplied}
      />
    </>
  );

  if (embedded) {
    return (
      <Box sx={shellSx}>
        {projectDetailKanbanToolbarPortal}
        {bodyContent}
        {overlays}
      </Box>
    );
  }

  return (
    <DashboardContent
      maxWidth={false}
      sx={{
        ...shellSx,
        pb: 0,
        pl: { sm: 3 },
        pr: { sm: 0 },
      }}
    >
      {bodyContent}
      {overlays}
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

function useUIPreferencesStoreKanban(scopeKey: string): KanbanBoardLayoutMode {
  return useUIPreferencesStore((state) => state.kanbanLayout[scopeKey] ?? 'board');
}
