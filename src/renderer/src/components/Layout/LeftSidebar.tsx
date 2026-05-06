import { useUIStore } from '../../stores/uiStore'
import SessionsPanel from '../Sidebar/SessionsPanel'
import ProjectsPanel from '../Sidebar/ProjectsPanel'
import ToolsPanel from '../Sidebar/ToolsPanel'
import MarketplacePanel from '../Sidebar/MarketplacePanel'
import SettingsPanel from '../Sidebar/SettingsPanel'

export default function LeftSidebar(): JSX.Element {
  const view = useUIStore((s) => s.leftSidebarView)

  return (
    <div className="flex flex-col h-full bg-bg-surface">
      {view === 'sessions' && <SessionsPanel />}
      {view === 'projects' && <ProjectsPanel />}
      {view === 'tools' && <ToolsPanel />}
      {view === 'marketplace' && <MarketplacePanel />}
      {view === 'settings' && <SettingsPanel />}
    </div>
  )
}
