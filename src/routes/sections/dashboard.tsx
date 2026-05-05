import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { CONFIG } from 'src/config-global';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard, RoleGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

const OverviewPage = lazy(() => import('src/pages/dashboard/overview'));

// Projects
const ProjectListPage = lazy(() => import('src/pages/dashboard/project/list'));
const ProjectTemplatesPage = lazy(() => import('src/pages/dashboard/project/templates'));
const ProjectRecurringProjectsPage = lazy(() => import('src/pages/dashboard/project/recurring-projects'));
const ProjectNewPage = lazy(() => import('src/pages/dashboard/project/new'));
const ProjectEditPage = lazy(() => import('src/pages/dashboard/project/edit'));
const ProjectDetailsPage = lazy(() => import('src/pages/dashboard/project/details'));
const ProjectKanbanPage = lazy(() => import('src/pages/dashboard/project/kanban'));

// Kanban (global)
const KanbanPage = lazy(() => import('src/pages/dashboard/kanban'));
// Calendar
const CalendarPage = lazy(() => import('src/pages/dashboard/calendar'));
// Timesheet
const TimesheetPage = lazy(() => import('src/pages/dashboard/timesheet'));

// Settings
const SettingsPage = lazy(() => import('src/pages/dashboard/settings'));

// Users
const UserListPage = lazy(() => import('src/pages/dashboard/user/list'));
const UserNewPage = lazy(() => import('src/pages/dashboard/user/new'));
const UserEditPage = lazy(() => import('src/pages/dashboard/user/edit'));
const UserProfilePage = lazy(() => import('src/pages/dashboard/user/profile'));
const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account'));

// Files
const FileManagerPage = lazy(() => import('src/pages/dashboard/file-manager'));

// Chat & Mail
const ChatPage = lazy(() => import('src/pages/dashboard/chat'));
const MailPage = lazy(() => import('src/pages/dashboard/mail'));

// Invoice
const InvoiceListPage = lazy(() => import('src/pages/dashboard/invoice/list'));
const InvoiceNewPage = lazy(() => import('src/pages/dashboard/invoice/new'));
const InvoiceEditPage = lazy(() => import('src/pages/dashboard/invoice/edit'));
const InvoiceDetailsPage = lazy(() => import('src/pages/dashboard/invoice/details'));

// ----------------------------------------------------------------------

const layoutContent = (
  <DashboardLayout>
    <Suspense fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  </DashboardLayout>
);

const WORKSPACE_ROLES = ['superadmin', 'admin', 'manager', 'member'] as const;
const PROJECT_EDIT_ROLES = ['superadmin', 'admin', 'manager'] as const;
const ADMIN_ROLES = ['superadmin', 'admin'] as const;
const INVOICE_ROLES = ['superadmin', 'admin', 'client'] as const;
const COLLAB_ROLES = WORKSPACE_ROLES;
const TIMESHEET_ROLES = ['admin', 'manager', 'member'] as const;

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? <>{layoutContent}</> : <AuthGuard>{layoutContent}</AuthGuard>,
    children: [
      { element: <OverviewPage />, index: true },
      {
        path: 'projects',
        children: [
          { element: <ProjectListPage />, index: true },
          { path: 'templates', element: <ProjectTemplatesPage /> },
          {
            path: 'recurring',
            element: <ProjectRecurringProjectsPage />,
          },
          {
            path: 'new',
            element: (
              <RoleGuard roles={[...PROJECT_EDIT_ROLES]}>
                <ProjectNewPage />
              </RoleGuard>
            ),
          },
          { path: ':id', element: <ProjectDetailsPage /> },
          {
            path: ':id/edit',
            element: (
              <RoleGuard roles={[...PROJECT_EDIT_ROLES]}>
                <ProjectEditPage />
              </RoleGuard>
            ),
          },
          {
            path: ':id/kanban',
            element: (
              <RoleGuard roles={[...WORKSPACE_ROLES]}>
                <ProjectKanbanPage />
              </RoleGuard>
            ),
          },
        ],
      },
      {
        path: 'kanban',
        element: (
          <RoleGuard roles={[...WORKSPACE_ROLES]}>
            <KanbanPage />
          </RoleGuard>
        ),
      },
      {
        path: 'calendar',
        element: (
          <RoleGuard roles={[...WORKSPACE_ROLES]}>
            <CalendarPage />
          </RoleGuard>
        ),
      },
      {
        path: 'timesheet',
        element: (
          <RoleGuard roles={[...TIMESHEET_ROLES]}>
            <TimesheetPage />
          </RoleGuard>
        ),
      },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'profile', element: <UserProfilePage /> },
      { path: 'account', element: <UserAccountPage /> },
      {
        path: 'users',
        element: (
          <RoleGuard roles={[...ADMIN_ROLES]}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { element: <UserListPage />, index: true },
          { path: 'new', element: <UserNewPage /> },
          { path: ':id/edit', element: <UserEditPage /> },
        ],
      },
      { path: 'files', element: <FileManagerPage /> },
      {
        path: 'chat',
        element: (
          <RoleGuard roles={[...COLLAB_ROLES]}>
            <ChatPage />
          </RoleGuard>
        ),
      },
      {
        path: 'mail',
        element: (
          <RoleGuard roles={[...COLLAB_ROLES]}>
            <MailPage />
          </RoleGuard>
        ),
      },
      {
        path: 'invoices',
        element: (
          <RoleGuard roles={[...INVOICE_ROLES]}>
            <Outlet />
          </RoleGuard>
        ),
        children: [
          { element: <InvoiceListPage />, index: true },
          { path: 'new', element: <InvoiceNewPage /> },
          { path: ':id', element: <InvoiceDetailsPage /> },
          { path: ':id/edit', element: <InvoiceEditPage /> },
        ],
      },
    ],
  },
];
