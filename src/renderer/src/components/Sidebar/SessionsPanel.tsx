import { useEffect, useState, useCallback } from 'react'
import { MessageSquare, Pin, Archive, Trash2, Edit3 } from 'lucide-react'
import { useSessionStore, useProjectStore, useUIStore } from '../../stores'
import { sessionService } from '../../services'
import { groupByDate, formatRelative } from '../../lib/date'
import { cn } from '../../lib/utils'
import SidebarHeader from './SidebarHeader'
import ListContextMenu, { type ContextMenuItem } from './ListContextMenu'
import { useSearchFilter } from './useSearchFilter'
import type { Session } from '@shared/db-types'

export default function SessionsPanel(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('')
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    sessionId: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const { activeProjectId } = useProjectStore()
  const {
    sessions,
    setSessions,
    addSession,
    removeSession,
    updateSession,
    activeSessionId,
    setActiveSession
  } = useSessionStore()
  const addTab = useUIStore((s) => s.addTab)

  const refresh = useCallback(async (): Promise<void> => {
    if (!activeProjectId) {
      setSessions([])
      return
    }
    setLoading(true)
    try {
      const list = await sessionService.list(activeProjectId)
      setSessions(list)
    } catch (e) {
      console.error('Failed to load sessions:', e)
    } finally {
      setLoading(false)
    }
  }, [activeProjectId, setSessions])

  useEffect(() => {
    refresh()
  }, [refresh])

  const filtered = useSearchFilter(sessions, searchQuery, (s) => s.title)
  const grouped = groupByDate(filtered)
  const groupOrder: Array<keyof typeof grouped> = [
    'Today',
    'Yesterday',
    'This Week',
    'This Month',
    'Older'
  ]

  const handleSessionClick = (session: Session): void => {
    setActiveSession(session.id)
    addTab({
      type: 'chat',
      title: session.title,
      data: session.id
    })
  }

  const handleNewSession = async (): Promise<void> => {
    if (!activeProjectId) {
      alert('Please select or create a project first.')
      return
    }
    try {
      const session = await sessionService.create({
        project_id: activeProjectId,
        title: 'New Session'
      })
      addSession(session)
      handleSessionClick(session)
    } catch (e) {
      console.error('Failed to create session:', e)
    }
  }

  const handlePin = async (id: string, pinned: boolean): Promise<void> => {
    const updated = await sessionService.setPinned(id, pinned)
    if (updated) updateSession(id, updated)
  }

  const handleArchive = async (id: string): Promise<void> => {
    const updated = await sessionService.setArchived(id, true)
    if (updated) removeSession(id)
  }

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('Delete this session and all its messages?')) return
    await sessionService.delete(id)
    removeSession(id)
  }

  const handleRename = async (id: string): Promise<void> => {
    const session = sessions.find((s) => s.id === id)
    if (!session) return
    const newTitle = prompt('Rename session:', session.title)
    if (!newTitle || newTitle === session.title) return
    const updated = await sessionService.updateTitle(id, newTitle)
    if (updated) updateSession(id, updated)
  }

  const buildContextItems = (sessionId: string): ContextMenuItem[] => {
    const session = sessions.find((s) => s.id === sessionId)
    if (!session) return []
    return [
      {
        label: 'Open',
        onClick: () => handleSessionClick(session)
      },
      { separator: true, onClick: () => undefined },
      {
        label: 'Rename',
        icon: <Edit3 size={14} />,
        onClick: () => handleRename(sessionId)
      },
      {
        label: session.pinned ? 'Unpin' : 'Pin',
        icon: <Pin size={14} />,
        onClick: () => handlePin(sessionId, !session.pinned)
      },
      {
        label: 'Archive',
        icon: <Archive size={14} />,
        onClick: () => handleArchive(sessionId)
      },
      { separator: true, onClick: () => undefined },
      {
        label: 'Delete',
        icon: <Trash2 size={14} />,
        onClick: () => handleDelete(sessionId),
        danger: true
      }
    ]
  }

  return (
    <div className="flex flex-col h-full">
      <SidebarHeader
        title="Sessions"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={handleNewSession}
        addLabel="New session"
      />
      <div className="flex-1 overflow-y-auto">
        {!activeProjectId ? (
          <div className="p-4 text-xs text-text-tertiary text-center">
            Select a project to view sessions.
          </div>
        ) : loading ? (
          <div className="p-4 text-xs text-text-tertiary">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-xs text-text-tertiary text-center">
            {searchQuery
              ? 'No sessions match your search.'
              : 'No sessions yet. Click + to create one.'}
          </div>
        ) : (
          groupOrder.map((group) => {
            const items = grouped[group]
            if (items.length === 0) return null
            return (
              <div key={group} className="py-1">
                <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-text-tertiary font-semibold">
                  {group}
                </div>
                {items.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => handleSessionClick(session)}
                    onContextMenu={(e) => {
                      e.preventDefault()
                      setContextMenu({ x: e.clientX, y: e.clientY, sessionId: session.id })
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-bg-hover transition-colors',
                      activeSessionId === session.id && 'bg-bg-elevated'
                    )}
                  >
                    <MessageSquare size={14} className="shrink-0 text-text-tertiary" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {session.pinned === 1 && <Pin size={10} className="text-text-tertiary" />}
                        <span className="text-sm truncate">{session.title}</span>
                      </div>
                      <div className="text-[10px] text-text-tertiary">
                        {formatRelative(session.updated_at)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )
          })
        )}
      </div>
      {contextMenu && (
        <ListContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={buildContextItems(contextMenu.sessionId)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  )
}
