import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  appName: 'Agent Flow Manager',
  appVersion: '0.1.0'
}

const windowControls = {
  minimize: (): Promise<void> => ipcRenderer.invoke('window:minimize'),
  maximize: (): Promise<void> => ipcRenderer.invoke('window:maximize'),
  close: (): Promise<void> => ipcRenderer.invoke('window:close'),
  isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:isMaximized'),
  onMaximizedChange: (callback: (isMaximized: boolean) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, isMaximized: boolean): void => {
      callback(isMaximized)
    }
    ipcRenderer.on('window:maximized', handler)
    return () => {
      ipcRenderer.removeListener('window:maximized', handler)
    }
  }
}

const platform = {
  get: (): Promise<string> => ipcRenderer.invoke('app:platform'),
  getVersion: (): Promise<string> => ipcRenderer.invoke('app:version')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('windowControls', windowControls)
    contextBridge.exposeInMainWorld('platform', platform)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error (define in dts)
  window.electron = electronAPI
  // @ts-expect-error (define in dts)
  window.api = api
  // @ts-expect-error (define in dts)
  window.windowControls = windowControls
  // @ts-expect-error (define in dts)
  window.platform = platform
}
