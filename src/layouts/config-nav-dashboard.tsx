import type { UserRole } from 'src/auth/roles';
import type { NavSectionProps } from 'src/components/nav-section';

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
const ADMIN_ONLY: UserRole[] = ['superadmin', 'admin'];
const INVOICE_VIEWERS: UserRole[] = ['superadmin', 'admin', 'client'];
const TIMESHEET_USERS: UserRole[] = ['admin', 'manager', 'member'];

// ----------------------------------------------------------------------

export const navData: NavSectionProps['data'] = [
  /**
   * Overview
   */
  {
    subheader: 'Overview',
    items: [
      { title: 'Dashboard', path: paths.dashboard.overview, icon: ICONS.dashboard, menuName: 'Dashboard' },
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
        path: paths.dashboard.project.list,
        icon: ICONS.folder,
        menuName: 'Project',
        children: [
          { title: 'List', path: paths.dashboard.project.list, menuName: 'Project', icon: SUB.list },
          {
            title: 'Templates',
            path: paths.dashboard.project.templates.root,
            menuName: 'Project',
            icon: <Iconify icon="solar:copy-bold" width={22} />,
          },
          {
            title: 'Recurring',
            path: paths.dashboard.project.recurringProjects.root,
            menuName: 'Project',
            icon: <Iconify icon="solar:calendar-bold" width={22} />,
          },
          { title: 'New', path: paths.dashboard.project.new, menuName: 'Project', permissionAction: 'canAdd', icon: SUB.add },
        ],
      },
      {
        title: 'My Work',
        path: paths.dashboard.kanban,
        icon: ICONS.kanban,
        menuName: 'My Work',
      },
      {
        title: 'Calendar',
        path: paths.dashboard.calendar,
        icon: ICONS.calendar,
        menuName: 'Calendar',
      },
      {
        title: 'Timesheet',
        path: paths.dashboard.timesheet,
        icon: ICONS.label,
        menuName: 'Timesheet',
      },
      { title: 'Files', path: paths.dashboard.files, icon: ICONS.file, menuName: 'File Manager' },
    ],
  },
  /**
   * Collaboration
   */
  {
    subheader: 'Collaboration',
    items: [
      { title: 'Chat', path: paths.dashboard.chat, icon: ICONS.chat, menuName: 'Discussions' },
      { title: 'Mail', path: paths.dashboard.mail, icon: ICONS.mail, menuName: 'Discussions' },
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
        menuName: 'People',
        children: [
          { title: 'List', path: paths.dashboard.user.list, menuName: 'People', icon: SUB.list },
          { title: 'New', path: paths.dashboard.user.new, menuName: 'People', permissionAction: 'canAdd', icon: SUB.add },
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
        menuName: 'Invoice',
        children: [
          {
            title: 'List',
            path: paths.dashboard.invoice.list,
            menuName: 'Invoice',
            icon: SUB.list,
          },
          { title: 'New', path: paths.dashboard.invoice.new, menuName: 'Invoice', permissionAction: 'canAdd', icon: SUB.add },
        ],
      },
    ],
  },
];
