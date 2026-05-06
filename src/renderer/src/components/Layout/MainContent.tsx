import TabBar from '../Tabs/TabBar'
import TabContentRenderer from '../Tabs/TabContentRenderer'
import { useUIStore } from '../../stores/uiStore'

export default function MainContent(): JSX.Element {
  const tabs = useUIStore((s) => s.tabs)

  if (tabs.length === 0) {
    return (
      <div className="flex-1 flex flex-col bg-bg-deepest min-w-0">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md p-8 animate-in zoom-in-95 duration-500">
            <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-accent to-accent/60">
              Agent Flow Manager
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed mb-6">
              Welcome to your Antigravity-inspired workspace. Start a new session or open an
              existing project to begin.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={(): void =>
                  useUIStore.getState().addTab({ type: 'chat', title: 'New Chat' })
                }
                className="px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent/90 transition-all active:scale-95"
              >
                New Chat
              </button>
              <button className="px-4 py-2 bg-bg-surface text-text-primary border border-border-subtle rounded-md text-sm font-medium hover:bg-bg-elevated transition-all">
                Open Project
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-bg-deepest min-w-0 overflow-hidden">
      <TabBar />
      <div className="flex-1 overflow-hidden flex flex-col">
        <TabContentRenderer />
      </div>
    </div>
  )
}
