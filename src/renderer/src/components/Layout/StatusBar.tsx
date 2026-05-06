import {
  useProjectStore,
  useSettingsStore,
  useAgentStore,
  useSessionStore,
  selectActiveProject
} from '../../stores'
import { Circle, Cpu, Wifi, Brain, Hash, Box } from 'lucide-react'

export default function StatusBar(): JSX.Element {
  const { currentBrainMode, brainModes, primaryModel } = useSettingsStore()
  const activeProject = useProjectStore(selectActiveProject)
  const { activeSessionId } = useSessionStore()
  const { agentsBySession } = useAgentStore()

  const activeAgents = activeSessionId ? (agentsBySession[activeSessionId] ?? []) : []
  const currentModel = brainModes[currentBrainMode]?.model || primaryModel

  return (
    <div className="h-7 flex items-center px-3 bg-bg-deepest border-t border-border-subtle text-[11px] text-text-tertiary gap-4 flex-shrink-0 select-none">
      {/* Connection & Status */}
      <div className="flex items-center gap-1.5 px-1 hover:text-text-secondary cursor-default transition-colors">
        <Circle size={8} className="fill-status-success text-status-success animate-pulse" />
        <span className="font-medium">Ready</span>
      </div>

      <div className="w-[1px] h-3 bg-border-subtle" />

      {/* Project Info */}
      <div className="flex items-center gap-1.5 px-1 hover:text-text-secondary cursor-default transition-colors">
        <Box size={12} className="text-accent-primary" />
        <span className="truncate max-w-[150px]">
          {activeProject ? activeProject.name : 'No Project'}
        </span>
      </div>

      <div className="w-[1px] h-3 bg-border-subtle" />

      {/* Brain Mode & Model */}
      <div className="flex items-center gap-3 group">
        <div className="flex items-center gap-1.5 px-1 hover:text-text-secondary cursor-pointer transition-colors">
          <Brain size={12} className="text-accent-secondary" />
          <span className="capitalize">{currentBrainMode} Mode</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-text-quaternary group-hover:text-text-tertiary transition-colors">
          <Cpu size={10} />
          <span>{currentModel}</span>
        </div>
      </div>

      <div className="flex-1" />

      {/* Agents & Tokens */}
      <div className="flex items-center gap-4 pr-1">
        <div className="flex items-center gap-1.5 hover:text-text-secondary transition-colors">
          <Cpu size={12} />
          <span>{activeAgents.length} agents</span>
        </div>

        <div className="flex items-center gap-1.5 hover:text-text-secondary transition-colors">
          <Hash size={12} />
          <span>0 tokens</span>
        </div>

        <div className="w-[1px] h-3 bg-border-subtle" />

        <div className="flex items-center gap-1.5 hover:text-status-success transition-colors cursor-default">
          <Wifi size={12} />
          <span>Local Node</span>
        </div>

        <div className="text-[10px] tabular-nums text-text-quaternary">UTF-8</div>
        <div className="text-[10px] text-text-quaternary font-mono">v0.1.0</div>
      </div>
    </div>
  )
}
