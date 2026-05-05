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

/** Full mock user list for member pickers (not limited to owner field slice). */
export function projectAssignPickerRows() {
  return _userList.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatarUrl: u.avatarUrl,
  }));
}

export function projectMemberMultiSelectOptions() {
  return projectAssignPickerRows().map((r) => ({ value: r.id, label: r.name }));
}

export function projectAvatarsForMemberIds(ids: readonly string[]) {
  return ids
    .map((id) => _userList.find((u) => u.id === id))
    .filter((u): u is (typeof _userList)[number] => u != null)
    .map((u) => ({ id: u.id, name: u.name, avatarUrl: u.avatarUrl }));
}

export function resolveProjectUserIdInPickerOptions(
  id: string | undefined,
  fallback: string
): string {
  if (id && PROJECT_USER_SELECT_OPTIONS.some((u) => u.value === id)) return id;
  if (fallback && PROJECT_USER_SELECT_OPTIONS.some((u) => u.value === fallback)) return fallback;
  return PROJECT_USER_SELECT_OPTIONS[0]?.value ?? '';
}
