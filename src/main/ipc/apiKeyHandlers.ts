import { ipcMain } from 'electron'
import { IPC } from '@shared/ipc-channels'
import { ipcSuccess, ipcError, type IPCResult } from '@shared/ipc-types'
import type { SecretStorage } from '../services/SecretStorage'

export function registerApiKeyHandlers(secretStorage: SecretStorage): void {
  ipcMain.handle(
    IPC.APIKEY_SET,
    async (_event, provider: string, key: string): Promise<IPCResult<void>> => {
      try {
        secretStorage.setApiKey(provider, key)
        return ipcSuccess(undefined)
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.APIKEY_HAS,
    async (_event, provider: string): Promise<IPCResult<boolean>> => {
      try {
        return ipcSuccess(secretStorage.hasApiKey(provider))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.APIKEY_DELETE,
    async (_event, provider: string): Promise<IPCResult<boolean>> => {
      try {
        return ipcSuccess(secretStorage.deleteApiKey(provider))
      } catch (error) {
        return ipcError(error)
      }
    }
  )

  ipcMain.handle(
    IPC.APIKEY_LIST_PROVIDERS,
    async (): Promise<IPCResult<string[]>> => {
      try {
        return ipcSuccess(secretStorage.listProviders())
      } catch (error) {
        return ipcError(error)
      }
    }
  )
}
