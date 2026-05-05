import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { breadcrumbHomeLink, useSetDashboardBreadcrumbs } from 'src/components/dashboard-breadcrumbs';

import { InvoiceNewEditForm } from '../invoice-new-edit-form';

// ----------------------------------------------------------------------

export function InvoiceCreateView() {
  useSetDashboardBreadcrumbs(
    [
      breadcrumbHomeLink,
      { name: 'Invoice', href: paths.dashboard.invoice.root },
      { name: 'New invoice' },
    ],
    undefined,
    []
  );

  return (
    <DashboardContent>
      <InvoiceNewEditForm />
    </DashboardContent>
  );
}
