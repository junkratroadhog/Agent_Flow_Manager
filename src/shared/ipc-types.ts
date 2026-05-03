/**
 * Standard envelope for all IPC responses. Use these helpers to ensure errors
 * are surfaced consistently across the IPC boundary.
 */

export type IPCSuccess<T> = { ok: true; data: T }
export type IPCError = { ok: false; error: string; code?: string }
export type IPCResult<T> = IPCSuccess<T> | IPCError

export function ipcSuccess<T>(data: T): IPCSuccess<T> {
  return { ok: true, data }
}

export function ipcError(error: unknown, code?: string): IPCError {
  const message = error instanceof Error ? error.message : String(error)
  return { ok: false, error: message, code }
}

export function unwrap<T>(result: IPCResult<T>): T {
  if (!result.ok) {
    throw new Error(result.error)
  }
  return result.data
}
