import { useEffect } from 'react'
import { TooltipProvider } from '../ui/Tooltip'
import { useUIStore } from '../../stores/uiStore'
import { usePanelManager } from '../../hooks/usePanelManager'
import { ACTIVITY_BAR_WIDTH, DRAG_TRANSITION_NONE, PANEL_TRANSITION } from './panelConstants'
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
      const shift = e.shiftKey
      const key = e.key.toLowerCase()

      if (ctrl && key === 'b') {
        e.preventDefault()
        toggleLeftSidebar()
      } else if (ctrl && key === 'j') {
        e.preventDefault()
        toggleBottomPanel()
      } else if (ctrl && key === 't') {
        e.preventDefault()
        useUIStore.getState().addTab({ type: 'chat', title: 'New Chat' })
      } else if (ctrl && key === 'w') {
        const { activeTabId, closeTab } = useUIStore.getState()
        if (activeTabId) {
          e.preventDefault()
          closeTab(activeTabId)
        }
      } else if (ctrl && key === 'tab') {
        e.preventDefault()
        if (shift) {
          useUIStore.getState().prevTab()
        } else {
          useUIStore.getState().nextTab()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleLeftSidebar, toggleBottomPanel])

  // Compute effective widths (collapsed = 0)
  const effectiveLeftWidth = pm.leftVisible && !pm.leftAutoCollapsed ? pm.leftWidth : 0
  const effectiveRightWidth = pm.rightVisible && !pm.rightAutoCollapsed ? pm.rightWidth : 0
  const effectiveBottomHeight = pm.bottomVisible ? pm.bottomHeight : 0

  // While dragging, disable transitions on the directly-dragged panel so it
  // tracks the cursor exactly. The OPPOSITE panel still animates when it
  // auto-collapses/restores.
  const leftTransition = pm.isDraggingLeft ? DRAG_TRANSITION_NONE : PANEL_TRANSITION
  const rightTransition = pm.isDraggingRight ? DRAG_TRANSITION_NONE : PANEL_TRANSITION
  const bottomTransition = pm.isDraggingBottom ? DRAG_TRANSITION_NONE : PANEL_TRANSITION

  return (
    <TooltipProvider delayDuration={300}>
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
                transition:
                  pm.isDraggingLeft || pm.isDraggingRight ? DRAG_TRANSITION_NONE : PANEL_TRANSITION,
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
