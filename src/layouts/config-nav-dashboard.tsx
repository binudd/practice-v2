import type { UserRole } from 'src/auth/roles';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  dashboard: icon('ic-dashboard'),
  analytics: icon('ic-analytics'),
  kanban: icon('ic-kanban'),
  calendar: icon('ic-calendar'),
  folder: icon('ic-folder'),
  /** Iconify: navbar `ic-file.svg` is a poor mask source in some themes; match project Files tab. */
  file: <Iconify icon="solar:document-bold" width={24} />,
  user: icon('ic-user'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  invoice: icon('ic-invoice'),
  label: icon('ic-label'),
  order: icon('ic-order'),
};

/** Submenu icons: same Solar bold family as account / project tabs (nav vertical/mini). */
const SUB = {
  list: <Iconify icon="solar:list-bold" width={22} />,
  add: <Iconify icon="solar:add-circle-bold" width={22} />,
};

// Reusable role groups
const ALL: UserRole[] = ['superadmin', 'admin', 'manager', 'member', 'client'];
const WORKSPACE: UserRole[] = ['superadmin', 'admin', 'manager', 'member'];
const PROJECT_EDIT: UserRole[] = ['superadmin', 'admin', 'manager'];
const ADMIN_ONLY: UserRole[] = ['superadmin', 'admin'];
const INVOICE_VIEWERS: UserRole[] = ['superadmin', 'admin', 'client'];
const TIMESHEET_USERS: UserRole[] = ['admin', 'manager', 'member'];

// ----------------------------------------------------------------------

export const navData = [
  /**
   * Overview
   */
  {
    subheader: 'Overview',
    items: [
      { title: 'Dashboard', path: paths.dashboard.overview, icon: ICONS.dashboard, roles: ALL },
    ],
  },
  /**
   * Management
   */
  {
    subheader: 'Management',
    items: [
      {
        title: 'Projects',
        path: paths.dashboard.project.root,
        icon: ICONS.folder,
        roles: ALL,
        children: [
          { title: 'List', path: paths.dashboard.project.list, roles: ALL, icon: SUB.list },
          { title: 'New', path: paths.dashboard.project.new, roles: PROJECT_EDIT, icon: SUB.add },
        ],
      },
      {
        title: 'My Work',
        path: paths.dashboard.kanban,
        icon: ICONS.kanban,
        roles: WORKSPACE,
      },
      {
        title: 'Calendar',
        path: paths.dashboard.calendar,
        icon: ICONS.calendar,
        roles: WORKSPACE,
      },
      {
        title: 'Timesheet',
        path: paths.dashboard.timesheet,
        icon: ICONS.label,
        roles: TIMESHEET_USERS,
      },
      { title: 'Files', path: paths.dashboard.files, icon: ICONS.file, roles: ALL },
    ],
  },
  /**
   * Collaboration
   */
  {
    subheader: 'Collaboration',
    items: [
      { title: 'Chat', path: paths.dashboard.chat, icon: ICONS.chat, roles: WORKSPACE },
      { title: 'Mail', path: paths.dashboard.mail, icon: ICONS.mail, roles: WORKSPACE },
    ],
  },
  /**
   * People
   */
  {
    subheader: 'People',
    items: [
      {
        title: 'Users',
        path: paths.dashboard.user.root,
        icon: ICONS.user,
        roles: ADMIN_ONLY,
        children: [
          { title: 'List', path: paths.dashboard.user.list, roles: ADMIN_ONLY, icon: SUB.list },
          { title: 'New', path: paths.dashboard.user.new, roles: ADMIN_ONLY, icon: SUB.add },
        ],
      },
    ],
  },
  /**
   * Billing
   */
  {
    subheader: 'Billing',
    items: [
      {
        title: 'Invoices',
        path: paths.dashboard.invoice.root,
        icon: ICONS.invoice,
        roles: INVOICE_VIEWERS,
        children: [
          {
            title: 'List',
            path: paths.dashboard.invoice.list,
            roles: INVOICE_VIEWERS,
            icon: SUB.list,
          },
          { title: 'New', path: paths.dashboard.invoice.new, roles: ADMIN_ONLY, icon: SUB.add },
        ],
      },
    ],
  },
];
