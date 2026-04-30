import type { Theme } from '@mui/material/styles';

/** First letters for two-word names or first two glyphs for a single token (MUI letter-avatar pattern). */
export function nameToInitials(name: string): string {
  const t = name.trim();
  if (!t) return '?';
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0][0] ?? '';
    const b = parts[parts.length - 1][0] ?? '';
    return `${a}${b}`.toUpperCase();
  }
  return t.length === 1 ? t.toUpperCase() : `${t.slice(0, 2)}`.toUpperCase();
}

const PALETTE_VARIANTS = ['primary', 'secondary', 'info', 'success', 'warning', 'error'] as const;

/** Deterministic pastel/flat foreground/background from theme tokens (lighter + dark, like AvatarGroup avatars). */
export function avatarSxFromPaletteKey(theme: Theme, key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    const ch = key.charCodeAt(i);
    hash = (hash + ch * (i + 107)) % 1000000007;
  }
  const variant = PALETTE_VARIANTS[Math.abs(hash) % PALETTE_VARIANTS.length];
  const p = theme.vars.palette[variant];
  return {
    bgcolor: p.lighter,
    color: p.dark,
    typography: 'caption',
    fontWeight: theme.typography.fontWeightSemiBold as number | string,
  } as const;
}
