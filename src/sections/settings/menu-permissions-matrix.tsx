import type {
  PermissionAssignee,
  MenuCrudPermissions,
  MenuPermissionListItem,
  MenuPermissionMatrixState,
  PermissionAssignmentPayload,
} from 'src/types/menu-permission';

import { useMemo, useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import TableContainer from '@mui/material/TableContainer';

import { varAlpha } from 'src/theme/styles';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

import { emptyMenuCrudPermissions } from 'src/types/menu-permission';

// ----------------------------------------------------------------------

const FILTER_TABS = [
  { value: 'all', label: 'All' },
  { value: 'modules', label: 'Modules' },
  { value: 'reports', label: 'Reports' },
] as const;

type FilterTab = (typeof FILTER_TABS)[number]['value'];

type PermissionKey = keyof MenuCrudPermissions;

const PERM_COLUMNS: { key: PermissionKey; label: string; short: string; icon: string }[] = [
  { key: 'canView', label: 'Can view', short: 'View', icon: 'solar:eye-bold' },
  { key: 'canAdd', label: 'Can add', short: 'Add', icon: 'mingcute:add-line' },
  { key: 'canEdit', label: 'Can edit', short: 'Edit', icon: 'solar:pen-bold' },
  { key: 'canDelete', label: 'Can delete', short: 'Delete', icon: 'solar:trash-bin-trash-bold' },
];

function buildMatrixFromMenus(
  menus: MenuPermissionListItem[],
  initial?: MenuPermissionMatrixState
): MenuPermissionMatrixState {
  const next: MenuPermissionMatrixState = {};
  menus.forEach((m) => {
    next[m.menuID] = initial?.[m.menuID]
      ? { ...initial[m.menuID] }
      : emptyMenuCrudPermissions();
  });
  return next;
}

function applyPermissionToggle(
  row: MenuCrudPermissions,
  key: PermissionKey,
  checked: boolean
): MenuCrudPermissions {
  const next = { ...row };
  if (key === 'canView' && !checked) {
    next.canView = false;
    next.canAdd = false;
    next.canEdit = false;
    next.canDelete = false;
    return next;
  }
  if (key === 'canView' && checked) {
    next.canView = true;
    return next;
  }
  if (checked && (key === 'canAdd' || key === 'canEdit' || key === 'canDelete')) {
    next[key] = true;
    next.canView = true;
    return next;
  }
  next[key] = checked;
  return next;
}

// ----------------------------------------------------------------------

export type MenuPermissionsMatrixProps = {
  menus: MenuPermissionListItem[];
  users?: PermissionAssignee[];
  initialMatrix?: MenuPermissionMatrixState;
  onSave?: (payload: PermissionAssignmentPayload) => void | Promise<void>;
};

export function MenuPermissionsMatrix({
  menus,
  users = [],
  initialMatrix,
  onSave,
}: MenuPermissionsMatrixProps) {
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [roleName, setRoleName] = useState('');
  const [assignee, setAssignee] = useState<PermissionAssignee | null>(null);
  const [matrix, setMatrix] = useState(() => buildMatrixFromMenus(menus, initialMatrix));

  useEffect(() => {
    setMatrix((prev) => {
      const next: MenuPermissionMatrixState = { ...prev };
      menus.forEach((m) => {
        if (!(m.menuID in next)) {
          next[m.menuID] = emptyMenuCrudPermissions();
        }
      });
      Object.keys(next).forEach((id) => {
        if (!menus.some((m) => m.menuID === Number(id))) {
          delete next[Number(id)];
        }
      });
      return next;
    });
  }, [menus]);

  const filteredMenus = useMemo(
    () =>
      menus.filter((m) => {
        if (filterTab === 'modules' && m.isReport) return false;
        if (filterTab === 'reports' && !m.isReport) return false;
        return true;
      }),
    [menus, filterTab]
  );

  const visibleIds = useMemo(() => filteredMenus.map((m) => m.menuID), [filteredMenus]);

  const columnSelectState = useCallback(
    (key: PermissionKey) => {
      const selected = visibleIds.filter((id) => matrix[id]?.[key]).length;
      const total = visibleIds.length;
      return {
        checked: total > 0 && selected === total,
        indeterminate: selected > 0 && selected < total,
      };
    },
    [matrix, visibleIds]
  );

  const applyColumn = useCallback((key: PermissionKey, checked: boolean) => {
    setMatrix((prev) => {
      const next = { ...prev };
      visibleIds.forEach((id) => {
        const cur = next[id] ?? emptyMenuCrudPermissions();
        next[id] = applyPermissionToggle(cur, key, checked);
      });
      return next;
    });
  }, [visibleIds]);

  const toggleCell = useCallback((menuId: number, key: PermissionKey, checked: boolean) => {
    setMatrix((prev) => {
      const cur = prev[menuId] ?? emptyMenuCrudPermissions();
      return { ...prev, [menuId]: applyPermissionToggle(cur, key, checked) };
    });
  }, []);

  const handleReset = useCallback(() => {
    setMatrix(buildMatrixFromMenus(menus));
    toast.info('Permissions reset to defaults');
  }, [menus]);

  const handleSave = useCallback(async () => {
    const trimmedRole = roleName.trim();
    if (!trimmedRole) {
      toast.warning('Enter a role name');
      return;
    }
    if (!assignee) {
      toast.warning('Select a user');
      return;
    }

    const payload: PermissionAssignmentPayload = {
      roleName: trimmedRole,
      user: assignee,
      matrix,
    };

    if (onSave) {
      try {
        await onSave(payload);
        toast.success('Permissions saved');
      } catch {
        toast.error('Could not save permissions');
      }
    } else {
      console.info('Permission assignment payload', payload);
      toast.info('Connect onSave to persist — payload logged to console');
    }
  }, [assignee, matrix, onSave, roleName]);

  const notFound = filteredMenus.length === 0;

  return (
    <Card>
      <Stack
        spacing={2.5}
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        sx={{ p: 2.5, pb: 0 }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h6">Menu permissions</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 560 }}>
           Manage roles and permissions for users.
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} flexShrink={0}>
          <Button color="inherit" variant="outlined" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Save changes
          </Button>
        </Stack>
      </Stack>

      <Stack
        spacing={2}
        direction={{ xs: 'column', md: 'row' }}
        sx={{ px: 2.5, pt: 2.5 }}
      >
        <TextField
          fullWidth
          label="Role name"
          placeholder="e.g. Project coordinator"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
        />

        <Autocomplete
          fullWidth
          options={users}
          value={assignee}
          onChange={(_, v) => setAssignee(v)}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => (
            <TextField {...params} label="User" placeholder="Search users..." />
          )}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              <Avatar
                alt={option.name}
                src={option.avatarUrl}
                sx={{ width: 32, height: 32, mr: 1.5, flexShrink: 0 }}
              />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle2" noWrap>
                  {option.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                  {option.email} · {option.role}
                </Typography>
              </Box>
            </li>
          )}
          noOptionsText="No users found"
        />
      </Stack>

      <Tabs
        value={filterTab}
        onChange={(_, v: FilterTab) => setFilterTab(v)}
        sx={{
          px: 2.5,
          mt: 2,
          boxShadow: (theme) =>
            `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
        }}
      >
        {FILTER_TABS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={tab.label}
            iconPosition="end"
            icon={
              <Label
                variant={tab.value === filterTab ? 'filled' : 'soft'}
                color={tab.value === 'reports' ? 'info' : tab.value === 'modules' ? 'success' : 'default'}
              >
                {tab.value === 'all'
                  ? menus.length
                  : tab.value === 'modules'
                    ? menus.filter((m) => !m.isReport).length
                    : menus.filter((m) => m.isReport).length}
              </Label>
            }
          />
        ))}
      </Tabs>

      <Box sx={{ px: 2.5, pt: 2, pb: 2.5 }}>
        <TableContainer
          component={Box}
          sx={{
            maxHeight: 560,
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.vars.palette.divider}`,
            overflow: 'auto',
          }}
        >
          <Table stickyHeader size="small" sx={{ minWidth: 768 }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    position: 'sticky',
                    left: 0,
                    top: 0,
                    zIndex: 5,
                    bgcolor: 'background.subtle',
                    boxShadow: (theme) =>
                      `1px 0 0 ${theme.vars.palette.divider}, 0 1px 0 ${theme.vars.palette.divider}`,
                    minWidth: 220,
                  }}
                >
                  Menu
                </TableCell>
                {PERM_COLUMNS.map((col) => {
                  const { checked, indeterminate } = columnSelectState(col.key);
                  return (
                    <TableCell
                      key={col.key}
                      align="center"
                      sx={{
                        top: 0,
                        zIndex: 4,
                        minWidth: 132,
                        px: 1,
                        bgcolor: 'background.subtle',
                        boxShadow: (theme) => `0 1px 0 ${theme.vars.palette.divider}`,
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                        spacing={0.75}
                        sx={{ flexWrap: 'nowrap' }}
                      >
                        <Tooltip title={`${col.label} — all rows below`} placement="top">
                          <span>
                            <Checkbox
                              size="small"
                              checked={checked}
                              indeterminate={indeterminate}
                              onChange={(e) => applyColumn(col.key, e.target.checked)}
                              disabled={visibleIds.length === 0}
                              inputProps={{ 'aria-label': `Select all ${col.label}` }}
                            />
                          </span>
                        </Tooltip>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                          sx={{ color: 'text.secondary' }}
                        >
                          <Iconify icon={col.icon} width={18} sx={{ opacity: 0.9 }} />
                          <Typography variant="caption" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {col.short}
                          </Typography>
                        </Stack>
                      </Stack>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>

            <TableBody>
              {notFound ? (
                <TableRow>
                  <TableCell colSpan={1 + PERM_COLUMNS.length} sx={{ border: 0 }}>
                    <EmptyContent filled title="No menus match" sx={{ py: 8 }} />
                  </TableCell>
                </TableRow>
              ) : (
                filteredMenus.map((row) => {
                  const perm = matrix[row.menuID] ?? emptyMenuCrudPermissions();
                  return (
                    <TableRow key={row.menuID} hover>
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: 0,
                          zIndex: 2,
                          bgcolor: 'background.paper',
                          boxShadow: (theme) => `1px 0 0 ${theme.vars.palette.divider}`,
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                          <Typography variant="subtitle2" noWrap>
                            {row.menuName}
                          </Typography>
                          <Label variant="soft" color={row.isReport ? 'info' : 'default'}>
                            {row.isReport ? 'Report' : 'Module'}
                          </Label>
                        </Stack>
                      </TableCell>
                      {PERM_COLUMNS.map((col) => {
                        const cellDisabled = col.key !== 'canView' && !perm.canView;
                        return (
                          <TableCell key={col.key} align="center" sx={{ px: 0.5, minWidth: 132 }}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="center"
                              spacing={0.75}
                              sx={{ flexWrap: 'nowrap' }}
                            >
                              <Tooltip title={col.label} placement="top">
                                <span>
                                  <Checkbox
                                    size="small"
                                    checked={perm[col.key]}
                                    onChange={(e) => toggleCell(row.menuID, col.key, e.target.checked)}
                                    disabled={cellDisabled}
                                    inputProps={{
                                      'aria-label': `${col.label} — ${row.menuName}`,
                                    }}
                                  />
                                </span>
                              </Tooltip>
                              <Stack
                                direction="row"
                                spacing={0.5}
                                alignItems="center"
                                sx={{
                                  color: 'text.secondary',
                                  opacity: cellDisabled ? 0.35 : 1,
                                }}
                              >
                                <Iconify icon={col.icon} width={16} sx={{ flexShrink: 0 }} />
                                <Typography
                                  variant="caption"
                                  sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
                                >
                                  {col.short}
                                </Typography>
                              </Stack>
                            </Stack>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Card>
  );
}
