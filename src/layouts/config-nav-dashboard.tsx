import type { UserRole } from 'src/auth/roles';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

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
  file: icon('ic-file'),
  user: icon('ic-user'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  invoice: icon('ic-invoice'),
  label: icon('ic-label'),
  order: icon('ic-order'),
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
        path: paths.dashboard.project.root,
        icon: ICONS.folder,
        menuName: 'Project',
        children: [
          { title: 'List', path: paths.dashboard.project.list, menuName: 'Project' },
          { title: 'New', path: paths.dashboard.project.new, menuName: 'Project' },
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
          { title: 'List', path: paths.dashboard.user.list, menuName: 'People' },
          { title: 'New', path: paths.dashboard.user.new, menuName: 'People' },
          { title: 'Profile', path: paths.dashboard.user.profile, menuName: 'People' },
          { title: 'Account', path: paths.dashboard.user.account, menuName: 'People' },
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
          { title: 'List', path: paths.dashboard.invoice.list, menuName: 'Invoice' },
          { title: 'New', path: paths.dashboard.invoice.new, menuName: 'Invoice' },
        ],
      },
    ],
  },
];
