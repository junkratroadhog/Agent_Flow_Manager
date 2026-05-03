import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createMainWindow, focusMainWindow } from './window'
import { registerWindowHandlers, attachWindowStateEvents } from './ipcHandlers'
import { initDatabase, closeDatabase } from './db'
import { runMigrations } from './db/migrations/runner'
import { createRepositories, type Repositories } from './db/repositories'
import { SecretStorage } from './services/SecretStorage'
import { registerAllIpcHandlers } from './ipc'

let repos: Repositories | null = null

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    focusMainWindow()
  })

  app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.agentflow.manager')

    // Initialize database & repos
    try {
      const db = initDatabase()
      runMigrations(db)
      repos = createRepositories(db)
      const secretStorage = new SecretStorage(db)
      registerAllIpcHandlers(repos, secretStorage)
      console.info('Database and IPC handlers initialized')
    } catch (error) {
      console.error('Failed to initialize:', error)
    }

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
    closeDatabase()
  })
}
