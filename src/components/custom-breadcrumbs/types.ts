import type { Theme, SxProps } from '@mui/material/styles';
import type { BreadcrumbsProps } from '@mui/material/Breadcrumbs';

// ----------------------------------------------------------------------

export type BreadcrumbsLinkProps = {
  name?: string;
  href?: string;
  icon?: React.ReactElement;
};

export type CustomBreadcrumbsProps = BreadcrumbsProps & {
  /**
   * @deprecated Ignored. The large page title was removed; breadcrumbs carry context.
   * Kept so older call sites remain type-valid.
   */
  heading?: string;
  /** @deprecated Ignored. */
  forceHeading?: boolean;
  moreLink?: string[];
  activeLast?: boolean;
  action?: React.ReactNode;
  links: BreadcrumbsLinkProps[];
  sx?: SxProps<Theme>;
  slotProps?: {
    action: SxProps<Theme>;
    moreLink: SxProps<Theme>;
    breadcrumbs: SxProps<Theme>;
  };
};
