import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  appName: 'Agent Flow Manager',
  appVersion: '0.1.0'
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error (define in dts)
  window.electron = electronAPI
  // @ts-expect-error (define in dts)
  window.api = api
}
