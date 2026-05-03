import { ElectronAPI } from '@electron-toolkit/preload'

export interface WindowControls {
  minimize: () => Promise<void>
  maximize: () => Promise<void>
  close: () => Promise<void>
  isMaximized: () => Promise<boolean>
  onMaximizedChange: (callback: (isMaximized: boolean) => void) => () => void
}

export interface PlatformAPI {
  get: () => Promise<string>
  getVersion: () => Promise<string>
}

export interface Bridge {
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
  on: (channel: string, listener: (...args: unknown[]) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: { appName: string; appVersion: string }
    windowControls: WindowControls
    platform: PlatformAPI
    bridge: Bridge
  }
}
