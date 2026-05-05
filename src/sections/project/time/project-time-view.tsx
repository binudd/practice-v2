import type { ITimeEntry } from 'src/domain/time-entry';

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

import { fDateTime } from 'src/utils/format-time';

import { CONFIG } from 'src/config-global';
import { useProjectTimeEntries } from 'src/actions/project-time-entries';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { ChatNavItemSkeleton } from 'src/sections/chat/chat-skeleton';

import { ProjectTabShell } from '../_components/project-tab-shell';
import { TimeEntryCreateDialog } from './time-entry-create-dialog';

// ----------------------------------------------------------------------

const PARAM = 'timeEntry';

type Props = { projectId: string };

function Detail({ row, onBack }: { row: ITimeEntry; onBack: () => void }) {
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
          {row.description}
        </Typography>
        <Typography variant="subtitle2">{row.hours}h</Typography>
      </Stack>
      <Scrollbar sx={{ flex: '1 1 auto', minHeight: 0 }}>
        <Box sx={{ p: 3 }}>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Logged: {fDateTime(row.loggedAt)}
            </Typography>
            {row.userLabel && (
              <Typography variant="body2" color="text.secondary">
                {row.userLabel}
              </Typography>
            )}
          </Stack>
        </Box>
      </Scrollbar>
    </ProjectTabShell>
  );
}

export function ProjectTimeView({ projectId }: Props) {
  const openCreate = useBoolean();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawId = searchParams.get(PARAM);
  const { timeEntries, timeEntriesLoading, timeEntriesEmpty } = useProjectTimeEntries(projectId);

  const selected = useMemo(
    () => (rawId ? timeEntries.find((t) => t.id === rawId) : undefined),
    [rawId, timeEntries]
  );

  useEffect(() => {
    if (rawId && !timeEntriesLoading && !selected) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete(PARAM);
          return next;
        },
        { replace: true }
      );
    }
  }, [rawId, selected, setSearchParams, timeEntriesLoading]);

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
            Time
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            size="medium"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={openCreate.onTrue}
          >
            Log time
          </Button>
        </Stack>

        {timeEntriesLoading ? (
          <ChatNavItemSkeleton />
        ) : timeEntriesEmpty ? (
          <Box sx={{ px: 2, py: 4 }}>
            <EmptyContent
              imgUrl={`${CONFIG.site.basePath}/assets/icons/empty/ic-content.svg`}
              title="No time entries"
              description="Record hours spent on this project."
            />
          </Box>
        ) : (
          <Scrollbar sx={{ flex: '1 1 auto', minHeight: 0, pb: 1 }}>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              {timeEntries.map((row) => (
                <Box key={row.id} component="li" sx={{ display: 'flex' }}>
                  <ListItemButton onClick={() => openRow(row.id)} sx={{ py: 1.5, px: 2.5, gap: 2 }}>
                    <ListItemText
                      primary={row.description}
                      secondary={`${row.hours}h · ${fDateTime(row.loggedAt)}`}
                      primaryTypographyProps={{ noWrap: true, variant: 'subtitle2' }}
                      secondaryTypographyProps={{
                        noWrap: true,
                        variant: 'body2',
                        color: 'text.secondary',
                      }}
                    />
                  </ListItemButton>
                </Box>
              ))}
            </Box>
          </Scrollbar>
        )}
      </Stack>

      <TimeEntryCreateDialog
        projectId={projectId}
        open={openCreate.value}
        onClose={openCreate.onFalse}
      />
    </ProjectTabShell>
  );
}
