import type { IProjectMailThread } from 'src/domain/project-mail';

import { useSearchParams } from 'react-router-dom';
import { useMemo, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fToNow } from 'src/utils/format-time';

import { CONFIG } from 'src/config-global';
import { useProjectMailThreads } from 'src/actions/project-mail-threads';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { ChatNavItemSkeleton } from 'src/sections/chat/chat-skeleton';

import { ProjectTabShell } from '../_components/project-tab-shell';

// ----------------------------------------------------------------------

const PARAM = 'mailId';

type Props = { projectId: string };

function Detail({ row, onBack }: { row: IProjectMailThread; onBack: () => void }) {
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
          {row.subject}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          component={RouterLink}
          href={paths.dashboard.mail}
        >
          Mail app
        </Button>
      </Stack>
      <Scrollbar sx={{ flex: '1 1 auto', minHeight: 0 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            From {row.fromLabel} · {fToNow(row.receivedAt)}
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {row.body ?? row.snippet}
          </Typography>
        </Box>
      </Scrollbar>
    </ProjectTabShell>
  );
}

export function ProjectMailView({ projectId }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawId = searchParams.get(PARAM);
  const { mailThreads, mailThreadsLoading, mailThreadsEmpty } = useProjectMailThreads(projectId);

  const selected = useMemo(
    () => (rawId ? mailThreads.find((m) => m.id === rawId) : undefined),
    [rawId, mailThreads]
  );

  useEffect(() => {
    if (rawId && !mailThreadsLoading && !selected) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete(PARAM);
          return next;
        },
        { replace: true }
      );
    }
  }, [rawId, selected, setSearchParams, mailThreadsLoading]);

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
            Mail
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="outlined" size="small" component={RouterLink} href={paths.dashboard.mail}>
            Open mail
          </Button>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ px: 2.5, pt: 1 }}>
          Threads associated with this project (mock). Use the full mail app for compose and search.
        </Typography>

        {mailThreadsLoading ? (
          <ChatNavItemSkeleton />
        ) : mailThreadsEmpty ? (
          <Box sx={{ px: 2, py: 4 }}>
            <EmptyContent
              imgUrl={`${CONFIG.site.basePath}/assets/icons/empty/ic-mail.svg`}
              title="No project mail"
              description="Messages linked to this project will appear here."
            />
          </Box>
        ) : (
          <Scrollbar sx={{ flex: '1 1 auto', minHeight: 0, pb: 1 }}>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              {mailThreads.map((row) => (
                <Box key={row.id} component="li" sx={{ display: 'flex' }}>
                  <ListItemButton onClick={() => openRow(row.id)} sx={{ py: 1.5, px: 2.5, gap: 2 }}>
                    <Iconify icon="solar:letter-bold" width={24} sx={{ color: 'text.secondary' }} />
                    <ListItemText
                      primary={row.subject}
                      secondary={`${row.fromLabel} — ${row.snippet}`}
                      primaryTypographyProps={{ noWrap: true, variant: 'subtitle2' }}
                      secondaryTypographyProps={{
                        noWrap: true,
                        variant: 'body2',
                        color: 'text.secondary',
                      }}
                    />
                    <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
                      {fToNow(row.receivedAt)}
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
