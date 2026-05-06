import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

export interface ContextMenuItem {
  label?: string
  icon?: ReactNode
  onClick?: () => void
  shortcut?: string
  separator?: boolean
  danger?: boolean
}

interface ListContextMenuProps {
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
}

export default function ListContextMenu({
  x,
  y,
  items,
  onClose
}: ListContextMenuProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      style={{ left: x, top: y }}
      className="fixed z-50 min-w-[180px] py-1 rounded-md border border-border bg-bg-elevated shadow-lg text-sm"
    >
      {items.map((item, i) => {
        if (item.separator) {
          return <div key={i} className="my-1 h-px bg-border-subtle" />
        }
        return (
          <button
            key={i}
            onClick={() => {
              item.onClick?.()
              onClose()
            }}
            className={cn(
              'w-full text-left px-3 py-1.5 hover:bg-bg-hover flex items-center justify-between gap-3',
              item.danger && 'text-status-error hover:text-status-error'
            )}
          >
            <span className="flex items-center gap-2">
              {item.icon}
              {item.label}
            </span>
            {item.shortcut && <span className="text-xs text-text-tertiary">{item.shortcut}</span>}
          </button>
        )
      })}
    </div>
  )
}
