import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import { AssigneeLetterAvatars } from 'src/components/assignee-letter-avatars';

// ----------------------------------------------------------------------

export type AssigneePickerAvatarUser = Pick<
  { id: string; name: string; avatarUrl?: string },
  'id' | 'name'
> &
  Partial<Pick<{ avatarUrl?: string }, 'avatarUrl'>>;

type Props = {
  label?: string;
  avatarUsers?: readonly AssigneePickerAvatarUser[];
  onAddClick: () => void;
  /** Shown only when `avatars.length > maxVisible` — does not truncate by default */
  maxVisibleAvatars?: number;
  sx?: SxProps<Theme>;
};

const Label = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  width: 100,
  flexShrink: 0,
  color: theme.vars.palette.text.secondary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

/** Kanban-style assignee row: label + avatars + dashed add control */
export function AssigneePickerStrip({
  label = 'Assignee',
  avatarUsers = [],
  onAddClick,
  maxVisibleAvatars,
  sx,
}: Props) {
  const shown =
    maxVisibleAvatars != null ? avatarUsers.slice(0, maxVisibleAvatars) : avatarUsers;
  const overflow =
    maxVisibleAvatars != null ? Math.max(0, avatarUsers.length - shown.length) : 0;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', ...sx }}>
      <Label sx={{ height: 40, lineHeight: '40px' }}>{label}</Label>

      <Box sx={{ gap: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
        <AssigneeLetterAvatars
          variant="inline"
          users={shown.map((user) => ({ id: user.id, name: user.name }))}
        />
        {overflow > 0 ? (
          <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
            +{overflow}
          </Typography>
        ) : null}

        <Tooltip title="Add assignee">
          <IconButton
            type="button"
            onClick={onAddClick}
            sx={{
              bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
              border: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
            }}
          >
            <Iconify icon="mingcute:add-line" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
