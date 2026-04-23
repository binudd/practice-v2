import type { UserRole } from 'src/auth/roles';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import { useDevStore } from 'src/store/dev-store';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { useCurrentRole } from 'src/auth/hooks';
import { ROLES, ALL_ROLES } from 'src/auth/roles';

// ----------------------------------------------------------------------

/**
 * Dev-only UI to flip the active role without a real backend. Writes to the
 * dev store, which is subscribed to by AuthProvider so the switch takes effect
 * immediately - no page reload. Hidden in production bundles.
 */
export function RoleSwitcher() {
  const currentRole = useCurrentRole();

  const roleOverride = useDevStore((s) => s.roleOverride);
  const setRoleOverride = useDevStore((s) => s.setRoleOverride);
  const clearRoleOverride = useDevStore((s) => s.clearRoleOverride);

  if (!import.meta.env.DEV) return null;

  const handleSelect = (role: UserRole) => setRoleOverride(role);

  const effective = roleOverride ?? currentRole;

  return (
    <Box sx={{ px: 2.5, py: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Iconify icon="solar:shield-user-bold" width={20} />
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
          Dev: switch role
        </Typography>
      </Stack>

      <MenuList dense sx={{ p: 0 }}>
        {ALL_ROLES.map((role) => (
          <MenuItem
            key={role}
            selected={effective === role}
            onClick={() => handleSelect(role)}
            sx={{ borderRadius: 1, py: 0.75 }}
          >
            <Label variant="soft" color={ROLES[role].color} sx={{ mr: 1 }}>
              {ROLES[role].label}
            </Label>
            {effective === role && (
              <Iconify icon="eva:checkmark-fill" sx={{ ml: 'auto' }} width={18} />
            )}
          </MenuItem>
        ))}
        <MenuItem
          onClick={() => clearRoleOverride()}
          sx={{ borderRadius: 1, py: 0.75, color: 'text.secondary' }}
        >
          <Iconify icon="solar:refresh-bold" sx={{ mr: 1 }} width={18} />
          Clear override
        </MenuItem>
      </MenuList>
    </Box>
  );
}
