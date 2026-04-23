// Kept as a compatibility re-export so the existing consumers can continue to
// import from `src/types/project`. The canonical definition lives in
// `src/domain/project/project.ts` alongside the zod schema.
export type { IProject, IProjectStatus } from 'src/domain/project/project';
