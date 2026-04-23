import type { AuthUser } from 'src/auth/types';
import type { IInvoice } from 'src/types/invoice';

import { hasPermission } from 'src/auth/permissions';

// ----------------------------------------------------------------------

export const InvoicePolicy = {
  canView: (user: AuthUser, invoice?: IInvoice) => {
    if (!user) return false;
    if (!hasPermission(user.role, 'invoice:view')) return false;
    // Clients only see invoices addressed to them. When the argument is
    // omitted we let the list view through so it can filter its own rows.
    if (user.role === 'client' && invoice) {
      return invoice.invoiceTo?.id === user.id;
    }
    return true;
  },

  canEdit: (user: AuthUser, _invoice: IInvoice) =>
    !!user && hasPermission(user.role, 'invoice:manage'),

  canDelete: (user: AuthUser, _invoice: IInvoice) =>
    !!user && hasPermission(user.role, 'invoice:manage'),

  canCreate: (user: AuthUser) => !!user && hasPermission(user.role, 'invoice:manage'),
};
