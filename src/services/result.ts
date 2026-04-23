// ----------------------------------------------------------------------
// Lightweight Result<T> so services can return typed success/failure without
// throwing. Callers write: `if (!res.ok) return;` instead of try/catch.
// ----------------------------------------------------------------------

export type Ok<T> = { ok: true; value: T };
export type Err<E = string> = { ok: false; error: E };
export type Result<T, E = string> = Ok<T> | Err<E>;

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });

export const err = <E = string>(error: E): Err<E> => ({ ok: false, error });

export function toMessage(error: unknown): string {
  if (!error) return 'Unknown error';
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}
