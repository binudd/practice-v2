import type { IProject } from './project';

// ----------------------------------------------------------------------

/** Flat fields that bulk update can set on every targeted project. */
export type ProjectBulkFlatFields = Partial<
  Pick<
    IProject,
    | 'priority'
    | 'department'
    | 'ownerId'
    | 'ownerName'
    | 'projectLeaderId'
    | 'projectLeaderName'
    | 'startDate'
    | 'endDate'
  >
>;

export type ProjectBulkMergeInput = {
  flat?: ProjectBulkFlatFields;
  memberIdsToAdd?: readonly string[];
};

/**
 * Build a patch relative to the previous project row (merges new members when `memberIdsToAdd` is set).
 */
export function mergeProjectBulkPatch(
  previous: IProject,
  input: ProjectBulkMergeInput
): Partial<IProject> {
  const out: Partial<IProject> = {};
  if (input.flat) {
    Object.assign(out, input.flat);
  }
  if (input.memberIdsToAdd?.length) {
    out.members = Array.from(new Set([...previous.members, ...input.memberIdsToAdd]));
  }
  return out;
}

export function isBulkPatchEmpty(patch: Partial<IProject>): boolean {
  return Object.keys(patch).length === 0;
}
