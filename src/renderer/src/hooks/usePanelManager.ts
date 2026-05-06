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
