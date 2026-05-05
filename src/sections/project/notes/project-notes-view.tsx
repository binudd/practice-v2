import type { INote } from 'src/domain/note';

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
import { useProjectNotes } from 'src/actions/project-notes';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { ChatNavItemSkeleton } from 'src/sections/chat/chat-skeleton';

import { NoteCreateDialog } from './note-create-dialog';
import { ProjectTabShell } from '../_components/project-tab-shell';

// ----------------------------------------------------------------------

const NOTE_PARAM = 'note';

type Props = {
  projectId: string;
};

function NoteDetailPanel({ note, onBack }: { note: INote; onBack: () => void }) {
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
          {note.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {fToNow(note.updatedAt)}
        </Typography>
      </Stack>
      <Scrollbar sx={{ flex: '1 1 auto', minHeight: 0 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {note.body || 'No body'}
          </Typography>
        </Box>
      </Scrollbar>
    </ProjectTabShell>
  );
}

export function ProjectNotesView({ projectId }: Props) {
  const openCreate = useBoolean();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawId = searchParams.get(NOTE_PARAM);
  const { notes, notesLoading, notesEmpty } = useProjectNotes(projectId);

  const selected = useMemo(
    () => (rawId ? notes.find((n) => n.id === rawId) : undefined),
    [rawId, notes]
  );

  useEffect(() => {
    if (rawId && !notesLoading && !selected) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete(NOTE_PARAM);
          return next;
        },
        { replace: true }
      );
    }
  }, [rawId, selected, setSearchParams, notesLoading]);

  const openNote = useCallback(
    (id: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(NOTE_PARAM, id);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const closeNote = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete(NOTE_PARAM);
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  if (selected) {
    return (
      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <NoteDetailPanel note={selected} onBack={closeNote} />
      </Box>
    );
  }

  return (
    <ProjectTabShell>
      <Stack
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          width: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack direction="row" alignItems="center" sx={{ p: 2.5, pb: 0 }}>
          <Typography variant="h6" sx={{ typography: { sm: 'h5' } }}>
            Notes
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            size="medium"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={openCreate.onTrue}
          >
            New note
          </Button>
        </Stack>

        {notesLoading ? (
          <ChatNavItemSkeleton />
        ) : notesEmpty ? (
          <Box sx={{ px: 2, py: 4 }}>
            <EmptyContent
              imgUrl={`${CONFIG.site.basePath}/assets/icons/empty/ic-content.svg`}
              title="No notes yet"
              description="Capture decisions and context for this project."
            />
          </Box>
        ) : (
          <Scrollbar sx={{ flex: '1 1 auto', minHeight: 0, pb: 1 }}>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              {notes.map((note) => (
                <Box key={note.id} component="li" sx={{ display: 'flex' }}>
                  <ListItemButton
                    onClick={() => openNote(note.id)}
                    sx={{ py: 1.5, px: 2.5, gap: 2 }}
                  >
                    <ListItemText
                      primary={note.title}
                      secondary={note.body?.slice(0, 120) || 'Empty note'}
                      primaryTypographyProps={{ noWrap: true, variant: 'subtitle2' }}
                      secondaryTypographyProps={{
                        noWrap: true,
                        variant: 'body2',
                        color: 'text.secondary',
                      }}
                    />
                    <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
                      {fToNow(note.updatedAt)}
                    </Typography>
                  </ListItemButton>
                </Box>
              ))}
            </Box>
          </Scrollbar>
        )}
      </Stack>

      <NoteCreateDialog
        projectId={projectId}
        open={openCreate.value}
        onClose={openCreate.onFalse}
      />
    </ProjectTabShell>
  );
}
