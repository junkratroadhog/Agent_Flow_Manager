import { invoke } from './bridge'
import { IPC } from '@shared/ipc-channels'

export const settingsService = {
  get: <T = unknown>(key: string): Promise<T | null> => invoke<T | null>(IPC.SETTINGS_GET, key),
  set: <T = unknown>(key: string, value: T): Promise<void> =>
    invoke<void>(IPC.SETTINGS_SET, key, value),
  getAll: (): Promise<Record<string, unknown>> =>
    invoke<Record<string, unknown>>(IPC.SETTINGS_GET_ALL)
}
