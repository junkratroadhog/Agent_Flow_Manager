import { Circle, Cpu, Wifi } from 'lucide-react'

export default function StatusBar(): JSX.Element {
  return (
    <div className="h-6 flex items-center px-3 bg-bg-deepest border-t border-border-subtle text-xs text-text-tertiary gap-4 flex-shrink-0">
      <div className="flex items-center gap-1.5">
        <Circle size={8} className="fill-status-success text-status-success" />
        <span>Ready</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Cpu size={12} />
        <span>0 agents</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-1.5">
        <Wifi size={12} />
        <span>Local</span>
      </div>
      <span>UTF-8</span>
      <span>v0.1.0</span>
    </div>
  )
}
