import { varAlpha } from '../styles';
import { grey, info, error, common, primary, success, warning, secondary } from './palette';

import type { ThemeColorScheme } from '../types';

// ----------------------------------------------------------------------

export interface CustomShadows {
  z1?: string;
  z4?: string;
  z8?: string;
  z12?: string;
  z16?: string;
  z20?: string;
  z24?: string;
  //
  primary?: string;
  secondary?: string;
  info?: string;
  success?: string;
  warning?: string;
  error?: string;
  //
  card?: string;
  dialog?: string;
  dropdown?: string;
  /** Floating toasts (Sonner) — needs depth over the neutral canvas */
  toast?: string;
}

declare module '@mui/material/styles' {
  interface Theme {
    customShadows: CustomShadows;
  }
  interface ThemeOptions {
    customShadows?: CustomShadows;
  }
  interface ThemeVars {
    customShadows: CustomShadows;
  }
}

// ----------------------------------------------------------------------

export function createShadowColor(colorChannel: string) {
  return `0 8px 16px 0 ${varAlpha(colorChannel, 0.24)}`;
}

/** In-app surfaces rely on palette contrast (neutral / paper / subtle), not drop shadows. */
const SURFACE_SHADOW = 'none';

export function customShadows(colorScheme: ThemeColorScheme) {
  const colorChannel = colorScheme === 'light' ? grey['500Channel'] : common.blackChannel;

  return {
    z1: SURFACE_SHADOW,
    z4: SURFACE_SHADOW,
    z8: SURFACE_SHADOW,
    z12: SURFACE_SHADOW,
    z16: SURFACE_SHADOW,
    z20: SURFACE_SHADOW,
    z24: SURFACE_SHADOW,
    //
    dialog: `-40px 40px 80px -8px ${varAlpha(common.blackChannel, 0.24)}`,
    card: SURFACE_SHADOW,
    dropdown: `0 0 2px 0 ${varAlpha(colorChannel, 0.24)}, -20px 20px 40px -4px ${varAlpha(colorChannel, 0.24)}`,
    toast: `0 8px 24px -4px ${varAlpha(colorChannel, 0.2)}, 0 4px 12px -2px ${varAlpha(common.blackChannel, 0.12)}`,
    //
    primary: createShadowColor(primary.mainChannel),
    secondary: createShadowColor(secondary.mainChannel),
    info: createShadowColor(info.mainChannel),
    success: createShadowColor(success.mainChannel),
    warning: createShadowColor(warning.mainChannel),
    error: createShadowColor(error.mainChannel),
  };
}
