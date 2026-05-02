import { ipcMain, BrowserWindow } from 'electron'

export function registerWindowHandlers(): void {
  ipcMain.handle('window:minimize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window) {
      window.minimize()
    }
  })

  ipcMain.handle('window:maximize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize()
      } else {
        window.maximize()
      }
    }
  })

  ipcMain.handle('window:close', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window) {
      window.close()
    }
  })

  ipcMain.handle('window:isMaximized', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    return window?.isMaximized() ?? false
  })

  ipcMain.handle('app:platform', () => {
    return process.platform
  })

  ipcMain.handle('app:version', () => {
    return process.env['npm_package_version'] || '0.1.0'
  })
}

/**
 * Sends window state events to renderer when window is maximized/unmaximized.
 * This lets the UI update the maximize button icon.
 */
export function attachWindowStateEvents(window: BrowserWindow): void {
  window.on('maximize', () => {
    window.webContents.send('window:maximized', true)
  })

  window.on('unmaximize', () => {
    window.webContents.send('window:maximized', false)
  })
}
