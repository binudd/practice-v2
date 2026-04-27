import { useState } from 'react';

import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { _userList, _menuPermissionList } from 'src/_mock';

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
        <MenuPermissionsMatrix menus={_menuPermissionList} users={_userList} />
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
