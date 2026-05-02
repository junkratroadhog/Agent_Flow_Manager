import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../../src/renderer/src/App'

describe('App', () => {
  beforeAll(() => {
    // Mock window.api before App tries to read it
    Object.defineProperty(window, 'api', {
      value: {
        appName: 'Agent Flow Manager',
        appVersion: '0.1.0'
      },
      writable: true
    })
  })

  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText(/Agent Flow Manager/i)).toBeInTheDocument()
  })

  it('displays the chapter 1 status card', () => {
    render(<App />)
    expect(screen.getByText(/Chapter 1 Complete/i)).toBeInTheDocument()
  })

  it('displays the version', () => {
    render(<App />)
    expect(screen.getByText(/0\.1\.0/)).toBeInTheDocument()
  })
})
