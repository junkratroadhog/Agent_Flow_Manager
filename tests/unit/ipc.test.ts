import { describe, it, expect } from 'vitest'
import { ipcSuccess, ipcError, unwrap } from '../../src/shared/ipc-types'

describe('IPC envelope', () => {
  it('wraps success', () => {
    const r = ipcSuccess({ id: 1 })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.data).toEqual({ id: 1 })
  })

  it('wraps errors', () => {
    const r = ipcError(new Error('boom'))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toBe('boom')
  })

  it('unwrap returns data on success', () => {
    expect(unwrap(ipcSuccess(42))).toBe(42)
  })

  it('unwrap throws on error', () => {
    expect(() => unwrap(ipcError(new Error('nope')))).toThrow('nope')
  })
})
