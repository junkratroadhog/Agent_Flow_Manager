import { ipcMain, BrowserWindow } from 'electron'
import { getMainWindow } from './window'
import { IPC, IPC_EVENTS } from '../shared/ipc-channels'

export function registerWindowHandlers(): void {
  ipcMain.handle(IPC.WINDOW_MINIMIZE, () => {
    const window = getMainWindow()
    if (window) {
      window.minimize()
    }
  })

  ipcMain.handle(IPC.WINDOW_MAXIMIZE, () => {
    const window = getMainWindow()
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize()
      } else {
        window.maximize()
      }
    }
  })

  ipcMain.handle(IPC.WINDOW_CLOSE, () => {
    const window = getMainWindow()
    if (window) {
      window.close()
    }
  })

  ipcMain.handle(IPC.WINDOW_IS_MAXIMIZED, () => {
    const window = getMainWindow()
    return window?.isMaximized() ?? false
  })

  // app:platform and app:version are now handled in ipc/appHandlers.ts
}

/**
 * Sends window state events to renderer when window is maximized/unmaximized.
 * This lets the UI update the maximize button icon.
 */
export function attachWindowStateEvents(window: BrowserWindow): void {
  window.on('maximize', () => {
    window.webContents.send(IPC_EVENTS.WINDOW_MAXIMIZED, true)
  })

  window.on('unmaximize', () => {
    window.webContents.send(IPC_EVENTS.WINDOW_MAXIMIZED, false)
  })
}
