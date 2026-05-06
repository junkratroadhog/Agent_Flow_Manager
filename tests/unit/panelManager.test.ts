import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePanelManager } from '../../src/renderer/src/hooks/usePanelManager'
import { useUIStore } from '../../src/renderer/src/stores/uiStore'

describe('usePanelManager', () => {
  beforeEach(() => {
    // Reset store to defaults
    useUIStore.setState({
      leftSidebarVisible: true,
      leftSidebarWidth: 260,
      rightSidebarVisible: true,
      rightSidebarWidth: 320,
      bottomPanelVisible: false,
      bottomPanelHeight: 200,
      leftSidebarAutoCollapsed: false,
      rightSidebarAutoCollapsed: false
    })
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      value: 1000,
      writable: true,
      configurable: true
    })
    Object.defineProperty(window, 'innerHeight', {
      value: 800,
      writable: true,
      configurable: true
    })
  })

  it('returns initial sizes from store', () => {
    const { result } = renderHook(() => usePanelManager())
    expect(result.current.leftWidth).toBe(260)
    expect(result.current.rightWidth).toBe(320)
  })

  it('auto-collapses right panel when cursor crosses 60% threshold', () => {
    const { result } = renderHook(() => usePanelManager())
    act(() => {
      result.current.startDragLeft()
    })
    // Drag to 70% of viewport
    act(() => {
      result.current.dragLeftTo(700)
    })
    expect(useUIStore.getState().rightSidebarAutoCollapsed).toBe(true)
  })

  it('auto-restores right panel when cursor returns below 50% threshold', () => {
    const { result } = renderHook(() => usePanelManager())
    act(() => {
      result.current.startDragLeft()
      result.current.dragLeftTo(700) // collapse
    })
    expect(useUIStore.getState().rightSidebarAutoCollapsed).toBe(true)
    act(() => {
      result.current.dragLeftTo(400) // back below 50%
    })
    expect(useUIStore.getState().rightSidebarAutoCollapsed).toBe(false)
  })

  it('auto-collapses left panel when right is dragged past 40% threshold', () => {
    const { result } = renderHook(() => usePanelManager())
    act(() => {
      result.current.startDragRight()
      result.current.dragRightTo(300) // 30% from left
    })
    expect(useUIStore.getState().leftSidebarAutoCollapsed).toBe(true)
  })

  it('clamps left width to minimum', () => {
    const { result } = renderHook(() => usePanelManager())
    act(() => {
      result.current.startDragLeft()
      result.current.dragLeftTo(50) // would give negative width
    })
    expect(result.current.leftWidth).toBeGreaterThanOrEqual(180)
  })

  it('clamps right width to minimum', () => {
    const { result } = renderHook(() => usePanelManager())
    act(() => {
      result.current.startDragRight()
      result.current.dragRightTo(990) // would give 10px width
    })
    expect(result.current.rightWidth).toBeGreaterThanOrEqual(220)
  })

  it('commits width to store on drag end', () => {
    const { result } = renderHook(() => usePanelManager())
    act(() => {
      result.current.startDragLeft()
      result.current.dragLeftTo(450)
    })
    // 450 - 48 (activity bar) = 402
    act(() => {
      result.current.endDragLeft()
    })
    expect(useUIStore.getState().leftSidebarWidth).toBe(402)
  })

  it('does not auto-collapse when manually hidden', () => {
    useUIStore.setState({ leftSidebarVisible: false })
    const { result } = renderHook(() => usePanelManager())
    expect(result.current.leftAutoCollapsed).toBe(false)
  })
})
