import type { IActivityEvent } from 'src/domain/activity';

import { useSearchParams } from 'react-router-dom';
import { useMemo, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

import { fToNow } from 'src/utils/format-time';

import { CONFIG } from 'src/config-global';
import { useProjectActivity } from 'src/actions/project-activity';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { ChatNavItemSkeleton } from 'src/sections/chat/chat-skeleton';

import { ProjectTabShell } from '../_components/project-tab-shell';

// ----------------------------------------------------------------------

const PARAM = 'activity';

const KIND_COLORS = {
  comment: 'info',
  status: 'warning',
  task: 'primary',
  file: 'secondary',
  member: 'success',
  system: 'default',
} as const;

type Props = { projectId: string };

function Detail({ row, onBack }: { row: IActivityEvent; onBack: () => void }) {
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
        <Typography variant="subtitle1" sx={{ flex: 1 }}>
          Activity
        </Typography>
        <Label color={KIND_COLORS[row.kind]} variant="soft">
          {row.kind}
        </Label>
      </Stack>
      <Scrollbar sx={{ flex: '1 1 auto', minHeight: 0 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {row.message}
          </Typography>
          {row.actorLabel && (
            <Typography variant="body2" color="text.secondary">
              {row.actorLabel}
            </Typography>
          )}
          <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 2 }}>
            {fToNow(row.createdAt)}
          </Typography>
        </Box>
      </Scrollbar>
    </ProjectTabShell>
  );
}

export function ProjectActivityView({ projectId }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawId = searchParams.get(PARAM);
  const { activity, activityLoading, activityEmpty } = useProjectActivity(projectId);

  const selected = useMemo(
    () => (rawId ? activity.find((a) => a.id === rawId) : undefined),
    [rawId, activity]
  );

  useEffect(() => {
    if (rawId && !activityLoading && !selected) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete(PARAM);
          return next;
        },
        { replace: true }
      );
    }
  }, [rawId, selected, setSearchParams, activityLoading]);

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
            Activity
          </Typography>
        </Stack>

        {activityLoading ? (
          <ChatNavItemSkeleton />
        ) : activityEmpty ? (
          <Box sx={{ px: 2, py: 4 }}>
            <EmptyContent
              imgUrl={`${CONFIG.site.basePath}/assets/icons/empty/ic-content.svg`}
              title="No activity yet"
              description="Updates from tasks, files, and team members will show here."
            />
          </Box>
        ) : (
          <Scrollbar sx={{ flex: '1 1 auto', minHeight: 0, pb: 1 }}>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              {activity.map((row) => (
                <Box key={row.id} component="li" sx={{ display: 'flex' }}>
                  <ListItemButton onClick={() => openRow(row.id)} sx={{ py: 1.5, px: 2.5, gap: 2 }}>
                    <Label color={KIND_COLORS[row.kind]} variant="soft" sx={{ flexShrink: 0 }}>
                      {row.kind}
                    </Label>
                    <ListItemText
                      primary={row.message}
                      secondary={row.actorLabel}
                      primaryTypographyProps={{ noWrap: true, variant: 'subtitle2' }}
                      secondaryTypographyProps={{
                        noWrap: true,
                        variant: 'body2',
                        color: 'text.secondary',
                      }}
                    />
                    <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
                      {fToNow(row.createdAt)}
                    </Typography>
                  </ListItemButton>
                </Box>
              ))}
            </Box>
          </Scrollbar>
        )}
      </Stack>
    </ProjectTabShell>
  );
}
