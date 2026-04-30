import { _userList } from 'src/_mock/_user';

// ----------------------------------------------------------------------

/** Users shown in owner / leader / bulk-add-team pickers (consistent with legacy create form). */
export const PROJECT_USER_SELECT_OPTIONS = _userList.slice(0, 16).map((u) => ({ value: u.id, label: u.name }));

export const DEPARTMENT_OPTIONS = [
  { value: 'dt-dev', label: 'DT-Dev' },
  { value: 'dt-ops', label: 'DT-Ops' },
  { value: 'product', label: 'Product' },
] as const;

// ----------------------------------------------------------------------

export function projectUserNameById(userId: string): string {
  return _userList.find((u) => u.id === userId)?.name ?? '';
}

export function resolveProjectUserIdInPickerOptions(
  id: string | undefined,
  fallback: string
): string {
  if (id && PROJECT_USER_SELECT_OPTIONS.some((u) => u.value === id)) return id;
  if (fallback && PROJECT_USER_SELECT_OPTIONS.some((u) => u.value === fallback)) return fallback;
  return PROJECT_USER_SELECT_OPTIONS[0]?.value ?? '';
}
