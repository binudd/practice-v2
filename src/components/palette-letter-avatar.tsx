import type { AvatarProps } from '@mui/material/Avatar';

import Avatar from '@mui/material/Avatar';
import { useTheme } from '@mui/material/styles';

import { nameToInitials, avatarSxFromPaletteKey } from 'src/utils/avatar-display';

// ----------------------------------------------------------------------

export type PaletteLetterAvatarProps = Omit<AvatarProps, 'src' | 'alt' | 'children'> & {
  /** Stable seed for background color (typically a user id). */
  paletteKey: string;
  /** Accessibility label; initials are derived from this string. */
  displayName: string;
};

/** Letter avatar with deterministic theme palette (same pattern as project team lists). */
export function PaletteLetterAvatar({
  paletteKey,
  displayName,
  sx,
  ...other
}: PaletteLetterAvatarProps) {
  const theme = useTheme();

  return (
    <Avatar
      alt={displayName}
      sx={[avatarSxFromPaletteKey(theme, paletteKey), ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      {...other}
    >
      {nameToInitials(displayName)}
    </Avatar>
  );
}
