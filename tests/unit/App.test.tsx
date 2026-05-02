import { describe, it, expect, beforeAll, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../../src/renderer/src/App'

describe('App', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'api', {
      value: {
        appName: 'Agent Flow Manager',
        appVersion: '0.1.0'
      },
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
        minimize: vi.fn().mockResolvedValue(undefined),
        maximize: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
        isMaximized: vi.fn().mockResolvedValue(false),
        onMaximizedChange: vi.fn().mockReturnValue(() => undefined)
      },
      writable: true,
      configurable: true
    })
  })

  it('renders without crashing', () => {
    render(<App />)
    const titles = screen.getAllByText(/Agent Flow Manager/i)
    expect(titles.length).toBeGreaterThan(0)
  })

  it('displays the chapter 2 status card', () => {
    render(<App />)
    expect(screen.getByText(/Chapter 2 Complete/i)).toBeInTheDocument()
  })

  it('displays the version', () => {
    render(<App />)
    expect(screen.getByText(/0\.1\.0/)).toBeInTheDocument()
  })

  it('renders the title bar', () => {
    render(<App />)
    expect(screen.getByLabelText(/Minimize/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Close/i)).toBeInTheDocument()
  })
})
