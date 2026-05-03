import { ipcMain } from 'electron'
import { IPC } from '@shared/ipc-channels'
import { ipcSuccess, ipcError, type IPCResult } from '@shared/ipc-types'
import type { Repositories } from '../db/repositories'

export function registerSettingsHandlers(repos: Repositories): void {
  ipcMain.handle(IPC.SETTINGS_GET, async (_event, key: string): Promise<IPCResult<unknown>> => {
    try {
      return ipcSuccess(repos.settings.get(key))
    } catch (error) {
      return ipcError(error)
    }
  })

  ipcMain.handle(
    IPC.SETTINGS_SET,
    async (_event, key: string, value: unknown): Promise<IPCResult<void>> => {
      try {
        repos.settings.set(key, value)
        return ipcSuccess(undefined)
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(IPC.SETTINGS_GET_ALL, async (): Promise<IPCResult<Record<string, unknown>>> => {
    try {
      return ipcSuccess(repos.settings.getAll())
    } catch (error) {
      return ipcError(error)
    }
  })
}
