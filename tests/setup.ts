import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Polyfill ResizeObserver for jsdom
class ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
vi.stubGlobal('ResizeObserver', ResizeObserver)

// Global mocks for Electron environment
vi.stubGlobal('electron', {
  ipcRenderer: {
    invoke: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    on: vi.fn().mockReturnValue(() => undefined)
  }
})

vi.stubGlobal('bridge', {
  invoke: vi.fn().mockResolvedValue({ ok: true, data: [] }),
  on: vi.fn().mockReturnValue(() => undefined)
})

vi.stubGlobal('api', { appName: 'Agent Flow Manager', appVersion: '0.1.0' })
vi.stubGlobal('platform', {
  get: vi.fn().mockResolvedValue('win32'),
  getVersion: vi.fn().mockResolvedValue('0.1.0')
})
vi.stubGlobal('windowControls', {
  minimize: vi.fn(),
  maximize: vi.fn(),
  close: vi.fn(),
  isMaximized: vi.fn().mockResolvedValue(false),
  onMaximizedChange: vi.fn().mockReturnValue(() => undefined)
})

afterEach(() => {
  cleanup()
})
