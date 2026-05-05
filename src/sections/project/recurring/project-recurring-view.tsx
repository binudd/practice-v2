import type { IRecurringRule } from 'src/domain/recurring';

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
import { useProjectRecurring } from 'src/actions/project-recurring';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { ChatNavItemSkeleton } from 'src/sections/chat/chat-skeleton';

import { RecurringCreateDialog } from './recurring-create-dialog';
import { ProjectTabShell } from '../_components/project-tab-shell';

// ----------------------------------------------------------------------

const PARAM = 'recurring';

type Props = { projectId: string };

function Detail({ row, onBack }: { row: IRecurringRule; onBack: () => void }) {
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
          {row.title}
        </Typography>
        <Label color={row.enabled ? 'success' : 'default'} variant="soft">
          {row.enabled ? 'On' : 'Off'}
        </Label>
      </Stack>
      <Scrollbar sx={{ flex: '1 1 auto', minHeight: 0 }}>
        <Box sx={{ p: 3 }}>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Cadence: {row.cadence}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Next run: {fDateTime(row.nextRunAt)}
            </Typography>
          </Stack>
        </Box>
      </Scrollbar>
    </ProjectTabShell>
  );
}

export function ProjectRecurringView({ projectId }: Props) {
  const openCreate = useBoolean();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawId = searchParams.get(PARAM);
  const { recurringRules, recurringLoading, recurringEmpty } = useProjectRecurring(projectId);

  const selected = useMemo(
    () => (rawId ? recurringRules.find((r) => r.id === rawId) : undefined),
    [rawId, recurringRules]
  );

  useEffect(() => {
    if (rawId && !recurringLoading && !selected) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete(PARAM);
          return next;
        },
        { replace: true }
      );
    }
  }, [rawId, selected, setSearchParams, recurringLoading]);

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
            Recurring
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            size="medium"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={openCreate.onTrue}
          >
            New rule
          </Button>
        </Stack>

        {recurringLoading ? (
          <ChatNavItemSkeleton />
        ) : recurringEmpty ? (
          <Box sx={{ px: 2, py: 4 }}>
            <EmptyContent
              imgUrl={`${CONFIG.site.basePath}/assets/icons/empty/ic-content.svg`}
              title="No recurring rules"
              description="Schedule reminders or repeating work for this project."
            />
          </Box>
        ) : (
          <Scrollbar sx={{ flex: '1 1 auto', minHeight: 0, pb: 1 }}>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              {recurringRules.map((row) => (
                <Box key={row.id} component="li" sx={{ display: 'flex' }}>
                  <ListItemButton onClick={() => openRow(row.id)} sx={{ py: 1.5, px: 2.5, gap: 2 }}>
                    <ListItemText
                      primary={row.title}
                      secondary={`${row.cadence} · ${fDateTime(row.nextRunAt)}`}
                      primaryTypographyProps={{ noWrap: true, variant: 'subtitle2' }}
                      secondaryTypographyProps={{
                        noWrap: true,
                        variant: 'body2',
                        color: 'text.secondary',
                      }}
                    />
                    <Label color={row.enabled ? 'success' : 'default'} variant="soft" sx={{ flexShrink: 0 }}>
                      {row.enabled ? 'On' : 'Off'}
                    </Label>
                  </ListItemButton>
                </Box>
              ))}
            </Box>
          </Scrollbar>
        )}
      </Stack>

      <RecurringCreateDialog
        projectId={projectId}
        open={openCreate.value}
        onClose={openCreate.onFalse}
      />
    </ProjectTabShell>
  );
}
