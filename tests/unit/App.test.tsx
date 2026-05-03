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
  })

  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getAllByText(/Agent Flow Manager/i).length).toBeGreaterThan(0)
  })

  it('renders the component showcase', () => {
    render(<App />)
    expect(screen.getByText(/Component Showcase/i)).toBeInTheDocument()
  })

  it('renders all section headers', () => {
    render(<App />)
    expect(screen.getByText(/^Buttons$/)).toBeInTheDocument()
    expect(screen.getByText(/^Inputs$/)).toBeInTheDocument()
    expect(screen.getByText(/^Dialog$/)).toBeInTheDocument()
  })
})
