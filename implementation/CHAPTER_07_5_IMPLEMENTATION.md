# 📘 Chapter 7.5 Implementation Plan: Antigravity-Style Panel System (Replacement)

> **READ THIS FIRST (LLM Instructions):**
>
> You are implementing Chapter 7.5 of the Agent Flow Manager project. This is a SUB-CHAPTER that REPLACES the panel system from Chapter 7 with an Antigravity-style interaction model. Follow this document EXACTLY in order.
>
> **CRITICAL RULES:**
>
> 1. Execute each task in the order given. DO NOT skip ahead.
> 2. After each task, run the verification command. If it fails, STOP and fix before moving on.
> 3. Copy file contents EXACTLY as written. Do not "improve" or modify them.
> 4. If a command fails, read the error carefully. Do not guess solutions.
> 5. Use `npm` only.
> 6. **PREREQUISITE:** Chapter 7 must be complete. This chapter REPLACES the panel system, not adds to it.
> 7. **DO NOT delete files unless this chapter explicitly says to delete them.**
> 8. **DO NOT install or uninstall any packages unless this chapter says to.**

---

## 🎯 Chapter 7.5 Goal

Replace the `react-resizable-panels`-based layout from Chapter 7 with a **custom panel system** that exactly mimics the Antigravity panel interaction model:

- The **left panel** can be dragged from left to right freely
- When dragged past a threshold (around 60% of screen width), the **right panel automatically collapses** with a smooth animation
- When the left panel is dragged back to the left (past another threshold), the right panel **automatically reappears** with the same smooth animation
- The left panel can be dragged all the way to the right edge, taking over nearly the entire screen
- Same behavior in reverse for the right panel
- All transitions are smooth (200ms ease-out)
- All sizes persist across app launches via `useUIStore`
- The bottom panel (toggle with Ctrl+J) continues to work as before

## 📋 What Will Exist When This Chapter Is Done

- A new `PanelManager` system in `src/renderer/src/components/Layout/`
- Custom drag handles using pointer events (not third-party library)
- Pixel-based widths (not percentages) for precise control
- Smooth CSS transitions for collapse/expand animations
- The right panel auto-collapses when left panel is dragged past 60% of viewport width
- The right panel auto-restores when left panel is dragged back below 50% of viewport width
- The same logic in reverse for dragging the right panel
- All resize state persists in `useUIStore`
- Old `react-resizable-panels`-based `AppShell` is replaced (file kept but content overwritten)

---

# 📦 SECTION 1: Pre-flight Checks

## Task 1.1: Verify Chapter 7 Is Complete

**Command to run:**

```bash
npm run typecheck && npm run test:run
```

**Expected:** All checks pass.

**If errors occur:** STOP. Fix Chapter 7 issues first.

## Task 1.2: Verify Current App Launches

**Command:**

```bash
npm run dev
```

**Expected:** App opens with the Chapter 7 layout (activity bar + left sidebar + main content + right sidebar + status bar).

**Action:** Try dragging the divider between left sidebar and main content. Confirm that you can NOT drag it past about 40% of the width — this is the bug we're fixing. Close the window. Proceed.

---

# 📦 SECTION 2: Update UI Store with New Panel State

The new panel system needs explicit pixel widths and "collapsed" flags for animation.

## Task 2.1: Update the UI Store

**File path:** `src/renderer/src/stores/uiStore.ts`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SidebarView = 'sessions' | 'projects' | 'tools' | 'marketplace' | 'settings' | null

export interface UIState {
  // Sidebar visibility (manual toggle from activity bar / Ctrl+B)
  leftSidebarVisible: boolean
  leftSidebarView: SidebarView
  leftSidebarWidth: number

  // Right sidebar
  rightSidebarVisible: boolean
  rightSidebarWidth: number

  // Auto-collapsed state (driven by panel drag behavior, NOT manual toggle).
  // When true, the panel slides off-screen but visibility flag is unchanged.
  rightSidebarAutoCollapsed: boolean
  leftSidebarAutoCollapsed: boolean

  // Bottom panel
  bottomPanelVisible: boolean
  bottomPanelHeight: number

  // Theme
  theme: 'dark' | 'light'

  // Active tab
  activeTabId: string | null

  // Modals
  isProjectWizardOpen: boolean
  isSettingsOpen: boolean

  // Manual toggle actions
  toggleLeftSidebar: () => void
  setLeftSidebarView: (view: SidebarView) => void
  setLeftSidebarWidth: (width: number) => void
  toggleRightSidebar: () => void
  setRightSidebarWidth: (width: number) => void
  toggleBottomPanel: () => void
  setBottomPanelHeight: (height: number) => void

  // Auto-collapse actions (for the new panel system)
  setRightSidebarAutoCollapsed: (collapsed: boolean) => void
  setLeftSidebarAutoCollapsed: (collapsed: boolean) => void

  // Misc
  setTheme: (theme: 'dark' | 'light') => void
  setActiveTabId: (id: string | null) => void
  setProjectWizardOpen: (open: boolean) => void
  setSettingsOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      leftSidebarVisible: true,
      leftSidebarView: 'sessions',
      leftSidebarWidth: 260,
      rightSidebarVisible: true,
      rightSidebarWidth: 320,
      rightSidebarAutoCollapsed: false,
      leftSidebarAutoCollapsed: false,
      bottomPanelVisible: false,
      bottomPanelHeight: 200,
      theme: 'dark',
      activeTabId: null,
      isProjectWizardOpen: false,
      isSettingsOpen: false,

      toggleLeftSidebar: (): void => set((s) => ({ leftSidebarVisible: !s.leftSidebarVisible })),
      setLeftSidebarView: (view): void => set({ leftSidebarView: view }),
      setLeftSidebarWidth: (width): void => set({ leftSidebarWidth: width }),
      toggleRightSidebar: (): void => set((s) => ({ rightSidebarVisible: !s.rightSidebarVisible })),
      setRightSidebarWidth: (width): void => set({ rightSidebarWidth: width }),
      toggleBottomPanel: (): void => set((s) => ({ bottomPanelVisible: !s.bottomPanelVisible })),
      setBottomPanelHeight: (height): void => set({ bottomPanelHeight: height }),
      setRightSidebarAutoCollapsed: (collapsed): void =>
        set({ rightSidebarAutoCollapsed: collapsed }),
      setLeftSidebarAutoCollapsed: (collapsed): void =>
        set({ leftSidebarAutoCollapsed: collapsed }),
      setTheme: (theme): void => set({ theme }),
      setActiveTabId: (id): void => set({ activeTabId: id }),
      setProjectWizardOpen: (open): void => set({ isProjectWizardOpen: open }),
      setSettingsOpen: (open): void => set({ isSettingsOpen: open })
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({
        leftSidebarVisible: state.leftSidebarVisible,
        leftSidebarView: state.leftSidebarView,
        leftSidebarWidth: state.leftSidebarWidth,
        rightSidebarVisible: state.rightSidebarVisible,
        rightSidebarWidth: state.rightSidebarWidth,
        bottomPanelVisible: state.bottomPanelVisible,
        bottomPanelHeight: state.bottomPanelHeight,
        theme: state.theme
        // Note: rightSidebarAutoCollapsed and leftSidebarAutoCollapsed are NOT persisted.
        // They reset to false on each app launch.
      })
    }
  )
)
```

---

# 📦 SECTION 3: Panel Constants

Define the magic numbers that control panel behavior. Keeping them in one file makes future tuning easy.

## Task 3.1: Create Panel Constants File

**File path:** `src/renderer/src/components/Layout/panelConstants.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
/**
 * Panel sizing constants for the Antigravity-style panel system.
 * All values are in pixels unless otherwise noted.
 */

// Activity bar (always visible, never resizes)
export const ACTIVITY_BAR_WIDTH = 48

// Left sidebar
export const LEFT_SIDEBAR_MIN_WIDTH = 180
export const LEFT_SIDEBAR_DEFAULT_WIDTH = 260
export const LEFT_SIDEBAR_MAX_WIDTH_PADDING = 200
// Max = window.innerWidth - LEFT_SIDEBAR_MAX_WIDTH_PADDING (computed at runtime)

// Right sidebar
export const RIGHT_SIDEBAR_MIN_WIDTH = 220
export const RIGHT_SIDEBAR_DEFAULT_WIDTH = 320
export const RIGHT_SIDEBAR_MAX_WIDTH_PADDING = 200

// Auto-collapse thresholds (as ratio of window.innerWidth)
// When the LEFT sidebar's right edge crosses this fraction of window width,
// the RIGHT sidebar auto-collapses.
export const LEFT_PANEL_COLLAPSE_RIGHT_THRESHOLD = 0.6
// When the LEFT sidebar's right edge falls back below this fraction,
// the RIGHT sidebar auto-restores.
export const LEFT_PANEL_RESTORE_RIGHT_THRESHOLD = 0.5

// When the RIGHT sidebar's left edge crosses BELOW this fraction,
// the LEFT sidebar auto-collapses.
export const RIGHT_PANEL_COLLAPSE_LEFT_THRESHOLD = 0.4
// When it returns above this fraction, the LEFT sidebar auto-restores.
export const RIGHT_PANEL_RESTORE_LEFT_THRESHOLD = 0.5

// Bottom panel
export const BOTTOM_PANEL_MIN_HEIGHT = 100
export const BOTTOM_PANEL_DEFAULT_HEIGHT = 200
export const BOTTOM_PANEL_MAX_HEIGHT_PADDING = 200

// Drag resize handle
export const RESIZE_HANDLE_WIDTH = 4 // visual width
export const RESIZE_HANDLE_HIT_AREA = 8 // invisible hit area

// Animation
export const PANEL_TRANSITION_MS = 200

// During an active drag, transitions are disabled to allow the panel to track
// the cursor exactly (no animation lag).
export const DRAG_TRANSITION_NONE = 'none'
export const PANEL_TRANSITION = `width ${PANEL_TRANSITION_MS}ms ease-out, transform ${PANEL_TRANSITION_MS}ms ease-out, opacity ${PANEL_TRANSITION_MS}ms ease-out`
```

---

# 📦 SECTION 4: Resize Handle Component

A custom drag handle that emits delta-x events as the user drags.

## Task 4.1: Create Resize Handle

**File path:** `src/renderer/src/components/Layout/ResizeHandle.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/utils'
import {
  RESIZE_HANDLE_HIT_AREA,
  RESIZE_HANDLE_WIDTH
} from './panelConstants'

export type ResizeOrientation = 'vertical' | 'horizontal'

export interface ResizeHandleProps {
  /** vertical = handle is a vertical line (drag horizontally) for left/right panels */
  /** horizontal = handle is a horizontal line (drag vertically) for top/bottom panels */
  orientation: ResizeOrientation
  /** Called continuously during drag with the cursor's clientX (vertical) or clientY (horizontal). */
  onDrag: (clientCoord: number) => void
  /** Called when drag starts. */
  onDragStart?: () => void
  /** Called when drag ends. */
  onDragEnd?: () => void
  className?: string
}

export default function ResizeHandle({
  orientation,
  onDrag,
  onDragStart,
  onDragEnd,
  className
}: ResizeHandleProps): JSX.Element {
  const [isDragging, setIsDragging] = useState(false)
  const isDraggingRef = useRef(false)

  useEffect(() => {
    if (!isDragging) return

    const handleMove = (e: PointerEvent): void => {
      if (!isDraggingRef.current) return
      e.preventDefault()
      onDrag(orientation === 'vertical' ? e.clientX : e.clientY)
    }

    const handleUp = (): void => {
      isDraggingRef.current = false
      setIsDragging(false)
      onDragEnd?.()
    }

    document.addEventListener('pointermove', handleMove)
    document.addEventListener('pointerup', handleUp)
    document.addEventListener('pointercancel', handleUp)
    document.body.style.cursor =
      orientation === 'vertical' ? 'col-resize' : 'row-resize'
    document.body.style.userSelect = 'none'

    return () => {
      document.removeEventListener('pointermove', handleMove)
      document.removeEventListener('pointerup', handleUp)
      document.removeEventListener('pointercancel', handleUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, onDrag, onDragEnd, orientation])

  const handleDown = (e: React.PointerEvent): void => {
    e.preventDefault()
    isDraggingRef.current = true
    setIsDragging(true)
    onDragStart?.()
  }

  const isVertical = orientation === 'vertical'

  return (
    <div
      onPointerDown={handleDown}
      role="separator"
      aria-orientation={isVertical ? 'vertical' : 'horizontal'}
      className={cn(
        'group relative flex items-center justify-center select-none z-30',
        isVertical
          ? 'cursor-col-resize h-full'
          : 'cursor-row-resize w-full',
        className
      )}
      style={{
        width: isVertical ? RESIZE_HANDLE_HIT_AREA : '100%',
        height: isVertical ? '100%' : RESIZE_HANDLE_HIT_AREA,
        // Negative margin so the hit area overlaps neighbors without affecting layout
        marginLeft: isVertical ? -RESIZE_HANDLE_HIT_AREA / 2 : undefined,
        marginRight: isVertical ? -RESIZE_HANDLE_HIT_AREA / 2 : undefined,
        marginTop: !isVertical ? -RESIZE_HANDLE_HIT_AREA / 2 : undefined,
        marginBottom: !isVertical ? -RESIZE_HANDLE_HIT_AREA / 2 : undefined
      }}
    >
      <div
        className={cn(
          'transition-colors',
          isVertical ? 'h-full' : 'w-full',
          isDragging
            ? 'bg-accent'
            : 'bg-transparent group-hover:bg-accent/50'
        )}
        style={{
          width: isVertical ? RESIZE_HANDLE_WIDTH : '100%',
          height: isVertical ? '100%' : RESIZE_HANDLE_WIDTH
        }}
      />
    </div>
  )
}
```

---

# 📦 SECTION 5: Panel Manager Hook

This is the brain of the new system. It owns the auto-collapse logic.

## Task 5.1: Create Panel Manager Hook

**File path:** `src/renderer/src/hooks/usePanelManager.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useCallback, useEffect, useRef, useState } from 'react'
import { useUIStore } from '../stores/uiStore'
import {
  ACTIVITY_BAR_WIDTH,
  LEFT_PANEL_COLLAPSE_RIGHT_THRESHOLD,
  LEFT_PANEL_RESTORE_RIGHT_THRESHOLD,
  LEFT_SIDEBAR_MAX_WIDTH_PADDING,
  LEFT_SIDEBAR_MIN_WIDTH,
  RIGHT_PANEL_COLLAPSE_LEFT_THRESHOLD,
  RIGHT_PANEL_RESTORE_LEFT_THRESHOLD,
  RIGHT_SIDEBAR_MAX_WIDTH_PADDING,
  RIGHT_SIDEBAR_MIN_WIDTH
} from '../components/Layout/panelConstants'

export interface PanelManager {
  // Live values (in px)
  leftWidth: number
  rightWidth: number
  bottomHeight: number

  // Visibility (manual toggle)
  leftVisible: boolean
  rightVisible: boolean
  bottomVisible: boolean

  // Auto-collapsed flags (driven by drag, separate from manual visibility)
  leftAutoCollapsed: boolean
  rightAutoCollapsed: boolean

  // Drag state
  isDraggingLeft: boolean
  isDraggingRight: boolean
  isDraggingBottom: boolean

  // Drag handlers
  startDragLeft: () => void
  endDragLeft: () => void
  dragLeftTo: (clientX: number) => void

  startDragRight: () => void
  endDragRight: () => void
  dragRightTo: (clientX: number) => void

  startDragBottom: () => void
  endDragBottom: () => void
  dragBottomTo: (clientY: number) => void
}

export function usePanelManager(): PanelManager {
  const {
    leftSidebarWidth,
    rightSidebarWidth,
    bottomPanelHeight,
    leftSidebarVisible,
    rightSidebarVisible,
    bottomPanelVisible,
    leftSidebarAutoCollapsed,
    rightSidebarAutoCollapsed,
    setLeftSidebarWidth,
    setRightSidebarWidth,
    setBottomPanelHeight,
    setLeftSidebarAutoCollapsed,
    setRightSidebarAutoCollapsed
  } = useUIStore()

  const [isDraggingLeft, setIsDraggingLeft] = useState(false)
  const [isDraggingRight, setIsDraggingRight] = useState(false)
  const [isDraggingBottom, setIsDraggingBottom] = useState(false)

  // Use a ref for the live width during drag so we don't trigger a re-render
  // on every pointermove. We commit to the store on drag end.
  const liveLeftWidthRef = useRef(leftSidebarWidth)
  const liveRightWidthRef = useRef(rightSidebarWidth)
  const liveBottomHeightRef = useRef(bottomPanelHeight)

  // But we DO need to re-render during drag for visual updates, so we use
  // a separate state that's updated less frequently (via rAF).
  const [, forceTick] = useState(0)
  const tick = useCallback(() => forceTick((n) => (n + 1) % 1_000_000), [])

  // Sync ref ↔ store when not dragging
  useEffect(() => {
    if (!isDraggingLeft) liveLeftWidthRef.current = leftSidebarWidth
  }, [leftSidebarWidth, isDraggingLeft])

  useEffect(() => {
    if (!isDraggingRight) liveRightWidthRef.current = rightSidebarWidth
  }, [rightSidebarWidth, isDraggingRight])

  useEffect(() => {
    if (!isDraggingBottom) liveBottomHeightRef.current = bottomPanelHeight
  }, [bottomPanelHeight, isDraggingBottom])

  // ===== LEFT PANEL =====

  const startDragLeft = useCallback(() => {
    setIsDraggingLeft(true)
  }, [])

  const endDragLeft = useCallback(() => {
    setIsDraggingLeft(false)
    // Commit live width to store
    setLeftSidebarWidth(liveLeftWidthRef.current)
  }, [setLeftSidebarWidth])

  const dragLeftTo = useCallback(
    (clientX: number) => {
      if (typeof window === 'undefined') return
      const winW = window.innerWidth
      // The left sidebar starts after the activity bar (48px)
      const desiredWidth = clientX - ACTIVITY_BAR_WIDTH
      const maxWidth = winW - LEFT_SIDEBAR_MAX_WIDTH_PADDING
      const clamped = Math.max(LEFT_SIDEBAR_MIN_WIDTH, Math.min(maxWidth, desiredWidth))
      liveLeftWidthRef.current = clamped

      // Auto-collapse / restore the RIGHT panel based on where the cursor is
      // relative to the window (not the panel). We use the cursor's clientX
      // as ratio so the user feels they're "pushing" the right panel off-screen.
      const cursorRatio = clientX / winW
      if (cursorRatio >= LEFT_PANEL_COLLAPSE_RIGHT_THRESHOLD) {
        if (!rightSidebarAutoCollapsed) setRightSidebarAutoCollapsed(true)
      } else if (cursorRatio < LEFT_PANEL_RESTORE_RIGHT_THRESHOLD) {
        if (rightSidebarAutoCollapsed) setRightSidebarAutoCollapsed(false)
      }

      tick()
    },
    [rightSidebarAutoCollapsed, setRightSidebarAutoCollapsed, tick]
  )

  // ===== RIGHT PANEL =====

  const startDragRight = useCallback(() => {
    setIsDraggingRight(true)
  }, [])

  const endDragRight = useCallback(() => {
    setIsDraggingRight(false)
    setRightSidebarWidth(liveRightWidthRef.current)
  }, [setRightSidebarWidth])

  const dragRightTo = useCallback(
    (clientX: number) => {
      if (typeof window === 'undefined') return
      const winW = window.innerWidth
      // Right panel width = distance from the right edge of viewport
      const desiredWidth = winW - clientX
      const maxWidth = winW - RIGHT_SIDEBAR_MAX_WIDTH_PADDING
      const clamped = Math.max(RIGHT_SIDEBAR_MIN_WIDTH, Math.min(maxWidth, desiredWidth))
      liveRightWidthRef.current = clamped

      // Auto-collapse / restore the LEFT panel based on cursor ratio
      const cursorRatio = clientX / winW
      if (cursorRatio <= RIGHT_PANEL_COLLAPSE_LEFT_THRESHOLD) {
        if (!leftSidebarAutoCollapsed) setLeftSidebarAutoCollapsed(true)
      } else if (cursorRatio > RIGHT_PANEL_RESTORE_LEFT_THRESHOLD) {
        if (leftSidebarAutoCollapsed) setLeftSidebarAutoCollapsed(false)
      }

      tick()
    },
    [leftSidebarAutoCollapsed, setLeftSidebarAutoCollapsed, tick]
  )

  // ===== BOTTOM PANEL =====

  const startDragBottom = useCallback(() => {
    setIsDraggingBottom(true)
  }, [])

  const endDragBottom = useCallback(() => {
    setIsDraggingBottom(false)
    setBottomPanelHeight(liveBottomHeightRef.current)
  }, [setBottomPanelHeight])

  const dragBottomTo = useCallback(
    (clientY: number) => {
      if (typeof window === 'undefined') return
      const winH = window.innerHeight
      const desiredHeight = winH - clientY
      const minH = 100
      const maxH = winH - 200
      const clamped = Math.max(minH, Math.min(maxH, desiredHeight))
      liveBottomHeightRef.current = clamped
      tick()
    },
    [tick]
  )

  // Reset auto-collapsed flags if user manually toggles a panel
  useEffect(() => {
    if (!leftSidebarVisible && leftSidebarAutoCollapsed) {
      setLeftSidebarAutoCollapsed(false)
    }
  }, [leftSidebarVisible, leftSidebarAutoCollapsed, setLeftSidebarAutoCollapsed])

  useEffect(() => {
    if (!rightSidebarVisible && rightSidebarAutoCollapsed) {
      setRightSidebarAutoCollapsed(false)
    }
  }, [rightSidebarVisible, rightSidebarAutoCollapsed, setRightSidebarAutoCollapsed])

  return {
    leftWidth: isDraggingLeft ? liveLeftWidthRef.current : leftSidebarWidth,
    rightWidth: isDraggingRight ? liveRightWidthRef.current : rightSidebarWidth,
    bottomHeight: isDraggingBottom ? liveBottomHeightRef.current : bottomPanelHeight,
    leftVisible: leftSidebarVisible,
    rightVisible: rightSidebarVisible,
    bottomVisible: bottomPanelVisible,
    leftAutoCollapsed: leftSidebarAutoCollapsed,
    rightAutoCollapsed: rightSidebarAutoCollapsed,
    isDraggingLeft,
    isDraggingRight,
    isDraggingBottom,
    startDragLeft,
    endDragLeft,
    dragLeftTo,
    startDragRight,
    endDragRight,
    dragRightTo,
    startDragBottom,
    endDragBottom,
    dragBottomTo
  }
}
```

---

# 📦 SECTION 6: New AppShell — Antigravity Style

This is the heart of the chapter. It uses absolute positioning and CSS transforms instead of `react-resizable-panels`.

## Task 6.1: Replace AppShell

**File path:** `src/renderer/src/components/Layout/AppShell.tsx`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import { useEffect } from 'react'
import { TooltipProvider } from '../ui/Tooltip'
import { useUIStore } from '../../stores/uiStore'
import { usePanelManager } from '../../hooks/usePanelManager'
import {
  ACTIVITY_BAR_WIDTH,
  DRAG_TRANSITION_NONE,
  PANEL_TRANSITION
} from './panelConstants'
import ActivityBar from './ActivityBar'
import LeftSidebar from './LeftSidebar'
import MainContent from './MainContent'
import RightSidebar from './RightSidebar'
import BottomPanel from './BottomPanel'
import StatusBar from './StatusBar'
import ResizeHandle from './ResizeHandle'

export default function AppShell(): JSX.Element {
  const toggleLeftSidebar = useUIStore((s) => s.toggleLeftSidebar)
  const toggleBottomPanel = useUIStore((s) => s.toggleBottomPanel)

  const pm = usePanelManager()

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        toggleLeftSidebar()
      } else if (ctrl && e.key.toLowerCase() === 'j') {
        e.preventDefault()
        toggleBottomPanel()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleLeftSidebar, toggleBottomPanel])

  // Compute effective widths (collapsed = 0)
  const effectiveLeftWidth =
    pm.leftVisible && !pm.leftAutoCollapsed ? pm.leftWidth : 0
  const effectiveRightWidth =
    pm.rightVisible && !pm.rightAutoCollapsed ? pm.rightWidth : 0
  const effectiveBottomHeight = pm.bottomVisible ? pm.bottomHeight : 0

  // While dragging, disable transitions on the directly-dragged panel so it
  // tracks the cursor exactly. The OPPOSITE panel still animates when it
  // auto-collapses/restores.
  const leftTransition = pm.isDraggingLeft ? DRAG_TRANSITION_NONE : PANEL_TRANSITION
  const rightTransition = pm.isDraggingRight ? DRAG_TRANSITION_NONE : PANEL_TRANSITION
  const bottomTransition = pm.isDraggingBottom ? DRAG_TRANSITION_NONE : PANEL_TRANSITION

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Top region: contains activity bar + the panel grid */}
        <div className="relative flex-1 flex overflow-hidden">
          {/* Activity bar (fixed-width column) */}
          <ActivityBar />

          {/* Panel area: positioned absolutely so we have full control */}
          <div className="relative flex-1 overflow-hidden">
            {/* Left Sidebar */}
            <div
              className="absolute top-0 left-0 h-full overflow-hidden"
              style={{
                width: `${effectiveLeftWidth}px`,
                transition: leftTransition,
                zIndex: 20
              }}
              aria-hidden={effectiveLeftWidth === 0}
            >
              {/* Inner content uses fixed width = pm.leftWidth so resizing the
                  outer container doesn't squish content. */}
              <div
                className="h-full"
                style={{
                  width: `${pm.leftWidth}px`,
                  transition: leftTransition
                }}
              >
                <LeftSidebar />
              </div>
            </div>

            {/* Resize handle for left sidebar (only when visible) */}
            {effectiveLeftWidth > 0 && (
              <div
                className="absolute top-0 h-full"
                style={{
                  left: `${effectiveLeftWidth}px`,
                  transition: leftTransition,
                  zIndex: 25
                }}
              >
                <ResizeHandle
                  orientation="vertical"
                  onDragStart={pm.startDragLeft}
                  onDragEnd={pm.endDragLeft}
                  onDrag={pm.dragLeftTo}
                />
              </div>
            )}

            {/* Main content + bottom panel column */}
            <div
              className="absolute top-0 h-full flex flex-col"
              style={{
                left: `${effectiveLeftWidth}px`,
                right: `${effectiveRightWidth}px`,
                transition: pm.isDraggingLeft || pm.isDraggingRight
                  ? DRAG_TRANSITION_NONE
                  : PANEL_TRANSITION,
                zIndex: 10
              }}
            >
              {/* Main content area */}
              <div
                className="flex-1 overflow-hidden flex flex-col min-h-0"
                style={{
                  transition: bottomTransition
                }}
              >
                <MainContent />
              </div>

              {/* Bottom panel resize handle */}
              {pm.bottomVisible && (
                <ResizeHandle
                  orientation="horizontal"
                  onDragStart={pm.startDragBottom}
                  onDragEnd={pm.endDragBottom}
                  onDrag={pm.dragBottomTo}
                />
              )}

              {/* Bottom panel */}
              <div
                className="overflow-hidden"
                style={{
                  height: `${effectiveBottomHeight}px`,
                  transition: bottomTransition
                }}
                aria-hidden={!pm.bottomVisible}
              >
                <div
                  style={{
                    height: `${pm.bottomHeight}px`,
                    transition: bottomTransition
                  }}
                >
                  <BottomPanel />
                </div>
              </div>
            </div>

            {/* Resize handle for right sidebar (only when visible) */}
            {effectiveRightWidth > 0 && (
              <div
                className="absolute top-0 h-full"
                style={{
                  right: `${effectiveRightWidth}px`,
                  transition: rightTransition,
                  zIndex: 25
                }}
              >
                <ResizeHandle
                  orientation="vertical"
                  onDragStart={pm.startDragRight}
                  onDragEnd={pm.endDragRight}
                  onDrag={pm.dragRightTo}
                />
              </div>
            )}

            {/* Right Sidebar */}
            <div
              className="absolute top-0 right-0 h-full overflow-hidden"
              style={{
                width: `${effectiveRightWidth}px`,
                transition: rightTransition,
                zIndex: 20
              }}
              aria-hidden={effectiveRightWidth === 0}
            >
              <div
                className="h-full"
                style={{
                  width: `${pm.rightWidth}px`,
                  transition: rightTransition,
                  // Anchor to right side so collapse animates as a slide-out
                  marginLeft: `${pm.rightWidth - effectiveRightWidth}px`
                }}
              >
                <RightSidebar />
              </div>
            </div>
          </div>
        </div>

        {/* Status bar (always full width, ignores activity bar offset) */}
        <StatusBar />
      </div>
    </TooltipProvider>
  )
}

// Re-export the activity bar width so child components can know about it.
export { ACTIVITY_BAR_WIDTH }
```

---

# 📦 SECTION 7: Tests

The panel manager has logic worth testing — auto-collapse thresholds.

## Task 7.1: Create Panel Manager Tests

**File path:** `tests/unit/panelManager.test.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
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
```

---

# 📦 SECTION 8: Verification

## Task 8.1: Type Check

**Command:**

```bash
npm run typecheck
```

**Expected:** Exit code 0.

**If errors occur:** Open the error output and verify the file matching the error matches exactly what this plan says.

## Task 8.2: Lint

**Command:**

```bash
npm run lint
```

**Expected:** Exit code 0.

## Task 8.3: Format

**Command:**

```bash
npm run format
```

## Task 8.4: Tests

**Command:**

```bash
npm run test:run
```

**Expected:** All tests pass (previous tests + new panel manager tests).

## Task 8.5: Build

**Command:**

```bash
npm run build
```

**Expected:** Exit code 0.

---

# 📦 SECTION 9: Visual Verification

This is the MOST IMPORTANT part of this chapter. Verify the panel interaction matches Antigravity exactly.

## Task 9.1: Launch Dev Mode

**Command:**

```bash
npm run dev
```

**🛑 USER VERIFICATION REQUIRED — TEST EACH ITEM:**

### Basic Layout (no drag)

- [ ] App launches with activity bar (left edge), left sidebar (260px), main content, right sidebar (320px), status bar (bottom)
- [ ] No layout shift on launch

### Left Panel — Drag Right

- [ ] Hover the divider between the left sidebar and main content → cursor changes to col-resize, divider highlights blue/accent on hover
- [ ] Click and drag the divider slowly to the right → left sidebar widens smoothly, tracking the cursor exactly (no lag)
- [ ] Continue dragging until the cursor passes ~60% of window width → **right sidebar smoothly slides off-screen** (200ms animation)
- [ ] Continue dragging further to the right → left sidebar continues to widen, the right sidebar stays collapsed
- [ ] Drag almost all the way to the right edge → left sidebar takes nearly the full screen
- [ ] **Release the mouse** → left sidebar stays at the dragged width

### Left Panel — Drag Back Left

- [ ] Click and drag the divider back to the left
- [ ] Once the cursor crosses below 50% of window width → **right sidebar smoothly slides back in** (200ms animation)
- [ ] Continue dragging back to the original size → all three panels visible again
- [ ] Release → state persists

### Right Panel — Drag Left

- [ ] Hover the divider between main content and right sidebar → cursor changes
- [ ] Drag the divider to the LEFT → right sidebar widens, main content shrinks
- [ ] Once the cursor crosses below 40% of window width → **left sidebar smoothly slides off-screen**
- [ ] Continue dragging → right sidebar takes most of the screen
- [ ] Drag back to the right → left sidebar reappears past 50% threshold

### Restart Persistence

- [ ] Drag panels to non-default sizes
- [ ] Close the app completely (not just minimize)
- [ ] Relaunch → panels open at the dragged sizes
- [ ] Auto-collapsed state is NOT remembered (always starts uncollapsed) — by design

### Manual Toggles Still Work

- [ ] Press **Ctrl+B** → left sidebar disappears completely (this is the manual toggle, different from auto-collapse)
- [ ] Press **Ctrl+B** again → it reappears
- [ ] Click the same activity bar icon twice → left sidebar toggles
- [ ] Click a DIFFERENT activity bar icon → sidebar stays visible, view changes
- [ ] Press **Ctrl+J** → bottom panel slides up smoothly
- [ ] Drag the divider above the bottom panel → bottom panel resizes
- [ ] Press **Ctrl+J** again → bottom panel slides back down smoothly

### Animation Quality

- [ ] All collapse/expand animations are smooth (200ms, no jank)
- [ ] During an active drag, the panel being dragged tracks the cursor with no lag (no animation)
- [ ] The OTHER panel (the one auto-collapsing) DOES animate smoothly even though the dragged one doesn't
- [ ] No flicker at the threshold boundary
- [ ] Resize handles are very thin (~4px) but easy to grab (hit area is 8px)

### Edge Cases

- [ ] Try to drag the left panel below its minimum width → it stops at 180px
- [ ] Try to drag the right panel below its minimum width → it stops at 220px
- [ ] Try to drag past the opposite edge (e.g., left panel past the right edge) → it stops with at least 200px reserved for the other side
- [ ] Resize the entire app window → panel widths stay (in pixels), main content adjusts

**Stop the app after verification.**

---

# 📦 SECTION 10: Git Commit

## Task 10.1: Stage and Commit

**Commands:**

```bash
git add .
git commit -m "feat: Antigravity-style panel system with auto-collapse (Chapter 7.5)"
```

---

# 🏁 FINAL VERIFICATION CHECKLIST

## ✅ Check 1: New files exist

```bash
ls src/renderer/src/components/Layout/panelConstants.ts src/renderer/src/components/Layout/ResizeHandle.tsx src/renderer/src/hooks/usePanelManager.ts
```

## ✅ Check 2: AppShell updated (no longer imports react-resizable-panels)

```bash
grep "react-resizable-panels" src/renderer/src/components/Layout/AppShell.tsx
```

**Expected:** No output (zero matches).

## ✅ Check 3: UI store has new auto-collapsed flags

```bash
grep "AutoCollapsed" src/renderer/src/stores/uiStore.ts
```

**Expected:** Multiple matches.

## ✅ Check 4: TypeScript compiles

```bash
npm run typecheck
```

## ✅ Check 5: Lint passes

```bash
npm run lint
```

## ✅ Check 6: Tests pass

```bash
npm run test:run
```

## ✅ Check 7: Build works

```bash
npm run build
```

## ✅ Check 8: Visual verification complete (user confirmed all items above)

## ✅ Check 9: Git commit

```bash
git log --oneline | head -5
```

**Expected:** "feat: Antigravity-style panel system with auto-collapse (Chapter 7.5)" at top.

## ✅ Check 10: Old behavior is gone

The left panel can now be dragged across more than 60% of the screen, which was impossible before this chapter.

---

# 📊 Chapter 7.5 Completion Report

```
✅ Chapter 7.5: Antigravity-Style Panel System - COMPLETE

Acceptance Criteria Met:
✅ Left panel can be dragged from left to far right of screen
✅ Right panel auto-collapses when left panel passes 60% threshold
✅ Right panel auto-restores when left panel returns below 50% threshold
✅ Same logic in reverse for right panel
✅ Smooth 200ms animations on collapse/expand
✅ No animation during active drag (cursor-perfect tracking)
✅ Pixel-precise widths persist across launches
✅ Auto-collapsed flags reset on launch (not persisted)
✅ Manual toggles (Ctrl+B, activity bar clicks) still work
✅ Bottom panel still works with Ctrl+J
✅ react-resizable-panels removed from AppShell
✅ Tests passing
✅ Production build works

Deliverables Created:
- src/renderer/src/components/Layout/panelConstants.ts (NEW)
- src/renderer/src/components/Layout/ResizeHandle.tsx (NEW)
- src/renderer/src/hooks/usePanelManager.ts (NEW)
- src/renderer/src/components/Layout/AppShell.tsx (REWRITTEN)
- src/renderer/src/stores/uiStore.ts (UPDATED)

Ready to continue with Chapter 8 and beyond. The panel system is now permanent.
```

---

# 🚨 Troubleshooting

## "Left panel doesn't track cursor when dragging"

- Open DevTools → check that `pointermove` events fire on the document
- Verify `liveLeftWidthRef.current` is being updated in `dragLeftTo`
- Make sure the panel's outer `<div>` has `transition: none` during drag (check via Elements inspector)

## "Right panel doesn't auto-collapse"

- Verify the cursor X position is past 60% of window width when threshold hits
- Check `useUIStore.getState().rightSidebarAutoCollapsed` in DevTools console — should be `true` when collapsed
- Inspect the right panel's computed `width` style — should be `0px` when collapsed

## "Animation is jerky"

- The transition is `width` and `transform` only. If you see jank, your monitor refresh rate may be the bottleneck.
- Try lowering `PANEL_TRANSITION_MS` to 150 in `panelConstants.ts`.

## "Resize handle is hard to grab"

- The hit area is 8px wide; the visible handle is 4px. Increase `RESIZE_HANDLE_HIT_AREA` in `panelConstants.ts` if needed.

## "Right panel disappears when I drag the left and never comes back"

- Verify `LEFT_PANEL_RESTORE_RIGHT_THRESHOLD` is LESS than `LEFT_PANEL_COLLAPSE_RIGHT_THRESHOLD` (this hysteresis prevents flickering)
- Check that `setRightSidebarAutoCollapsed(false)` is being called when the cursor goes back below 50%

## "Layout breaks when window is resized very small"

- The minimum widths (180 + 220 + activity bar 48 + min main 200) require at least ~650px width
- Below that, panels overlap. Acceptable for now; will be polished later.

## "I want different threshold values"

Edit the constants in `src/renderer/src/components/Layout/panelConstants.ts`. Keep `RESTORE` < `COLLAPSE` to avoid flicker.

## "Can I uninstall react-resizable-panels now?"

**No.** It's still used by the `Resizable` UI primitive component (in `src/renderer/src/components/ui/Resizable.tsx`) which is exposed in the design system showcase. Keep it installed.

---

**End of Chapter 7.5 Implementation Plan**
