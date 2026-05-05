import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup';

import { PaletteLetterAvatar } from 'src/components/palette-letter-avatar';

// ----------------------------------------------------------------------

export type AssigneeLetterUser = {
  id: string;
  name: string;
};

type Props = {
  users: readonly AssigneeLetterUser[];
  variant: 'inline' | 'grouped';
  /** Merged into each `PaletteLetterAvatar` (inline, or grouped when overriding defaults) */
  avatarSx?: SxProps<Theme>;
  /** `AvatarGroup` root `sx` (grouped variant only) */
  groupSx?: SxProps<Theme>;
};

/** Shared assignee visuals: letter avatars (same as `AssigneePickerStrip` / project team). */
export function AssigneeLetterAvatars({ users, variant, avatarSx, groupSx }: Props) {
  if (variant === 'grouped') {
    const avatarDimSx = {
      [`& .${avatarGroupClasses.avatar}`]: {
        width: 24,
        height: 24,
        fontSize: 10,
      },
    };

    return (
      <AvatarGroup
        sx={
          groupSx != null
            ? ([avatarDimSx, groupSx] as SxProps<Theme>)
            : avatarDimSx
        }
      >
        {users.map((user) => (
          <PaletteLetterAvatar
            key={user.id}
            paletteKey={user.id}
            displayName={user.name}
            title={user.name}
            {...(avatarSx != null ? { sx: avatarSx } : {})}
          />
        ))}
      </AvatarGroup>
    );
  }

  return (
    <Box sx={{ gap: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
      {users.map((user) => (
        <Tooltip key={user.id} title={user.name}>
          <PaletteLetterAvatar
            paletteKey={user.id}
            displayName={user.name}
            {...(avatarSx != null ? { sx: avatarSx } : {})}
          />
        </Tooltip>
      ))}
    </Box>
  );
}
