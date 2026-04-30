import type { AvatarProps } from '@mui/material/Avatar';

import Avatar from '@mui/material/Avatar';

import { PaletteLetterAvatar } from 'src/components/palette-letter-avatar';

// ----------------------------------------------------------------------

export type UserAvatarProps = Omit<AvatarProps, 'alt' | 'children'> & {
  name: string;
};

/** Prefer `src` when set; otherwise same letter avatar treatment as assignee / member pickers. */
export function UserAvatar({ name, src, sx, ...other }: UserAvatarProps) {
  const hasPhoto = typeof src === 'string' && src.trim() !== '';

  if (hasPhoto) {
    return <Avatar alt={name} src={src} sx={sx} {...other} />;
  }

  return <PaletteLetterAvatar paletteKey={name} displayName={name} sx={sx} {...other} />;
}
