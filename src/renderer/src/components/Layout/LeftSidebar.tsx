import { useUIStore } from '../../stores/uiStore'

export default function LeftSidebar(): JSX.Element {
  const view = useUIStore((s) => s.leftSidebarView)

  const titles: Record<string, string> = {
    sessions: 'Sessions',
    projects: 'Projects',
    tools: 'Tools',
    marketplace: 'Marketplace',
    settings: 'Settings'
  }

  const title = view ? (titles[view] ?? 'Sidebar') : 'Sidebar'

  return (
    <div className="flex flex-col h-full bg-bg-surface">
      <div className="h-9 flex items-center px-3 border-b border-border-subtle">
        <span className="text-xs uppercase tracking-wider text-text-tertiary font-semibold">
          {title}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 text-sm text-text-secondary">
          {view === 'sessions' && (
            <p className="text-text-tertiary text-xs">
              Session list will appear here in Chapter 9.
            </p>
          )}
          {view === 'projects' && (
            <p className="text-text-tertiary text-xs">
              Project list will appear here in Chapter 9.
            </p>
          )}
          {view === 'tools' && (
            <p className="text-text-tertiary text-xs">Installed tools list (Chapter 9).</p>
          )}
          {view === 'marketplace' && (
            <p className="text-text-tertiary text-xs">Marketplace browser (later chapter).</p>
          )}
          {view === 'settings' && (
            <p className="text-text-tertiary text-xs">Settings (later chapter).</p>
          )}
        </div>
      </div>
    </div>
  )
}
