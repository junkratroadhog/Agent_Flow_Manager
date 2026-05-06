import { useUIStore } from '../../stores/uiStore'
import SessionToolbar from '../Chat/SessionToolbar'
import ChatView from '../Chat/ChatView'

export default function TabContentRenderer(): JSX.Element {
  const tabs = useUIStore((s) => s.tabs)
  const activeTabId = useUIStore((s) => s.activeTabId)
  const activeTab = tabs.find((t) => t.id === activeTabId)

  if (!activeTab) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-deepest text-text-secondary italic">
        No active tab. Open a new chat or select a project.
      </div>
    )
  }

  // Map tab types to components
  switch (activeTab.type) {
    case 'chat':
      return (
        <div className="flex-1 flex flex-col min-w-0 relative h-full">
          <SessionToolbar />
          <div className="flex-1 relative min-h-0">
            <ChatView sessionId={activeTab.id} />
          </div>
        </div>
      )
    case 'settings':
      return (
        <div className="flex-1 p-8 overflow-auto animate-in slide-in-from-bottom-2 duration-300">
          <h3 className="text-xl font-semibold mb-6">Settings</h3>
          <div className="space-y-4 max-w-2xl">
            <div className="p-4 rounded-lg bg-bg-surface border border-border-subtle">
              <h4 className="font-medium mb-1">Theme</h4>
              <p className="text-xs text-text-secondary mb-3">Customize the look and feel.</p>
              {/* Theme toggle placeholder */}
            </div>
          </div>
        </div>
      )
    default:
      return (
        <div className="flex-1 flex items-center justify-center text-text-secondary italic">
          Content for {activeTab.type} view is under development.
        </div>
      )
  }
}
