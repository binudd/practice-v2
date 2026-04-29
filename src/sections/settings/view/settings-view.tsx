import { useState, useEffect } from 'react';

import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { _userList } from 'src/_mock';

import { useUserStore } from 'src/store/user-store';
import { useMenuStore } from 'src/store/menu-store';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { MenuPermissionsMatrix } from '../menu-permissions-matrix';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'permission', label: 'Permission' },
  { value: 'system', label: 'System' },
  { value: 'workflow', label: 'Workflow' },
  { value: 'notification', label: 'Notification' },
  { value: 'custom-fields', label: 'Custom fields' },
] as const;

function PlaceholderPanel({ title, description }: { title: string; description: string }) {
  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={1}>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

export function SettingsView() {
  const [tab, setTab] = useState<string>(TABS[0].value);

  const tenantID = useUserStore((s) => s.user?.tenantID);
  const userId = useUserStore((s) => s.user?.id);
  const userEmail = useUserStore((s) => s.user?.email);
  const menus = useMenuStore((s) => s.menus);
  const roles = useMenuStore((s) => s.roles);
  const loading = useMenuStore((s) => s.loading);
  const roleLoading = useMenuStore((s) => s.roleLoading);
  const fetchMenus = useMenuStore((s) => s.fetchMenus);
  const fetchRoles = useMenuStore((s) => s.fetchRoles);
  const fetchRoleDetails = useMenuStore((s) => s.fetchRoleDetails);
  const savePermissions = useMenuStore((s) => s.savePermissions);
  const deleteRole = useMenuStore((s) => s.deleteRole);

  useEffect(() => {
    if (tenantID) {
      fetchMenus(tenantID);
      fetchRoles(tenantID);
    }
  }, [tenantID, fetchMenus, fetchRoles]);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Settings' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <CustomTabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        {TABS.map((t) => (
          <Tab key={t.value} value={t.value} label={t.label} />
        ))}
      </CustomTabs>

      {tab === 'permission' && (
        <MenuPermissionsMatrix
          menus={menus}
          roles={roles}
          loading={loading}
          roleLoading={roleLoading}
          onFetchRoleDetails={fetchRoleDetails}
          onSave={async (payload) => {
            if (!tenantID) return;
            // Map the payload to the expected API structure
            const apiPayload = {
              roleID: payload.roleID,
              tenantID,
              roleName: payload.roleName,
              roleDescription: payload.roleDescription,
              createdBy: userId || 0,
              changedBy: userId || 0,
              changedOn: new Date().toISOString(),
              createdOn: new Date().toISOString(),
              isValid: true,
              userRoleDetails: Object.entries(payload.matrix).map(([id, p]) => ({
                menuID: Number(id),
                ...p,
              })),
            };
            await savePermissions(apiPayload);
          }}
          onDelete={async (roleID) => {
            if (!tenantID) return;
            const apiPayload = {
              tenantID,
              userID: userId || 0,
              email: userEmail || '',
            };
            await deleteRole(roleID, apiPayload);
            await fetchRoles(tenantID);
          }}
        />
      )}
      {tab === 'system' && (
        <PlaceholderPanel
          title="System"
          description="Workspace-wide system preferences and limits (coming soon)."
        />
      )}
      {tab === 'workflow' && (
        <PlaceholderPanel
          title="Workflow"
          description="Define workflow rules and automations (coming soon)."
        />
      )}
      {tab === 'notification' && (
        <PlaceholderPanel
          title="Notification"
          description="Choose how and when you receive notifications (coming soon)."
        />
      )}
      {tab === 'custom-fields' && (
        <PlaceholderPanel
          title="Custom fields"
          description="Create and manage custom fields for projects and tasks (coming soon)."
        />
      )}
    </DashboardContent>
  );
}
