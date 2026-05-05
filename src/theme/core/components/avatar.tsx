import type { Theme, Components, ComponentsVariants } from '@mui/material/styles';

import { avatarGroupClasses } from '@mui/material/AvatarGroup';

import { paletteVariantKeyFromSeed } from 'src/utils/avatar-display';

import { varAlpha } from '../../styles';

// ----------------------------------------------------------------------

// NEW VARIANT
declare module '@mui/material/AvatarGroup' {
  interface AvatarGroupPropsVariantOverrides {
    compact: true;
  }
}

const COLORS = ['primary', 'secondary', 'info', 'success', 'warning', 'error'] as const;

// ----------------------------------------------------------------------

const avatarColors: Record<string, ComponentsVariants<Theme>['MuiAvatar']> = {
  colors: COLORS.map((color) => ({
    props: ({ ownerState }) => ownerState.color === color,
    style: ({ theme }) => ({
      color: theme.vars.palette[color].contrastText,
      backgroundColor: theme.vars.palette[color].main,
    }),
  })),
  defaultColor: [
    {
      props: ({ ownerState }) => ownerState.color === 'default',
      style: ({ theme }) => ({
        color: theme.vars.palette.text.secondary,
        backgroundColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.24),
      }),
    },
  ],
};

const MuiAvatar: Components<Theme>['MuiAvatar'] = {
  /** **************************************
   * VARIANTS
   *************************************** */
  variants: [...[...avatarColors.defaultColor!, ...avatarColors.colors!]],

  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    rounded: ({ theme }) => ({ borderRadius: theme.shape.borderRadius * 1.5 }),
    colorDefault: ({ ownerState, theme }) => {
      const seed = `${ownerState.alt ?? ''}`.trim();
      if (!seed) {
        return {
          color: theme.vars.palette.text.secondary,
          backgroundColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.24),
        };
      }
      const variant = paletteVariantKeyFromSeed(seed);
      return {
        color: theme.vars.palette[variant].contrastText,
        backgroundColor: theme.vars.palette[variant].main,
      };
    },
  },
};

// ----------------------------------------------------------------------

const MuiAvatarGroup: Components<Theme>['MuiAvatarGroup'] = {
  /** **************************************
   * DEFAULT PROPS
   *************************************** */
  defaultProps: { max: 4 },

  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ ownerState }) => ({
      justifyContent: 'flex-end',
      ...(ownerState.variant === 'compact' && {
        width: 40,
        height: 40,
        position: 'relative',
        [`& .${avatarGroupClasses.avatar}`]: {
          margin: 0,
          width: 28,
          height: 28,
          position: 'absolute',
          '&:first-of-type': { left: 0, bottom: 0, zIndex: 9 },
          '&:last-of-type': { top: 0, right: 0 },
        },
      }),
    }),
    avatar: ({ theme }) => ({
      fontSize: 16,
      fontWeight: theme.typography.fontWeightSemiBold,
      '&:first-of-type': {
        fontSize: 12,
        color: theme.vars.palette.primary.dark,
        backgroundColor: theme.vars.palette.primary.lighter,
      },
    }),
  },
};

// ----------------------------------------------------------------------

export const avatar = { MuiAvatar, MuiAvatarGroup };
