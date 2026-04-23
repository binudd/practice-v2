import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { OverviewAdminView } from 'src/sections/overview/admin/view';
import { OverviewClientView } from 'src/sections/overview/client/view';
import { OverviewMemberView } from 'src/sections/overview/member/view';
import { OverviewManagerView } from 'src/sections/overview/manager/view';
import { OverviewSuperAdminView } from 'src/sections/overview/super-admin/view';

import { useCurrentRole } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const metadata = { title: `Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const role = useCurrentRole();

  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      {(() => {
        switch (role) {
          case 'superadmin':
            return <OverviewSuperAdminView />;
          case 'admin':
            return <OverviewAdminView />;
          case 'manager':
            return <OverviewManagerView />;
          case 'client':
            return <OverviewClientView />;
          case 'member':
          default:
            return <OverviewMemberView />;
        }
      })()}
    </>
  );
}
