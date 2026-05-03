import { unwrap, type IPCResult } from '@shared/ipc-types'

export async function invoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!window.bridge) {
    throw new Error('IPC bridge not available. Are you running in Electron?')
  }
  const result = (await window.bridge.invoke(channel, ...args)) as IPCResult<T>
  return unwrap(result)
}

export function subscribe(channel: string, listener: (...args: unknown[]) => void): () => void {
  if (!window.bridge) {
    return () => undefined
  }
  return window.bridge.on(channel, listener)
}
