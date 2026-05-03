import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IPC, IPC_EVENTS } from '../shared/ipc-channels'
import type { IPCResult } from '../shared/ipc-types'

const api = {
  appName: 'Agent Flow Manager',
  appVersion: '0.1.0'
}

const windowControls = {
  minimize: (): Promise<void> => ipcRenderer.invoke(IPC.WINDOW_MINIMIZE),
  maximize: (): Promise<void> => ipcRenderer.invoke(IPC.WINDOW_MAXIMIZE),
  close: (): Promise<void> => ipcRenderer.invoke(IPC.WINDOW_CLOSE),
  isMaximized: (): Promise<boolean> => ipcRenderer.invoke(IPC.WINDOW_IS_MAXIMIZED),
  onMaximizedChange: (callback: (isMaximized: boolean) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, isMaximized: boolean): void => {
      callback(isMaximized)
    }
    ipcRenderer.on(IPC_EVENTS.WINDOW_MAXIMIZED, handler)
    return () => ipcRenderer.removeListener(IPC_EVENTS.WINDOW_MAXIMIZED, handler)
  }
}

const platform = {
  get: (): Promise<string> =>
    ipcRenderer
      .invoke(IPC.APP_PLATFORM)
      .then((r: IPCResult<string>) => (r.ok ? r.data : 'unknown')),
  getVersion: (): Promise<string> =>
    ipcRenderer.invoke(IPC.APP_VERSION).then((r: IPCResult<string>) => (r.ok ? r.data : '0.0.0'))
}

/**
 * Generic IPC bridge. The renderer service layer wraps these.
 */
const bridge = {
  invoke: (channel: string, ...args: unknown[]): Promise<unknown> =>
    ipcRenderer.invoke(channel, ...args),
  on: (channel: string, listener: (...args: unknown[]) => void): (() => void) => {
    const wrapped = (_event: Electron.IpcRendererEvent, ...args: unknown[]): void =>
      listener(...args)
    ipcRenderer.on(channel, wrapped)
    return () => ipcRenderer.removeListener(channel, wrapped)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('windowControls', windowControls)
    contextBridge.exposeInMainWorld('platform', platform)
    contextBridge.exposeInMainWorld('bridge', bridge)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error - exposing to window in non-isolated context
  window.electron = electronAPI
  // @ts-expect-error - exposing to window in non-isolated context
  window.api = api
  // @ts-expect-error - exposing to window in non-isolated context
  window.windowControls = windowControls
  // @ts-expect-error - exposing to window in non-isolated context
  window.platform = platform
  // @ts-expect-error - exposing to window in non-isolated context
  window.bridge = bridge
}
