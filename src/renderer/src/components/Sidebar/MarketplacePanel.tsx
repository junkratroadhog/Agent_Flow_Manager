import { Store } from 'lucide-react'
import SidebarHeader from './SidebarHeader'
import { useState } from 'react'

export default function MarketplacePanel(): JSX.Element {
  const [q, setQ] = useState('')
  return (
    <div className="flex flex-col h-full">
      <SidebarHeader title="Marketplace" searchQuery={q} onSearchChange={setQ} />
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <Store size={32} className="text-text-tertiary mb-3" />
        <p className="text-sm text-text-secondary mb-1">Marketplace</p>
        <p className="text-xs text-text-tertiary">Browse and install MCP tools from GitHub.</p>
        <p className="text-[10px] text-text-tertiary mt-3">Coming in a later chapter.</p>
      </div>
    </div>
  )
}
