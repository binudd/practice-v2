import type { IInvoice } from 'src/types/invoice';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { breadcrumbHomeLink, useSetDashboardBreadcrumbs } from 'src/components/dashboard-breadcrumbs';

import { InvoiceNewEditForm } from '../invoice-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
  invoice?: IInvoice;
};

export function InvoiceEditView({ invoice }: Props) {
  useSetDashboardBreadcrumbs(
    [
      breadcrumbHomeLink,
      { name: 'Invoice', href: paths.dashboard.invoice.root },
      { name: invoice?.invoiceNumber ?? '' },
    ],
    undefined,
    [invoice?.id, invoice?.invoiceNumber]
  );

  return (
    <DashboardContent>
      <InvoiceNewEditForm currentInvoice={invoice} />
    </DashboardContent>
  );
}
