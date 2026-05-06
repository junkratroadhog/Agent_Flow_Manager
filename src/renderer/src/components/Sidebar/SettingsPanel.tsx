import { Settings as SettingsIcon, KeyRound, Zap, Sliders, Info } from 'lucide-react'
import { useUIStore } from '../../stores'
import SidebarHeader from './SidebarHeader'
import { useState } from 'react'
import { cn } from '../../lib/utils'

interface SettingsItem {
  id: string
  label: string
  icon: typeof SettingsIcon
}

const ITEMS: SettingsItem[] = [
  { id: 'general', label: 'General', icon: Sliders },
  { id: 'api-keys', label: 'API Keys', icon: KeyRound },
  { id: 'models', label: 'Models', icon: Zap },
  { id: 'about', label: 'About', icon: Info }
]

export default function SettingsPanel(): JSX.Element {
  const [q, setQ] = useState('')
  const addTab = useUIStore((s) => s.addTab)

  const filtered = ITEMS.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()))

  const handleOpen = (item: SettingsItem): void => {
    addTab({
      type: 'settings',
      title: `Settings: ${item.label}`,
      data: item.id
    })
  }

  return (
    <div className="flex flex-col h-full">
      <SidebarHeader title="Settings" searchQuery={q} onSearchChange={setQ} />
      <div className="flex-1 overflow-y-auto py-1">
        {filtered.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => handleOpen(item)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-bg-hover transition-colors'
              )}
            >
              <Icon size={14} className="shrink-0 text-text-tertiary" />
              <span className="text-sm">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
