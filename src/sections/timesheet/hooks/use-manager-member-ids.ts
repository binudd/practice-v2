import type { UserRole } from 'src/auth/roles';
import type { ITimesheetEntry } from 'src/types/timesheet';

import { useMemo } from 'react';

import { _userList } from 'src/_mock/_user';

// ----------------------------------------------------------------------

const ROLLUP_ROLES: UserRole[] = ['member', 'manager', 'admin', 'superadmin'];

export function useManagerMemberIds(entriesInRange: ITimesheetEntry[], enabled: boolean) {
  return useMemo(() => {
    if (!enabled) {
      return [];
    }
    const ids = new Set<string>();
    entriesInRange.forEach((e) => {
      const u = _userList.find((x) => x.id === e.userId);
      if (u && ROLLUP_ROLES.includes(u.role as UserRole)) {
        ids.add(e.userId);
      }
    });
    return Array.from(ids).sort((a, b) => {
      const ua = _userList.find((u) => u.id === a);
      const ub = _userList.find((u) => u.id === b);
      return (ua?.name ?? a).localeCompare(ub?.name ?? b);
    });
  }, [entriesInRange, enabled]);
}
