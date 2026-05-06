import { X, Pin, Circle } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TabMetadata } from './types'
import { cn } from '../../lib/utils'
import { useUIStore } from '../../stores/uiStore'

interface TabItemProps {
  tab: TabMetadata
  isActive: boolean
}

export default function TabItem({ tab, isActive }: TabItemProps): JSX.Element {
  const setActiveTabId = useUIStore((s) => s.setActiveTabId)
  const closeTab = useUIStore((s) => s.closeTab)
  const updateTab = useUIStore((s) => s.updateTab)
  const closeOtherTabs = useUIStore((s) => s.closeOtherTabs)
  const closeTabsToTheRight = useUIStore((s) => s.closeTabsToTheRight)
  const closeAllTabs = useUIStore((s) => s.closeAllTabs)

  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
  const menuRef = useRef<HTMLDivElement>(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tab.id
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : undefined,
    opacity: isDragging ? 0.6 : 1
  }

  const handleClose = (e: React.MouseEvent): void => {
    e.stopPropagation()
    closeTab(tab.id)
  }

  const handleMiddleClick = (e: React.MouseEvent): void => {
    if (e.button === 1) {
      e.preventDefault()
      closeTab(tab.id)
    }
  }

  const handleContextMenu = (e: React.MouseEvent): void => {
    e.preventDefault()
    setMenuPos({ x: e.clientX, y: e.clientY })
    setMenuOpen(true)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={(): void => setActiveTabId(tab.id)}
        onMouseDown={handleMiddleClick}
        onContextMenu={handleContextMenu}
        className={cn(
          'group relative flex items-center h-9 px-3 min-w-[120px] max-w-[200px] border-r border-border-subtle cursor-pointer select-none transition-colors outline-none',
          isActive
            ? 'bg-bg-deepest text-text-primary'
            : 'bg-bg-deep text-text-secondary hover:bg-bg-surface hover:text-text-primary'
        )}
      >
        {/* Active indicator top bar */}
        {isActive && <div className="absolute top-0 left-0 w-full h-[2px] bg-accent" />}

        {/* Tab Icon */}
        <div className="mr-2 opacity-70">
          <Circle size={14} className={cn(tab.pinned && 'text-accent fill-accent')} />
        </div>

        {/* Title */}
        <span className="flex-1 text-xs truncate mr-2 font-medium">{tab.title}</span>

        {/* Status Icons / Close Button */}
        <div className="flex items-center space-x-1">
          {tab.modified && !isActive && <div className="w-2 h-2 rounded-full bg-accent" />}
          {tab.pinned && <Pin size={10} className="text-text-secondary rotate-45" />}
          <button
            onClick={handleClose}
            className={cn(
              'p-0.5 rounded-sm hover:bg-bg-elevated transition-colors opacity-0 group-hover:opacity-100',
              isActive && 'opacity-100'
            )}
            onMouseDown={(e): void => e.stopPropagation()} // Prevent drag when closing
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Custom Context Menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="fixed z-[100] w-48 bg-bg-surface border border-border-subtle rounded-md shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100"
          style={{ top: menuPos.y, left: menuPos.x }}
          onMouseDown={(e): void => e.stopPropagation()} // Prevent drag when using menu
        >
          <button
            className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent hover:text-white transition-colors flex items-center"
            onClick={(): void => {
              updateTab(tab.id, { pinned: !tab.pinned })
              setMenuOpen(false)
            }}
          >
            <Pin size={12} className="mr-2" />
            {tab.pinned ? 'Unpin Tab' : 'Pin Tab'}
          </button>
          <div className="h-px bg-border-subtle my-1" />
          <button
            className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent hover:text-white transition-colors"
            onClick={(): void => {
              closeTab(tab.id)
              setMenuOpen(false)
            }}
          >
            Close
          </button>
          <button
            className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent hover:text-white transition-colors"
            onClick={(): void => {
              closeOtherTabs(tab.id)
              setMenuOpen(false)
            }}
          >
            Close Others
          </button>
          <button
            className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent hover:text-white transition-colors"
            onClick={(): void => {
              closeTabsToTheRight(tab.id)
              setMenuOpen(false)
            }}
          >
            Close to the Right
          </button>
          <button
            className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent hover:text-white transition-colors"
            onClick={(): void => {
              closeAllTabs()
              setMenuOpen(false)
            }}
          >
            Close All
          </button>
        </div>
      )}
    </>
  )
}
