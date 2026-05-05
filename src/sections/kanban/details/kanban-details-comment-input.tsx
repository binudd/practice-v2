import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';
import { UserAvatar } from 'src/components/user-avatar';

import { useMockedUser } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function KanbanDetailsCommentInput() {
  const { user } = useMockedUser();

  return (
    <Stack direction="row" spacing={2} sx={{ py: 3, px: 2.5 }}>
      <UserAvatar name={user?.displayName ?? undefined} src={user?.photoURL} />

      <Paper variant="outlined" sx={{ p: 1, flexGrow: 1, bgcolor: 'transparent' }}>
        <InputBase fullWidth multiline rows={2} placeholder="Type a message" sx={{ px: 1 }} />

        <Stack direction="row" alignItems="center">
          <Stack direction="row" flexGrow={1}>
            <IconButton>
              <Iconify icon="solar:gallery-add-bold" />
            </IconButton>

            <IconButton>
              <Iconify icon="eva:attach-2-fill" />
            </IconButton>
          </Stack>

          <Button variant="contained">Comment</Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
