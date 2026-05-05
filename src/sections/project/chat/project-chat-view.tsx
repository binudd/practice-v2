import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/config-global';
import { useProjectChatShortcuts } from 'src/actions/project-chat-shortcuts';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';

import { ChatNavItemSkeleton } from 'src/sections/chat/chat-skeleton';

import { ProjectTabShell } from '../_components/project-tab-shell';

// ----------------------------------------------------------------------

type Props = { projectId: string };

export function ProjectChatView({ projectId }: Props) {
  const { chatShortcuts, chatShortcutsLoading, chatShortcutsEmpty } =
    useProjectChatShortcuts(projectId);

  return (
    <ProjectTabShell>
      <Stack sx={{ flex: '1 1 auto', minHeight: 0, width: 1, display: 'flex', flexDirection: 'column' }}>
        <Stack sx={{ p: 2.5, pb: 0 }}>
          <Typography variant="h6" sx={{ typography: { sm: 'h5' } }}>
            Chat
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Open the dashboard chat and mail apps. Project-scoped rooms can be linked here when the
            backend is connected.
          </Typography>
        </Stack>

        {chatShortcutsLoading ? (
          <ChatNavItemSkeleton />
        ) : chatShortcutsEmpty ? (
          <Box sx={{ px: 2, py: 4 }}>
            <EmptyContent
              imgUrl={`${CONFIG.site.basePath}/assets/icons/empty/ic-chat-active.svg`}
              title="No shortcuts"
              description="Shortcuts will appear for this project once configured."
            />
          </Box>
        ) : (
          <Scrollbar sx={{ flex: '1 1 auto', minHeight: 0, pb: 1 }}>
            <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
              {chatShortcuts.map((s) => (
                <Box key={s.id} component="li" sx={{ display: 'flex' }}>
                  <ListItemButton
                    component={RouterLink}
                    href={s.href}
                    sx={{ py: 1.5, px: 2.5, gap: 2 }}
                  >
                    <Iconify icon="solar:chat-round-dots-bold" width={24} sx={{ color: 'primary.main' }} />
                    <ListItemText
                      primary={s.title}
                      secondary={s.description}
                      primaryTypographyProps={{ variant: 'subtitle2' }}
                      secondaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                    />
                    <Button size="small" variant="outlined" component="span" sx={{ flexShrink: 0 }}>
                      Open
                    </Button>
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
