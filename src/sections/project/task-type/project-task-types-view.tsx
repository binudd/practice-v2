import type { ITaskType } from 'src/domain/task-type';

import { useSearchParams } from 'react-router-dom';
import { useMemo, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { fToNow } from 'src/utils/format-time';

import { CONFIG } from 'src/config-global';
import { useProjectTaskTypes } from 'src/actions/project-task-types';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { ChatNavItemSkeleton } from 'src/sections/chat/chat-skeleton';

import { TaskTypeCreateDialog } from './task-type-create-dialog';
import { ProjectTabShell } from '../_components/project-tab-shell';

// ----------------------------------------------------------------------

const PARAM = 'taskType';

type Props = { projectId: string };

function Detail({ row, onBack }: { row: ITaskType; onBack: () => void }) {
  return (
    <ProjectTabShell card={false}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: (theme) => `solid 1px ${theme.vars.palette.divider}`,
        }}
      >
        <IconButton onClick={onBack} aria-label="Back">
          <Iconify icon="eva:arrow-ios-back-fill" />
        </IconButton>
        <Typography variant="subtitle1" noWrap sx={{ flex: 1 }}>
          {row.name}
        </Typography>
        {row.color && (
          <Label color="default" variant="soft">
            {row.color}
          </Label>
        )}
      </Stack>
      <Scrollbar sx={{ flex: '1 1 auto', minHeight: 0 }}>
        <Box sx={{ p: 3 }}>
          <Stack spacing={1.5}>
            {row.description && <Typography variant="body2">{row.description}</Typography>}
            {row.defaultEstimateHours != null && (
              <Typography variant="body2" color="text.secondary">
                Default estimate: {row.defaultEstimateHours}h
              </Typography>
            )}
            <Typography variant="caption" color="text.disabled">
              Updated {fToNow(row.updatedAt)}
            </Typography>
          </Stack>
        </Box>
      </Scrollbar>
    </ProjectTabShell>
  );
}

export function ProjectTaskTypesView({ projectId }: Props) {
  const openCreate = useBoolean();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawId = searchParams.get(PARAM);
  const { taskTypes, taskTypesLoading, taskTypesEmpty } = useProjectTaskTypes(projectId);

  const selected = useMemo(
    () => (rawId ? taskTypes.find((t) => t.id === rawId) : undefined),
    [rawId, taskTypes]
  );

  useEffect(() => {
    if (rawId && !taskTypesLoading && !selected) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete(PARAM);
          return next;
        },
        { replace: true }
      );
    }
  }, [rawId, selected, setSearchParams, taskTypesLoading]);

  const openRow = useCallback(
    (id: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(PARAM, id);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const closeRow = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete(PARAM);
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  if (selected) {
    return (
      <Box sx={{ flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <Detail row={selected} onBack={closeRow} />
      </Box>
    );
  }

  return (
    <ProjectTabShell>
      <Stack sx={{ flex: '1 1 auto', minHeight: 0, width: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" alignItems="center" sx={{ p: 2.5, pb: 0 }}>
          <Typography variant="h6" sx={{ typography: { sm: 'h5' } }}>
            Task types
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            size="medium"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={openCreate.onTrue}
          >
            New type
          </Button>
        </Stack>

        {taskTypesLoading ? (
          <ChatNavItemSkeleton />
        ) : taskTypesEmpty ? (
          <Box sx={{ px: 2, py: 4 }}>
            <EmptyContent
              imgUrl={`${CONFIG.site.basePath}/assets/icons/empty/ic-content.svg`}
              title="No task types"
              description="Define types your team uses on this project."
            />
          </Box>
        ) : (
          <Scrollbar sx={{ flex: '1 1 auto', minHeight: 0, pb: 1 }}>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              {taskTypes.map((row) => (
                <Box key={row.id} component="li" sx={{ display: 'flex' }}>
                  <ListItemButton onClick={() => openRow(row.id)} sx={{ py: 1.5, px: 2.5, gap: 2 }}>
                    <ListItemText
                      primary={row.name}
                      secondary={row.description ?? 'No description'}
                      primaryTypographyProps={{ noWrap: true, variant: 'subtitle2' }}
                      secondaryTypographyProps={{
                        noWrap: true,
                        variant: 'body2',
                        color: 'text.secondary',
                      }}
                    />
                    <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
                      {fToNow(row.updatedAt)}
                    </Typography>
                  </ListItemButton>
                </Box>
              ))}
            </Box>
          </Scrollbar>
        )}
      </Stack>

      <TaskTypeCreateDialog
        projectId={projectId}
        open={openCreate.value}
        onClose={openCreate.onFalse}
      />
    </ProjectTabShell>
  );
}
