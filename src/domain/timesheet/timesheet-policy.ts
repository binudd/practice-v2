import type { AuthUser } from 'src/auth/types';
import type { ITimesheetEntry } from 'src/types/timesheet';

import { hasPermission } from 'src/auth/permissions';

// ----------------------------------------------------------------------

export const TimesheetPolicy = {
  canEnter: (user: AuthUser) => !!user && hasPermission(user.role, 'timesheet:enter'),

  canViewAll: (user: AuthUser) => !!user && hasPermission(user.role, 'timesheet:view-all'),

  canEditEntry: (user: AuthUser, entry: ITimesheetEntry) => {
    if (!user) return false;
    if (hasPermission(user.role, 'timesheet:view-all')) return true;
    return entry.userId === user.id;
  },

  canDeleteEntry: (user: AuthUser, entry: ITimesheetEntry) =>
    TimesheetPolicy.canEditEntry(user, entry),
};
