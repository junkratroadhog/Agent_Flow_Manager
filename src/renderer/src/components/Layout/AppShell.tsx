import { useEffect } from 'react'
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

  const leftSidebarDefaultSize = (leftSidebarWidth / (window.innerWidth || 1)) * 100
  const bottomPanelDefaultSize = (bottomPanelHeight / (window.innerHeight || 1)) * 100
  const rightSidebarDefaultSize = (rightSidebarWidth / (window.innerWidth || 1)) * 100

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          <ActivityBar />
          <ResizablePanelGroup orientation="horizontal" className="flex-1">
            {leftSidebarVisible && (
              <>
                <ResizablePanel
                  defaultSize={leftSidebarDefaultSize}
                  minSize={12}
                  maxSize={40}
                  onResize={(size) => {
                    const px = Math.round((size / 100) * window.innerWidth)
                    setLeftSidebarWidth(px)
                  }}
                >
                  <LeftSidebar />
                </ResizablePanel>
                <ResizableHandle />
              </>
            )}
            <ResizablePanel defaultSize={60} minSize={30}>
              <ResizablePanelGroup orientation="vertical">
                <ResizablePanel defaultSize={bottomPanelVisible ? 70 : 100} minSize={30}>
                  <MainContent />
                </ResizablePanel>
                {bottomPanelVisible && (
                  <>
                    <ResizableHandle />
                    <ResizablePanel
                      defaultSize={bottomPanelDefaultSize}
                      minSize={10}
                      maxSize={70}
                      onResize={(size) => {
                        const px = Math.round((size / 100) * window.innerHeight)
                        setBottomPanelHeight(px)
                      }}
                    >
                      <BottomPanel />
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </ResizablePanel>
            {rightSidebarVisible && (
              <>
                <ResizableHandle />
                <ResizablePanel
                  defaultSize={rightSidebarDefaultSize}
                  minSize={15}
                  maxSize={40}
                  onResize={(size) => {
                    const px = Math.round((size / 100) * window.innerWidth)
                    setRightSidebarWidth(px)
                  }}
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
