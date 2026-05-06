import { useSettingsStore, useSessionStore } from '../../stores'
import { Brain, Pin, Trash2, Archive, MoreHorizontal, Zap, Layers, Search } from 'lucide-react'
import { Button } from '../ui/Button'
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/Tooltip'
import { clsx } from 'clsx'

export default function SessionToolbar(): JSX.Element {
  const { currentBrainMode, setCurrentBrainMode } = useSettingsStore()
  const { activeSessionId, sessions } = useSessionStore()

  const activeSession = sessions.find((s) => s.id === activeSessionId)

  const modes = [
    { id: 'fast', name: 'Fast', icon: Zap, color: 'text-yellow-500' },
    { id: 'plan', name: 'Plan', icon: Layers, color: 'text-blue-500' },
    { id: 'deepThink', name: 'Think', icon: Brain, color: 'text-purple-500' },
    { id: 'deepResearch', name: 'Research', icon: Search, color: 'text-emerald-500' }
  ] as const

  return (
    <div className="h-10 flex items-center px-4 bg-bg-deepest/50 backdrop-blur-md border-b border-border-subtle gap-4 shrink-0">
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <h2 className="text-sm font-semibold truncate text-text-primary">
          {activeSession?.title || 'New Chat'}
        </h2>
        {activeSession?.pinned === 1 && <Pin size={12} className="text-accent fill-accent" />}
      </div>

      <div className="flex items-center gap-1 bg-bg-surface p-0.5 rounded-lg border border-border-subtle">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setCurrentBrainMode(mode.id as any)}
            className={clsx(
              'flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-all',
              currentBrainMode === mode.id
                ? 'bg-bg-elevated text-text-primary shadow-sm'
                : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-elevated/50'
            )}
          >
            <mode.icon
              size={12}
              className={currentBrainMode === mode.id ? mode.color : 'text-text-tertiary'}
            />
            <span className="hidden sm:inline">{mode.name}</span>
          </button>
        ))}
      </div>

      <div className="h-4 w-[1px] bg-border-subtle" />

      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-text-tertiary">
              <Archive size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Archive Session</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-text-tertiary">
              <Trash2 size={16} className="hover:text-status-error" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete Session</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-text-tertiary">
              <MoreHorizontal size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>More Actions</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
