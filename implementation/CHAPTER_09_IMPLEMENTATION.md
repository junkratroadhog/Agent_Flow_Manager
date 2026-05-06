# 📘 Chapter 9 Implementation Plan: Sidebar Components & Navigation

> **READ THIS FIRST (LLM Instructions):**
>
> You are implementing Chapter 9 of the Agent Flow Manager project. Follow this document EXACTLY in order.
>
> **CRITICAL RULES:**
>
> 1. Execute each task in the order given. DO NOT skip ahead.
> 2. After each task, run the verification command. If it fails, STOP and fix before moving on.
> 3. Copy file contents EXACTLY as written. Do not "improve" or modify them.
> 4. Use `npm` only.
> 5. **PREREQUISITE:** Chapters 1-8 must be complete with all verification checks passing.

---

## 🎯 Chapter 9 Goal

Replace the demo buttons in the left sidebar with real, functional navigation panels: live sessions list (grouped by date), projects list, tools list, and a search bar. All data comes from the database via IPC services.

## 📋 What Will Exist When This Chapter Is Done

- **Sessions panel:** Shows real sessions for the active project, grouped by Today/Yesterday/Earlier This Week/Older. Click opens a chat tab.
- **Projects panel:** Shows all projects, "Create Project" button, click selects active project
- **Tools panel:** Shows installed tools (placeholder data for now), enable/disable toggles
- Sidebar header has a search input that filters the visible list
- Right-click context menus on sessions and projects
- "New Project" wizard dialog
- "New Session" inline action
- Keyboard navigation (arrow keys to navigate, Enter to open)
- Loading states while data fetches
- Empty states with helpful prompts

---

# 📦 SECTION 1: Pre-flight Checks

## Task 1.1: Verify Previous Chapters

**Command:**

```bash
npm run typecheck && npm run test:run
```

**Expected:** All checks pass.

---

# 📦 SECTION 2: Date Helper

## Task 2.1: Create Date Utility

**File path:** `src/renderer/src/lib/date.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
export type DateGroup = 'Today' | 'Yesterday' | 'This Week' | 'This Month' | 'Older'

export function groupByDate<T extends { updated_at: string }>(items: T[]): Record<DateGroup, T[]> {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)
  const startOfThisWeek = new Date(startOfToday)
  startOfThisWeek.setDate(startOfThisWeek.getDate() - now.getDay())
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const groups: Record<DateGroup, T[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    'This Month': [],
    Older: []
  }

  for (const item of items) {
    const d = new Date(item.updated_at)
    if (d >= startOfToday) groups.Today.push(item)
    else if (d >= startOfYesterday) groups.Yesterday.push(item)
    else if (d >= startOfThisWeek) groups['This Week'].push(item)
    else if (d >= startOfThisMonth) groups['This Month'].push(item)
    else groups.Older.push(item)
  }

  return groups
}

export function formatRelative(dateString: string): string {
  const d = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return d.toLocaleDateString()
}
```

---

# 📦 SECTION 3: Sidebar Search Hook

## Task 3.1: Create Search Hook

**File path:** `src/renderer/src/components/Sidebar/useSearchFilter.ts`

**Command first:**

```bash
mkdir -p src/renderer/src/components/Sidebar
```

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useMemo } from 'react'

export function useSearchFilter<T>(
  items: T[],
  query: string,
  getSearchableText: (item: T) => string
): T[] {
  return useMemo(() => {
    if (!query.trim()) return items
    const lower = query.toLowerCase()
    return items.filter((item) => getSearchableText(item).toLowerCase().includes(lower))
  }, [items, query, getSearchableText])
}
```

---

# 📦 SECTION 4: Sidebar Header

## Task 4.1: Create Sidebar Header

**File path:** `src/renderer/src/components/Sidebar/SidebarHeader.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
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
```

---

# 📦 SECTION 5: Generic List Context Menu

## Task 5.1: Create Reusable Context Menu

**File path:** `src/renderer/src/components/Sidebar/ListContextMenu.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

export interface ContextMenuItem {
  label: string
  icon?: ReactNode
  onClick: () => void
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
              item.onClick()
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
```

---

# 📦 SECTION 6: Sessions Panel

## Task 6.1: Create Sessions Panel

**File path:** `src/renderer/src/components/Sidebar/SessionsPanel.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useEffect, useState, useCallback } from 'react'
import { MessageSquare, Pin, Archive, Trash2, Edit3 } from 'lucide-react'
import { useSessionStore, useProjectStore, useTabStore } from '../../stores'
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
  const { sessions, setSessions, addSession, removeSession, updateSession, activeSessionId, setActiveSession } =
    useSessionStore()
  const openTab = useTabStore((s) => s.openTab)

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
    openTab({
      id: undefined as unknown as string,
      type: 'chat',
      title: session.title,
      contextId: session.id
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
      { separator: true, label: '', onClick: () => undefined },
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
      { separator: true, label: '', onClick: () => undefined },
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
            {searchQuery ? 'No sessions match your search.' : 'No sessions yet. Click + to create one.'}
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
```

---

# 📦 SECTION 7: Projects Panel

## Task 7.1: Create Project Wizard Dialog

**File path:** `src/renderer/src/components/Sidebar/NewProjectDialog.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../ui/Dialog'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'
import { useProjectStore } from '../../stores'
import { projectService } from '../../services'

interface NewProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function NewProjectDialog({
  open,
  onOpenChange
}: NewProjectDialogProps): JSX.Element {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [workspacePath, setWorkspacePath] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { addProject, setActiveProject } = useProjectStore()

  const handleSubmit = async (): Promise<void> => {
    if (!name.trim() || submitting) return
    setSubmitting(true)
    try {
      const project = await projectService.create({
        name: name.trim(),
        description: description.trim() || undefined,
        workspace_path: workspacePath.trim() || undefined,
        workspace_type: 'local'
      })
      addProject(project)
      setActiveProject(project.id)
      setName('')
      setDescription('')
      setWorkspacePath('')
      onOpenChange(false)
    } catch (e) {
      alert(`Failed to create project: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>
            Create a workspace for organizing related sessions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Name *</label>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Project"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Workspace Path (optional)
            </label>
            <Input
              value={workspacePath}
              onChange={(e) => setWorkspacePath(e.target.value)}
              placeholder="/path/to/project"
            />
            <p className="text-[10px] text-text-tertiary">
              The directory the agent will work in. Can be set later.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || submitting}>
            {submitting ? 'Creating...' : 'Create Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

## Task 7.2: Create Projects Panel

**File path:** `src/renderer/src/components/Sidebar/ProjectsPanel.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useEffect, useState } from 'react'
import { FolderOpen, Trash2, Edit3, Check } from 'lucide-react'
import { useProjectStore } from '../../stores'
import { projectService } from '../../services'
import { cn } from '../../lib/utils'
import SidebarHeader from './SidebarHeader'
import ListContextMenu, { type ContextMenuItem } from './ListContextMenu'
import { useSearchFilter } from './useSearchFilter'
import NewProjectDialog from './NewProjectDialog'

export default function ProjectsPanel(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    projectId: string
  } | null>(null)

  const {
    projects,
    setProjects,
    removeProject,
    updateProject,
    activeProjectId,
    setActiveProject
  } = useProjectStore()

  useEffect(() => {
    projectService
      .list()
      .then(setProjects)
      .catch((e) => console.error('Failed to load projects:', e))
  }, [setProjects])

  const filtered = useSearchFilter(projects, searchQuery, (p) => p.name)

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('Delete this project and all its sessions/messages? Cannot be undone.')) return
    await projectService.delete(id)
    removeProject(id)
  }

  const handleRename = async (id: string): Promise<void> => {
    const project = projects.find((p) => p.id === id)
    if (!project) return
    const newName = prompt('Rename project:', project.name)
    if (!newName || newName === project.name) return
    const updated = await projectService.update(id, { name: newName })
    if (updated) updateProject(id, updated)
  }

  const buildContextItems = (projectId: string): ContextMenuItem[] => {
    return [
      {
        label: 'Set as Active',
        icon: <Check size={14} />,
        onClick: () => setActiveProject(projectId)
      },
      { separator: true, label: '', onClick: () => undefined },
      {
        label: 'Rename',
        icon: <Edit3 size={14} />,
        onClick: () => handleRename(projectId)
      },
      { separator: true, label: '', onClick: () => undefined },
      {
        label: 'Delete',
        icon: <Trash2 size={14} />,
        onClick: () => handleDelete(projectId),
        danger: true
      }
    ]
  }

  return (
    <div className="flex flex-col h-full">
      <SidebarHeader
        title="Projects"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClick={() => setDialogOpen(true)}
        addLabel="New project"
      />
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-4 text-xs text-text-tertiary text-center">
            {searchQuery
              ? 'No projects match your search.'
              : 'No projects yet. Click + to create one.'}
          </div>
        ) : (
          <div className="py-1">
            {filtered.map((project) => (
              <button
                key={project.id}
                onClick={() => setActiveProject(project.id)}
                onContextMenu={(e) => {
                  e.preventDefault()
                  setContextMenu({ x: e.clientX, y: e.clientY, projectId: project.id })
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-bg-hover transition-colors',
                  activeProjectId === project.id && 'bg-bg-elevated'
                )}
              >
                <FolderOpen
                  size={14}
                  className={cn(
                    'shrink-0',
                    activeProjectId === project.id ? 'text-accent' : 'text-text-tertiary'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{project.name}</div>
                  {project.description && (
                    <div className="text-[10px] text-text-tertiary truncate">
                      {project.description}
                    </div>
                  )}
                </div>
                {activeProjectId === project.id && (
                  <Check size={12} className="text-accent shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      <NewProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      {contextMenu && (
        <ListContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={buildContextItems(contextMenu.projectId)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  )
}
```

---

# 📦 SECTION 8: Tools Panel (Placeholder Data)

## Task 8.1: Create Tools Panel

**File path:** `src/renderer/src/components/Sidebar/ToolsPanel.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { useEffect, useState } from 'react'
import { Wrench, Globe, Code, FileText, Search } from 'lucide-react'
import { useToolStore, type InstalledTool } from '../../stores'
import { cn } from '../../lib/utils'
import SidebarHeader from './SidebarHeader'
import { useSearchFilter } from './useSearchFilter'

const PLACEHOLDER_TOOLS: InstalledTool[] = [
  {
    id: 'tol_websearch',
    name: 'web_search',
    description: 'Search the web for current information',
    category: 'research',
    source: 'builtin',
    enabled: true,
    version: '1.0.0',
    permissions: ['network']
  },
  {
    id: 'tol_fetch',
    name: 'web_fetch',
    description: 'Fetch content from a URL',
    category: 'research',
    source: 'builtin',
    enabled: true,
    version: '1.0.0',
    permissions: ['network']
  },
  {
    id: 'tol_fs_read',
    name: 'file_read',
    description: 'Read files from the workspace',
    category: 'filesystem',
    source: 'builtin',
    enabled: true,
    version: '1.0.0',
    permissions: ['fs:read']
  },
  {
    id: 'tol_fs_write',
    name: 'file_write',
    description: 'Write files to the workspace',
    category: 'filesystem',
    source: 'builtin',
    enabled: true,
    version: '1.0.0',
    permissions: ['fs:write']
  },
  {
    id: 'tol_shell',
    name: 'shell_exec',
    description: 'Execute shell commands',
    category: 'system',
    source: 'builtin',
    enabled: false,
    version: '1.0.0',
    permissions: ['shell']
  }
]

const iconForTool = (name: string): typeof Wrench => {
  if (name.startsWith('web_')) return Globe
  if (name.startsWith('file_')) return FileText
  if (name === 'shell_exec') return Code
  if (name === 'web_search') return Search
  return Wrench
}

export default function ToolsPanel(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('')
  const { installedTools, setInstalledTools, setToolEnabled } = useToolStore()

  useEffect(() => {
    // Placeholder: in later chapters, fetch from main process
    if (installedTools.length === 0) {
      setInstalledTools(PLACEHOLDER_TOOLS)
    }
  }, [installedTools.length, setInstalledTools])

  const filtered = useSearchFilter(
    installedTools,
    searchQuery,
    (t) => `${t.name} ${t.description} ${t.category}`
  )

  // Group by category
  const grouped: Record<string, InstalledTool[]> = {}
  for (const tool of filtered) {
    if (!grouped[tool.category]) grouped[tool.category] = []
    grouped[tool.category].push(tool)
  }

  return (
    <div className="flex flex-col h-full">
      <SidebarHeader
        title="Tools"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-4 text-xs text-text-tertiary text-center">
            {searchQuery ? 'No tools match.' : 'No tools installed.'}
          </div>
        ) : (
          Object.entries(grouped).map(([category, tools]) => (
            <div key={category} className="py-1">
              <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-text-tertiary font-semibold">
                {category}
              </div>
              {tools.map((tool) => {
                const Icon = iconForTool(tool.name)
                return (
                  <div
                    key={tool.id}
                    className="flex items-start gap-2 px-3 py-2 hover:bg-bg-hover group"
                  >
                    <Icon
                      size={14}
                      className={cn(
                        'shrink-0 mt-0.5',
                        tool.enabled ? 'text-accent' : 'text-text-tertiary'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-mono">{tool.name}</div>
                      <div className="text-[10px] text-text-tertiary leading-snug">
                        {tool.description}
                      </div>
                    </div>
                    <label className="shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={tool.enabled}
                        onChange={(e) => setToolEnabled(tool.id, e.target.checked)}
                        className="cursor-pointer"
                      />
                    </label>
                  </div>
                )
              })}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
```

---

# 📦 SECTION 9: Marketplace Placeholder

## Task 9.1: Create Marketplace Panel

**File path:** `src/renderer/src/components/Sidebar/MarketplacePanel.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
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
```

---

# 📦 SECTION 10: Settings Sidebar Panel

## Task 10.1: Create Settings Panel

**File path:** `src/renderer/src/components/Sidebar/SettingsPanel.tsx`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { Settings as SettingsIcon, KeyRound, Zap, Sliders, Info } from 'lucide-react'
import { useTabStore } from '../../stores'
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
  const openTab = useTabStore((s) => s.openTab)

  const filtered = ITEMS.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()))

  const handleOpen = (item: SettingsItem): void => {
    openTab({
      id: undefined as unknown as string,
      type: 'settings',
      title: `Settings: ${item.label}`,
      contextId: item.id
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
```

---

# 📦 SECTION 11: Update LeftSidebar to Use Panels

## Task 11.1: Replace LeftSidebar

**File path:** `src/renderer/src/components/Layout/LeftSidebar.tsx`

**Action:** OVERWRITE entire file.

**Exact content:**

```typescript
import { useUIStore } from '../../stores/uiStore'
import SessionsPanel from '../Sidebar/SessionsPanel'
import ProjectsPanel from '../Sidebar/ProjectsPanel'
import ToolsPanel from '../Sidebar/ToolsPanel'
import MarketplacePanel from '../Sidebar/MarketplacePanel'
import SettingsPanel from '../Sidebar/SettingsPanel'

export default function LeftSidebar(): JSX.Element {
  const view = useUIStore((s) => s.leftSidebarView)

  return (
    <div className="flex flex-col h-full bg-bg-deep">
      {view === 'sessions' && <SessionsPanel />}
      {view === 'projects' && <ProjectsPanel />}
      {view === 'tools' && <ToolsPanel />}
      {view === 'marketplace' && <MarketplacePanel />}
      {view === 'settings' && <SettingsPanel />}
    </div>
  )
}
```

---

# 📦 SECTION 12: Tests

## Task 12.1: Create Date Utility Tests

**File path:** `tests/unit/date.test.ts`

**Action:** Create NEW file.

**Exact content:**

```typescript
import { describe, it, expect } from 'vitest'
import { groupByDate, formatRelative } from '../../src/renderer/src/lib/date'

describe('groupByDate', () => {
  it('groups items into date buckets', () => {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 25 * 60 * 60 * 1000)
    const old = new Date('2020-01-01T00:00:00Z')

    const items = [
      { id: '1', updated_at: now.toISOString() },
      { id: '2', updated_at: yesterday.toISOString() },
      { id: '3', updated_at: old.toISOString() }
    ]

    const grouped = groupByDate(items)
    expect(grouped.Today.length).toBe(1)
    expect(grouped.Older.length).toBe(1)
  })
})

describe('formatRelative', () => {
  it('returns "just now" for very recent dates', () => {
    expect(formatRelative(new Date().toISOString())).toBe('just now')
  })

  it('returns minutes for recent dates', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
    expect(formatRelative(fiveMinAgo.toISOString())).toMatch(/m ago/)
  })

  it('returns hours for hour-old dates', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    expect(formatRelative(twoHoursAgo.toISOString())).toMatch(/h ago/)
  })
})
```

---

# 📦 SECTION 13: Verification

## Task 13.1: Type Check

```bash
npm run typecheck
```

## Task 13.2: Lint

```bash
npm run lint
```

## Task 13.3: Format

```bash
npm run format
```

## Task 13.4: Tests

```bash
npm run test:run
```

## Task 13.5: Build

```bash
npm run build
```

## Task 13.6: Dev Mode

```bash
npm run dev
```

**🛑 USER VERIFICATION REQUIRED:**

- [ ] Click "Projects" icon → Projects panel appears with search bar
- [ ] Click + button in Projects → "New Project" dialog opens
- [ ] Fill in name "Test Project" → Click "Create Project" → project appears in list
- [ ] Click the project → it becomes active (accent-colored folder icon, checkmark)
- [ ] Right-click project → context menu with Rename/Delete
- [ ] Click "Sessions" icon → Sessions panel appears
- [ ] Click + → new session created and chat tab opens
- [ ] Create 2-3 more sessions
- [ ] Sessions are grouped under "Today"
- [ ] Type in the search box → list filters
- [ ] Right-click a session → context menu (Open/Rename/Pin/Archive/Delete)
- [ ] Click "Pin" → pin icon appears, session stays at top
- [ ] Click "Tools" icon → Tools panel shows 5 placeholder tools grouped by category
- [ ] Toggle a tool's checkbox → state changes and persists
- [ ] Click "Marketplace" → placeholder visible
- [ ] Click "Settings" icon → list of settings categories
- [ ] Click "API Keys" → tab opens with title "Settings: API Keys"
- [ ] Close app, reopen → projects, sessions, tools state preserved (DB)

---

# 📦 SECTION 14: Git Commit

```bash
git add .
git commit -m "feat: functional sidebar panels with sessions/projects/tools (Chapter 9)"
```

---

# 🏁 FINAL VERIFICATION CHECKLIST

## ✅ Check 1: Sidebar components exist

```bash
ls src/renderer/src/components/Sidebar/SessionsPanel.tsx src/renderer/src/components/Sidebar/ProjectsPanel.tsx src/renderer/src/components/Sidebar/ToolsPanel.tsx src/renderer/src/components/Sidebar/MarketplacePanel.tsx src/renderer/src/components/Sidebar/SettingsPanel.tsx
```

## ✅ Check 2: Helper components exist

```bash
ls src/renderer/src/components/Sidebar/SidebarHeader.tsx src/renderer/src/components/Sidebar/ListContextMenu.tsx src/renderer/src/components/Sidebar/NewProjectDialog.tsx src/renderer/src/components/Sidebar/useSearchFilter.ts src/renderer/src/lib/date.ts
```

## ✅ Check 3: TypeScript compiles

```bash
npm run typecheck
```

## ✅ Check 4: Lint passes

```bash
npm run lint
```

## ✅ Check 5: Tests pass

```bash
npm run test:run
```

## ✅ Check 6: Build works

```bash
npm run build
```

## ✅ Check 7: Sidebar functional (user confirmed)

## ✅ Check 8: Project + session creation works (user confirmed)

## ✅ Check 9: Persistence works (user confirmed)

## ✅ Check 10: Git commit

```bash
git log --oneline
```

---

# 📊 Chapter 9 Completion Report

```
✅ Chapter 9: Sidebar Components & Navigation - COMPLETE

Acceptance Criteria Met:
✅ Sessions panel with date grouping
✅ Projects panel with create wizard
✅ Tools panel with toggle and grouping
✅ Settings panel with submenu items
✅ Marketplace placeholder
✅ Search bar filters each panel
✅ Right-click context menus
✅ Project/session CRUD via IPC
✅ All tests passing
✅ Build works

Ready to proceed to Chapter 10: Status Bar & Toolbar.
```

---

# 🚨 Troubleshooting

## "Cannot select project" / sessions empty

The active project must be selected first. Click "Projects" icon → click a project to make it active. Then click "Sessions" icon → list will populate.

## Sessions don't show after creating

- Check browser console for IPC errors
- Verify Chapter 6 IPC handlers are registered in main/index.ts
- Try refreshing the panel by switching views and back

## prompt() doesn't work in Electron

The native `prompt()` may not work in Electron production builds. For dev mode it's fine. Will be replaced with proper dialogs in a polish chapter.

## Context menu position glitchy near edges

Acceptable for now. Will be improved in a polish chapter using floating-ui.

---

**End of Chapter 9 Implementation Plan**
