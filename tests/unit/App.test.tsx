import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import App from '../../src/renderer/src/App'

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('electron', {
      ipcRenderer: {
        invoke: vi.fn().mockResolvedValue({ ok: true, data: [] }),
        on: vi.fn().mockReturnValue(() => undefined)
      }
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
    vi.stubGlobal('bridge', {
      invoke: vi.fn().mockResolvedValue({ ok: true, data: [] }),
      on: vi.fn().mockReturnValue(() => undefined)
    })
  })

  it('renders without crashing', async () => {
    await act(async () => {
      render(<App />)
    })
    expect(screen.getAllByText(/Agent Flow Manager/i).length).toBeGreaterThan(0)
  })

  it('renders the IPC smoke test by default', async () => {
    await act(async () => {
      render(<App />)
    })
    expect(screen.getByText(/IPC Smoke Test/i)).toBeInTheDocument()
    expect(screen.getByText(/Create Project/i)).toBeInTheDocument()
  })

  it('can switch to component showcase', async () => {
    await act(async () => {
      render(<App />)
    })
    const button = screen.getByText(/Components/i)
    await act(async () => {
      button.click()
    })
    expect(screen.getByText(/Component Showcase/i)).toBeInTheDocument()
  })
})
