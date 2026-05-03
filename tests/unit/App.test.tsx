import { describe, it, expect, beforeAll, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../../src/renderer/src/App'

describe('App', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'api', {
      value: { appName: 'Agent Flow Manager', appVersion: '0.1.0' },
      writable: true,
      configurable: true
    })
    Object.defineProperty(window, 'platform', {
      value: {
        get: vi.fn().mockResolvedValue('win32'),
        getVersion: vi.fn().mockResolvedValue('0.1.0')
      },
      writable: true,
      configurable: true
    })
    Object.defineProperty(window, 'windowControls', {
      value: {
        minimize: vi.fn(),
        maximize: vi.fn(),
        close: vi.fn(),
        isMaximized: vi.fn().mockResolvedValue(false),
        onMaximizedChange: vi.fn().mockReturnValue(() => undefined)
      },
      writable: true,
      configurable: true
    })
    Object.defineProperty(window, 'bridge', {
      value: {
        invoke: vi.fn().mockResolvedValue({ ok: true, data: [] }),
        on: vi.fn().mockReturnValue(() => undefined)
      },
      writable: true,
      configurable: true
    })
  })

  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getAllByText(/Agent Flow Manager/i).length).toBeGreaterThan(0)
  })

  it('renders the layout shell', () => {
    render(<App />)
    // Welcome message in MainContent
    expect(screen.getByText(/Welcome to Agent Flow Manager/i)).toBeInTheDocument()
  })

  it('renders activity bar items', () => {
    render(<App />)
    // ActivityBar buttons have aria-labels
    expect(screen.getByLabelText(/Sessions/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Projects/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Tools/i)).toBeInTheDocument()
  })
})
