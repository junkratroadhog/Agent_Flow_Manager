import { useEffect, useMemo } from 'react'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../ui/Resizable'
import { TooltipProvider } from '../ui/Tooltip'
import { useUIStore } from '../../stores/uiStore'
import ActivityBar from './ActivityBar'
import LeftSidebar from './LeftSidebar'
import MainContent from './MainContent'
import RightSidebar from './RightSidebar'
import BottomPanel from './BottomPanel'
import StatusBar from './StatusBar'

export default function AppShell(): JSX.Element {
  const leftSidebarVisible = useUIStore((s) => s.leftSidebarVisible)
  const leftSidebarWidth = useUIStore((s) => s.leftSidebarWidth)
  const setLeftSidebarWidth = useUIStore((s) => s.setLeftSidebarWidth)
  const rightSidebarVisible = useUIStore((s) => s.rightSidebarVisible)
  const rightSidebarWidth = useUIStore((s) => s.rightSidebarWidth)
  const setRightSidebarWidth = useUIStore((s) => s.setRightSidebarWidth)
  const bottomPanelVisible = useUIStore((s) => s.bottomPanelVisible)
  const bottomPanelHeight = useUIStore((s) => s.bottomPanelHeight)
  const setBottomPanelHeight = useUIStore((s) => s.setBottomPanelHeight)
  const toggleLeftSidebar = useUIStore((s) => s.toggleLeftSidebar)
  const toggleBottomPanel = useUIStore((s) => s.toggleBottomPanel)

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

  // Calculate initial sizes ONCE to prevent re-render "tug-of-war"
  const initialSizes = useMemo(() => {
    const innerWidth = window.innerWidth || 1200
    const innerHeight = window.innerHeight || 800

    const leftPct = (leftSidebarWidth / innerWidth) * 100 || 20
    const rightPct = (rightSidebarWidth / innerWidth) * 100 || 20
    const bottomPct = (bottomPanelHeight / innerHeight) * 100 || 25

    return {
      left: leftPct,
      right: rightPct,
      bottom: bottomPct,
      center: 100 - leftPct - rightPct,
      main: 100 - bottomPct
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty deps = only calculate on mount

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full w-full overflow-hidden bg-bg-deepest">
        <div className="flex flex-1 w-full overflow-hidden">
          <ActivityBar />
          <ResizablePanelGroup
            orientation="horizontal"
            className="flex-1 h-full w-full overflow-hidden"
          >
            {leftSidebarVisible && (
              <>
                <ResizablePanel
                  defaultSize={initialSizes.left}
                  minSize={0}
                  maxSize={100}
                  onResize={(size) => {
                    const px = Math.round((size / 100) * window.innerWidth)
                    if (px > 0) setLeftSidebarWidth(px)
                  }}
                  className="h-full overflow-hidden"
                >
                  <LeftSidebar />
                </ResizablePanel>
                <ResizableHandle withHandle />
              </>
            )}
            <ResizablePanel
              defaultSize={initialSizes.center}
              minSize={0}
              className="flex flex-col h-full"
            >
              <ResizablePanelGroup orientation="vertical" className="flex-1 h-full w-full">
                <ResizablePanel
                  defaultSize={initialSizes.main}
                  minSize={0}
                  className="h-full overflow-hidden"
                >
                  <MainContent />
                </ResizablePanel>
                {bottomPanelVisible && (
                  <>
                    <ResizableHandle withHandle />
                    <ResizablePanel
                      defaultSize={initialSizes.bottom}
                      minSize={0}
                      maxSize={100}
                      onResize={(size) => {
                        const px = Math.round((size / 100) * window.innerHeight)
                        if (px > 0) setBottomPanelHeight(px)
                      }}
                      className="h-full overflow-hidden"
                    >
                      <BottomPanel />
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </ResizablePanel>
            {rightSidebarVisible && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel
                  defaultSize={initialSizes.right}
                  minSize={0}
                  maxSize={100}
                  onResize={(size) => {
                    const px = Math.round((size / 100) * window.innerWidth)
                    if (px > 0) setRightSidebarWidth(px)
                  }}
                  className="h-full overflow-hidden"
                >
                  <RightSidebar />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
        <StatusBar />
      </div>
    </TooltipProvider>
  )
}
