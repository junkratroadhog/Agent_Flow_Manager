import { MessageSquare, FolderOpen, Wrench, Store, Settings } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/Tooltip'
import { useUIStore, type SidebarView } from '../../stores/uiStore'
import { cn } from '../../lib/utils'

interface ActivityItem {
  id: SidebarView
  icon: typeof MessageSquare
  label: string
  shortcut?: string
}

const TOP_ITEMS: ActivityItem[] = [
  { id: 'sessions', icon: MessageSquare, label: 'Sessions', shortcut: 'Ctrl+1' },
  { id: 'projects', icon: FolderOpen, label: 'Projects', shortcut: 'Ctrl+2' },
  { id: 'tools', icon: Wrench, label: 'Tools', shortcut: 'Ctrl+3' },
  { id: 'marketplace', icon: Store, label: 'Marketplace', shortcut: 'Ctrl+4' }
]

const BOTTOM_ITEMS: ActivityItem[] = [
  { id: 'settings', icon: Settings, label: 'Settings', shortcut: 'Ctrl+,' }
]

export default function ActivityBar(): JSX.Element {
  const { leftSidebarVisible, leftSidebarView, setLeftSidebarView, toggleLeftSidebar } =
    useUIStore()

  const handleClick = (id: SidebarView): void => {
    if (leftSidebarView === id && leftSidebarVisible) {
      toggleLeftSidebar()
    } else {
      setLeftSidebarView(id)
      if (!leftSidebarVisible) toggleLeftSidebar()
    }
  }

  const renderItem = (item: ActivityItem): JSX.Element => {
    const Icon = item.icon
    const isActive = leftSidebarView === item.id && leftSidebarVisible
    return (
      <Tooltip key={item.id} delayDuration={300}>
        <TooltipTrigger asChild>
          <button
            onClick={() => handleClick(item.id)}
            className={cn(
              'relative flex items-center justify-center w-12 h-12 transition-colors',
              'hover:text-text-primary',
              isActive ? 'text-text-primary' : 'text-text-tertiary'
            )}
            aria-label={item.label}
          >
            {isActive && (
              <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-accent rounded-r" />
            )}
            <Icon size={20} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {item.label} {item.shortcut && <span className="opacity-60 ml-2">{item.shortcut}</span>}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className="flex flex-col w-12 bg-bg-deepest border-r border-border-subtle flex-shrink-0">
      <div className="flex flex-col">{TOP_ITEMS.map(renderItem)}</div>
      <div className="flex-1" />
      <div className="flex flex-col">{BOTTOM_ITEMS.map(renderItem)}</div>
    </div>
  )
}
