import { Search, X, Plus } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SidebarHeaderProps {
  title: string
  searchQuery: string
  onSearchChange: (q: string) => void
  onAddClick?: () => void
  addLabel?: string
}

export default function SidebarHeader({
  title,
  searchQuery,
  onSearchChange,
  onAddClick,
  addLabel
}: SidebarHeaderProps): JSX.Element {
  return (
    <div className="border-b border-border-subtle bg-bg-deep">
      <div className="h-9 flex items-center justify-between px-3">
        <span className="text-xs uppercase tracking-wider text-text-tertiary font-semibold">
          {title}
        </span>
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="p-1 text-text-tertiary hover:text-text-primary rounded hover:bg-bg-hover"
            aria-label={addLabel ?? 'Add'}
            title={addLabel}
          >
            <Plus size={14} />
          </button>
        )}
      </div>
      <div className="px-2 pb-2">
        <div
          className={cn(
            'relative flex items-center rounded-md border border-border bg-bg-deepest',
            'focus-within:ring-2 focus-within:ring-accent focus-within:border-transparent'
          )}
        >
          <Search size={12} className="absolute left-2 text-text-tertiary pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="w-full pl-7 pr-7 py-1 text-xs bg-transparent outline-none placeholder:text-text-tertiary"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 text-text-tertiary hover:text-text-primary"
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
