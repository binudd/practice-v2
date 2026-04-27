import type { IProjectFile } from 'src/domain/project-file';

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
import { fData } from 'src/utils/format-number';

import { CONFIG } from 'src/config-global';
import { useProjectFiles } from 'src/actions/project-files';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { ChatNavItemSkeleton } from 'src/sections/chat/chat-skeleton';

import { FileCreateDialog } from './file-create-dialog';
import { ProjectTabShell } from '../_components/project-tab-shell';

// ----------------------------------------------------------------------

const FILE_PARAM = 'file';

type Props = {
  projectId: string;
};

function FileDetailPanel({
  file,
  onBack,
}: {
  file: IProjectFile;
  onBack: () => void;
}) {
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
          {file.name}
        </Typography>
        <Button
          size="small"
          variant="contained"
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<Iconify icon="eva:external-link-fill" />}
        >
          Open
        </Button>
      </Stack>
      <Scrollbar sx={{ flex: '1 1 auto', minHeight: 0 }}>
        <Box sx={{ p: 3 }}>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Updated {fToNow(file.updatedAt)}
            </Typography>
            {file.mimeType && (
              <Typography variant="body2">
                Type: {file.mimeType}
              </Typography>
            )}
            {file.sizeBytes != null && (
              <Typography variant="body2">
                Size: {fData(file.sizeBytes)}
              </Typography>
            )}
            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
              {file.url}
            </Typography>
          </Stack>
        </Box>
      </Scrollbar>
    </ProjectTabShell>
  );
}

export function ProjectFilesView({ projectId }: Props) {
  const openCreate = useBoolean();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawId = searchParams.get(FILE_PARAM);
  const { files, filesLoading, filesEmpty } = useProjectFiles(projectId);

  const selected = useMemo(
    () => (rawId ? files.find((f) => f.id === rawId) : undefined),
    [rawId, files]
  );

  useEffect(() => {
    if (rawId && !filesLoading && !selected) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete(FILE_PARAM);
          return next;
        },
        { replace: true }
      );
    }
  }, [rawId, selected, setSearchParams, filesLoading]);

  const openFile = useCallback(
    (id: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(FILE_PARAM, id);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const closeFile = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete(FILE_PARAM);
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
        <FileDetailPanel file={selected} onBack={closeFile} />
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
            Files
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            size="medium"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={openCreate.onTrue}
          >
            Add file
          </Button>
        </Stack>

        {filesLoading ? (
          <ChatNavItemSkeleton />
        ) : filesEmpty ? (
          <Box sx={{ px: 2, py: 4 }}>
            <EmptyContent
              imgUrl={`${CONFIG.site.basePath}/assets/icons/empty/ic-folder-empty.svg`}
              title="No files yet"
              description="Link documents stored elsewhere or register uploads."
            />
          </Box>
        ) : (
          <Scrollbar sx={{ flex: '1 1 auto', minHeight: 0, pb: 1 }}>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              {files.map((file) => (
                <Box key={file.id} component="li" sx={{ display: 'flex' }}>
                  <ListItemButton
                    onClick={() => openFile(file.id)}
                    sx={{ py: 1.5, px: 2.5, gap: 2 }}
                  >
                    <Iconify icon="solar:document-bold" width={24} sx={{ color: 'text.secondary' }} />
                    <ListItemText
                      primary={file.name}
                      secondary={file.mimeType ?? file.url}
                      primaryTypographyProps={{ noWrap: true, variant: 'subtitle2' }}
                      secondaryTypographyProps={{
                        noWrap: true,
                        variant: 'body2',
                        color: 'text.secondary',
                      }}
                    />
                    <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
                      {fToNow(file.updatedAt)}
                    </Typography>
                  </ListItemButton>
                </Box>
              ))}
            </Box>
          </Scrollbar>
        )}
      </Stack>

      <FileCreateDialog
        projectId={projectId}
        open={openCreate.value}
        onClose={openCreate.onFalse}
      />
    </ProjectTabShell>
  );
}
