import { ipcMain, app } from 'electron'
import { IPC } from '@shared/ipc-channels'
import { ipcSuccess, ipcError, type IPCResult } from '@shared/ipc-types'

export function registerAppHandlers(): void {
  ipcMain.handle(IPC.APP_VERSION, async (): Promise<IPCResult<string>> => {
    try {
      return ipcSuccess(app.getVersion())
    } catch (error) {
      return ipcError(error)
    }
  })

  ipcMain.handle(IPC.APP_PLATFORM, async (): Promise<IPCResult<string>> => {
    try {
      return ipcSuccess(process.platform)
    } catch (error) {
      return ipcError(error)
    }
  })

  ipcMain.handle(IPC.APP_USER_DATA_PATH, async (): Promise<IPCResult<string>> => {
    try {
      return ipcSuccess(app.getPath('userData'))
    } catch (error) {
      return ipcError(error)
    }
  })
}
