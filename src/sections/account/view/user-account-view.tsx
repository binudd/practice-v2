import { useSearchParams } from 'react-router-dom';
import { useEffect, useCallback, type SyntheticEvent } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { _userAbout, _userPlans, _userPayment, _userInvoices, _userAddressBook } from 'src/_mock';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AccountGeneral } from '../account-general';
import { AccountBilling } from '../account-billing';
import { AccountSocialLinks } from '../account-social-links';
import { AccountNotifications } from '../account-notifications';
import { AccountChangePassword } from '../account-change-password';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'general', label: 'General', icon: <Iconify icon="solar:user-id-bold" width={24} /> },
  { value: 'billing', label: 'Billing', icon: <Iconify icon="solar:bill-list-bold" width={24} /> },
  {
    value: 'notifications',
    label: 'Notifications',
    icon: <Iconify icon="solar:bell-bing-bold" width={24} />,
  },
  { value: 'social', label: 'Social links', icon: <Iconify icon="solar:share-bold" width={24} /> },
  { value: 'security', label: 'Security', icon: <Iconify icon="ic:round-vpn-key" width={24} /> },
] as const;

const TAB_VALUES = new Set<string>(TABS.map((t) => t.value));

function tabFromSearchParams(searchParams: URLSearchParams) {
  const raw = searchParams.get('tab');
  return raw && TAB_VALUES.has(raw) ? raw : 'general';
}

// ----------------------------------------------------------------------

export function AccountView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = tabFromSearchParams(searchParams);

  useEffect(() => {
    const raw = searchParams.get('tab');
    if (raw && !TAB_VALUES.has(raw)) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('tab');
          return next;
        },
        { replace: true }
      );
    }
  }, [searchParams, setSearchParams]);

  const handleTabChange = useCallback(
    (_: SyntheticEvent, newValue: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (newValue === 'general') {
            next.delete('tab');
          } else {
            next.set('tab', newValue);
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'My account' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: { xs: 3, md: 5 } }}>
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
        ))}
      </Tabs>

      {currentTab === 'general' && <AccountGeneral />}

      {currentTab === 'billing' && (
        <AccountBilling
          plans={_userPlans}
          cards={_userPayment}
          invoices={_userInvoices}
          addressBook={_userAddressBook}
        />
      )}

      {currentTab === 'notifications' && <AccountNotifications />}

      {currentTab === 'social' && <AccountSocialLinks socialLinks={_userAbout.socialLinks} />}

      {currentTab === 'security' && <AccountChangePassword />}
    </DashboardContent>
  );
}
