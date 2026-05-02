import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createMainWindow, focusMainWindow } from './window'
import { registerWindowHandlers, attachWindowStateEvents } from './ipcHandlers'

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    focusMainWindow()
  })

  app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.agentflow.manager')

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    registerWindowHandlers()

    const mainWindow = createMainWindow()
    attachWindowStateEvents(mainWindow)

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) {
        const newWindow = createMainWindow()
        attachWindowStateEvents(newWindow)
      }
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('before-quit', () => {
    // Cleanup hook for future chapters (DB close, etc.)
  })
}
