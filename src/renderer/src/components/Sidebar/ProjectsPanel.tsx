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

  const { projects, setProjects, removeProject, updateProject, activeProjectId, setActiveProject } =
    useProjectStore()

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
      { separator: true },
      {
        label: 'Rename',
        icon: <Edit3 size={14} />,
        onClick: () => handleRename(projectId)
      },
      { separator: true },
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
